#!/usr/bin/env node
"use strict";

const fs = require("node:fs");

const LOCATION_ONLY = /\bbuckfast\s+(?:road|street|avenue|lane|way|drive|close|court|place|terrace|gardens)\b/i;
const NEAR_PLACE = /\b(?:near|at|in|around|through)\s+buckfast\b/i;
const PLACE_NAMES = /\bbuckfastleigh\b/i;
const PRODUCT_SPAM = /\b(?:personalised|personalized|custom|sticker|label|foil|burner|liner|coupon|promo code|free shipping|pack of|\d+\s?(?:pcs|pc|pack|set))\b/i;
const DRINK_CONTEXT = /\b(?:buckfast tonic wine|tonic wine|fortified wine|caffeinated wine|wine|alcohol|alcoholic|drink|drinking|booze|bottle|bottles|buckie|bucky)\b/i;

function clean(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function mentionsBuckfast(value) {
  return (value.match(/\bbuckfast\b/gi) || []).length;
}

function splitPublisherTitle(value) {
  const title = clean(value);
  const separators = [" - ", " – ", " — "];
  let cut = -1;

  for (const separator of separators) {
    cut = Math.max(cut, title.lastIndexOf(separator));
  }

  return cut > 0
    ? { headline: title.slice(0, cut).trim(), publisher: title.slice(cut + 3).trim() }
    : { headline: title, publisher: "" };
}

function headlineKey(value) {
  return splitPublisherTitle(value).headline
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sourcePriority(item) {
  const publisher = splitPublisherTitle(item && item.title).publisher;
  const link = String(item && item.link || "");
  return /\b(?:reddit|facebook|instagram|twitter|x\.com)\b/i.test(`${publisher} ${link}`) ? 0 : 1;
}

function deduplicate(items) {
  const output = [];
  const seenLinks = new Set();
  const headlineIndexes = new Map();

  for (const item of items || []) {
    if (!item || !item.link || seenLinks.has(item.link)) continue;

    const key = headlineKey(item.title);
    const duplicateIndex = key ? headlineIndexes.get(key) : undefined;

    if (duplicateIndex !== undefined) {
      if (sourcePriority(item) > sourcePriority(output[duplicateIndex])) {
        output[duplicateIndex] = item;
      }
      seenLinks.add(item.link);
      continue;
    }

    seenLinks.add(item.link);
    if (key) headlineIndexes.set(key, output.length);
    output.push(item);
  }

  return output;
}

function isRelevant(item) {
  const title = clean(item.title);
  const description = clean(item.description);
  const text = `${title} ${description}`.trim();

  if (!mentionsBuckfast(text)) return false;
  if (PLACE_NAMES.test(text) || PRODUCT_SPAM.test(text)) return false;
  if ((LOCATION_ONLY.test(text) || NEAR_PLACE.test(text)) && !DRINK_CONTEXT.test(text)) return false;

  // A Buckfast headline is normally enough; results without it need stronger proof.
  return mentionsBuckfast(title) > 0 ||
    (mentionsBuckfast(text) >= 2 && DRINK_CONTEXT.test(text));
}

function merge(archive, items) {
  const additions = (items || []).filter(item => item && item.link && isRelevant(item));
  return deduplicate([...additions, ...archive]);
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

module.exports = { deduplicate, headlineKey, isRelevant, merge, splitPublisherTitle };
