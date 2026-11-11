"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { build } = require("../scripts/build-site.js");

const ROOT = path.join(__dirname, "..");

function fixtureRoot(archive) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bf-build-"));
  fs.copyFileSync(path.join(ROOT, "index.html"), path.join(root, "index.html"));
  fs.writeFileSync(path.join(root, "archive.json"), JSON.stringify(archive));
  return root;
}

const ARCHIVE = [
  {
    title: "Man jailed after <b>Buckfast</b> bottle attack in Paisley - Daily Record",
    pubDate: "2026-01-01 00:30:00",
    link: "https://www.google.com/url?rct=j&sa=t&url=https://www.dailyrecord.co.uk/news/paisley-buckfast-attack-123/&ct=ga",
    description: "A man has been jailed after hitting a stranger with a <b>Buckfast</b> bottle outside a Paisley bar."
  },
  {
    title: "Buckfast sales soar as monks defend tonic wine - BBC News",
    pubDate: "2025-12-30 10:00:00",
    link: "https://www.bbc.co.uk/news/buckfast-sales",
    description: "Buckfast sales soar as monks defend tonic wine BBC News"
  }
];

test("writes the rendered feed into the published home page", async () => {
  const root = fixtureRoot(ARCHIVE);
  await build({ root, out: path.join(root, "_site") });
  const home = fs.readFileSync(path.join(root, "_site", "index.html"), "utf8");

  assert.match(home, /<section class="feed" id="feed">\s*<article class="entry">/);
  assert.match(home, /Man jailed after Buckfast bottle attack in Paisley/);
  // Google Alerts redirects are replaced by the original article URL.
  assert.match(home, /href="https:\/\/www\.dailyrecord\.co\.uk\/news\/paisley-buckfast-attack-123\/"/);
  assert.doesNotMatch(home, /class="entry-link" href="https:\/\/www\.google\.com\/url/);
});

test("creates one page per entry, linked from the home page and the sitemap", async () => {
  const root = fixtureRoot(ARCHIVE);
  const out = path.join(root, "_site");
  const { items } = await build({ root, out });
  const home = fs.readFileSync(path.join(out, "index.html"), "utf8");
  const sitemap = fs.readFileSync(path.join(out, "sitemap.xml"), "utf8");

  assert.equal(items.length, 2);
  for (const item of items) {
    assert.ok(fs.existsSync(path.join(out, "incidents", item.slug, "index.html")), item.slug);
    assert.ok(home.includes(`href="/incidents/${item.slug}/"`), item.slug);
    assert.ok(sitemap.includes(`https://buckfastandfurious.com/incidents/${item.slug}/`), item.slug);
  }
});

test("takes the slug date from the raw string, whatever the time zone", async () => {
  const root = fixtureRoot(ARCHIVE);
  const { items } = await build({ root, out: path.join(root, "_site") });
  assert.equal(items[0].slug, "2026-01-01-man-jailed-after-buckfast-bottle-attack-in-paisley");
});

test("incident pages carry their own title, description and canonical URL", async () => {
  const root = fixtureRoot(ARCHIVE);
  const out = path.join(root, "_site");
  const { items } = await build({ root, out });
  const page = fs.readFileSync(path.join(out, "incidents", items[0].slug, "index.html"), "utf8");

  assert.match(page, /<title>Man jailed after Buckfast bottle attack in Paisley — Buckfast and Furious<\/title>/);
  assert.match(page, /<meta name="description" content="A man has been jailed after hitting a stranger/);
  assert.match(page, /<link rel="canonical" href="https:\/\/buckfastandfurious\.com\/incidents\/2026-01-01-/);
  assert.match(page, /<h1 class="entry-title">/);
  assert.match(page, /Originally reported by Daily Record\./);
});

test("drops summaries that only repeat the headline", async () => {
  const root = fixtureRoot(ARCHIVE);
  const out = path.join(root, "_site");
  const { items } = await build({ root, out });
  const page = fs.readFileSync(path.join(out, "incidents", items[1].slug, "index.html"), "utf8");
  assert.doesNotMatch(page, /class="entry-summary"/);
});

test("publishes robots.txt pointing at the sitemap, and a noindex 404", async () => {
  const root = fixtureRoot(ARCHIVE);
  const out = path.join(root, "_site");
  await build({ root, out });
  assert.match(fs.readFileSync(path.join(out, "robots.txt"), "utf8"), /Sitemap: https:\/\/buckfastandfurious\.com\/sitemap\.xml/);
  assert.match(fs.readFileSync(path.join(out, "404.html"), "utf8"), /<meta name="robots" content="noindex" \/>/);
});

test("refuses to publish an empty site", async () => {
  const root = fixtureRoot([]);
  await assert.rejects(build({ root, out: path.join(root, "_site") }), /rendered no entries/);
});
