// Generates two HyperFrames projects (9:16 and 16:9) for the ClipFive ad.
// Usage: node ad/src/build.mjs   → writes ad/hf-9x16/ and ad/hf-16x9/
// Copy and placeholders live in COPY below; edit there and re-run, or edit the
// generated HTML directly in the HyperFrames desktop app.
import { mkdirSync, writeFileSync, rmSync, existsSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const AD = join(HERE, "..");

const COPY = {
  url: "[clipfive.com]", // PLACEHOLDER: real domain unknown (site runs on localhost)
  typedLink: "youtube.com/watch?v=your-video", // PLACEHOLDER
  cardCaptions: [
    ["Here's", "the", "part"],
    ["Nobody", "expected", "this"],
    ["Watch", "this", "moment"],
  ], // PLACEHOLDER sample speech
  cardHighlight: [1, 1, 2],
  scores: [94, 89, 83], // PLACEHOLDER sample scores (feature is real)
};

const Y = "#FFE01B";
const SCENES = [
  { id: "hook", start: 0, dur: 2.4 },
  { id: "problem", start: 2.4, dur: 3.2 },
  { id: "upload", start: 5.6, dur: 3.8 },
  { id: "moments", start: 9.4, dur: 3.8 },
  { id: "shorts", start: 13.2, dur: 4.4 },
  { id: "cta", start: 17.6, dur: 4.9 },
];
const TOTAL = 22.5;

const CAPTIONS = [
  { s: 0.15, e: 1.2, w: ["Got", "a", "long", "video?"], hi: 2 },
  { s: 1.2, e: 2.35, w: ["Turn", "it", "into", "shorts."], hi: 3 },
  { s: 2.5, e: 3.95, w: ["Cutting", "clips", "by", "hand?"], hi: 3 },
  { s: 3.95, e: 4.75, w: ["10+", "minutes."], hi: [0, 1] },
  { s: 4.75, e: 5.5, w: ["Every.", "Single.", "One."], hi: 1 },
  { s: 5.7, e: 7.5, w: ["Paste", "a", "YouTube", "link"], hi: 2 },
  { s: 7.5, e: 9.3, w: ["or", "upload", "any", "video"], hi: 1 },
  { s: 9.55, e: 11.3, w: ["ClipFive", "scans", "your", "video"], hi: 0 },
  { s: 11.3, e: 13.1, w: ["picks", "the", "best", "moments"], hi: [2, 3] },
  { s: 13.35, e: 15.4, w: ["5–10", "clips", "per", "video"], hi: 0 },
  { s: 15.4, e: 17.5, w: ["for", "TikTok,", "Reels", "&", "Shorts"], hi: [1, 2, 4] },
  { s: 17.75, e: 20.0, w: ["Free", "to", "start."], hi: 0 },
  { s: 20.0, e: 22.4, w: ["No", "credit", "card."], hi: 0 },
];

// Deterministic PRNG (mulberry32) so the waveform and editor are identical every build.
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r2 = (n) => Math.round(n * 100) / 100;
const hiSet = (hi) => new Set(Array.isArray(hi) ? hi : [hi]);

function scene(id, W, H, css, html, js) {
  return `<template>
  <style>
    #root { position: absolute; inset: 0; overflow: hidden; background: transparent; font-family: "Inter", sans-serif; color: #fff; }
    #root * { box-sizing: border-box; margin: 0; padding: 0; }
${css}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
${html}
  </div>
  <script>
    (() => {
      const tl = gsap.timeline({ paused: true });
${js}
      window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`;
}

const CURSOR_SVG = `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M3 2 L3 19 L7.6 14.9 L10.6 21.6 L13.7 20.2 L10.8 13.6 L17 13.4 Z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

// ───────────────────────────── Scene 1: hook ─────────────────────────────
function hook(P, W, H) {
  const cw = P ? 262 : 230;
  const ch = Math.round((cw * 16) / 9);
  const rectH = Math.round((cw * 3 * 9) / 16);
  const sy = r2(rectH / ch);
  const cx = P ? 540 : 1340;
  const cy = P ? 870 : 560;
  const gap = P ? 44 : 48;
  const left = cx - cw / 2;
  const top = cy - ch / 2;
  const hl = P
    ? `left:0; right:0; top:230px; text-align:center; font-size:150px;`
    : `left:140px; top:360px; text-align:left; font-size:128px;`;
  const css = `
    .h-hl { position:absolute; ${hl} font-family:"Archivo Black"; line-height:1.0; letter-spacing:-0.02em; text-transform:uppercase; }
    .h-hl span { display:inline-block; }
    .y { color:${Y}; }
    .h-slice { position:absolute; left:${left}px; top:${top}px; width:${cw}px; height:${ch}px; overflow:hidden;
      background: radial-gradient(circle at 18% 40%, #ff5fa2 0, rgba(255,95,162,0) 22%), radial-gradient(circle at 50% 55%, #ff3b2f 0, rgba(255,59,47,0) 26%), radial-gradient(circle at 82% 38%, #2bc0c0 0, rgba(43,192,192,0) 24%), linear-gradient(90deg, #8a1450, #6a1010 50%, #0b5a62);
      background-size: 300% 100%; }
    #h-s0 { background-position: 0% 50%; border-radius: 22px 0 0 22px; }
    #h-s1 { background-position: 50% 50%; }
    #h-s2 { background-position: 100% 50%; border-radius: 0 22px 22px 0; }
    .h-tint { position:absolute; inset:0; opacity:0; }
    #h-s0 .h-tint { background: radial-gradient(circle at 40% 35%, #ff7ab6 0, #b0145a 40%, #2a0414 85%); }
    #h-s1 .h-tint { background: radial-gradient(circle at 50% 40%, #ff3a2a 0, #a30d0d 40%, #200303 85%); }
    #h-s2 .h-tint { background: radial-gradient(circle at 45% 35%, #39d0cc 0, #0f5560 45%, #021012 88%); }
    .h-cap { position:absolute; left:0; right:0; bottom:${P ? 70 : 60}px; text-align:center; font-family:"Archivo Black"; font-size:${P ? 30 : 28}px; opacity:0; text-shadow:0 2px 6px rgba(0,0,0,.6); }
    #h-frame { position:absolute; left:${cx - (cw * 3) / 2}px; top:${cy - rectH / 2}px; width:${cw * 3}px; height:${rectH}px; border:3px solid rgba(255,255,255,.75); border-radius:22px; }
    #h-play { position:absolute; left:${cx - 60}px; top:${cy - 60}px; width:120px; height:120px; border-radius:50%; background:rgba(0,0,0,.45); border:3px solid rgba(255,255,255,.85); }
    #h-play::after { content:""; position:absolute; left:46px; top:34px; border-left:40px solid #fff; border-top:26px solid transparent; border-bottom:26px solid transparent; }
    #h-bar { position:absolute; left:${cx - (cw * 3) / 2 + 28}px; top:${cy + rectH / 2 - 34}px; width:${cw * 3 - 56}px; height:8px; border-radius:4px; background:rgba(255,255,255,.3); overflow:hidden; }
    #h-barfill { position:absolute; inset:0; background:#fff; transform-origin: 0 50%; }
  `;
  const capWords = [
    ["The", "best", "part"],
    ["Wait", "for", "it"],
    ["Here's", "the", "trick"],
  ];
  const html = `
    <div id="h-hl1" class="h-hl"><span>One</span><br><span>video</span></div>
    <div id="h-hl2" class="h-hl"><span>5–10</span><br><span class="y">shorts</span></div>
    <div id="h-group">
      ${[0, 1, 2]
        .map(
          (i) => `<div id="h-s${i}" class="h-slice"><div class="h-tint"></div><div class="h-cap">${capWords[i]
            .map((w, j) => (j === 1 ? `<span class="y">${w}</span>` : w))
            .join(" ")}</div></div>`,
        )
        .join("\n      ")}
      <div id="h-frame"></div>
      <div id="h-play"></div>
      <div id="h-bar"><div id="h-barfill"></div></div>
    </div>`;
  const off = cw + gap;
  const js = `
      gsap.set("#h-hl2 span", { opacity: 0, filter: "blur(8px)" });
      [0,1,2].forEach(i => gsap.set("#h-s"+i, { scaleY: ${sy}, x: (i - 1) * ${cw}, rotation: 0 }));
      tl.fromTo("#h-barfill", { scaleX: 0.04 }, { scaleX: 0.3, duration: 0.7, ease: "none" }, 0);
      tl.to(["#h-play", "#h-bar", "#h-frame"], { opacity: 0, scale: 0.9, duration: 0.14, ease: "power2.in" }, 0.6);
      tl.to("#h-s0", { x: ${-(cw + gap)}, scaleY: 1, scale: 1.04, rotation: -5, borderRadius: 22, duration: 0.5, ease: "expo.out" }, 0.7);
      tl.to("#h-s1", { y: ${P ? -24 : -18}, scaleY: 1, scale: 1.08, borderRadius: 22, duration: 0.5, ease: "expo.out" }, 0.7);
      tl.to("#h-s2", { x: ${cw + gap}, scaleY: 1, scale: 1.04, rotation: 5, borderRadius: 22, duration: 0.5, ease: "expo.out" }, 0.7);
      tl.to(".h-tint", { opacity: 1, duration: 0.3, ease: "power2.out", stagger: 0.05 }, 0.72);
      tl.to(".h-cap", { opacity: 1, duration: 0.15, stagger: 0.08 }, 1.05);
      tl.to("#h-hl1 span", { opacity: 0, filter: "blur(8px)", duration: 0.14, ease: "power2.in", stagger: 0.04 }, 0.68);
      tl.to("#h-hl2 span", { opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power4.out", stagger: 0.08 }, 0.86);
      tl.to(["#h-hl2", "#h-group"], { x: ${P ? -380 : -520}, opacity: 0, filter: "blur(14px)", duration: 0.24, ease: "power3.in" }, 2.14);
  `;
  return scene("hook", W, H, css, html, js);
}

// ──────────────────────────── Scene 2: problem ────────────────────────────
function problem(P, W, H) {
  const R = rng(7);
  const ex = P ? 60 : 360,
    ey = P ? 590 : 270,
    ew = P ? 960 : 1200,
    eh = P ? 540 : 580;
  const tracksTop = eh - 230;
  let blocks = "";
  const colors = ["#3a3a3a", "#474747", "#3d4a5c", "#4d3f3f"];
  for (let t = 0; t < 4; t++) {
    let x = 24 + R() * 30;
    let n = 0;
    while (x < ew - 80) {
      const w = 60 + R() * (ew / 5);
      const wclip = Math.min(w, ew - 24 - x);
      blocks += `<div class="p-blk" style="left:${Math.round(x)}px; top:${tracksTop + t * 50}px; width:${Math.round(wclip)}px; background:${colors[t]};"></div>`;
      x += w + 6 + R() * 18;
      n++;
    }
  }
  const hl = P
    ? `left:0; right:0; top:250px; text-align:center; font-size:120px;`
    : `left:0; right:0; top:95px; text-align:center; font-size:104px;`;
  const css = `
    #p-bg { position:absolute; inset:0; background:#0d0d0d; }
    .p-hl { position:absolute; ${hl} font-family:"Archivo Black"; line-height:1.02; text-transform:uppercase; letter-spacing:-0.02em; }
    .p-hl span { display:inline-block; }
    #p-ed { position:absolute; left:${ex}px; top:${ey}px; width:${ew}px; height:${eh}px; border-radius:20px; background:#1b1b1b; border:2px solid #2c2c2c; overflow:hidden; }
    #p-prev { position:absolute; left:24px; top:24px; width:${Math.round((eh - 260) * 0.5625)}px; height:${eh - 260}px; border-radius:10px; background:linear-gradient(160deg,#4a4a4a,#222); }
    .p-slider { position:absolute; height:10px; border-radius:5px; background:#333; }
    .p-knob { position:absolute; top:-7px; width:24px; height:24px; border-radius:50%; background:#777; }
    #p-tc { position:absolute; right:28px; top:24px; font-family:"JetBrains Mono"; font-weight:700; font-size:${P ? 40 : 44}px; color:#bbb; }
    .p-blk { position:absolute; height:38px; border-radius:6px; }
    #p-ph { position:absolute; left:0; top:${tracksTop - 16}px; width:4px; height:${4 * 50 + 10}px; background:#fff; border-radius:2px; }
    #p-scrim { position:absolute; left:${ex}px; top:${ey}px; width:${ew}px; height:${eh}px; border-radius:20px; background:rgba(0,0,0,.72); opacity:0; }
    #p-big { position:absolute; left:${ex}px; top:${ey}px; width:${ew}px; height:${eh}px; display:flex; align-items:center; justify-content:center; font-family:"Archivo Black"; font-size:${P ? 190 : 250}px; color:${Y}; letter-spacing:-0.03em; white-space:nowrap; opacity:0; }
    #p-dip { position:absolute; inset:0; background:#000; opacity:0; }
  `;
  const sx = 24 + Math.round((eh - 260) * 0.5625) + 40;
  const sliders = [0, 1, 2, 3]
    .map(
      (i) =>
        `<div class="p-slider" style="left:${sx}px; top:${110 + i * 56}px; width:${ew - sx - 40}px;"><div class="p-knob" id="p-k${i}" style="left:${Math.round(40 + R() * (ew - sx - 140))}px;"></div></div>`,
    )
    .join("");
  const html = `
    <div id="p-bg"></div>
    <div class="p-hl" id="p-hl"><span>Editing</span>${P ? "<br>" : " "}<span>one</span> <span>short?</span></div>
    <div id="p-ed">
      <div id="p-prev"></div>
      ${sliders}
      <div id="p-tc">00:00</div>
      ${blocks}
      <div id="p-ph"></div>
    </div>
    <div id="p-scrim"></div>
    <div id="p-big">10+ MIN</div>
    <div id="p-dip"></div>`;
  const phs = [0.12, 0.55, 0.3, 0.78, 0.42, 0.9, 0.6].map((f) => Math.round(24 + f * (ew - 60)));
  const js = `
      tl.fromTo("#p-hl span", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power4.out", stagger: 0.09 }, 0.08);
      tl.fromTo("#p-ed", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "expo.out" }, 0.05);
      const ph = ${JSON.stringify(phs)};
      tl.set("#p-ph", { x: ph[0] }, 0);
      ph.slice(1).forEach((x, i) => tl.to("#p-ph", { x, duration: 0.22, ease: "power2.inOut" }, 0.35 + i * 0.24));
      [0,1,2,3].forEach(i => tl.to("#p-k"+i, { x: (i % 2 ? -1 : 1) * ${P ? 90 : 120}, duration: 0.5, ease: "power2.inOut" }, 0.4 + i * 0.3));
      const tc = { v: 0 };
      const fmt = v => { const m = Math.floor(v / 60), s = Math.floor(v % 60); return String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0"); };
      tl.fromTo(tc, { v: 0 }, { v: 600, duration: 1.5, ease: "power2.in", onUpdate: () => { document.getElementById("p-tc").textContent = fmt(tc.v) + (tc.v >= 600 ? "+" : ""); } }, 0.3);
      tl.to("#p-tc", { color: "${Y}", duration: 0.1 }, 1.75);
      tl.to("#p-scrim", { opacity: 1, duration: 0.18, ease: "power2.out" }, 1.85);
      tl.fromTo("#p-big", { opacity: 0, scale: 1.35, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.28, ease: "expo.out" }, 1.88);
      tl.to("#p-dip", { opacity: 0.45, duration: 0.1, ease: "none" }, 3.08);
  `;
  return scene("problem", W, H, css, html, js);
}

// ──────────────────────────── Scene 3: upload ─────────────────────────────
function upload(P, W, H) {
  const cx = P ? 60 : 410,
    cy = P ? 560 : 290,
    cw = P ? 960 : 1100,
    ch = 500;
  const iw = cw - 88;
  const inputC = [cx + 44 + 40, cy + 110 + 48];
  const btnC = [cx + 44 + iw / 2, cy + 236 + 50];
  const upC = [cx + 44 + 165, cy + 372 + 42];
  const hx0 = P ? 60 : 160,
    hx1 = P ? 1020 : 1760,
    hy = P ? 200 : 50;
  const nvY = P ? 320 : 150;
  const usage = P
    ? `left:60px; top:440px; width:960px;`
    : `left:${cx + cw - 420}px; top:${nvY + 16}px; width:420px;`;
  const css = `
    #u-bg { position:absolute; inset:0; background:#0b0b0b; }
    #u-app { position:absolute; inset:0; }
    #u-logo { position:absolute; left:${hx0}px; top:${hy}px; font-family:"Archivo Black"; font-size:${P ? 46 : 40}px; display:flex; align-items:center; gap:14px; }
    .u-beta { font-family:"Inter"; font-weight:700; font-size:28px; background:${Y}; color:#000; padding:2px 12px; border-radius:8px; }
    #u-nav { position:absolute; right:${W - hx1}px; top:${hy + (P ? 12 : 10)}px; display:flex; gap:${P ? 28 : 40}px; font-weight:700; font-size:28px; color:#e8e8e8; }
    #u-line { position:absolute; left:${hx0}px; top:${hy + (P ? 80 : 70)}px; width:${hx1 - hx0}px; height:2px; background:#222; }
    #u-title { position:absolute; left:${cx}px; top:${nvY}px; font-family:"Archivo Black"; font-size:${P ? 80 : 72}px; letter-spacing:-0.02em; }
    #u-usage { position:absolute; ${usage} font-weight:700; font-size:28px; color:#ddd; }
    #u-usage .bar { margin-top:14px; height:8px; border-radius:4px; background:#2a2a2a; }
    #u-card { position:absolute; left:${cx}px; top:${cy}px; width:${cw}px; height:${ch}px; border:4px solid ${Y}; border-radius:28px; background:#111; }
    #u-label { position:absolute; left:${cx + 44}px; top:${cy + 44}px; font-family:"Archivo Black"; font-size:${P ? 36 : 34}px; }
    #u-input { position:absolute; left:${cx + 44}px; top:${cy + 110}px; width:${iw}px; height:96px; border:2px solid #777; border-radius:14px; background:#0b0b0b; }
    #u-ph, #u-typed { position:absolute; left:26px; top:0; height:92px; line-height:92px; font-size:${P ? 30 : 30}px; white-space:nowrap; }
    #u-ph { color:#8a8a8a; }
    #u-typed span { opacity:0; }
    #u-caret { display:inline-block; width:3px; height:38px; background:#fff; vertical-align:middle; margin-left:2px; opacity:0; }
    #u-btn { position:absolute; left:${cx + 44}px; top:${cy + 236}px; width:${iw}px; height:100px; border-radius:16px; background:${Y}; }
    #u-btnt { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:${P ? 38 : 36}px; color:#111; }
    #u-up { position:absolute; left:${cx + 44}px; top:${cy + 372}px; width:330px; height:84px; border:2px solid #777; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:${P ? 29 : 28}px; }
    #u-uphint { position:absolute; left:${cx + 44 + 356}px; top:${cy + 372}px; height:84px; line-height:84px; font-weight:700; font-size:28px; color:#aaa; }
    #u-cursor { position:absolute; left:0; top:0; width:${P ? 66 : 76}px; height:${P ? 66 : 76}px; }
    #u-zoom { position:absolute; left:${btnC[0] - 60}px; top:${btnC[1] - 60}px; width:120px; height:120px; border-radius:50%; background:${Y}; opacity:0; }
  `;
  const typed = [...COPY.typedLink].map((c) => `<span>${c}</span>`).join("");
  const html = `
    <div id="u-bg"></div>
    <div id="u-app">
      <div id="u-logo">ClipFive <span class="u-beta">Beta</span></div>
      <div id="u-nav"><span>Dashboard</span><span>Pricing</span><span>Account</span></div>
      <div id="u-line"></div>
      <div id="u-title">New video</div>
      <div id="u-usage">0 of 2 free videos used<div class="bar"></div></div>
      <div id="u-card"></div>
      <div id="u-label">Paste a YouTube link</div>
      <div id="u-input"><div id="u-ph">https://www.youtube.com/watch?v=...</div><div id="u-typed">${typed}<span id="u-caret"></span></div></div>
      <div id="u-btn"><div id="u-btnt">Get my clips</div></div>
      <div id="u-up">or upload a video</div>
      <div id="u-uphint">Up to 30 minutes</div>
    </div>
    <div id="u-zoom"></div>
    <div id="u-cursor" data-layout-allow-overflow>${CURSOR_SVG}</div>`;
  const zoomScale = Math.ceil((Math.hypot(W, H) * 2) / 120) + 2;
  const js = `
      tl.fromTo("#u-app", { opacity: 0, scale: 1.06, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.32, ease: "expo.out" }, 0);
      tl.fromTo("#u-cursor", { x: ${W + 40}, y: ${H * 0.75} }, { x: ${inputC[0]}, y: ${inputC[1]}, duration: 0.5, ease: "power3.out" }, 0.3);
      tl.to("#u-input", { borderColor: "#ffffff", duration: 0.08 }, 0.82);
      tl.to("#u-cursor", { scale: 0.85, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: "0 0" }, 0.8);
      tl.set("#u-ph", { opacity: 0 }, 0.88);
      tl.set("#u-caret", { opacity: 1 }, 0.88);
      tl.to("#u-typed span:not(#u-caret)", { opacity: 1, duration: 0.01, stagger: 0.022 }, 0.9);
      tl.to("#u-cursor", { x: ${upC[0] + 40}, y: ${upC[1] + 6}, duration: 0.38, ease: "power3.inOut" }, 1.75);
      tl.to("#u-up", { borderColor: "${Y}", color: "${Y}", duration: 0.12 }, 2.05);
      tl.to("#u-uphint", { color: "#ffffff", duration: 0.12 }, 2.05);
      tl.to("#u-cursor", { x: ${btnC[0] + 30}, y: ${btnC[1] + 8}, duration: 0.4, ease: "power3.inOut" }, 2.55);
      tl.to("#u-up", { borderColor: "#777777", color: "#ffffff", duration: 0.12 }, 2.6);
      tl.to("#u-uphint", { color: "#aaaaaa", duration: 0.12 }, 2.6);
      tl.to("#u-cursor", { scale: 0.85, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: "0 0" }, 2.96);
      tl.to("#u-btn", { scale: 0.96, duration: 0.06, yoyo: true, repeat: 1 }, 2.96);
      tl.to("#u-btnt", { opacity: 0, duration: 0.1 }, 3.12);
      tl.to("#u-cursor", { opacity: 0, duration: 0.1 }, 3.12);
      tl.set("#u-zoom", { opacity: 1 }, 3.2);
      tl.fromTo("#u-zoom", { scale: 1 }, { scale: ${zoomScale}, duration: 0.42, ease: "power3.in" }, 3.2);
      tl.to("#u-app", { scale: 1.4, filter: "blur(12px)", duration: 0.42, ease: "power3.in", transformOrigin: "${btnC[0]}px ${btnC[1]}px" }, 3.2);
  `;
  return scene("upload", W, H, css, html, js);
}

// ──────────────────────────── Scene 4: moments ────────────────────────────
function moments(P, W, H) {
  const n = P ? 48 : 75;
  const bw = 12,
    gap = 8;
  const totalW = n * bw + (n - 1) * gap;
  const x0 = Math.round((W - totalW) / 2);
  const cy = P ? 790 : 560;
  const maxH = P ? 240 : 270;
  const segs = P
    ? [
        [5, 11],
        [21, 27],
        [37, 43],
      ]
    : [
        [8, 16],
        [33, 41],
        [57, 65],
      ];
  const inSeg = (i) => segs.findIndex(([a, b]) => i >= a && i <= b);
  const R = rng(42);
  let bars = "";
  for (let i = 0; i < n; i++) {
    const s = inSeg(i);
    const base = s >= 0 ? 0.55 + R() * 0.45 : 0.12 + R() * 0.5;
    const h = Math.max(14, Math.round(base * maxH));
    bars += `<div class="m-bar${s >= 0 ? " m-sel" : ""}" id="m-b${i}" style="left:${x0 + i * (bw + gap)}px; top:${cy - h / 2}px; height:${h}px;"></div>`;
  }
  const dots = segs
    .map(([a, b], k) => {
      const mx = x0 + ((a + b) / 2) * (bw + gap) + bw / 2;
      return `<div class="m-dot" id="m-d${k}" style="left:${Math.round(mx - 3)}px; top:${cy + maxH / 2 + 24}px;"></div>`;
    })
    .join("");
  const hl = P
    ? `left:0; right:0; top:260px; text-align:center; font-size:112px;`
    : `left:0; right:0; top:130px; text-align:center; font-size:88px;`;
  const css = `
    #m-bg { position:absolute; inset:0; background:${Y}; }
    .m-hl { position:absolute; ${hl} font-family:"Archivo Black"; line-height:1.02; text-transform:uppercase; letter-spacing:-0.02em; }
    .m-hl span { display:inline-block; }
    .y { color:${Y}; }
    #m-wave { position:absolute; inset:0; }
    .m-bar { position:absolute; width:${bw}px; border-radius:6px; background:#5a5a5a; }
    #m-scan { position:absolute; left:0; top:${cy - maxH / 2 - 40}px; width:4px; height:${maxH + 80}px; background:${Y}; box-shadow:0 0 24px 6px rgba(255,224,27,.55); border-radius:2px; opacity:0; }
    .m-dot { position:absolute; width:6px; height:${P ? 180 : 150}px; background-image:linear-gradient(${Y} 50%, rgba(0,0,0,0) 50%); background-size:6px 18px; transform-origin:50% 0; }
  `;
  const html = `
    <div id="m-bg"></div>
    <div class="m-hl" id="m-hl"><span>AI</span> <span>picks</span> <span>the</span>${P ? "<br>" : " "}<span class="y">best</span> <span class="y">moments</span></div>
    <div id="m-wave">
      ${bars}
      ${dots}
      <div id="m-scan"></div>
    </div>`;
  const scanStart = 0.55,
    scanDur = 1.7;
  const xStart = x0 - 20,
    xEnd = x0 + totalW + 20;
  const t = (i) => r2(scanStart + ((x0 + i * (bw + gap) - xStart) / (xEnd - xStart)) * scanDur);
  let barTweens = "";
  for (let i = 0; i < n; i++) {
    const s = inSeg(i);
    barTweens += s >= 0 ? `["#m-b${i}",${t(i)},1],` : `["#m-b${i}",${t(i)},0],`;
  }
  const js = `
      tl.to("#m-bg", { backgroundColor: "#0a0a0a", duration: 0.35, ease: "power2.inOut" }, 0);
      tl.fromTo(".m-bar", { scaleY: 0.1, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.4, ease: "expo.out", stagger: { each: 0.006, from: "center" } }, 0.12);
      tl.fromTo("#m-hl span", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power4.out", stagger: 0.08 }, 0.3);
      gsap.set(".m-dot", { scaleY: 0 });
      tl.set("#m-scan", { x: ${xStart}, opacity: 1 }, ${scanStart});
      tl.to("#m-scan", { x: ${xEnd}, duration: ${scanDur}, ease: "none" }, ${scanStart});
      tl.to("#m-scan", { opacity: 0, duration: 0.12 }, ${r2(scanStart + scanDur)});
      ${"[" + barTweens + "]"}.forEach(([sel, at, on]) => {
        tl.to(sel, on ? { backgroundColor: "${Y}", duration: 0.12, ease: "power2.out" } : { backgroundColor: "#353535", duration: 0.2 }, at);
      });
      [0,1,2].forEach(k => tl.to("#m-d"+k, { scaleY: 1, duration: 0.4, ease: "expo.out" }, 2.45 + k * 0.08));
      tl.to(["#m-wave", "#m-hl"], { y: ${-H * 0.35}, opacity: 0, filter: "blur(14px)", duration: 0.26, ease: "power3.in" }, 3.54);
  `;
  return scene("moments", W, H, css, html, js);
}

// ───────────────────────────── Scene 5: shorts ────────────────────────────
function shorts(P, W, H) {
  const cw = P ? 300 : 280,
    ch = Math.round((cw * 16) / 9);
  const gap = P ? 30 : 64;
  const top = P ? 470 : 230;
  const x0 = Math.round((W - (3 * cw + 2 * gap)) / 2);
  const bd = P ? 92 : 84;
  const by = top + ch + (P ? 26 : 24);
  const grads = [
    "radial-gradient(circle at 30% 28%, #ff7ab6 0, rgba(255,122,182,0) 30%), radial-gradient(circle at 70% 62%, #ffb347 0, rgba(255,179,71,0) 30%), linear-gradient(165deg,#9a1450,#3a0a1f 70%,#120408)",
    "radial-gradient(circle at 50% 42%, #ff3a2a 0, #a30d0d 38%, #250404 80%)",
    "radial-gradient(circle at 38% 30%, #39d0cc 0, rgba(57,208,204,0) 45%), radial-gradient(circle at 76% 45%, #d8c060 0, rgba(216,192,96,0) 32%), linear-gradient(170deg,#0f5560,#06242a 70%,#020a0c)",
  ];
  const cards = [0, 1, 2]
    .map((i) => {
      const words = COPY.cardCaptions[i]
        .map((w, j) => `<span class="s-w${j === COPY.cardHighlight[i] ? " s-hi" : ""}">${w}</span>`)
        .join(" ");
      return `<div class="s-card" id="s-c${i}" style="left:${x0 + i * (cw + gap)}px;">
        <div class="s-foot" style="background:${grads[i]};"></div>
        <div class="s-capt">${words}</div>
        <div class="s-dl" id="s-dl${i}"><svg viewBox="0 0 24 24" width="60%" height="60%"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      </div>
      <div class="s-badge" id="s-b${i}" style="left:${x0 + i * (cw + gap) + cw / 2 - bd / 2}px;"><span id="s-n${i}">0</span></div>`;
    })
    .join("\n      ");
  const hl = P
    ? `left:0; right:0; top:230px; height:220px; font-size:96px;`
    : `left:0; right:0; top:70px; height:120px; font-size:88px;`;
  const css = `
    #s-bg { position:absolute; inset:0; background:#0a0a0a; }
    .s-hl { position:absolute; ${hl} display:flex; align-items:center; justify-content:center; text-align:center; font-family:"Archivo Black"; line-height:1.02; text-transform:uppercase; letter-spacing:-0.02em; }
    .s-hl span { display:inline-block; }
    .y { color:${Y}; }
    .s-card { position:absolute; top:${top}px; width:${cw}px; height:${ch}px; border-radius:24px; overflow:hidden; border:2px solid #333; background:#000; }
    .s-foot { position:absolute; left:-10%; top:-10%; width:120%; height:120%; }
    .s-capt { position:absolute; left:0; right:0; bottom:${P ? 90 : 80}px; text-align:center; font-family:"Archivo Black"; font-size:${P ? 34 : 30}px; line-height:1.1; padding:0 14px; text-shadow:0 3px 8px rgba(0,0,0,.7); }
    .s-w { display:inline-block; opacity:0; }
    .s-dl { position:absolute; right:16px; top:16px; width:${P ? 60 : 56}px; height:${P ? 60 : 56}px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; opacity:0; }
    .s-badge { position:absolute; top:${by}px; width:${bd}px; height:${bd}px; border-radius:50%; background:${Y}; color:#111; display:flex; align-items:center; justify-content:center; font-family:"Archivo Black"; font-size:${P ? 38 : 34}px; box-shadow:0 0 30px rgba(255,224,27,.45); }
    #s-world { position:absolute; left:${x0 + cw + gap + cw / 2 - bd / 2}px; top:${by}px; width:${bd}px; height:${bd}px; border-radius:50%; background:${Y}; opacity:0; }
  `;
  const head = (id, html) => `<div class="s-hl" id="${id}">${html}</div>`;
  const html = `
    <div id="s-bg"></div>
    ${head("s-h1", `<div><span>Captions.</span></div>`)}
    ${head("s-h2", `<div><span>Virality</span>${P ? "<br>" : " "}<span class="y">scores.</span></div>`)}
    ${head("s-h3", `<div><span>Ready</span> <span>to</span>${P ? "<br>" : " "}<span class="y">download.</span></div>`)}
    ${cards}
    <div id="s-world"></div>`;
  const worldScale = Math.ceil((Math.hypot(W, H) * 2.2) / bd);
  const js = `
      const S = ${JSON.stringify(COPY.scores)};
      gsap.set(["#s-h1 span", "#s-h2 span", "#s-h3 span"], { opacity: 0, filter: "blur(8px)" });
      [0,1,2].forEach(i => tl.fromTo("#s-c"+i, { y: ${H * 0.45}, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, i * 0.07));
      [0,1,2].forEach(i => tl.fromTo("#s-c"+i+" .s-foot", { x: 0, y: 0, scale: 1 }, { x: (i - 1) * 18, y: -14, scale: 1.08, duration: 4.4, ease: "none" }, 0));
      gsap.set(".s-badge", { scale: 0, opacity: 0 });
      tl.to("#s-h1 span", { opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power4.out" }, 0.2);
      // karaoke captions: words appear one by one, then hold
      [0,1,2].forEach(i => tl.to("#s-c"+i+" .s-w", { opacity: 1, duration: 0.08, stagger: 0.22 }, 0.45 + i * 0.1));
      tl.to("#s-h1 span", { opacity: 0, filter: "blur(8px)", duration: 0.13, ease: "power2.in" }, 1.25);
      tl.to("#s-h2 span", { opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power4.out", stagger: 0.08 }, 1.36);
      [0,1,2].forEach(i => {
        tl.to("#s-b"+i, { scale: 1, opacity: 1, duration: 0.35, ease: "expo.out" }, 1.4 + i * 0.12);
        const o = { v: 0 };
        tl.to(o, { v: S[i], duration: 0.6, ease: "power2.out", onUpdate: () => { document.getElementById("s-n"+i).textContent = Math.round(o.v); } }, 1.4 + i * 0.12);
      });
      tl.to("#s-h2 span", { opacity: 0, filter: "blur(8px)", duration: 0.13, ease: "power2.in" }, 2.55);
      tl.to("#s-h3 span", { opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power4.out", stagger: 0.08 }, 2.66);
      [0,1,2].forEach(i => tl.fromTo("#s-dl"+i, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "expo.out" }, 2.75 + i * 0.1));
      tl.to(["#s-h3", "#s-c0", "#s-c2", "#s-b0", "#s-b2"], { opacity: 0, filter: "blur(12px)", duration: 0.25, ease: "power2.in" }, 3.95);
      tl.to("#s-n1", { opacity: 0, duration: 0.1 }, 3.95);
      tl.set("#s-world", { opacity: 1 }, 4.0);
      tl.fromTo("#s-world", { scale: 1 }, { scale: ${worldScale}, duration: 0.38, ease: "power3.in" }, 4.0);
  `;
  return scene("shorts", W, H, css, html, js);
}

// ─────────────────────────────── Scene 6: CTA ─────────────────────────────
function cta(P, W, H) {
  const wmTop = P ? 330 : 150;
  const hlTop = P ? 540 : 340;
  const btnW = P ? 600 : 560,
    btnH = P ? 128 : 116;
  const btnTop = P ? 880 : 560;
  const btnC = [W / 2, btnTop + btnH / 2];
  const urlTop = btnTop + btnH + (P ? 54 : 46);
  const word = [..."ClipFive"].map((c) => `<span class="c-l">${c}</span>`).join("");
  const css = `
    #c-bg { position:absolute; inset:0; background:${Y}; }
    #c-wm { position:absolute; left:0; right:0; top:${wmTop}px; display:flex; align-items:center; justify-content:center; gap:22px; font-family:"Archivo Black"; font-size:${P ? 124 : 112}px; color:#0a0a0a; letter-spacing:-0.02em; }
    .c-l { display:inline-block; }
    #c-beta { font-family:"Inter"; font-weight:700; font-size:${P ? 38 : 34}px; background:#0a0a0a; color:${Y}; padding:6px 18px; border-radius:12px; letter-spacing:0; }
    #c-hl { position:absolute; left:0; right:0; top:${hlTop}px; text-align:center; font-family:"Archivo Black"; font-size:${P ? 104 : 86}px; line-height:1.12; color:#0a0a0a; letter-spacing:-0.02em; }
    #c-hl span { display:inline-block; }
    #c-hl .c-hi { background:#0a0a0a; color:${Y}; padding:0 18px; border-radius:16px; }
    #c-btn { position:absolute; left:${W / 2 - btnW / 2}px; top:${btnTop}px; width:${btnW}px; height:${btnH}px; border-radius:22px; background:#0a0a0a; }
    #c-btnt { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:${P ? 50 : 46}px; color:${Y}; }
    #c-url { position:absolute; left:0; right:0; top:${urlTop}px; text-align:center; font-weight:700; font-size:${P ? 42 : 38}px; color:#0a0a0a; }
    #c-cursor { position:absolute; left:0; top:0; width:${P ? 66 : 76}px; height:${P ? 66 : 76}px; }
  `;
  const html = `
    <div id="c-bg"></div>
    <div id="c-wm">${`<span>${word}</span>`}<span id="c-beta">Beta</span></div>
    <div id="c-hl"><span>Pro</span> <span>AI</span> <span>clips</span>${P ? "<br>" : " "}<span>for</span> <span class="c-hi">$5/month</span></div>
    <div id="c-btn"><div id="c-btnt">Get my clips</div></div>
    <div id="c-url">${COPY.url}</div>
    <div id="c-cursor" data-layout-allow-overflow>${CURSOR_SVG}</div>`;
  const js = `
      tl.fromTo(".c-l", { opacity: 0.0, y: 30, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "expo.out", stagger: 0.05 }, 0.08);
      tl.fromTo("#c-beta", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.35, ease: "expo.out" }, 0.55);
      tl.fromTo("#c-hl span", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power4.out", stagger: 0.08 }, 0.8);
      tl.fromTo("#c-btn", { opacity: 0, scaleX: 0.2, filter: "blur(12px)" }, { opacity: 1, scaleX: 1, filter: "blur(0px)", duration: 0.3, ease: "power3.out" }, 1.35);
      tl.fromTo("#c-btnt", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 1.55);
      tl.fromTo("#c-url", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, 1.75);
      tl.fromTo("#c-cursor", { x: ${W + 40}, y: ${H * 0.85} }, { x: ${btnC[0] + 60}, y: ${btnC[1] + 10}, duration: 0.55, ease: "power3.out" }, 2.1);
      tl.to("#c-cursor", { scale: 0.85, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: "0 0" }, 2.7);
      tl.to("#c-btn", { scale: 0.95, duration: 0.07, yoyo: true, repeat: 1 }, 2.7);
      tl.to("#c-cursor", { x: ${btnC[0] + 260}, y: ${btnC[1] + 220}, opacity: 0, duration: 0.4, ease: "power2.in" }, 3.2);
  `;
  return scene("cta", W, H, css, html, js);
}

// ───────────────────────────── Captions track ─────────────────────────────
function captions(P, W, H) {
  const pos = P ? `top:1205px; height:120px;` : `bottom:72px; height:100px;`;
  const groups = CAPTIONS.map((c, gi) => {
    const hs = hiSet(c.hi);
    const words = c.w.map((w, j) => `<span class="k-w${hs.has(j) ? " k-hi" : ""}">${w}</span>`).join(" ");
    return `<div class="k-g" id="k-g${gi}">${words}</div>`;
  }).join("\n    ");
  const css = `
    .k-g { position:absolute; left:0; right:0; ${pos} display:flex; align-items:center; justify-content:center; gap:0 ${P ? 18 : 16}px; flex-wrap:wrap; text-align:center; padding:0 ${P ? 80 : 200}px;
      font-family:"Archivo Black"; font-size:${P ? 62 : 54}px; line-height:1.05; color:#fff; opacity:0; overflow:visible;
      -webkit-text-stroke: ${P ? 9 : 8}px #000; paint-order: stroke fill; text-shadow: 0 5px 0 #000; }
    .k-w { display:inline-block; }
    .k-hi { color:${Y}; }
  `;
  const js = `
      const G = ${JSON.stringify(CAPTIONS.map((c) => [c.s, c.e, c.w.length]))};
      G.forEach(([s, e, n], i) => {
        const g = "#k-g" + i;
        tl.set(g, { opacity: 1, visibility: "visible" }, s);
        tl.fromTo(g + " .k-w", { opacity: 0, scale: 0.8, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.14, ease: "power3.out", stagger: Math.min(0.09, (e - s - 0.3) / n) }, s);
        tl.to(g, { opacity: 0, duration: 0.1, ease: "power2.in" }, e - 0.1);
        tl.set(g, { opacity: 0, visibility: "hidden" }, e);
      });
  `;
  return scene("captions", W, H, css, `    ${groups}`, js);
}

// ────────────────────────────────── index ─────────────────────────────────
function index(P, W, H, sfx) {
  const hosts = SCENES.map(
    (s, i) => `      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="${i + 1}" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:${i + 1}"></div>`,
  ).join("\n");
  const audio = sfx
    .map(
      (a, i) =>
        `      <audio id="sfx-${i}" class="clip" src="${a.src}" data-start="${a.t}" data-duration="${a.d}" data-track-index="${20 + (i % 4)}" data-volume="${a.v}"></audio>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>ClipFive ad ${P ? "9x16" : "16x9"}</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #0a0a0a; }
      #bg { position: absolute; inset: 0; background: #0a0a0a; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
      <div id="bg"></div>
${hosts}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${TOTAL}" data-track-index="10" data-track-kind="captions" data-width="${W}" data-height="${H}" style="z-index:50"></div>
${audio}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}

// Sound effects placed on visible actions (files resolved into ad/sfx/ beforehand, if present).
const SFX = [
  { name: "whoosh1", t: 0.7, d: 0.6, v: 0.7 },
  { name: "whoosh2", t: 2.18, d: 0.6, v: 0.6 },
  { name: "impact", t: 4.27, d: 1.0, v: 0.8 },
  { name: "click", t: 6.4, d: 0.4, v: 0.9 },
  { name: "type", t: 6.5, d: 0.75, v: 0.35 },
  { name: "click", t: 8.56, d: 0.4, v: 0.9 },
  { name: "whoosh1", t: 8.8, d: 0.6, v: 0.7 },
  { name: "whoosh2", t: 12.95, d: 0.6, v: 0.6 },
  { name: "pop", t: 14.6, d: 0.4, v: 0.7 },
  { name: "pop", t: 14.72, d: 0.4, v: 0.6 },
  { name: "pop", t: 14.84, d: 0.4, v: 0.7 },
  { name: "whoosh1", t: 17.2, d: 0.6, v: 0.7 },
  { name: "click", t: 20.3, d: 0.4, v: 0.9 },
];

for (const P of [true, false]) {
  const W = P ? 1080 : 1920,
    H = P ? 1920 : 1080;
  const dir = join(AD, P ? "hf-9x16" : "hf-16x9");
  if (existsSync(join(dir, "compositions"))) rmSync(join(dir, "compositions"), { recursive: true });
  mkdirSync(join(dir, "compositions"), { recursive: true });
  mkdirSync(join(dir, "assets"), { recursive: true });
  cpSync(join(AD, "vendor", "gsap.min.js"), join(dir, "assets", "gsap.min.js"));
  const sfx = [];
  for (const s of SFX) {
    const src = join(AD, "sfx", `${s.name}.mp3`);
    if (existsSync(src)) {
      cpSync(src, join(dir, "assets", `${s.name}.mp3`));
      sfx.push({ ...s, src: `assets/${s.name}.mp3` });
    }
  }
  const files = { hook, problem, upload, moments, shorts, cta, captions };
  for (const [id, fn] of Object.entries(files)) writeFileSync(join(dir, "compositions", `${id}.html`), fn(P, W, H));
  writeFileSync(join(dir, "index.html"), index(P, W, H, sfx));
  writeFileSync(
    join(dir, "hyperframes.json"),
    JSON.stringify(
      {
        $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
        registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
        paths: { blocks: "compositions", components: "compositions/components", assets: "assets" },
        media: { autoProxy: true },
        skill: "hyperframes",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`wrote ${dir} (${sfx.length} sfx)`);
}
