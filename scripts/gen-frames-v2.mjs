/**
 * gen-frames-v2.mjs — renders the v2 "data hall" image sequence.
 *
 * Scene: a cinematic corridor of glowing server-rack pillars with floor
 * reflections, fog, light shafts, drifting dust and a bright core gate
 * at the far end. The camera descends and dollies down the corridor as
 * t goes 0 → 1. Output: public/seq2/frame_NNN.jpg.
 *
 * Run: node scripts/gen-frames-v2.mjs
 */
import { createCanvas } from 'canvas';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const W = 1600, H = 900;
const FRAMES = 120;
const OUT = join(import.meta.dirname, '..', 'public', 'seq2');
mkdirSync(OUT, { recursive: true });

// deterministic pseudo-random — identical frames on every run
let seed = 42;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const lerp  = (a, b, t) => a + (b - a) * t;
const ease  = t => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ── scene ───────────────────────────────────────────────────────────────
// Corridor runs along +z. Floor at y=0. Two rows of pillars at x = ±6.5.
const GATE_Z = 66;

// pillars: {x, z, h, w, flicker} — h height, w half-width, flicker 0..1
const pillars = [];
for (let z = 6; z <= 62; z += 4.2) {
  for (const side of [-1, 1]) {
    pillars.push({
      x: side * 6.5 + (rand() - 0.5) * 0.6,
      z: z + (rand() - 0.5) * 1.2,
      h: 6.2 + rand() * 2.4,
      w: 0.85,
      flicker: 0.55 + rand() * 0.45,
    });
  }
}

// LED dots on pillar faces: {p (pillar idx), u (0..1 across), v (0..1 up), heat}
const leds = [];
pillars.forEach((p, i) => {
  const n = 8 + Math.floor(rand() * 7);
  for (let k = 0; k < n; k++) {
    leds.push({ p: i, u: rand() * 2 - 1, v: 0.08 + rand() * 0.84, heat: 0.4 + rand() * 0.6 });
  }
});

// data particles streaming down the corridor's center lanes
const streams = [];
for (let k = 0; k < 90; k++) {
  streams.push({
    lane: (rand() < 0.5 ? -1 : 1) * (0.8 + rand() * 1.6),
    y: 0.7 + rand() * 2.8,
    off: rand(),
    speed: 0.9 + rand() * 1.6,
  });
}

// dust motes floating in the volume
const dust = [];
for (let k = 0; k < 140; k++) {
  dust.push({
    x: (rand() - 0.5) * 14, y: 0.3 + rand() * 7, z: 2 + rand() * 60,
    drift: rand() * Math.PI * 2,
  });
}

// ── camera: high wide → descend → dolly toward the gate, slight sway ────
function camera(t) {
  const e = ease(t);
  const pos = {
    x: Math.sin(t * Math.PI * 1.5) * lerp(2.2, 0.6, e),   // gentle lateral sway
    y: lerp(6.8, 2.3, ease(clamp(t * 1.4, 0, 1))),        // descend early
    z: lerp(-4, 38, e),                                    // dolly the length of the hall
  };
  const target = { x: 0, y: lerp(3.4, 3.0, e), z: pos.z + 20 };
  const roll = Math.sin(t * Math.PI) * 0.03;               // ±1.7° cinematic roll
  let f = { x: target.x - pos.x, y: target.y - pos.y, z: target.z - pos.z };
  const fl = Math.hypot(f.x, f.y, f.z); f = { x: f.x / fl, y: f.y / fl, z: f.z / fl };
  let r = { x: f.z, y: 0, z: -f.x };
  const rl = Math.hypot(r.x, r.z); r = { x: r.x / rl, y: 0, z: r.z / rl };
  let u = { x: r.y * f.z - r.z * f.y, y: r.z * f.x - r.x * f.z, z: r.x * f.y - r.y * f.x };
  // apply roll by rotating r and u around f
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const r2 = { x: r.x * cr + u.x * sr, y: r.y * cr + u.y * sr, z: r.z * cr + u.z * sr };
  const u2 = { x: u.x * cr - r.x * sr, y: u.y * cr - r.y * sr, z: u.z * cr - r.z * sr };
  return { pos, r: r2, u: u2, f };
}

function project(cam, p) {
  const d = { x: p.x - cam.pos.x, y: p.y - cam.pos.y, z: p.z - cam.pos.z };
  const cx = d.x * cam.r.x + d.y * cam.r.y + d.z * cam.r.z;
  const cy = d.x * cam.u.x + d.y * cam.u.y + d.z * cam.u.z;
  const cz = d.x * cam.f.x + d.y * cam.f.y + d.z * cam.f.z;
  if (cz < 0.4) return null;
  const focal = H * 1.05;
  return { sx: W / 2 + (cx / cz) * focal, sy: H / 2 - (cy / cz) * focal, depth: cz };
}

