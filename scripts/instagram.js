#!/usr/bin/env node
"use strict";

// Publishes new Buckfast stories on Instagram as Reels.
//
// The visual is drawn by story-render.js inside the real site (index.html run
// in headless Chromium), so the headline, source, date and category are
// exactly what visitors see. Each frame is encoded to MP4 with ffmpeg, then
// sent to the Instagram Graph API with a resumable upload (no public URL needed).
//
// Modes (IG_MODE):
//   auto     publish stories that appeared since the last run (default)
//   dry-run  render the latest eligible story and check the token, publish nothing
//   latest   publish the latest eligible story that was never posted
//
// State lives in data/instagram-state.json: every story already seen is
// recorded, so the backlog is never posted and nothing is posted twice.

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const STATE_PATH = path.join(ROOT, "data", "instagram-state.json");
const OUT_DIR = path.join(ROOT, "social-out");

const GRAPH = `https://graph.facebook.com/${process.env.IG_GRAPH_VERSION || "v27.0"}`;
const IG_USER_ID = process.env.IG_USER_ID || "17841475935625616";
const TOKEN = process.env.IG_ACCESS_TOKEN || "";
const MODE = process.env.IG_MODE || "auto";
const MAX_PER_RUN = Number(process.env.IG_MAX_PER_RUN || 1);
const MAX_PER_DAY = Number(process.env.IG_MAX_PER_DAY || 3);
const MAX_AGE_HOURS = Number(process.env.IG_MAX_AGE_HOURS || 72);
// Music from Instagram's own catalogue (licensed for third-party use):
// either one fixed track (IG_AUDIO_ID) or a search keyword (IG_MUSIC_QUERY)
// whose top results are used in rotation.
const AUDIO_ID = process.env.IG_AUDIO_ID || "";
const MUSIC_QUERY = process.env.IG_MUSIC_QUERY || "";

const FPS = 30;
const DURATION = 7;
const COVER_AT = 4.5; // seconds: everything is revealed

const HASHTAGS = "#buckfast #buckfasttonicwine #buckie #scotland #scottishnews";

// ---------------------------------------------------------------- state

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return { initialized: null, seen: [], posts: [] };
  }
}

function saveState(state) {
  state.seen = [...new Set(state.seen)].slice(-2000);
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

// Google Alerts wraps article links in a redirect; the real URL is the key.
function storyKey(link) {
  try {
    const url = new URL(link);
    if (/(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.searchParams.get("url")) {
      return url.searchParams.get("url").split("#")[0];
    }
    return url.href.split("#")[0];
  } catch {
    return String(link || "");
  }
}

// ---------------------------------------------------------------- selection

function isEligible(story) {
  const headline = String(story.headline || "").trim();
  if (story.sourcePriority === 0) return false; // Reddit, Facebook, X, Instagram
  if (headline.length < 25 || headline.length > 170) return false;
  if (/(\.\.\.|…)\s*$/.test(headline)) return false; // truncated by the feed
  if (/\bpage \d+\b/i.test(headline) || /https?:\/\//i.test(headline)) return false;
  if (/\b(?:weather|forecast|hourly|postcode|hotels?|things to do|directions)\b/i.test(headline)) return false; // the village, not the drink
  return true;
}

function isRecent(story) {
  const time = new Date(story.pubDate).getTime();
  return Number.isFinite(time) && Date.now() - time <= MAX_AGE_HOURS * 3600e3;
}

function caption(story) {
  const clean = value => String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return [
    clean(story.headline),
    "",
    story.source ? `Source: ${clean(story.source)}` : "",
    "Every Buckfast story, collected daily → buckfastandfurious.com (link in bio)",
    "",
    HASHTAGS
  ].filter((line, i, all) => line !== "" || all[i - 1] !== "").join("\n");
}

// ---------------------------------------------------------------- site & rendering

function serveSite() {
  const types = {
    ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json",
    ".css": "text/css", ".otf": "font/otf", ".png": "image/png", ".webp": "image/webp"
  };
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = path.normalize(path.join(ROOT, pathname === "/" ? "index.html" : pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function openSite() {
  const { chromium } = require("playwright");
  const server = await serveSite();
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("buckfast_lang", "en"); } catch {} });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: "load" });
  await page.waitForFunction(() => typeof allEntries !== "undefined" && allEntries.length > 0, null, { timeout: 60000 });
  if (!(await page.evaluate(() => typeof window.BFStory === "object"))) {
    await page.addScriptTag({ path: path.join(ROOT, "story-render.js") });
  }
  return { server, browser, page };
}

function listStories(page) {
  return page.evaluate(() => allEntries.map(entry => {
    const parts = getStoryParts(entry);
    return {
      link: entry.link,
      pubDate: entry.pubDate,
      headline: parts.headline,
      source: parts.source,
      date: formatStoryDate(entry.pubDate),
      category: UI.en.categories[entry.category] || "",
      sourcePriority: sourcePriority(entry)
    };
  }));
}

function run(cmd, args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: [input ? "pipe" : "ignore", "inherit", "inherit"] });
    child.on("error", reject);
    child.on("close", code => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
    if (input) input(child.stdin);
  });
}

