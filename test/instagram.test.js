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

test("can count pending stories without a browser", () => {
  const { execFileSync } = require("node:child_process");
  const out = execFileSync(process.execPath, [require.resolve("../scripts/instagram.js"), "--pending"], { encoding: "utf8" });
  assert.match(out.trim(), /^\d+$/);
});

test("tags the town of the story in the caption", () => {
  const { findPlace, placeTags } = require("../scripts/places.js");
  assert.deepEqual(findPlace("Ayr thug smashed Buckfast bottle over man's head"), { name: "Ayr", region: "Ayrshire", country: "Scotland" });
  assert.equal(findPlace("Buckfast-fuelled lout jailed in Ayrshire").name, "Ayrshire");
  assert.equal(findPlace("Domestic abuser's Buckfast claim rejected", "A Dunfermline man told the court").name, "Dunfermline");
  assert.equal(findPlace("Buckfast sales jump despite duty hike"), null);
  assert.deepEqual(placeTags(null), ["scotland", "scottishnews"]);
  const text = caption({ headline: "Angus woman jailed for Buckfast bottle petrol bomb attack", source: "The Courier" });
  assert.match(text, /📍 Angus/);
  assert.match(text, /#angus #scotland/);
});
