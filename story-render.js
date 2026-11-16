// Native Canvas 2D renderer for Buckfast & Furious Instagram visuals.
// Replaces html2canvas: text is drawn by the browser's own text engine,
// so the font's kerning is kept and the layout is fully controlled.
(function (global) {
  "use strict";

  const COLORS = { bg: "#f35a08", ink: "#050505" };

  const FORMATS = {
    // Instagram story: the top ~250 px and bottom ~340 px sit under the app UI.
    story: { w: 1080, h: 1920, safeTop: 250, safeBottom: 340, pad: 72, padRight: 72 },
    // Instagram reel: caption and username cover the bottom, the like /
    // comment / share column covers the right edge.
    reel: { w: 1080, h: 1920, safeTop: 230, safeBottom: 440, pad: 72, padRight: 150 },
    // Instagram feed post (4:5).
    post: { w: 1080, h: 1350, safeTop: 0, safeBottom: 0, pad: 72, padRight: 72 }
  };

  const LABELS = {
    en: { readMore: "Read the story on", source: "Source" },
    fr: { readMore: "L’histoire complète sur", source: "Source" }
  };

  const FONT_FILES = {
    400: "Radial Regular.otf",
    700: "Radial Bold.otf",
    900: "Radial Heavy.otf"
  };

  let fontsPromise = null;

  // Loads the fonts explicitly through the FontFace API under a private
  // family name, so drawing never starts before the glyphs are available.
  function loadFonts(baseUrl) {
    if (fontsPromise) return fontsPromise;
    const base = baseUrl || "";
    fontsPromise = Promise.all(
      Object.entries(FONT_FILES).map(([weight, file]) => {
        const face = new FontFace("RadialStory", `url("${base}${encodeURI(file)}")`, { weight: String(weight) });
        return face.load().then(f => { document.fonts.add(f); return f; });
      })
    );
    return fontsPromise;
  }

  // Typographic clean-up of raw news headlines.
  function smartTypography(text) {
    let s = String(text || "")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    s = s.replace(/\s*\.\.\.$/, "…").replace(/\.\.\./g, "…");
    s = s.replace(/ - /g, " – ").replace(/ -- /g, " – ");
    // Double quotes: opening after start/space/bracket, closing otherwise.
    s = s.replace(/(^|[\s(\[–—])"/g, "$1“").replace(/"/g, "”");
    // Single quotes and apostrophes.
    s = s.replace(/(^|[\s(\[“–—])'/g, "$1‘").replace(/'/g, "’");
    return s;
  }

  // Splits a headline into breakable pieces. A hyphenated compound
  // ("Buckfast-fuelled") may break after its hyphen.
  function tokenize(text, splitHyphens) {
    const tokens = [];
    text.split(" ").forEach((word, wi) => {
      const parts = splitHyphens ? word.split(/(?<=[a-zA-Z]-)(?=[a-zA-Z]{3,})/) : [word];
      parts.forEach((part, pi) => {
        tokens.push({ text: part, spaceBefore: wi > 0 && pi === 0 });
      });
    });
    return tokens;
  }

  function setFont(ctx, weight, size, tracking) {
    ctx.font = `${weight} ${size}px RadialStory`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${(tracking * size).toFixed(2)}px`;
    if ("fontKerning" in ctx) ctx.fontKerning = "normal";
  }

  // Balanced line breaking (minimum raggedness), with penalties for a
  // very short last line and for a lone last word.
  function breakLines(ctx, tokens, maxWidth) {
    const n = tokens.length;
    const space = ctx.measureText(" ").width;
    const widths = tokens.map(t => ctx.measureText(t.text).width);

    const lineWidth = (i, j) => {
      let w = 0;
      for (let k = i; k < j; k += 1) w += widths[k] + (k > i && tokens[k].spaceBefore ? space : 0);
      return w;
    };

    const best = new Array(n + 1).fill(Infinity);
    const prev = new Array(n + 1).fill(-1);
    best[0] = 0;

    for (let j = 1; j <= n; j += 1) {
      for (let i = j - 1; i >= 0; i -= 1) {
        // A line cannot start on a fragment that continues a hyphenated word
        // unless the previous token really ended with a hyphen (always true here).
        const w = lineWidth(i, j);
        if (w > maxWidth) {
          if (j - i === 1) return null; // a single piece is wider than the box
          break;
        }
        const slack = maxWidth - w;
        let cost = slack * slack;
        if (j === n) {
          cost = 0.35 * cost;
          if (w < maxWidth * 0.38) cost += maxWidth * maxWidth * 0.5;
          if (j - i === 1 && n > 2) cost += maxWidth * maxWidth * 0.6;
        }
        if (best[i] + cost < best[j]) { best[j] = best[i] + cost; prev[j] = i; }
      }
    }

    const lines = [];
    for (let j = n; j > 0; j = prev[j]) {
      const i = prev[j];
      if (i < 0) return null;
      let txt = "";
      for (let k = i; k < j; k += 1) txt += (k > i && tokens[k].spaceBefore ? " " : "") + tokens[k].text;
      lines.unshift(txt);
    }
    return lines;
  }

  function raggedness(ctx, lines, maxWidth) {
    if (lines.length < 2) return 0;
    let sum = 0;
    for (let i = 0; i < lines.length - 1; i += 1) {
      const r = 1 - ctx.measureText(lines[i]).width / maxWidth;
      sum += r * r;
    }
    return sum / (lines.length - 1);
  }

  // Finds the largest type size whose balanced layout fits the box, then
  // trades a little size for a better-balanced rag when that helps.
  function fitHeadline(ctx, text, box, opts) {
    const whole = tokenize(text, false);
    const split = tokenize(text, true);
    const fits = size => {
      setFont(ctx, opts.weight, size, opts.tracking);
      const lines = breakLines(ctx, whole, box.w) || breakLines(ctx, split, box.w);
      const height = lines ? (lines.length - 1) * size * opts.leading + size * 0.78 : Infinity;
      return lines && height <= box.h ? lines : null;
    };
    let lo = opts.minSize, hi = opts.maxSize, maxFit = opts.minSize;
    for (let step = 0; step < 14; step += 1) {
      const size = (lo + hi) / 2;
      if (fits(size)) { maxFit = size; lo = size; } else { hi = size; }
    }
    maxFit = Math.floor(maxFit);

    let chosen = null;
    for (let size = maxFit; size >= Math.max(opts.minSize, maxFit * 0.8); size -= 1) {
      const lines = fits(size);
      if (!lines) continue;
      const score = raggedness(ctx, lines, box.w) + 0.9 * (1 - size / maxFit);
      if (!chosen || score < chosen.score) chosen = { size, lines, score };
    }
    if (!chosen) {
      setFont(ctx, opts.weight, opts.minSize, opts.tracking);
      chosen = { size: opts.minSize, lines: breakLines(ctx, split, box.w) || [text] };
    }
    setFont(ctx, opts.weight, chosen.size, opts.tracking);
    return { size: chosen.size, lines: chosen.lines };
  }

  // Computes every element's position once, so the still image and the
  // video frames share exactly the same layout.
  function layout(ctx, data, formatName) {
    const f = FORMATS[formatName] || FORMATS.story;
    const lang = LABELS[data.lang] ? data.lang : "en";
    const L = { f, lang, labels: LABELS[lang] };
    // "black" swaps the brand colours: black background, orange type.
    L.colors = data.theme === "black" ? { bg: COLORS.ink, ink: COLORS.bg } : { bg: COLORS.bg, ink: COLORS.ink };

    const tall = f.h > 1500;
    const top = f.safeTop + (tall ? 10 : 64);
    L.header = { y: top, rule: top };
    const footerH = 236;
    L.footer = { y: f.h - f.safeBottom - footerH - (tall ? 0 : f.pad), h: footerH };

    const titleTop = top + 120;
    const titleBottom = L.footer.y - 140; // room for the source credit
    L.title = fitHeadline(ctx, smartTypography(data.headline), { w: f.w - f.pad - f.padRight, h: titleBottom - titleTop }, {
      weight: 700, tracking: -0.03, leading: 0.94,
      minSize: 54, maxSize: tall ? 168 : 140
    });
    // The headline block (title + source credit) sits on the optical centre
    // of the free space between header and footer.
    const blockH = (L.title.lines.length - 1) * L.title.size * 0.94 + L.title.size * 0.78;
    const free = Math.max(0, (L.footer.y - 70) - titleTop - (blockH + 70));
    L.title.x = f.pad;
    L.title.y = titleTop + free * 0.4;
    L.source = { y: L.title.y + blockH + 70 };
    L.data = {
      category: String(data.category || "").toUpperCase(),
      date: String(data.date || "").toUpperCase(),
      source: smartTypography(data.source || ""),
      site: data.site || "buckfastandfurious.com"
    };
    return L;
  }

  // Draws one frame. `t` maps each element to a 0..1 reveal progress;
  // omitted (still image) means everything fully shown.
  function draw(ctx, L, t) {
    const { f } = L;
    const p = key => (t && key in t ? Math.max(0, Math.min(1, t[key])) : 1);
    const ease = x => 1 - Math.pow(1 - x, 3);

    ctx.save();
    ctx.fillStyle = L.colors.bg;
    ctx.fillRect(0, 0, f.w, f.h);
    ctx.fillStyle = L.colors.ink;
    ctx.textBaseline = "alphabetic";

    // Header: rule + brand / category · date
    const ph = ease(p("header"));
    ctx.globalAlpha = ph;
    ctx.fillRect(f.pad, L.header.rule, (f.w - f.pad - f.padRight) * ph, 4);
    setFont(ctx, 700, 26, 0.06);
    ctx.textAlign = "left";
    ctx.fillText("BUCKFAST & FURIOUS", f.pad, L.header.y + 52);
    ctx.textAlign = "right";
    const meta = [L.data.category, L.data.date].filter(Boolean).join("  ·  ");
    ctx.fillText(meta, f.w - f.padRight, L.header.y + 52);
    ctx.globalAlpha = 1;

    // Headline, line by line
    setFont(ctx, 700, L.title.size, -0.03);
    ctx.textAlign = "left";
    const lh = L.title.size * 0.94;
    const first = L.title.y + L.title.size * 0.78;
    L.title.lines.forEach((line, i) => {
      const pl = ease(p(`line${i}`));
      if (pl <= 0) return;
      const y = first + i * lh;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, y - L.title.size * 0.95, f.w, L.title.size * 1.2);
      ctx.clip();
      ctx.fillText(line, L.title.x, y + (1 - pl) * L.title.size * 0.9);
      ctx.restore();
    });

    // Source credit
    const ps = ease(p("source"));
    if (L.data.source && ps > 0) {
      ctx.globalAlpha = ps;
      setFont(ctx, 700, 30, 0.04);
      ctx.fillText(`${L.labels.source.toUpperCase()} — ${L.data.source}`, f.pad, L.source.y);
      ctx.globalAlpha = 1;
    }

    // Footer: black label carrying the site address, kept above the story UI
    const pf = ease(p("footer"));
    if (pf > 0) {
      const fx = f.pad, fw = f.w - f.pad - f.padRight;
      const fy = L.footer.y + (1 - pf) * 40;
      ctx.globalAlpha = pf;
      ctx.fillRect(fx, fy, fw, L.footer.h);
      ctx.fillStyle = L.colors.bg;
      const inner = 44;
      setFont(ctx, 700, 26, 0.06);
      ctx.fillText(L.labels.readMore.toUpperCase(), fx + inner, fy + inner + 22);
      setFont(ctx, 700, 100, -0.03);
      const w100 = ctx.measureText(L.data.site).width;
      const siteSize = Math.min(110, Math.floor(100 * (fw - inner * 2) / w100));
      setFont(ctx, 700, siteSize, -0.03);
      ctx.fillText(L.data.site, fx + inner, fy + L.footer.h - inner - 4);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // Reveal timeline (seconds) for the animated version.
  function timeline(L, time) {
    const t = {};
    const seg = (start, dur) => (time - start) / dur;
    t.header = seg(0.15, 0.6);
    const lineStart = 0.45, stagger = 0.13, lineDur = 0.55;
    L.title.lines.forEach((_, i) => { t[`line${i}`] = seg(lineStart + i * stagger, lineDur); });
    const afterTitle = lineStart + (L.title.lines.length - 1) * stagger + lineDur;
    t.source = seg(afterTitle + 0.05, 0.45);
    t.footer = seg(afterTitle + 0.35, 0.55);
    return t;
  }


  // ------------------------------------------------------------------
  // Motion version (Reels): intro on the category, word-by-word headline,
  // highlighted keyword, typed source, footer label that becomes the end
  // card. Starts and ends on black so the Reel loops cleanly.

  const clamp01 = x => Math.max(0, Math.min(1, x));
  const prog = (t, start, dur) => clamp01((t - start) / dur);
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeInOut = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const easeBack = x => { const c = 1.15; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;

  function wordsOf(ctx, L) {
    if (L._words) return L._words;
    setFont(ctx, 700, L.title.size, -0.03);
    const space = ctx.measureText(" ").width;
    const words = [];
    L.title.lines.forEach((line, li) => {
      let x = L.title.x;
      line.split(" ").forEach(text => {
        const width = ctx.measureText(text).width;
        words.push({ text, line: li, x, width });
        x += width + space;
      });
    });
    L._words = words;
    L._highlight = words.findIndex(w => /buckfast/i.test(w.text));
    return words;
  }

  function motionTimes(L) {
    const count = L.title.lines.join(" ").split(" ").length;
    const T = { intro: 0.1, wipe: 1.0, wipeDur: 0.36, header: 1.25, words: 1.45, stagger: 0.055, wordDur: 0.5 };
    T.wordsEnd = T.words + (count - 1) * T.stagger + T.wordDur;
    T.highlight = T.wordsEnd + 0.05;
    T.source = T.wordsEnd;
    T.footer = T.highlight + 0.3;
    T.outro = 6.8;
    T.outroDur = 0.55;
    T.duration = 8;
    T.cover = 5.8;
    return T;
  }

  function drawIntro(ctx, L, t, T) {
    const { f } = L;
    const wipe = easeInOut(prog(t, T.wipe, T.wipeDur));
    const visible = f.h * (1 - wipe);
    if (visible <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, f.w, visible);
    ctx.clip();
    ctx.fillStyle = L.colors.ink;
    ctx.fillRect(0, 0, f.w, f.h);

    const word = (L.data.category || "BUCKFAST").toUpperCase();
    const lines = word.split(" ");
    const width = f.w - f.pad - f.padRight;
    setFont(ctx, 900, 100, -0.04);
    const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
    const size = Math.min(330, Math.floor(100 * width / widest));
    const lh = size * 0.86;
    const blockH = (lines.length - 1) * lh + size * 0.74;
    const top = f.safeTop + (f.h - f.safeTop - f.safeBottom - blockH) / 2;

    ctx.fillStyle = L.colors.bg;
    setFont(ctx, 700, 26, 0.06);
    ctx.globalAlpha = easeOut(prog(t, T.intro, 0.4));
    ctx.textAlign = "left";
    ctx.fillText("BUCKFAST & FURIOUS", f.pad, top - 60);
    ctx.textAlign = "right";
    ctx.fillText(L.data.date, f.w - f.padRight, top - 60);
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;

    setFont(ctx, 900, size, -0.04);
    let index = 0;
    lines.forEach((line, li) => {
      const base = top + size * 0.74 + li * lh;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, base - size * 0.8, f.w, size * 0.86);
      ctx.clip();
      for (let i = 0; i < line.length; i += 1) {
        const x = f.pad + ctx.measureText(line.slice(0, i)).width;
        const p = easeOut(prog(t, T.intro + 0.08 + index * 0.028, 0.42));
        ctx.fillText(line[i], x, base + (1 - p) * size * 0.9);
        index += 1;
      }
      ctx.restore();
    });
    ctx.restore();
  }

  function drawMotion(ctx, L, t) {
    const { f } = L;
    const T = motionTimes(L);
    const words = wordsOf(ctx, L);
    const size = L.title.size;
    const lh = size * 0.94;
    const firstBase = L.title.y + size * 0.78;

    ctx.save();
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = L.colors.bg;
    ctx.fillRect(0, 0, f.w, f.h);

    // Slow push-in during the main scene.
    const zoom = 1 + 0.03 * easeInOut(prog(t, T.header, T.outro - T.header));
    ctx.save();
    ctx.translate(f.w / 2, f.h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-f.w / 2, -f.h / 2);
    ctx.fillStyle = L.colors.ink;

    // Header
    const rule = easeInOut(prog(t, T.header, 0.5));
    ctx.fillRect(f.pad, L.header.rule, (f.w - f.pad - f.padRight) * rule, 4);
    const ph = easeOut(prog(t, T.header + 0.15, 0.4));
    if (ph > 0) {
      ctx.globalAlpha = ph;
      setFont(ctx, 700, 26, 0.06);
      const dy = (1 - ph) * 16;
      ctx.fillText("BUCKFAST & FURIOUS", f.pad, L.header.y + 52 + dy);
      ctx.textAlign = "right";
      ctx.fillText([L.data.category, L.data.date].filter(Boolean).join("  ·  "), f.w - f.padRight, L.header.y + 52 + dy);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }

    // Headline, word by word
    setFont(ctx, 700, size, -0.03);
    words.forEach((w, i) => {
      const p = prog(t, T.words + i * T.stagger, T.wordDur);
      if (p <= 0) return;
      const base = firstBase + w.line * lh;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, base - size * 1.05, f.w, size * 1.3);
      ctx.clip();
      ctx.fillText(w.text, w.x, base + (1 - easeBack(p)) * size);
      ctx.restore();
    });

    // Keyword highlight: a black block sweeps behind "Buckfast"
    const hi = L._highlight;
    const hp = easeInOut(prog(t, T.highlight, 0.42));
    if (hi >= 0 && hp > 0) {
      const w = words[hi];
      const base = firstBase + w.line * lh;
      const padX = size * 0.08;
      const boxTop = base - size * 0.8;
      const boxH = size * 0.96;
      const boxW = (w.width + padX * 2) * hp;
      ctx.fillRect(w.x - padX, boxTop, boxW, boxH);
      ctx.save();
      ctx.beginPath();
      ctx.rect(w.x - padX, boxTop, boxW, boxH);
      ctx.clip();
      ctx.fillStyle = L.colors.bg;
      ctx.fillText(w.text, w.x, base);
      ctx.restore();
    }

    // Source, typed
    if (L.data.source) {
      const text = `${L.labels.source.toUpperCase()} — ${L.data.source}`;
      const shown = Math.floor(prog(t, T.source, text.length * 0.022) * text.length);
      if (shown > 0) {
        setFont(ctx, 700, 30, 0.04);
        ctx.fillText(text.slice(0, shown), f.pad, L.source.y);
      }
    }

    // Footer label grows from its baseline, then the address cascades in
    const fx = f.pad, fw = f.w - f.pad - f.padRight, fy = L.footer.y, fh = L.footer.h;
    const pf = easeOut(prog(t, T.footer, 0.45));
    const inner = 44;
    setFont(ctx, 700, 100, -0.03);
    const siteSize = Math.min(110, Math.floor(100 * (fw - inner * 2) / ctx.measureText(L.data.site).width));
    if (pf > 0) {
      ctx.fillRect(fx, fy + fh * (1 - pf), fw, fh * pf);
      ctx.save();
      ctx.beginPath();
      ctx.rect(fx, fy, fw, fh);
      ctx.clip();
      ctx.fillStyle = L.colors.bg;
      const pr = easeOut(prog(t, T.footer + 0.2, 0.35));
      ctx.globalAlpha = pr;
      setFont(ctx, 700, 26, 0.06);
      ctx.fillText(L.labels.readMore.toUpperCase(), fx + inner, fy + inner + 22 + (1 - pr) * 12);
      ctx.globalAlpha = 1;
      setFont(ctx, 700, siteSize, -0.03);
      const site = L.data.site;
      const base = fy + fh - inner - 4;
      for (let i = 0; i < site.length; i += 1) {
        const p = easeOut(prog(t, T.footer + 0.28 + i * 0.016, 0.3));
        if (p <= 0) continue;
        const x = fx + inner + ctx.measureText(site.slice(0, i)).width;
        ctx.globalAlpha = p;
        ctx.fillText(site[i], x, base + (1 - p) * siteSize * 0.5);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    ctx.restore(); // camera

    // Outro: the black label opens to the whole frame and becomes the end card
    const po = easeInOut(prog(t, T.outro, T.outroDur));
    if (po > 0) {
      const sx = v => f.w / 2 + (v - f.w / 2) * zoom;
      const sy = v => f.h / 2 + (v - f.h / 2) * zoom;
      const x0 = lerp(sx(fx), 0, po), y0 = lerp(sy(fy), 0, po);
      const x1 = lerp(sx(fx + fw), f.w, po), y1 = lerp(sy(fy + fh), f.h, po);
      ctx.fillStyle = L.colors.ink;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      ctx.fillStyle = L.colors.bg;
      const endSize = siteSize * 1.12;
      const sz = lerp(siteSize * zoom, endSize, po);
      setFont(ctx, 700, sz, -0.03);
      const tw = ctx.measureText(L.data.site).width;
      const textX = lerp(sx(fx + inner), (f.w - tw) / 2, po);
      const textY = lerp(sy(fy + fh - inner - 4), f.h / 2 + endSize * 0.3, po);
      ctx.fillText(L.data.site, textX, textY);
      setFont(ctx, 700, 26, 0.06);
      const label = L.labels.readMore.toUpperCase();
      const lw = ctx.measureText(label).width;
      ctx.fillText(label, lerp(sx(fx + inner), (f.w - lw) / 2, po), lerp(sy(fy + inner + 22), f.h / 2 - endSize * 0.75, po));
    }

    drawIntro(ctx, L, t, T);
    ctx.restore();
  }

  async function renderStill(canvas, data, formatName, baseUrl) {
    await loadFonts(baseUrl);
    const f = FORMATS[formatName] || FORMATS.story;
    canvas.width = f.w;
    canvas.height = f.h;
    const ctx = canvas.getContext("2d");
    const L = layout(ctx, data, formatName);
    draw(ctx, L);
    return L;
  }

  global.BFStory = { FORMATS, loadFonts, smartTypography, layout, draw, timeline, drawMotion, motionTimes, renderStill };
})(window);
