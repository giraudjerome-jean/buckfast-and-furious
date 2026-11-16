const test = require("node:test");
const assert = require("node:assert/strict");
const { caption, isEligible, storyKey } = require("../scripts/instagram.js");

test("uses the real article URL behind Google Alerts redirects", () => {
  assert.equal(
    storyKey("https://www.google.com/url?rct=j&sa=t&url=https://www.dailyrecord.co.uk/news/story-123&ct=ga&cd=X"),
    "https://www.dailyrecord.co.uk/news/story-123"
  );
});

test("only publishes complete press headlines", () => {
  assert.ok(isEligible({ headline: "Angus woman jailed for Buckfast bottle petrol bomb attack", sourcePriority: 1 }));
  assert.ok(!isEligible({ headline: "The Buckfast driver continues to spread their joy in Blackburn ...", sourcePriority: 1 }));
  assert.ok(!isEligible({ headline: "JR from Pig Destroyer drinks Buckfast at Damnation Festival", sourcePriority: 0 }));
  assert.ok(!isEligible({ headline: "Buckfast - Scottish Daily Record - Page 5", sourcePriority: 1 }));
  assert.ok(!isEligible({ headline: "Buckfast Weather Today & Hourly Forecast", sourcePriority: 1 }));
});

test("credits the source and points to the site in the caption", () => {
  const text = caption({ headline: "Angus woman jailed for Buckfast bottle petrol bomb attack", source: "The Courier" });
  assert.match(text, /^Angus woman jailed/);
  assert.match(text, /Source: The Courier/);
  assert.match(text, /buckfastandfurious\.com/);
});