async function renderReel(page, story, basename) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const video = path.join(OUT_DIR, `${basename}.mp4`);
  const cover = path.join(OUT_DIR, `${basename}.jpg`);

  await page.evaluate(async data => {
    window.__reelCanvas = document.createElement("canvas");
    window.__reelLayout = await BFStory.renderStill(window.__reelCanvas, data, "reel", "");
  }, { headline: story.headline, source: story.source, date: story.date, category: story.category, lang: "en" });

  const frame = time => page.evaluate(t => {
    const canvas = window.__reelCanvas;
    BFStory.draw(canvas.getContext("2d"), window.__reelLayout, BFStory.timeline(window.__reelLayout, t));
    return canvas.toDataURL("image/png").split(",")[1];
  }, time);

  const frames = [];
  for (let i = 0; i < FPS * DURATION; i += 1) frames.push(Buffer.from(await frame(i / FPS), "base64"));
  fs.writeFileSync(cover.replace(/\.jpg$/, ".png"), Buffer.from(await frame(COVER_AT), "base64"));

  await run("ffmpeg", [
    "-v", "error", "-y",
    "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
    "-shortest", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", video
  ], stdin => { for (const buffer of frames) stdin.write(buffer); stdin.end(); });
  await run("ffmpeg", ["-v", "error", "-y", "-i", cover.replace(/\.jpg$/, ".png"), "-q:v", "2", cover]);
  fs.rmSync(cover.replace(/\.jpg$/, ".png"));
  return { video, cover };
}

// ---------------------------------------------------------------- Instagram Graph API

async function graph(method, endpoint, params = {}) {
  const url = new URL(`${GRAPH}${endpoint}`);
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const response = method === "GET"
    ? await fetch(`${url}?${body}`)
    : await fetch(url, { method, body });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error) {
    const error = json.error || {};
    throw new Error(`Graph API ${method} ${endpoint}: ${error.message || response.status} (code ${error.code || "?"}, subcode ${error.error_subcode || "?"})`);
  }
  return json;
}

async function checkAccount() {
  const account = await graph("GET", `/${IG_USER_ID}`, { fields: "username" });
  let quota = null;
  try {
    quota = (await graph("GET", `/${IG_USER_ID}/content_publishing_limit`, { fields: "quota_usage,config" })).data?.[0] || null;
  } catch (error) {
    console.warn(`Could not read the publishing limit: ${error.message}`);
  }
  console.log(`Instagram account: @${account.username}${quota ? ` — ${quota.quota_usage}/${quota.config?.quota_total} posts in the last 24 h` : ""}`);
  return account;
}

async function searchMusic(query) {
  const result = await graph("GET", "/ig_audio", { audio_type: "music", user_id: IG_USER_ID, search_query: query });
  return (result.data || result.audio || []).map(track => ({
    id: String(track.audio_id || track.id || ""),
    title: track.title || "",
    artist: track.display_artist || track.artist || "",
    duration: track.duration_in_ms || null
  })).filter(track => track.id);
}

async function pickMusic(rotation) {
  if (AUDIO_ID) return { id: AUDIO_ID, title: "", artist: "" };
  if (!MUSIC_QUERY) return null;
  try {
    const tracks = (await searchMusic(MUSIC_QUERY)).slice(0, 5);
    return tracks.length ? tracks[rotation % tracks.length] : null;
  } catch (error) {
    console.warn(`Music search failed, the Reel goes out without music: ${error.message}`);
    return null;
  }
}

async function createReelContainer(story, music) {
  const params = {
    media_type: "REELS",
    upload_type: "resumable",
    caption: caption(story),
    share_to_feed: "true",
    thumb_offset: String(COVER_AT * 1000)
  };
  if (music) {
    try {
      return await graph("POST", `/${IG_USER_ID}/media`, {
        ...params,
        audio_configuration: JSON.stringify({ audio_id: music.id, audio_volume: 100, video_volume: 1 })
      });
    } catch (error) {
      console.warn(`Instagram refused the music, publishing without it: ${error.message}`);
    }
  }
  return graph("POST", `/${IG_USER_ID}/media`, params);
}

