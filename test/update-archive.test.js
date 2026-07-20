"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { isRelevant, merge } = require("../scripts/update-archive.js");

test("keeps a real Buckfast story", () => {
  assert.equal(isRelevant({ title: "Buckfast tonic wine licensing debate", description: "Alcohol policy in Glasgow." }), true);
});
test("rejects a street name", () => {
  assert.equal(isRelevant({ title: "Gas works on Buckfast Road", description: "Traffic disruption follows." }), false);
});
test("rejects Buckfastleigh and shopping spam", () => {
  assert.equal(isRelevant({ title: "Buckfastleigh community news" }), false);
  assert.equal(isRelevant({ title: "Personalised Buckfast bottle label", description: "Pack of 40pcs, free shipping" }), false);
});
test("requires stronger proof without Buckfast in the title", () => {
  assert.equal(isRelevant({ title: "Licensing debate", description: "Buckfast Tonic Wine and Buckfast sales were discussed." }), true);
  assert.equal(isRelevant({ title: "Licensing debate", description: "One Buckfast mention appeared." }), false);
});
test("keeps archive objects unchanged and deduplicated", () => {
  const item = { title: "Buckfast Tonic Wine news", link: "https://example.test/a" };
  assert.deepEqual(merge([item], [item]), [item]);
});
