#!/usr/bin/env node
"use strict";

const fs = require("node:fs");

const LOCATION_ONLY = /\bbuckfast\s+(?:road|street|avenue|lane|way|drive|close|court|place|terrace|gardens)\b/i;
const PLACE_NAMES = /\bbuckfastleigh\b/i;
const PRODUCT_SPAM = /\b(?:personalised|personalized|custom|sticker|label|foil|burner|liner|coupon|promo code|free shipping|pack of|\d+\s?(?:pcs|pc|pack|set))\b/i;
const DRINK_CONTEXT = /\b(?:buckfast tonic wine|tonic wine|fortified wine|caffeinated wine|wine|alcohol|alcoholic|drink|drinking|booze|bottle|bottles|buckie|bucky)\b/i;

function clean(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function mentionsBuckfast(value) {
  return (value.match(/\bbuckfast\b/gi) || []).length;
}

function isRelevant(item) {
  const title = clean(item.title);
  const description = clean(item.description);
  const text = `${title} ${description}`.trim();

  if (!mentionsBuckfast(text)) return false;
  if (PLACE_NAMES.test(text) || PRODUCT_SPAM.test(text)) return false;
  if (LOCATION_ONLY.test(text) && !DRINK_CONTEXT.test(text)) return false;

  // A Buckfast headline is normally enough; results without it need stronger proof.
  return mentionsBuckfast(title) > 0 ||
    (mentionsBuckfast(text) >= 2 && DRINK_CONTEXT.test(text));
}

function merge(archive, items) {
  const seen = new Set(archive.map(item => item && item.link).filter(Boolean));
  const additions = [];

  for (const item of items || []) {
    if (!item || !item.link || seen.has(item.link) || !isRelevant(item)) continue;
    additions.push(item);
    seen.add(item.link);
  }
  return [...additions, ...archive];
}

function run(feedPath = "feed.json", archivePath = "archive.json") {
  const feed = JSON.parse(fs.readFileSync(feedPath, "utf8"));
  const archive = fs.existsSync(archivePath)
    ? JSON.parse(fs.readFileSync(archivePath, "utf8"))
    : [];
  const next = merge(archive, feed.items || []);
  fs.writeFileSync(archivePath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Added ${next.length - archive.length} relevant article(s).`);
}

if (require.main === module) run(process.argv[2], process.argv[3]);

module.exports = { isRelevant, merge };
