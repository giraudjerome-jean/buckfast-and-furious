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
  assert.equal(isRelevant({
    title: "A38 closed near Buckfast Abbey after collision"
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
test("keeps only abbey news about the drink", () => {
  assert.equal(isRelevant({
    title: "Buckfast Abbey announces two major choral concerts - The Moorlander"
  }), false);
  assert.equal(isRelevant({
    title: "Buckfast Abbey Choir to celebrate Venice's golden age"
  }), false);
  assert.equal(isRelevant({
    title: "Buckfast Abbey hosts a private Requiem and guided tour"
  }), false);
  assert.equal(isRelevant({
    title: "Organ recital returns to Buckfast Abbey"
  }), false);
  assert.equal(isRelevant({
    title: "Buckfast Abbey expands tonic wine production"
  }), true);
  assert.equal(isRelevant({
    title: "Buckfast Abbey reports higher Buckfast sales and profits"
  }), true);
  assert.equal(isRelevant({
    title: "Police investigate theft at Buckfast Abbey"
  }), false);
  assert.equal(isRelevant({
    title: "Fire closes Buckfast Abbey visitor centre"
  }), false);
  assert.equal(isRelevant({
    title: "Police investigate theft during concert at Buckfast Abbey"
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

test("drops recipes posted on social media", () => {
  const { isRelevant, looksLikeRecipe } = require("../scripts/update-archive.js");
  const recipe = "Buckfast Ham 1.7kg Ham 1 bottle of Buckfast 100 g sugar A sprinkle of sea salt A shake ... - Instagram";
  assert.ok(looksLikeRecipe(recipe));
  assert.equal(isRelevant({ title: recipe, link: "https://www.instagram.com/p/x" }), false);
  assert.ok(looksLikeRecipe("Cocktail of the week: Cafe Cùil’s Buckfast bloody Maìri – recipe | The good mixer - The Guardian"));
  assert.ok(!looksLikeRecipe("Sales of Buckfast fall by over £3 million after 'punitive' tax increase - The Herald"));
});

test("keeps drink-driving stories that quote alcohol levels", () => {
  const { looksLikeRecipe } = require("../scripts/update-archive.js");
  for (const title of [
    "Driver had 1.2g per litre of alcohol after downing 70cl of Buckfast",
    "Motorist found with 2.1g/l and 3 bottles of Buckfast in his car",
    "Man had 135mg of alcohol in 100ml of blood after Buckfast binge",
    "Buckfast drinker almost four times the limit: 2g of alcohol, 75cl bottle empty",
    "Un automobiliste avec 1,8 g d'alcool par litre de sang et une bouteille de Buckfast"
  ]) {
    assert.ok(!looksLikeRecipe(title), title);
  }
});

test("filters cocktail recipes and weather pages", () => {
  const { isRelevant } = require("../scripts/update-archive.js");
  for (const title of [
    "Cocktail of the week: Cafe Cùil’s Buckfast bloody Maìri – recipe | The good mixer - The Guardian",
    "Buckfast Weather Today & Hourly Forecast - SpaceRef"
  ]) {
    assert.ok(!isRelevant({ title, description: "" }), title);
  }
  assert.ok(isRelevant({ title: "Buckfast-fuelled night out was a recipe for disaster, court hears", description: "" }));
});

test("drops abbey events and pages unrelated to the drink", () => {
  const { isRelevant } = require("../scripts/update-archive.js");
  for (const title of [
    "Police search Buckfast Abbey ahead of Ann Widdecombe's funeral - Devon Live",
    "Buckfast Abbey Choir to celebrate Venice’s golden age - Great British Life",
    "102 Buckfast Ct, Thomasville, GA 31792 | Harry Norman REALTORS",
    "#Buckfast - Search / X"
  ]) assert.ok(!isRelevant({ title, description: "" }), title);
  assert.ok(isRelevant({ title: "Buckfast Abbey in bid to shake off bad image as it announces record profits - The National", description: "" }));
});