const fog = depth => clamp(1 - (depth - 4) / 52, 0.05, 1);

// amber ramp with blue-leaning shadows for the cinematic grade
function tint(heat, alpha) {
  const r = Math.round(lerp(120, 255, heat));
  const g = Math.round(lerp(95, 210, heat));
  const b = Math.round(lerp(80, 140, heat));
  return `rgba(${r},${g},${b},${alpha})`;
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// draw one pillar face as a projected quad; mirror=true paints a short,
// faint floor reflection (flipped about y=0)
function drawPillar(cam, p, mirror) {
  const m = mirror ? -1 : 1;
  const fade = mirror ? 0.13 : 1;
  const h = mirror ? p.h * 0.45 : p.h;   // reflections die out quickly
  const corners = [
    { x: p.x - p.w, y: 0,       z: p.z },
    { x: p.x + p.w, y: 0,       z: p.z },
    { x: p.x + p.w, y: m * h,   z: p.z },
    { x: p.x - p.w, y: m * h,   z: p.z },
  ].map(c => project(cam, c));
  if (corners.some(c => !c)) return null;
  const depth = (corners[0].depth + corners[2].depth) / 2;
  const f = fog(depth) * fade;
  // dark monolith body — the light comes from edges and LEDs, not the face
  const grad = ctx.createLinearGradient(corners[0].sx, corners[0].sy, corners[3].sx, corners[3].sy);
  grad.addColorStop(0, tint(0.55 * p.flicker, 0.15 * f));
  grad.addColorStop(1, tint(0.25 * p.flicker, 0.03 * f));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(corners[0].sx, corners[0].sy);
  for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].sx, corners[i].sy);
  ctx.closePath(); ctx.fill();
  // bright inner edge facing the corridor
  const inner = p.x < 0 ? [corners[1], corners[2]] : [corners[0], corners[3]];
  ctx.strokeStyle = tint(0.95, 0.7 * f * p.flicker);
  ctx.lineWidth = clamp(44 / depth, 0.7, 3);
  ctx.beginPath(); ctx.moveTo(inner[0].sx, inner[0].sy); ctx.lineTo(inner[1].sx, inner[1].sy); ctx.stroke();
  return { depth, f };
}

