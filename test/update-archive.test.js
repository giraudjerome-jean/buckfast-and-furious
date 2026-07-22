"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { isRelevant, merge, splitPublisherTitle } = require("../scripts/update-archive.js");

test("keeps a real Buckfast story", () => {
  assert.equal(isRelevant({ title: "Buckfast tonic wine licensing debate", description: "Alcohol policy in Glasgow." }), true);
});
test("rejects a street name", () => {
  assert.equal(isRelevant({ title: "Gas works on Buckfast Road", description: "Traffic disruption follows." }), false);
});
test("rejects unrelated A38 stories and Buckfast as a place", () => {
  assert.equal(isRelevant({ title: "A38 to shut after man seriously hurt in crash", description: "Devon Live traffic update." }), false);
  assert.equal(isRelevant({ title: "A38 closure near Buckfast after serious collision", description: "Travel disruption continues." }), false);
  assert.equal(isRelevant({
    title: "LIVE: A38 near <b>Buckfast</b> closed after serious collision causes Devon delays",
    description: "Traffic update with an unrelated Buckfast bottle link in the page sidebar."
  }), false);
});
test("rejects Buckfastleigh and shopping spam", () => {
  assert.equal(isRelevant({ title: "Buckfastleigh community news" }), false);
  assert.equal(isRelevant({ title: "Personalised Buckfast bottle label", description: "Pack of 40pcs, free shipping" }), false);
});
test("rejects Buckfast bee and Adami breeding content", () => {
  assert.equal(isRelevant({
    title: "THIS is what a true Buckfast Adami looks like! #shorts - YouTube",
    description: "A queen bee from a Buckfast breeding line."
  }), false);
});
test("accepts only coherent description-only matches", () => {
  assert.equal(isRelevant({ title: "Licensing debate", description: "Buckfast Tonic Wine and Buckfast sales were discussed." }), false);
  assert.equal(isRelevant({ title: "Licensing debate", description: "One Buckfast mention appeared." }), false);
  assert.equal(isRelevant({
    title: "Council licensing debate prompts public health concern",
    description: "The council licensing debate examined Buckfast Tonic Wine sales and Buckfast-related alcohol harm."
  }), true);
  assert.equal(isRelevant({
    title: "Domestic abuser subjects partner to 'terrifying attack' in Falkirk",
    description: "Naked man was holding a bottle of Buckfast · Naked man was holding a bottle of Buckfast."
  }), false);
});
test("keeps archive objects unchanged and deduplicated", () => {
  const item = { title: "Buckfast Tonic Wine news", link: "https://example.test/a" };
  assert.deepEqual(merge([item], [item]), [item]);
});

test("does not add a new false positive to the archive", () => {
  const bad = {
    title: "LIVE: A38 near Buckfast closed after serious collision causes Devon delays",
    description: "An unrelated Buckfast bottle link appeared in a sidebar.",
    link: "https://example.test/a38"
  };
  const good = {
    title: "Buckfast tonic wine licensing debate",
    description: "Alcohol policy in Glasgow.",
    link: "https://example.test/wine"
  };

  assert.deepEqual(merge([good], [bad]), [good]);
});

test("deduplicates the same story published through different sources", () => {
  const reddit = {
    title: "Naked Bo'ness man was holding a bottle of Buckfast before police arrived - Reddit",
    link: "https://example.test/reddit"
  };
  const original = {
    title: "Naked Bo’ness man was holding a bottle of Buckfast before police arrived - Falkirk Herald",
    link: "https://example.test/falkirk"
  };

  assert.deepEqual(merge([reddit, original], []), [original]);
});

test("deduplicates near-identical syndicated headlines published the same day", () => {
  const items = [
    { title: "Buckfast bottle-smashing woman spared jail after threats to kill police - Forres Gazette", pubDate: "2026-06-14", link: "https://example.com/forres" },
    { title: "Buckfast bottle-smashing Elgin woman spared jail after threats to kill police - Northern Scot", pubDate: "2026-06-14", link: "https://example.com/scot" }
  ];
  assert.equal(merge([], items).length, 1);
});

test("supports publisher names before or after the headline", () => {
  const headline = "Naked Bo'ness man was holding a bottle of Buckfast before police arrived";
  assert.deepEqual(splitPublisherTitle(`Falkirk - ${headline}`), {
    headline,
    publisher: "Falkirk"
  });
  assert.deepEqual(splitPublisherTitle(`${headline} - Falkirk Herald`), {
    headline,
    publisher: "Falkirk Herald"
  });
});
