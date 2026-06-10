/**
 * gen-frames.mjs — renders the scroll-scrub image sequence for /scroll-demo.
 *
 * Draws a stylized 3D "data pipeline" (Bronze → Silver → Gold medallion
 * clusters joined by flowing edges) with a camera that dollies down the
 * pipeline and orbits as t goes 0 → 1. Output: public/seq/frame_NNN.jpg.
 *
 * Run: node scripts/gen-frames.mjs
 */
import { createCanvas } from 'canvas';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const W = 1600, H = 900;
const FRAMES = 120;
const OUT = join(import.meta.dirname, '..', 'public', 'seq');
mkdirSync(OUT, { recursive: true });

// ── deterministic pseudo-random so every run renders identical frames ──
let seed = 7;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const lerp  = (a, b, t) => a + (b - a) * t;
const ease  = t => t * t * (3 - 2 * t);               // smoothstep
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ── scene graph ─────────────────────────────────────────────────────────
// World: y up, pipeline runs along +z. Three clusters = medallion layers.
const nodes = [];   // {x,y,z,r,heat}  heat 0..1 = how bright/golden
const edges = [];   // {a,b}           indices into nodes

// Bronze: a wall of small source nodes at z≈0
const sources = [];
for (let gx = -2; gx <= 2; gx++) {
  for (let gy = 0; gy <= 2; gy++) {
    sources.push(nodes.push({
      x: gx * 2.6 + (rand() - 0.5), y: gy * 2.2 + 1 + (rand() - 0.5),
      z: (rand() - 0.5) * 2, r: 0.28, heat: 0.25,
    }) - 1);
  }
}
// Collector funnels all sources forward
const collector = nodes.push({ x: 0, y: 2.6, z: 9, r: 0.6, heat: 0.45 }) - 1;
sources.forEach(s => edges.push({ a: s, b: collector }));

// Silver: three transform nodes in a triangle at z≈24
const silver = [];
for (let i = 0; i < 3; i++) {
  const ang = (i / 3) * Math.PI * 2 + 0.5;
  silver.push(nodes.push({
    x: Math.cos(ang) * 3.4, y: 2.6 + Math.sin(ang) * 2.2,
    z: 24 + (rand() - 0.5) * 3, r: 0.5, heat: 0.6,
  }) - 1);
}
silver.forEach(s => edges.push({ a: collector, b: s }));
edges.push({ a: silver[0], b: silver[1] }, { a: silver[1], b: silver[2] }, { a: silver[2], b: silver[0] });

// Gold: the serving core at z≈48 with a satellite ring
const gold = nodes.push({ x: 0, y: 2.6, z: 48, r: 1.05, heat: 1 }) - 1;
silver.forEach(s => edges.push({ a: s, b: gold }));
for (let i = 0; i < 6; i++) {
  const ang = (i / 6) * Math.PI * 2;
  const sat = nodes.push({
    x: Math.cos(ang) * 2.6, y: 2.6 + Math.sin(ang) * 2.6,
    z: 48.5, r: 0.22, heat: 0.85,
  }) - 1;
  edges.push({ a: gold, b: sat });
}

// Particles: each edge carries a few dots whose phase advances with t,
// so scrolling forward makes data visibly flow down the pipeline.
const particles = [];
edges.forEach((e, i) => {
  const n = 2 + (i % 2);
  for (let k = 0; k < n; k++) particles.push({ e, off: rand(), speed: 1.5 + rand() * 1.5 });
});

// ── camera path: wide front view → dolly along pipeline → close on gold ─
function camera(t) {
  const e = ease(t);
  const tz   = lerp(2, 47, e);                 // look-at point slides down the line
  const dist = lerp(21, 9, e);                 // pull in
  const az   = lerp(-0.62, 0.45, e);           // orbit ~60° around the line
  const hgt  = lerp(12, 3.2, ease(clamp(t * 1.3, 0, 1)));
  const target = { x: 0, y: 2.6, z: tz };
  const pos = { x: target.x + Math.sin(az) * dist, y: hgt, z: target.z - Math.cos(az) * dist };
  // orthonormal basis looking at target
  let f = { x: target.x - pos.x, y: target.y - pos.y, z: target.z - pos.z };
  const fl = Math.hypot(f.x, f.y, f.z); f = { x: f.x / fl, y: f.y / fl, z: f.z / fl };
  let r = { x: f.z, y: 0, z: -f.x };
  const rl = Math.hypot(r.x, r.z); r = { x: r.x / rl, y: 0, z: r.z / rl };
  const u = { x: r.y * f.z - r.z * f.y, y: r.z * f.x - r.x * f.z, z: r.x * f.y - r.y * f.x };
  return { pos, r, u, f };
}