function render(t) {
  const cam = camera(t);
  ctx.globalCompositeOperation = 'source-over';

  // backdrop: near-black with cold blue depth, warm pool at the far gate
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#05060a');
  sky.addColorStop(0.6, '#07070c');
  sky.addColorStop(1, '#0a0908');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // far gate glow seen down the corridor (brightens as we approach)
  const gp = project(cam, { x: 0, y: 3, z: GATE_Z });
  if (gp) {
    const near = clamp((cam.pos.z + 8) / 48, 0, 1);   // 0 at start → 1 at the finale
    const rad = clamp(2600 / gp.depth, 60, 1200) * (1 + near * 3);   // blooms as we arrive
    const glow = ctx.createRadialGradient(gp.sx, gp.sy, 0, gp.sx, gp.sy, rad);
    glow.addColorStop(0, tint(1, 0.55 + 0.35 * near));
    glow.addColorStop(0.25, tint(0.85, 0.22 + 0.2 * near));
    glow.addColorStop(1, tint(0.6, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    // anamorphic horizontal flare across the gate core
    const fl = ctx.createLinearGradient(gp.sx - rad * 1.6, gp.sy, gp.sx + rad * 1.6, gp.sy);
    fl.addColorStop(0, 'rgba(255,210,140,0)');
    fl.addColorStop(0.5, `rgba(255,225,170,${0.28 + 0.3 * near})`);
    fl.addColorStop(1, 'rgba(255,210,140,0)');
    ctx.fillStyle = fl;
    ctx.fillRect(gp.sx - rad * 1.6, gp.sy - 1.5, rad * 3.2, 3);
  }

  // floor: glossy dark plane with a warm center stripe reflecting the gate
  const horizon = project(cam, { x: 0, y: 0, z: 60 });
  if (horizon) {
    const floor = ctx.createLinearGradient(0, horizon.sy, 0, H);
    floor.addColorStop(0, 'rgba(20,16,12,0.55)');
    floor.addColorStop(1, 'rgba(8,7,8,0.9)');
    ctx.fillStyle = floor;
    ctx.fillRect(0, horizon.sy, W, H - horizon.sy);
  }

  // pillar reflections first (under everything), then pillars
  for (const p of pillars) drawPillar(cam, p, true);
  const sorted = [...pillars].sort((a, b) => (b.z - cam.pos.z) - (a.z - cam.pos.z));
  for (const p of sorted) drawPillar(cam, p, false);

  // additive pass: LEDs, light shafts, streams, dust, all glow-stacked
  ctx.globalCompositeOperation = 'lighter';

  // LEDs on pillar faces
  for (const l of leds) {
    const p = pillars[l.p];
    const pt = project(cam, { x: p.x + l.u * p.w * 0.8, y: l.v * p.h, z: p.z - 0.05 });
    if (!pt) continue;
    const f = fog(pt.depth);
    const r = clamp(26 / pt.depth, 0.6, 3.2);
    const g = ctx.createRadialGradient(pt.sx, pt.sy, 0, pt.sx, pt.sy, r * 3);
    g.addColorStop(0, tint(l.heat, 0.8 * f));
    g.addColorStop(1, tint(l.heat, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(pt.sx, pt.sy, r * 3, 0, Math.PI * 2); ctx.fill();
  }

  // light shafts from above, every few pillar bays
  for (let z = 10; z <= 56; z += 12) {
    const top = project(cam, { x: 0, y: 9.5, z });
    const bot = project(cam, { x: 0, y: 0, z });
    if (!top || !bot) continue;
    const f = fog(bot.depth);
    const wTop = clamp(120 / top.depth, 4, 60);
    const wBot = clamp(560 / bot.depth, 20, 280);
    const g = ctx.createLinearGradient(0, top.sy, 0, bot.sy);
    g.addColorStop(0, `rgba(230,200,150,${0.10 * f})`);
    g.addColorStop(1, 'rgba(230,200,150,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(top.sx - wTop, top.sy);
    ctx.lineTo(top.sx + wTop, top.sy);
    ctx.lineTo(bot.sx + wBot, bot.sy);
    ctx.lineTo(bot.sx - wBot, bot.sy);
    ctx.closePath(); ctx.fill();
  }

  // data streams racing toward the gate (phase advances with t)
  for (const s of streams) {
    const ph = (s.off + t * s.speed) % 1;
    const z = 2 + ph * (GATE_Z - 4);
    const pt = project(cam, { x: s.lane, y: s.y, z });
    if (!pt || pt.depth < 2.5) continue;   // skip blow-ups right at the lens
    const f = fog(pt.depth);
    const r = clamp(50 / pt.depth, 0.8, 4);
    // motion streak capped in screen space so near misses don't slash the frame
    const ahead = project(cam, { x: s.lane, y: s.y, z: z + 1.2 });
    if (ahead) {
      let dx = ahead.sx - pt.sx, dy = ahead.sy - pt.sy;
      const len = Math.hypot(dx, dy);
      const max = 34;
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      ctx.strokeStyle = tint(0.9, 0.4 * f);
      ctx.lineWidth = r * 0.9;
      ctx.beginPath(); ctx.moveTo(pt.sx, pt.sy); ctx.lineTo(pt.sx + dx, pt.sy + dy); ctx.stroke();
    }
    const g = ctx.createRadialGradient(pt.sx, pt.sy, 0, pt.sx, pt.sy, r * 2.6);
    g.addColorStop(0, `rgba(255,235,190,${0.85 * f})`);
    g.addColorStop(1, 'rgba(255,235,190,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(pt.sx, pt.sy, r * 2.6, 0, Math.PI * 2); ctx.fill();
  }

  // dust motes with slow sinusoidal drift
  for (const d of dust) {
    const pt = project(cam, {
      x: d.x + Math.sin(d.drift + t * 6) * 0.25,
      y: d.y + Math.cos(d.drift + t * 4) * 0.18,
      z: d.z,
    });
    if (!pt) continue;
    const f = fog(pt.depth);
    const r = clamp(16 / pt.depth, 0.4, 1.6);
    ctx.fillStyle = `rgba(235,215,180,${0.22 * f})`;
    ctx.beginPath(); ctx.arc(pt.sx, pt.sy, r, 0, Math.PI * 2); ctx.fill();
  }

  // grade: cool the top, vignette the frame
  ctx.globalCompositeOperation = 'source-over';
  const cool = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  cool.addColorStop(0, 'rgba(8,12,24,0.35)');
  cool.addColorStop(1, 'rgba(8,12,24,0)');
  ctx.fillStyle = cool;
  ctx.fillRect(0, 0, W, H * 0.5);
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, W * 0.7);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

let total = 0;
for (let i = 0; i < FRAMES; i++) {
  render(i / (FRAMES - 1));
  const buf = canvas.toBuffer('image/jpeg', { quality: 0.72 });
  total += buf.length;
  writeFileSync(join(OUT, `frame_${String(i).padStart(3, '0')}.jpg`), buf);
}
console.log(`${FRAMES} frames → public/seq2/ (${(total / 1024 / 1024).toFixed(1)} MB total, avg ${(total / FRAMES / 1024).toFixed(0)} KB)`);
