const test = require("node:test");
const assert = require("node:assert/strict");
const { caption, isEligible, planAutoRun, storyKey } = require("../scripts/instagram.js");

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

test("keeps extra new stories pending instead of dropping them", () => {
  const now = Date.parse("2026-11-19T12:00:00Z");
  const story = (key, hoursAgo) => ({
    key, headline: `Buckfast bottle attacker jailed after court hearing ${key}`, sourcePriority: 1,
    pubDate: new Date(now - hoursAgo * 3600e3).toISOString()
  });
  const stories = [story("a", 1), story("b", 2), story("old", 24 * 30)];
  const state = { seen: [], posts: [] };

  const first = planAutoRun(stories, state, ["a", "b", "old", "hidden"], now);
  assert.deepEqual(first.queue.map(s => s.key), ["a"]);
  assert.equal(first.waiting, 1);
  assert.deepEqual(first.skipped.sort(), ["hidden", "old", "old"]);

  // Next run, once "a" is published: "b" goes out.
  state.seen.push(...first.skipped, "a");
  state.posts.push({ key: "a", at: new Date(now).toISOString() });
  const second = planAutoRun(stories, state, ["a", "b", "old", "hidden"], now + 3600e3);
  assert.deepEqual(second.queue.map(s => s.key), ["b"]);
});

test("waits for the next day when the daily limit is reached", () => {
  const now = Date.parse("2026-11-19T12:00:00Z");
  const posts = [1, 2, 3].map(h => ({ key: `p${h}`, at: new Date(now - h * 3600e3).toISOString() }));
  const stories = [{ key: "n", headline: "Man admits using Buckfast bottle to assault two in Ayr", sourcePriority: 1, pubDate: new Date(now).toISOString() }];
  const plan = planAutoRun(stories, { seen: [], posts }, ["n"], now);
  assert.equal(plan.queue.length, 0);
  assert.equal(plan.waiting, 1);
  assert.deepEqual(plan.skipped, []);
});
