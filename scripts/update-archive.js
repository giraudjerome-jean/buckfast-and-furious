#!/usr/bin/env node
"use strict";

const fs = require("node:fs");

// These are deliberately conservative: they remove obvious non-drink results
// without introducing a paid API or changing the item shape consumed by the site.
const LOCATION_ONLY = /\bbuckfast\s+(?:road|street|avenue|lane|way|drive|close|court|place|terrace|gardens)\b/i;
const PLACE_NAMES = /\bbuckfastleigh\b/i;
const PRODUCT_SPAM = /\b(?:personalised|personalized|custom|sticker|label|foil|burner|liner|coupon|promo code|free shipping|pack of|\d+\s?(?:pcs|pc|pack|set))\b/i;
const DRINK_CONTEXT = /\b(?:buckfast tonic wine|tonic wine|fortified wine|caffeinated wine|wine|alcohol|alcoholic|drink|drinking|booze|bottle|bottles|buckie|bucky)\b/i;

function toPlainText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function occurrences(text) {
  return (text.match(/\bbuckfast\b/gi) || []).length;
}

function isRelevantBuckfastArticle(item) {
  const title = toPlainText(item && item.title);
  const description = toPlainText(item && item.description);
  const text = `${title} ${description}`.trim();

  if (!text || occurrences(text) === 0) return false;
  if (PLACE_NAMES.test(text) || PRODUCT_SPAM.test(text)) return false;

  const titleHasBuckfast = occurrences(title) > 0;
  const hasDrinkContext = DRINK_CONTEXT.test(text);

  // A street/address mention is only useful if the same result also establishes
  // that it concerns the drink. This catches "Buckfast Road" style false hits.
  if (LOCATION_ONLY.test(text) && !hasDrinkContext) return false;

  // Google Alerts titles are the strongest free signal. If the word is absent
  // from the title, require both repeated mentions and drink-specific context.
  if (titleHasBuckfast) return true;
  return occurrences(text) >= 2 && hasDrinkContext;
}

function mergeArchive(archive, items) {
  const existingLinks = new Set((archive || []).map((item) => item && item.link).filter(Boolean));
  const additions = [];

  for (const item of items || []) {
    if (!item || !item.link || existingLinks.has(item.link)) continue;
    if (!isRelevantBuckfastArticle(item)) continue;
    additions.push(item);
    existingLinks.add(item.link);
  }

  return [...additions, ...(archive || [])];
}

function run(feedPath = "feed.json", archivePath = "archive.json") {
  const feed = JSON.parse(fs.readFileSync(feedPath, "utf8"));
  const archive = fs.existsSync(archivePath)
    ? JSON.parse(fs.readFileSync(archivePath, "utf8"))
    : [];
  const nextArchive = mergeArchive(archive, feed.items || []);
  fs.writeFileSync(archivePath, `${JSON.stringify(nextArchive, null, 2)}\n`);
  console.log(`Added ${nextArchive.length - archive.length} relevant article(s).`);
}

if (require.main === module) run(process.argv[2], process.argv[3]);

module.exports = { isRelevantBuckfastArticle, mergeArchive, toPlainText };
