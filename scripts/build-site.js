#!/usr/bin/env node
"use strict";

// Builds the published version of the site into _site/.
//
// index.html stays the single source of truth: it is executed in a simulated
// browser (jsdom) with archive.json, exactly as a visitor's browser would.
// The rendered feed is then written into the HTML so search engines see the
// articles without running JavaScript, and every visible entry gets its own
// page under /incidents/<slug>/, plus sitemap.xml, robots.txt and 404.html.

const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");

const SITE_URL = "https://buckfastandfurious.com";
const SITE_NAME = "Buckfast and Furious";
const ROOT = path.join(__dirname, "..");

// Development files that are not part of the public site.
const EXCLUDED = new Set([
  ".git", ".github", ".gitignore", "node_modules", "_site", "test", "scripts",
  "feeds", "feed.json", "package.json", "package-lock.json"
]);

const RELATED_COUNT = 6;

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(text, max) {
  if (!text || text.length <= max) return text || "";
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

// "2026-11-09 19:04:57" -> "2026-11-09", read from the string itself so the
// result never depends on the build machine's time zone.
function entryDay(entry) {
  const match = String(entry.pubDate || entry.date || "").match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const date = new Date(entry.pubDate || entry.date);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function formatDay(day, options) {
  if (!day) return "";
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", ...options });
}

async function renderHome(html, archive) {
  const dom = new JSDOM(html, {
    url: `${SITE_URL}/`,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: new VirtualConsole(),
    beforeParse(window) {
      window.localStorage.setItem("buckfast_lang", "en");
      // archive.json is served from disk; live RSS refreshes and translations
      // are skipped so the build only reflects the published archive.
      window.fetch = async url => ({
        ok: true,
        json: async () => (String(url) === "archive.json"
          ? JSON.parse(JSON.stringify(archive))
          : { items: [] })
      });
    }
  });

  const { window } = dom;
  const feed = window.document.getElementById("feed");
  for (let i = 0; i < 200 && !feed.children.length; i += 1) {
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  await new Promise(resolve => setTimeout(resolve, 50));

  const entries = window.eval("allEntries");
  if (!entries.length || !feed.querySelector(".entry")) {
    throw new Error("The home page rendered no entries; refusing to publish an empty site.");
  }

  return {
    window,
    entries,
    feedHtml: feed.innerHTML,
    sectionMeta: window.document.getElementById("section-meta").textContent
  };
}

function describeEntry(window, entry) {
  const { headline, publisher } = window.splitPublisherTitle(entry.title);
  const sourceUrl = window.getSourceUrl(entry.link);
  const source = publisher || window.getSourceHost(entry.link);
  const day = entryDay(entry);
  let summary = window.cleanText(entry.description || "");

  // Google News descriptions only repeat the headline and publisher name.
  const headlineKey = window.headlineKey(headline);
  if (!summary || window.headlineKey(summary).startsWith(headlineKey.slice(0, 40))) summary = "";

  return {
    entry,
    slug: window.entrySlug(entry),
    headline: headline || window.cleanText(entry.title) || "Untitled",
    source,
    sourceUrl,
    summary,
    category: entry.category,
    day,
    dateLabel: formatDay(day, { day: "2-digit", month: "short", year: "numeric" }),
    monthLabel: formatDay(day, { month: "long", year: "numeric" })
  };
}

function pageShell({ title, description, canonical, ogType, jsonLd, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta name="theme-color" content="#f35a08" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${SITE_URL}/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="/assets/site.css" />
${jsonLd ? `  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n` : ""}</head>
<body>
  <main class="page">
    <header class="topbar">
      <a class="brand" href="/">${SITE_NAME}</a>
      <nav class="topnav"><a class="nav-btn active" href="/">All incidents</a></nav>
    </header>
${body}
    <footer class="footer">
      <div class="footer-block">
        <h3>About</h3>
        <p>
          Buckfast and Furious collects and indexes daily news items involving Buckfast.
          Each entry includes a short summary, a short excerpt and a direct link to the original article.
        </p>
      </div>
    </footer>
  </main>
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"e454a7d2c8084117b51d5831ec61a5b5"}'></script>
</body>
</html>
`;
}

function relatedEntries(item, items) {
  const sameCategory = items.filter(other => other.category === item.category);
  const index = sameCategory.indexOf(item);
  const before = sameCategory.slice(Math.max(0, index - RELATED_COUNT / 2), index);
  const after = sameCategory.slice(index + 1, index + 1 + RELATED_COUNT - before.length);
  const picked = [...before, ...after];
  // Near the end of the list, borrow more recent stories to keep six links.
  if (picked.length < RELATED_COUNT) {
    picked.unshift(...sameCategory.slice(0, index).filter(other => !picked.includes(other))
      .slice(-(RELATED_COUNT - picked.length)));
  }
  return picked;
}

function incidentPage(item, items) {
  const canonical = `${SITE_URL}/incidents/${item.slug}/`;
  const description = item.summary
    ? truncate(item.summary, 155)
    : truncate(`${item.headline}. Reported by ${item.source}${item.dateLabel ? ` on ${item.dateLabel}` : ""}.`, 155);

  const related = relatedEntries(item, items).map(other => `
      <article class="entry">
        <div class="entry-meta">
          <div class="entry-date">${escapeHtml(other.dateLabel)}</div>
          <div class="entry-source">${escapeHtml(other.source)}</div>
        </div>
        <div class="entry-body">
          <h3 class="entry-title"><a href="/incidents/${other.slug}/">${escapeHtml(other.headline)}</a></h3>
        </div>
      </article>`).join("");

  const body = `
    <section class="section-head">
      <div class="section-title">${escapeHtml(item.category)}</div>
      <div class="section-meta">${escapeHtml(item.monthLabel)}</div>
    </section>

    <section class="feed">
      <article class="entry">
        <div class="entry-meta">
          <time class="entry-date" datetime="${escapeHtml(item.day)}">${escapeHtml(item.dateLabel)}</time>
          <div class="entry-source">${escapeHtml(item.source)}</div>
          <div class="entry-tag">${escapeHtml(item.category)}</div>
        </div>
        <div class="entry-body">
          <h1 class="entry-title">${escapeHtml(item.headline)}</h1>
          ${item.summary ? `<p class="entry-summary">${escapeHtml(item.summary)}</p>` : ""}
          <p class="entry-credit">Originally reported by ${escapeHtml(item.source)}.</p>
          <a class="entry-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">Read the original article</a>
          <a class="entry-link entry-back" href="/">All Buckfast incidents</a>
        </div>
      </article>
    </section>
${related ? `
    <section class="section-head">
      <h2 class="section-title">More ${escapeHtml(item.category)}</h2>
      <div class="section-meta">${SITE_NAME}</div>
    </section>

    <section class="feed related">${related}
    </section>` : ""}`;

  return pageShell({
    title: `${item.headline} — ${SITE_NAME}`,
    description,
    canonical,
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: item.headline, item: canonical }
      ]
    },
    body
  });
}

function notFoundPage() {
  return pageShell({
    title: `Page not found — ${SITE_NAME}`,
    description: "This page does not exist.",
    canonical: `${SITE_URL}/`,
    ogType: "website",
    body: `
    <section class="section-head">
      <h1 class="section-title">Page not found</h1>
      <div class="section-meta">404</div>
    </section>
    <section class="feed">
      <div class="empty not-found">This incident is not here. <a class="entry-link" href="/">See all Buckfast incidents</a></div>
    </section>`
  }).replace("<head>", "<head>\n  <meta name=\"robots\" content=\"noindex\" />");
}

function sharedStylesheet(html) {
  const match = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!match) throw new Error("No <style> block found in index.html");
  // Fonts are referenced relative to the root; incident pages live two
  // folders deeper, so make the URLs absolute.
  return `${match[1].replace(/url\("(?!\/|https?:)([^"]+)"\)/g, 'url("/$1")').trim()}

/* Incident pages */
.brand{ display:inline-block; }
h1.entry-title{ max-width:14em; }
.entry-credit{ margin-top:10px; font-size:12px; line-height:1.35; color:var(--soft); }
.entry-back{ margin-left:18px; }
.empty.not-found{ border-bottom:0; }
.related .entry{ padding:14px 0 16px; }
.related .entry-title{ font-size:clamp(20px, 2vw, 32px); max-width:18em; }
`;
}

function copyPublicFiles(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const name of fs.readdirSync(source)) {
    if (EXCLUDED.has(name)) continue;
    fs.cpSync(path.join(source, name), path.join(target, name), { recursive: true });
  }
}

function injectHome(html, { feedHtml, sectionMeta }) {
  const emptyFeed = '<section class="feed" id="feed"></section>';
  if (html.split(emptyFeed).length !== 2) throw new Error("Could not find the empty feed in index.html");
  return html
    .replace(emptyFeed, `<section class="feed" id="feed">${feedHtml}</section>`)
    .replace('<div class="section-meta" id="section-meta">Live feed</div>',
      `<div class="section-meta" id="section-meta">${escapeHtml(sectionMeta)}</div>`);
}

function sitemap(items) {
  const newest = items.map(item => item.day).filter(Boolean).sort().pop();
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: newest },
    ...items.map(item => ({ loc: `${SITE_URL}/incidents/${item.slug}/`, lastmod: item.day }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${escapeHtml(url.loc)}</loc>${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`;
}

async function build({ root = ROOT, out = path.join(root, "_site") } = {}) {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const archive = JSON.parse(fs.readFileSync(path.join(root, "archive.json"), "utf8"));

  const home = await renderHome(html, archive);
  const items = home.entries.map(entry => describeEntry(home.window, entry));
  home.window.close();

  const seen = new Map();
  const unique = items.filter(item => {
    if (seen.has(item.slug)) {
      console.warn(`Duplicate slug skipped: ${item.slug}`);
      return false;
    }
    seen.set(item.slug, item);
    return true;
  });

  fs.rmSync(out, { recursive: true, force: true });
  copyPublicFiles(root, out);

  fs.writeFileSync(path.join(out, "index.html"), injectHome(html, home));
  fs.mkdirSync(path.join(out, "assets"), { recursive: true });
  fs.writeFileSync(path.join(out, "assets", "site.css"), sharedStylesheet(html));

  for (const item of unique) {
    const dir = path.join(out, "incidents", item.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), incidentPage(item, unique));
  }

  fs.writeFileSync(path.join(out, "404.html"), notFoundPage());
  fs.writeFileSync(path.join(out, "sitemap.xml"), sitemap(unique));
  fs.writeFileSync(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  console.log(`Built ${unique.length} incident page(s) into ${path.relative(root, out) || out}.`);
  return { items: unique };
}

if (require.main === module) {
  build().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { build, entryDay, escapeHtml, relatedEntries, sitemap, truncate };
