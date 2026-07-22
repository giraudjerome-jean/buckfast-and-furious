#!/usr/bin/env node
"use strict";

const fs = require("node:fs");

const LOCATION_ONLY = /\bbuckfast\s+(?:road|street|avenue|lane|way|drive|close|court|place|terrace|gardens)\b/i;
const NEAR_PLACE = /\b(?:near|at|in|around|through)\s+buckfast\b/i;
const PLACE_NAMES = /\bbuckfastleigh\b/i;
const TRAFFIC_CONTEXT = /\b(?:a\d{1,3}|motorway|road|route|traffic|travel|collision|crash|closed|closure|delays?|diversion|vehicles?|junction|accident)\b/i;
const PRODUCT_SPAM = /\b(?:personalised|personalized|custom|sticker|label|foil|burner|liner|coupon|promo code|free shipping|pack of|\d+\s?(?:pcs|pc|pack|set))\b/i;
const BEE_CONTEXT = /\b(?:adami|bees?|beekeeper|beekeeping|apiary|apiarist|honeybees?|queen bee|apis mellifera)\b/i;
const DRINK_CONTEXT = /\b(?:buckfast tonic wine|tonic wine|fortified wine|caffeinated wine|wine|alcohol|alcoholic|drink|drinking|booze|bottle|bottles|buckie|bucky)\b/i;
const DESCRIPTION_NOISE = /(?:\s[·|]\s|\b(?:related stories?|read more|more stories|latest news)\b)/i;
const TOPIC_STOP_WORDS = new Set([
  "about", "after", "again", "before", "being", "could", "court", "from",
  "into", "latest", "live", "news", "over", "says", "their", "there",
  "these", "those", "under", "where", "which", "while", "with", "would"
]);

function clean(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function mentionsBuckfast(value) {
  return (value.match(/\bbuckfast\b/gi) || []).length;
}

function topicWords(value) {
  return [...new Set(
    clean(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .match(/[a-z0-9]+/g) || []
  )].filter(word => word.length >= 5 && !TOPIC_STOP_WORDS.has(word));
}

function hasTopicOverlap(title, description) {
  const titleWords = topicWords(title);
  if (!titleWords.length) return false;

  const descriptionWords = new Set(topicWords(description));
  const matches = titleWords.filter(word => descriptionWords.has(word)).length;
  return matches >= Math.min(2, titleWords.length);
}

function hasStrongDescriptionEvidence(title, description) {
  return !DESCRIPTION_NOISE.test(description) &&
    mentionsBuckfast(description) >= 2 &&
    DRINK_CONTEXT.test(description) &&
    hasTopicOverlap(title, description);
}

function splitPublisherTitle(value) {
  const title = clean(value);
  const separators = [" - ", " – ", " — "];
  let cut = -1;

  for (const separator of separators) {
    cut = Math.max(cut, title.lastIndexOf(separator));
  }

  if (cut <= 0) return { headline: title, publisher: "" };

  const before = title.slice(0, cut).trim();
  const after = title.slice(cut + 3).trim();
  const beforeWords = before.split(/\s+/).length;
  const afterWords = after.split(/\s+/).length;

  // Some feeds prefix the publisher ("Falkirk - Headline") while most
  // append it ("Headline - Falkirk Herald"). Buckfast in the long side is
  // a strong signal for which side is the actual headline.
  if (/\bbuckfast\b/i.test(after) && before.length <= 40 && beforeWords <= 5) {
    return { headline: after, publisher: before };
  }

  if (!/\bbuckfast\b/i.test(after) && after.length <= 70 && afterWords <= 8) {
    return { headline: before, publisher: after };
  }

  return { headline: title, publisher: "" };
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

function publicationDay(item) {
  const date = new Date(item && (item.pubDate || item.date));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function isNearDuplicateHeadline(left, right) {
  const leftWords = new Set(topicWords(splitPublisherTitle(left).headline));
  const rightWords = new Set(topicWords(splitPublisherTitle(right).headline));
  if (leftWords.size < 6 || rightWords.size < 6) return false;
  const shared = [...leftWords].filter(word => rightWords.has(word)).length;
  return shared / Math.min(leftWords.size, rightWords.size) >= 0.9 &&
    shared / Math.max(leftWords.size, rightWords.size) >= 0.8;
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
    let duplicateIndex = key ? headlineIndexes.get(key) : undefined;
    if (duplicateIndex === undefined) {
      duplicateIndex = output.findIndex(existing =>
        publicationDay(existing) && publicationDay(existing) === publicationDay(item) &&
        isNearDuplicateHeadline(existing.title, item.title)
      );
      if (duplicateIndex < 0) duplicateIndex = undefined;
    }

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
  // Buckfast in the headline is the strongest signal. Description-only matches
  // are still allowed when the summary is coherent with the headline and does
  // not look like a related-story card copied into the RSS feed.
  if (!mentionsBuckfast(title) && !hasStrongDescriptionEvidence(title, description)) return false;
  if (PLACE_NAMES.test(text) || PRODUCT_SPAM.test(text) || BEE_CONTEXT.test(title)) return false;

  // RSS descriptions can contain unrelated sidebars or adverts mentioning a
  // bottle. A traffic headline that uses Buckfast as a location must therefore
  // prove drink relevance in the headline itself, not somewhere in the feed.
  const titleUsesBuckfastAsPlace = LOCATION_ONLY.test(title) || NEAR_PLACE.test(title);
  if (titleUsesBuckfastAsPlace && TRAFFIC_CONTEXT.test(title) && !DRINK_CONTEXT.test(title)) {
    return false;
  }

  if ((LOCATION_ONLY.test(text) || NEAR_PLACE.test(text)) && !DRINK_CONTEXT.test(text)) return false;

  return true;
}

function merge(archive, items) {
  const additions = (items || []).filter(item => item && item.link && isRelevant(item));
  return deduplicate([...additions, ...(archive || [])]);
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

module.exports = { deduplicate, headlineKey, isNearDuplicateHeadline, isRelevant, merge, splitPublisherTitle };
