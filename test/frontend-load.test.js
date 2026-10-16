const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("renders the published archive before refreshing external feeds", () => {
  assert.match(html, /fetch\("archive\.json"\)/);

  const loadStart = html.indexOf("async function load()");
  const initialRender = html.indexOf("render(allEntries);", loadStart);
  const feedRefresh = html.indexOf("refreshFromFeeds(archive);", initialRender);

  assert.notEqual(initialRender, -1);
  assert.notEqual(feedRefresh, -1);
  assert.ok(initialRender < feedRefresh);
});

test("refreshes all feeds concurrently", () => {
  assert.match(html, /Promise\.allSettled\(\s*FEED_URLS\.map/);
});

test("renders before starting optional French translations", () => {
  const initialRender = html.indexOf("render(allEntries);", html.indexOf("async function load()"));
  const backgroundTranslations = html.indexOf("ensureTranslationsForVisible().then", initialRender);

  assert.notEqual(initialRender, -1);
  assert.notEqual(backgroundTranslations, -1);
  assert.ok(initialRender < backgroundTranslations);
});

test("does not block parsing on the Story export library", () => {
  assert.match(html, /<script defer src="https:\/\/cdn\.jsdelivr\.net\/npm\/html2canvas@1\.4\.1/);
});

test("mirrors the contextual Buckfast Abbey filter in the front end", () => {
  const filterStart = html.indexOf("function shouldHideEntry(entry)");
  const filterEnd = html.indexOf("function applyStaticLanguage()", filterStart);
  const filterSource = html.slice(filterStart, filterEnd);

  assert.match(filterSource, /titleMentionsBuckfastAbbey/);
  assert.match(filterSource, /titleLooksLikeRoutineAbbeyNews/);
  assert.match(filterSource, /titleAbbeyKeepContext/);
});