// Project world point → screen {sx, sy, depth} or null if behind camera
function project(cam, p) {
  const d = { x: p.x - cam.pos.x, y: p.y - cam.pos.y, z: p.z - cam.pos.z };
  const cx = d.x * cam.r.x + d.y * cam.r.y + d.z * cam.r.z;
  const cy = d.x * cam.u.x + d.y * cam.u.y + d.z * cam.u.z;
  const cz = d.x * cam.f.x + d.y * cam.f.y + d.z * cam.f.z;
  if (cz < 0.5) return null;
  const focal = H * 1.15;
  return { sx: W / 2 + (cx / cz) * focal, sy: H / 2 - (cy / cz) * focal, depth: cz };
}

// Distance fog: far things sink into the background
const fog = depth => clamp(1 - (depth - 6) / 55, 0.06, 1);

// Amber ramp: heat 0 = dim ember, 1 = bright gold-white
function tint(heat, alpha) {
  const r = Math.round(lerp(150, 255, heat));
  const g = Math.round(lerp(105, 216, heat));
  const b = Math.round(lerp(60, 150, heat));
  return `rgba(${r},${g},${b},${alpha})`;
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

function render(t) {
  const cam = camera(t);

  // backdrop: near-black with a faint warm pool low in frame
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#07070a';
  ctx.fillRect(0, 0, W, H);
  const pool = ctx.createRadialGradient(W * 0.5, H * 0.78, 0, W * 0.5, H * 0.78, W * 0.75);
  pool.addColorStop(0, 'rgba(201,163,90,0.05)');
  pool.addColorStop(1, 'rgba(201,163,90,0)');
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, W, H);

  // floor grid on y=0, fading with distance
  ctx.lineWidth = 1;
  for (let gz = -10; gz <= 64; gz += 4) {
    const a = project(cam, { x: -30, y: 0, z: gz });
    const b = project(cam, { x: 30, y: 0, z: gz });
    if (!a || !b) continue;
    ctx.strokeStyle = `rgba(201,163,90,${0.05 * fog((a.depth + b.depth) / 2)})`;
    ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
  }
  for (let gx = -30; gx <= 30; gx += 4) {
    const a = project(cam, { x: gx, y: 0, z: -10 });
    const b = project(cam, { x: gx, y: 0, z: 64 });
    if (!a || !b) continue;
    ctx.strokeStyle = 'rgba(201,163,90,0.03)';
    ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
  }

  // edges — glows stack additively for the lit-fiber look
  ctx.globalCompositeOperation = 'lighter';
  for (const e of edges) {
    const a = project(cam, nodes[e.a]);
    const b = project(cam, nodes[e.b]);
    if (!a || !b) continue;
    const f = fog((a.depth + b.depth) / 2);
    const heat = (nodes[e.a].heat + nodes[e.b].heat) / 2;
    ctx.strokeStyle = tint(heat, 0.24 * f);
    ctx.lineWidth = clamp(46 / ((a.depth + b.depth) / 2), 0.6, 3);
    ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
  }

  // particles flowing along edges
  for (const p of particles) {
    const na = nodes[p.e.a], nb = nodes[p.e.b];
    const ph = (p.off + t * p.speed) % 1;
    const pt = project(cam, { x: lerp(na.x, nb.x, ph), y: lerp(na.y, nb.y, ph), z: lerp(na.z, nb.z, ph) });
    if (!pt) continue;
    const f = fog(pt.depth);
    const rad = clamp(90 / pt.depth, 1, 5);
    const g = ctx.createRadialGradient(pt.sx, pt.sy, 0, pt.sx, pt.sy, rad * 3);
    g.addColorStop(0, tint(0.95, 0.85 * f));
    g.addColorStop(1, tint(0.95, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(pt.sx, pt.sy, rad * 3, 0, Math.PI * 2); ctx.fill();
  }

  // nodes, far-to-near so close glows paint over distant ones
  const drawn = nodes
    .map(n => ({ n, p: project(cam, n) }))
    .filter(d => d.p)
    .sort((x, y) => y.p.depth - x.p.depth);
  for (const { n, p } of drawn) {
    const f = fog(p.depth);
    const rad = clamp((n.r * 520) / p.depth, 2, 90);
    const halo = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, rad * 4);
    halo.addColorStop(0, tint(n.heat, 0.5 * f));
    halo.addColorStop(0.35, tint(n.heat, 0.12 * f));
    halo.addColorStop(1, tint(n.heat, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(p.sx, p.sy, rad * 4, 0, Math.PI * 2); ctx.fill();
    const core = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, rad);
    core.addColorStop(0, `rgba(255,244,220,${0.95 * f})`);
    core.addColorStop(0.6, tint(n.heat, 0.8 * f));
    core.addColorStop(1, tint(n.heat, 0));
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2); ctx.fill();
  }

  // vignette for the cinematic crop
  ctx.globalCompositeOperation = 'source-over';
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.55)');
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
console.log(`${FRAMES} frames → public/seq/ (${(total / 1024 / 1024).toFixed(1)} MB total, avg ${(total / FRAMES / 1024).toFixed(0)} KB)`);