async function publishReel(story, video, music) {
  const container = await createReelContainer(story, music);
  const uploadUrl = container.uri || `https://rupload.facebook.com/ig-api-upload/${GRAPH.split("/").pop()}/${container.id}`;
  const file = fs.readFileSync(video);
  const upload = await fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `OAuth ${TOKEN}`, offset: "0", file_size: String(file.length) },
    body: file
  });
  if (!upload.ok) throw new Error(`Video upload failed: ${upload.status} ${await upload.text()}`);

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const { status_code: status, status: detail } = await graph("GET", `/${container.id}`, { fields: "status_code,status" });
    if (status === "FINISHED") break;
    if (status === "ERROR" || status === "EXPIRED") throw new Error(`Instagram could not process the video: ${detail || status}`);
    if (attempt === 59) throw new Error("Instagram is still processing the video after 5 minutes");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  const media = await graph("POST", `/${IG_USER_ID}/media_publish`, { creation_id: container.id });
  const { permalink } = await graph("GET", `/${media.id}`, { fields: "permalink" }).catch(() => ({}));
  return { id: media.id, permalink: permalink || null };
}

// ---------------------------------------------------------------- main

function slug(value) {
  return String(value).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

async function main() {
  if (!TOKEN && MODE !== "dry-run") {
    console.log("IG_ACCESS_TOKEN is not set: nothing to do.");
    return;
  }

  const state = loadState();
  const { server, browser, page } = await openSite();
  try {
    const stories = (await listStories(page)).map(story => ({ ...story, key: storyKey(story.link) }));
    const posted = new Set(state.posts.map(post => post.key));

    if (!state.initialized && MODE === "auto") {
      state.initialized = new Date().toISOString();
      state.seen = stories.map(story => story.key);
      saveState(state);
      console.log(`First run: ${stories.length} existing stories marked as seen, nothing posted.`);
      return;
    }

    let queue;
    if (MODE === "auto") {
      const seen = new Set(state.seen);
      const fresh = stories.filter(story => !seen.has(story.key));
      const postedToday = state.posts.filter(post => Date.now() - new Date(post.at).getTime() < 24 * 3600e3).length;
      const room = Math.max(0, Math.min(MAX_PER_RUN, MAX_PER_DAY - postedToday));
      queue = fresh.filter(story => isEligible(story) && isRecent(story) && !posted.has(story.key)).slice(0, room);
      // Stories that will not be posted are recorded now; queued ones only
      // once published, so a failed upload is retried on the next run.
      const queued = new Set(queue.map(story => story.key));
      state.seen.push(...fresh.filter(story => !queued.has(story.key)).map(story => story.key));
      saveState(state);
      console.log(`${fresh.length} new story(ies), ${queue.length} to publish (${postedToday} posted in the last 24 h).`);
    } else {
      queue = stories.filter(story => isEligible(story) && !posted.has(story.key)).slice(0, 1);
    }

    if (TOKEN) await checkAccount();
    if (TOKEN && MODE === "dry-run" && MUSIC_QUERY) {
      const tracks = await searchMusic(MUSIC_QUERY).catch(error => { console.warn(error.message); return []; });
      console.log(`Music for “${MUSIC_QUERY}”:\n${tracks.slice(0, 15).map((t, i) => `  ${i + 1}. ${t.title} — ${t.artist} (id ${t.id})`).join("\n") || "  nothing found"}`);
    }

    for (const story of queue) {
      const basename = `${new Date(story.pubDate).toISOString().slice(0, 10)}-${slug(story.headline)}`;
      const media = await renderReel(page, story, basename);
      console.log(`Rendered ${path.relative(ROOT, media.video)} — “${story.headline}”`);
      if (MODE === "dry-run") {
        console.log(`Caption:\n${caption(story)}`);
        continue;
      }
      const music = await pickMusic(state.posts.length);
      if (music) console.log(`Music: ${music.title || music.id}${music.artist ? ` — ${music.artist}` : ""}`);
      const result = await publishReel(story, media.video, music);
      state.posts.push({ key: story.key, headline: story.headline, media_id: result.id, permalink: result.permalink, music: music ? music.id : null, at: new Date().toISOString() });
      if (!state.seen.includes(story.key)) state.seen.push(story.key);
      saveState(state);
      console.log(`Published on Instagram: ${result.permalink || result.id}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { caption, isEligible, storyKey };
