/* =================================================================
   dark-scene.ts — particle cloud for the dark homepage (/).
   Ported from Tong's v3 demo (usta.agency feel) with MEANINGFUL,
   per-beat morphs instead of arbitrary geometry.

   - GPU particle cloud (custom ShaderMaterial) morphs between forms
     that MEAN something for each of the 7 beats and is repelled by
     the cursor in real time.
   - GSAP ScrollTrigger drives the morphs + text reveals.
   - Lenis provides smooth scroll (exposed as window.__lenis for the
     verification harness).

   This module is imported dynamically AFTER first paint by index.astro,
   so the static HTML hero is the LCP, not the canvas. It bails out
   entirely under prefers-reduced-motion or when WebGL is unavailable —
   in those cases the page is the plain stacked HTML sections.
   ================================================================= */
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
// @ts-ignore — topojson-client ships no type declarations.
import { feature } from 'topojson-client';
// @ts-ignore — JSON map asset (Natural Earth land), no type declaration needed.
import landTopo from 'world-atlas/land-110m.json';

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
    __darkScene?: boolean;
  }
}

/* -----------------------------------------------------------------
   0. GUARD — reduced motion stays on the static HTML.
   WebGL failures are caught further down and fall back the same way.
   ----------------------------------------------------------------- */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
const loaderEl = document.getElementById('loader');
const loaderNum = document.getElementById('loaderNum');

/** Reveal the page chrome and drop the loader without any WebGL. */
function fallbackToStatic() {
  document.documentElement.classList.add('no-scene');
  if (loaderEl) loaderEl.classList.add('is-done');
}

if (reduceMotion || !canvas) {
  fallbackToStatic();
} else {
  // boot() is async (font-race fix); .catch handles both sync throws and async rejects.
  boot(canvas).catch((err) => {
    // WebGL init / shader compile failed → static fallback, site fully usable.
    console.warn('[dark-scene] WebGL unavailable, using static fallback:', err);
    fallbackToStatic();
  });
}

/* -----------------------------------------------------------------
   MAIN
   ----------------------------------------------------------------- */
async function boot(canvas: HTMLCanvasElement) {
  const isMobile = innerWidth < 760;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6.4);

  // Particle budget scales down on small / low-power devices.
  const COUNT = isMobile ? 7000 : 14000;
  const RADIUS = 2.5;

  const TAU = Math.PI * 2;
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));

  // canvas.style is set by CSS (#scene); reveal it now that WebGL is live.
  canvas.style.display = 'block';
  document.documentElement.classList.add('has-scene');

  // Figure placement (item 7) is derived at runtime from each beat's text rect
  // — see recomputePlacements() below. No hand-picked offset map: the figure
  // drops into the largest empty viewport region opposite the text, both axes,
  // and self-corrects across desktop / mobile / resize.

  // ~13% of the budget are permanent wide-field "ambient" dots that never
  // join the figure — they keep a faint scattered target in every shape and
  // twinkle on a faster timescale (item 3 + item 4 two-timescales).
  const AMBIENT_FRACTION = 0.13;

  /* ---------------------------------------------------------------
     SHAPE GENERATORS — each returns a Float32Array of length COUNT*3.
     Several also return a per-particle "accent mask" used to light
     specific particles (e.g. Luxembourg, wordmark glyphs).
     --------------------------------------------------------------- */

  // Hero — a DOTTED EARTH: continents are dense dot clusters, the ocean a sparse
  // scatter that holds the sphere's silhouette, oriented so Western Europe faces
  // the camera with Luxembourg (≈49.6°N, 6.1°E) lit as a bright node.
  const accentGlobe = new Float32Array(COUNT); // 0 = base land/ocean, 0.5 = W. Europe, 1 = Luxembourg

  // Real coastline land mask: rasterize Natural Earth land (world-atlas TopoJSON)
  // onto an equirectangular canvas once, then sample it as isLand(lat, lon). The
  // canvas fill handles continent outlines + lake holes; far more recognizable
  // than analytic blobs. Built lazily on first call, cached.
  let landData: Uint8ClampedArray | null = null;
  let landW = 0, landH = 0;
  function buildLandMask() {
    landW = 1024; landH = 512;
    const cv = document.createElement('canvas');
    cv.width = landW; cv.height = landH;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, landW, landH);
    const land: any = feature(landTopo as any, (landTopo as any).objects.land);
    // feature() yields a FeatureCollection (land is a GeometryCollection) or a
    // single Feature — collect every Polygon/MultiPolygon ring from either.
    const features: any[] = land.type === 'FeatureCollection' ? land.features : [land];
    // equirectangular: lon[-180,180]→x[0,W], lat[90,-90]→y[0,H].
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    for (const f of features) {
      const g = f.geometry;
      if (!g) continue;
      const polys: number[][][][] = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
      for (const poly of polys) {
        for (const ring of poly) {
          ring.forEach(([lon, lat], i) => {
            const x = ((lon + 180) / 360) * landW;
            const y = ((90 - lat) / 180) * landH;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          });
          ctx.closePath();
        }
      }
    }
    ctx.fill('evenodd'); // even-odd so inner rings (lakes) cut holes
    landData = ctx.getImageData(0, 0, landW, landH).data;
  }
  function isLand(lat: number, lon: number): boolean {
    if (!landData) buildLandMask();
    let x = Math.floor(((lon + 180) / 360) * landW);
    let y = Math.floor(((90 - lat) / 180) * landH);
    x = Math.max(0, Math.min(landW - 1, x));
    y = Math.max(0, Math.min(landH - 1, y));
    return landData![(y * landW + x) * 4] > 128;
  }

  function makeGlobe(): Float32Array {
    const a = new Float32Array(COUNT * 3);
    const k = RADIUS * 1.18;
    const D2R = Math.PI / 180;
    // Unit vector for a lat/lon (lon measured from +x toward +z).
    const toVec = (la: number, lo: number): [number, number, number] => {
      const a1 = la * D2R, o1 = lo * D2R;
      return [Math.cos(a1) * Math.cos(o1), Math.sin(a1), Math.cos(a1) * Math.sin(o1)];
    };
    const dot = (x: number[], y: number[]) => x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
    const norm = (v: number[]): [number, number, number] => {
      const m = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / m, v[1] / m, v[2] / m];
    };
    const cross = (x: number[], y: number[]): [number, number, number] =>
      [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];

    // Orientation basis: Western Europe faces the camera (+z), north stays up.
    // Centre on ~W. Europe so Europe sits middle with the Atlantic (ocean) framing
    // it on the left — the contrast that makes the coastline read.
    const f = norm(toVec(42, 4));                  // front → +z (toward camera)
    const N = [0, 1, 0];
    const u = norm([N[0] - dot(N, f) * f[0], N[1] - dot(N, f) * f[1], N[2] - dot(N, f) * f[2]]); // up → +y
    const r = norm(cross(u, f));                   // right → +x
    const orient = (p: number[]): [number, number, number] => [dot(p, r), dot(p, u), dot(p, f)];

    // Gather land directions (with their lat/lon) from a dense fibonacci sample.
    // Many candidates → fine coastlines (each gets only a couple of particles).
    const land: { v: [number, number, number]; lat: number; lon: number }[] = [];
    const M = 22000;
    for (let j = 0; j < M; j++) {
      const yv = 1 - (j / (M - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - yv * yv));
      const th = GOLDEN * j;
      const p = [Math.cos(th) * rad, yv, Math.sin(th) * rad];
      const lat = Math.asin(p[1]) / D2R, lon = Math.atan2(p[2], p[0]) / D2R;
      if (isLand(lat, lon)) land.push({ v: orient(p), lat, lon });
    }

    let li = 0;
    for (let i = 0; i < COUNT; i++) {
      // Almost all particles render the continents (dotted-map look); a thin ~3%
      // ocean keeps a faint hint of the sphere's round edge. Empty ocean = the
      // coastlines and inner seas read instead of a solid ball.
      const onLand = land.length > 0 && i % 100 < 97;
      let vx: number, vy: number, vz: number, acc = 0;
      if (onLand) {
        const c = land[li++ % land.length];
        const j = 0.012; // small jitter so dots aren't stacked on candidates
        vx = c.v[0] + (Math.random() - 0.5) * j;
        vy = c.v[1] + (Math.random() - 0.5) * j;
        vz = c.v[2] + (Math.random() - 0.5) * j;
        // Light Western Europe; Luxembourg is the brightest node.
        const dLux = Math.abs(c.lat - 49.6) + Math.abs(c.lon - 6.1);
        if (dLux < 4) acc = 1;
        else if (c.lat > 40 && c.lat < 60 && c.lon > -10 && c.lon < 22) acc = 0.5;
      } else {
        const yv = Math.random() * 2 - 1;
        const rr = Math.sqrt(Math.max(0, 1 - yv * yv));
        const th = Math.random() * TAU;
        vx = Math.cos(th) * rr; vy = yv; vz = Math.sin(th) * rr;
      }
      a[i * 3] = vx * k;
      a[i * 3 + 1] = vy * k;
      a[i * 3 + 2] = vz * k;
      accentGlobe[i] = acc;
    }
    return a;
  }

  /* --- Work-experience figures: pipeline TOPOLOGIES, not wordmarks (the company
     name carries in the HTML copy). Each maps to what Tong built there, and the
     seven figures read as one pipeline story: stream → network → ledger → … ---
     Each returns positions + a themed-accent mask (1 = themed flow, 0 = cream). */

  // Neste (energy; batch + streaming) — a flowing current that FORKS into two
  // channels (batch + stream). Particles travel left→right; past the fork they
  // split into an upper and lower ribbon.
  function makeNesteStream(): { pos: Float32Array; accent: Float32Array } {
    const pos = new Float32Array(COUNT * 3);
    const accent = new Float32Array(COUNT);
    const WIDTH = 5.0;
    for (let i = 0; i < COUNT; i++) {
      const t = Math.random();                       // 0..1 along the flow
      const x = (t - 0.5) * WIDTH;                    // left → right
      const fork = Math.max(0, (t - 0.45) / 0.55);    // 0 before split, →1 right
      const side = i % 2 === 0 ? 1 : -1;              // upper / lower channel
      const sep = side * Math.pow(fork, 1.4) * 1.3;   // channels ease apart
      const thick = (0.55 - 0.34 * t) * (0.5 + 0.5 * Math.random()); // ribbon tapers
      pos[i * 3] = x + (Math.random() - 0.5) * 0.06;
      pos[i * 3 + 1] = sep + (Math.random() - 0.5) * thick;
      pos[i * 3 + 2] = Math.sin(t * TAU + side) * 0.22 + (Math.random() - 0.5) * 0.3;
      // The flowing core is themed (green); the looser edges stay cream.
      accent[i] = Math.random() < 0.7 ? 1 : 0;
    }
    return { pos, accent };
  }

  // PostNord (logistics; pipelines + BI) — a ROUTED NETWORK: hub nodes joined by
  // directed streams carrying discrete "packets" (parcels) between them.
  function makePostnordNetwork(): { pos: Float32Array; accent: Float32Array } {
    const pos = new Float32Array(COUNT * 3);
    const accent = new Float32Array(COUNT);
    const HUBS = 6;
    const C: [number, number, number][] = [];
    for (let n = 0; n < HUBS; n++) {
      const ang = (n / HUBS) * TAU + 0.3;
      const rad = 1.5 + (n % 2) * 0.8;
      C.push([Math.cos(ang) * rad, Math.sin(ang * 1.1) * 1.3, Math.sin(ang) * rad * 0.5]);
    }
    const edges: [number, number][] = [];
    for (let n = 0; n < HUBS; n++) { edges.push([n, (n + 1) % HUBS]); edges.push([n, (n + 2) % HUBS]); }
    for (let i = 0; i < COUNT; i++) {
      if (i % 3 === 0) {
        // Hub: a tight cluster (a depot/node on the network).
        const c = C[i % HUBS];
        const rr = Math.pow(Math.random(), 1.7) * 0.42;
        const ang = Math.random() * TAU, ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = c[0] + Math.sin(ph) * Math.cos(ang) * rr;
        pos[i * 3 + 1] = c[1] + Math.sin(ph) * Math.sin(ang) * rr;
        pos[i * 3 + 2] = c[2] + Math.cos(ph) * rr;
        accent[i] = 0; // hubs read cream
      } else {
        // Route packet: particles bunch at discrete points along an edge so the
        // links read as parcels moving, not a smooth line.
        const e = edges[i % edges.length];
        const c1 = C[e[0]], c2 = C[e[1]];
        const tt = Math.floor(Math.random() * 4) / 4 + Math.random() * 0.12;
        pos[i * 3] = c1[0] + (c2[0] - c1[0]) * tt + (Math.random() - 0.5) * 0.08;
        pos[i * 3 + 1] = c1[1] + (c2[1] - c1[1]) * tt + (Math.random() - 0.5) * 0.08;
        pos[i * 3 + 2] = c1[2] + (c2[2] - c1[2]) * tt + (Math.random() - 0.5) * 0.08;
        accent[i] = 1; // moving packets are themed (blue)
      }
    }
    return { pos, accent };
  }

  // Basware (fintech / invoicing) — particles SETTLING ROW-BY-ROW into a ledger
  // grid (transactions reconciling): top rows crisp/settled, lower rows still loose.
  function makeBaswareLedger(): { pos: Float32Array; accent: Float32Array } {
    const pos = new Float32Array(COUNT * 3);
    const accent = new Float32Array(COUNT);
    const COLS = 15, ROWS = 11;
    const CW = 0.32, RH = 0.34;
    const halfW = ((COLS - 1) * CW) / 2, halfH = ((ROWS - 1) * RH) / 2;
    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS) % ROWS;
      const settle = row / (ROWS - 1);               // 0 top (settled) .. 1 bottom (loose)
      const jit = 0.03 + settle * 0.22;              // lower rows haven't settled yet
      pos[i * 3] = col * CW - halfW + (Math.random() - 0.5) * jit;
      pos[i * 3 + 1] = halfH - row * RH + (Math.random() - 0.5) * jit;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
      // Settled (upper) rows are themed amber; still-loose lower rows stay cream.
      accent[i] = settle < 0.55 ? 1 : 0;
    }
    return { pos, accent };
  }

  // Projects — constellation of built artifacts: discrete glowing clusters
  // (one per "thing built") linked by sparse bridge particles.
  function makeConstellation(): Float32Array {
    const a = new Float32Array(COUNT * 3);
    const nodes = 9;
    const centers: [number, number, number][] = [];
    for (let n = 0; n < nodes; n++) {
      const ang = (n / nodes) * TAU + 0.4;
      const rad = 1.4 + (n % 3) * 0.55;
      centers.push([
        Math.cos(ang) * rad,
        Math.sin(ang * 1.3) * 1.5,
        Math.sin(ang) * rad * 0.7,
      ]);
    }
    for (let i = 0; i < COUNT; i++) {
      if (i % 6 === 0) {
        // Bridge particle: lerp between two random node centers (the links).
        const c1 = centers[i % nodes];
        const c2 = centers[(i + 3) % nodes];
        const t = Math.random();
        a[i * 3] = c1[0] + (c2[0] - c1[0]) * t + (Math.random() - 0.5) * 0.1;
        a[i * 3 + 1] = c1[1] + (c2[1] - c1[1]) * t + (Math.random() - 0.5) * 0.1;
        a[i * 3 + 2] = c1[2] + (c2[2] - c1[2]) * t + (Math.random() - 0.5) * 0.1;
      } else {
        // Cluster particle: a small blob around one node.
        const c = centers[i % nodes];
        const rr = Math.pow(Math.random(), 1.6) * 0.55;
        const ang = Math.random() * TAU;
        const ph = Math.acos(2 * Math.random() - 1);
        a[i * 3] = c[0] + Math.sin(ph) * Math.cos(ang) * rr;
        a[i * 3 + 1] = c[1] + Math.sin(ph) * Math.sin(ang) * rr;
        a[i * 3 + 2] = c[2] + Math.cos(ph) * rr;
      }
    }
    return a;
  }

  // Writes — flowing horizontal lines of text forming: stacked rows of
  // particles with a left-to-right density gradient (lines being written).
  function makeTextLines(): Float32Array {
    const a = new Float32Array(COUNT * 3);
    const rows = 11;
    const rowGap = 0.42;
    const width = 5.2;
    for (let i = 0; i < COUNT; i++) {
      const row = i % rows;
      // x weighted toward the left (start of a line, trailing off right).
      const tx = Math.pow(Math.random(), 0.8);
      const x = (tx - 0.5) * width;
      const y = (row - (rows - 1) / 2) * rowGap + (Math.random() - 0.5) * 0.08;
      // Break each row into word-like clumps via a sine mask on x.
      const clump = 0.5 + 0.5 * Math.sin(x * 5 + row);
      const z = (Math.random() - 0.5) * 0.5 - clump * 0.3;
      a[i * 3] = x;
      a[i * 3 + 1] = y;
      a[i * 3 + 2] = z;
    }
    return a;
  }

  // Talk-to-me — conversational / neural form: two lobes (you ⇄ me)
  // joined by a dense synaptic bundle. The end state of the journey.
  function makeNeural(): Float32Array {
    const a = new Float32Array(COUNT * 3);
    const lobeX = 1.7;
    for (let i = 0; i < COUNT; i++) {
      const seg = i % 5;
      if (seg < 2) {
        // Bundle: particles strung along a curved bridge between lobes.
        const t = Math.random();
        const x = (t - 0.5) * 2 * lobeX;
        const sag = Math.sin(t * Math.PI) * 0.5;
        a[i * 3] = x;
        a[i * 3 + 1] = sag * (Math.random() - 0.5) * 2 + (Math.random() - 0.5) * 0.25;
        a[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      } else {
        // Lobe: a soft sphere on the left or right.
        const side = seg % 2 === 0 ? -1 : 1;
        const rr = Math.pow(Math.random(), 0.7) * 1.25;
        const ang = Math.random() * TAU;
        const ph = Math.acos(2 * Math.random() - 1);
        a[i * 3] = side * lobeX + Math.sin(ph) * Math.cos(ang) * rr;
        a[i * 3 + 1] = Math.sin(ph) * Math.sin(ang) * rr;
        a[i * 3 + 2] = Math.cos(ph) * rr;
      }
    }
    return a;
  }

  // Intro — a dense little core that blooms into the globe.
  function makeCollapse(): Float32Array {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const yv = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - yv * yv));
      const th = GOLDEN * i;
      const k = RADIUS * 0.42 * Math.random();
      a[i * 3] = Math.cos(th) * r * k;
      a[i * 3 + 1] = yv * k;
      a[i * 3 + 2] = Math.sin(th) * r * k;
    }
    return a;
  }

  // Wait for Anton before sampling glyph pixels — without this, a cold load
  // bakes the Impact/Arial-Narrow fallback metrics into the cached particle
  // positions permanently (font-race: positions are computed once, never again).
  if (document.fonts?.load) {
    await document.fonts.load('700 150px Anton');
    await document.fonts.ready;
  }

  // Build all morph targets once (Anton is guaranteed loaded at this point).
  const globe = makeGlobe();
  const neste = makeNesteStream();
  const postnord = makePostnordNetwork();
  const basware = makeBaswareLedger();

  type ShapeDef = { pos: Float32Array; accent: Float32Array | null; color: any };
  const cCream = new THREE.Color(0xece8de);
  const cBlue = new THREE.Color(0x3b6cf6);
  const cAmber = new THREE.Color(0xe8762b);
  // Neste green-ish energy, PostNord blue, Basware amber — themed accents.
  const cNeste = new THREE.Color(0x36c98a);
  const cPostnord = cBlue;
  const cBasware = cAmber;

  const SHAPES: Record<string, ShapeDef> = {
    hero: { pos: globe, accent: accentGlobe, color: cBlue },
    neste: { pos: neste.pos, accent: neste.accent, color: cNeste },
    postnord: { pos: postnord.pos, accent: postnord.accent, color: cPostnord },
    basware: { pos: basware.pos, accent: basware.accent, color: cBasware },
    projects: { pos: makeConstellation(), accent: null, color: cBlue },
    writes: { pos: makeTextLines(), accent: null, color: cCream },
    bot: { pos: makeNeural(), accent: null, color: cAmber },
  };

  /* ---------------------------------------------------------------
     PER-PARTICLE BASE COLOR + RANDOM
     --------------------------------------------------------------- */
  const baseColors = new Float32Array(COUNT * 3);
  const rand = new Float32Array(COUNT);
  // aAmbient: 1.0 for permanent wide-field dots (never join the figure),
  // 0.0 for figure particles. Distributed by index so the fraction is exact.
  const ambient = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const roll = Math.random();
    let col: any;
    if (roll < 0.1) col = cBlue;
    else if (roll < 0.16) col = cAmber;
    else col = cCream;
    const b = 0.55 + Math.random() * 0.45;
    baseColors[i * 3] = col.r * b;
    baseColors[i * 3 + 1] = col.g * b;
    baseColors[i * 3 + 2] = col.b * b;
    rand[i] = Math.random();
    ambient[i] = Math.random() < AMBIENT_FRACTION ? 1 : 0;
  }

  // Permanent wide-field position for the ambient dots — a screen-filling
  // starfield (~9 units wide) they hold in EVERY shape so the canvas is never
  // empty of dots, including the hero at rest. Figure shapes write over the
  // non-ambient particles below.
  const AMBIENT_W = 4.6; // half-width: spans ~9.2 world units (full viewport)
  function fillAmbient(pos: Float32Array) {
    for (let i = 0; i < COUNT; i++) {
      if (ambient[i] !== 1) continue;
      pos[i * 3] = (Math.random() * 2 - 1) * AMBIENT_W;
      pos[i * 3 + 1] = (Math.random() * 2 - 1) * AMBIENT_W * 0.62;
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * 1.8 - 0.6;
    }
  }
  // Stamp the ambient field into every figure target so ambient dots stay put
  // through all morphs (they never converge onto the figure).
  for (const key of Object.keys(SHAPES)) fillAmbient(SHAPES[key].pos);

  // Natural figure half-extent (world units, xy) per shape, measured over the
  // NON-ambient particles only — used to scale each figure to fit its empty
  // region so it stays fully on-screen AND clear of the text (see #2 fix).
  const figExtent: Record<string, { x: number; y: number }> = {};
  for (const key of Object.keys(SHAPES)) {
    const p = SHAPES[key].pos;
    let mx = 0.001, my = 0.001;
    for (let i = 0; i < COUNT; i++) {
      if (ambient[i] === 1) continue;
      mx = Math.max(mx, Math.abs(p[i * 3]));
      my = Math.max(my, Math.abs(p[i * 3 + 1]));
    }
    figExtent[key] = { x: mx, y: my };
  }

  // Accent color attribute — recomputed per morph so glyphs / nodes light up
  // in the beat's theme color. Tweened via uAccentMix for a smooth handoff.
  const accentColorsA = new Float32Array(COUNT * 3);
  const accentColorsB = new Float32Array(COUNT * 3);

  /** Write the accent color for a shape into the given buffer. */
  function fillAccent(buf: Float32Array, def: ShapeDef) {
    const col = def.color;
    for (let i = 0; i < COUNT; i++) {
      const m = def.accent ? def.accent[i] : 0;
      if (m > 0) {
        // Bright themed accent (Luxembourg node = full, Europe band = soft).
        const bright = 0.85 + 0.15 * m;
        buf[i * 3] = col.r * bright + 0.15 * m;
        buf[i * 3 + 1] = col.g * bright + 0.15 * m;
        buf[i * 3 + 2] = col.b * bright + 0.15 * m;
      } else {
        buf[i * 3] = baseColors[i * 3];
        buf[i * 3 + 1] = baseColors[i * 3 + 1];
        buf[i * 3 + 2] = baseColors[i * 3 + 2];
      }
    }
  }

  fillAccent(accentColorsA, SHAPES.hero);
  fillAccent(accentColorsB, SHAPES.hero);

  /* ---------------------------------------------------------------
     GEOMETRY + SHADER MATERIAL
     --------------------------------------------------------------- */
  const geo = new THREE.BufferGeometry();
  const startPos = makeCollapse();
  geo.setAttribute('aPosA', new THREE.BufferAttribute(startPos.slice(), 3));
  geo.setAttribute('aPosB', new THREE.BufferAttribute(globe.slice(), 3));
  geo.setAttribute('aColA', new THREE.BufferAttribute(accentColorsA, 3));
  geo.setAttribute('aColB', new THREE.BufferAttribute(accentColorsB, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  geo.setAttribute('aAmbient', new THREE.BufferAttribute(ambient, 1));
  geo.setAttribute('position', new THREE.BufferAttribute(startPos.slice(), 3));

  const uniforms = {
    uTime: { value: 0 },
    uMix: { value: 0 },
    uAccentMix: { value: 1 },
    uMouse: { value: new THREE.Vector3() },
    uMouseStrength: { value: 0 },
    uSize: { value: isMobile ? 21 : 28 },
    uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
    uDrift: { value: reduceMotion ? 0 : 1 },
    // 0 = particles on the figure; 1 = flown out to the wide scatter field.
    // Scrub-driven by ScrollTrigger across each section gap (reversible).
    uScatterMix: { value: 0 },
    // Figure offset (world units), tweened on morph so the cloud sits in the
    // empty region opposite the text — BOTH axes. Ambient + scatter ignore it
    // (they fill the screen). Set by recomputePlacements().
    uOffsetX: { value: 0 },
    uOffsetY: { value: 0 },
    // Per-beat figure scale (xy), tweened on morph so the figure shrinks to fit
    // the empty region beside the text — stays on-screen AND clear. Ambient = 1.
    uFigureScale: { value: 1 },
    // Per-beat dot-size multiplier (figure dots only). The Earth needs finer dots
    // so continents resolve; the abstract figures stay bold. Tweened on morph.
    uDotScale: { value: 1 },
    // Back-face fade (1 = on, for the Earth): dims dots whose sphere normal points
    // away from the camera so the back hemisphere stops bleeding through the front.
    uBackFade: { value: 1 },
    // Inverse of the cloud's object rotation (points.rotation), refreshed each
    // frame. The placement offset (uOffsetX/Y) is a WORLD-space target, but the
    // whole cloud is spun by points.rotation (scroll flourish). Pre-multiplying
    // the offset by this inverse cancels that spin so the figure lands on its
    // spot regardless of rotation — it spins in place, placement stays put.
    uFigRotInv: { value: new THREE.Matrix3() },
    // Scatter field half-extents (world units) — a screen-filling starfield.
    uScatterExtent: { value: new THREE.Vector3(4.8, 3.0, 2.0) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aPosA;
      attribute vec3 aPosB;
      attribute vec3 aColA;
      attribute vec3 aColB;
      attribute float aRand;
      attribute float aAmbient;
      uniform float uTime;
      uniform float uMix;
      uniform float uAccentMix;
      uniform vec3  uMouse;
      uniform float uMouseStrength;
      uniform float uSize;
      uniform float uPixelRatio;
      uniform float uDrift;
      uniform float uScatterMix;
      uniform float uOffsetX;
      uniform float uOffsetY;
      uniform float uFigureScale;
      uniform float uDotScale;
      uniform float uBackFade;
      uniform mat3  uFigRotInv;
      uniform vec3  uScatterExtent;
      varying vec3 vColor;
      varying float vAlpha;

      const float TAU = 6.2831853;

      // Cheap per-particle hash → 3 decorrelated values in [0,1).
      vec3 hash3(float n) {
        return fract(sin(vec3(n, n + 1.7, n + 3.3)) * vec3(43758.5453, 22578.1459, 19642.3490));
      }

      void main() {
        vColor = mix(aColA, aColB, uAccentMix);

        // --- figure position: morph A→B, then shift opposite the text.
        // Ambient dots ignore the offset (they fill the whole screen).
        vec3 figurePos = mix(aPosA, aPosB, uMix);
        // Sphere normal for the Earth's back-face fade (globe is centred at origin,
        // so the raw morph position doubles as the outward normal). Pre-scale.
        vec3 sphereN = normalize(figurePos + vec3(0.0001));
        // Scale the figure (not ambient) to fit its empty region, then shift it
        // there — both axes (#2 fix + item 7). Scale about origin (figures are
        // centred there); ambient stays full-size and screen-filling.
        figurePos.xy *= mix(uFigureScale, 1.0, aAmbient);
        // Shift the figure into its empty region (world-space target), but undo
        // the cloud's spin first (uFigRotInv) so modelViewMatrix re-applying that
        // rotation lands the figure exactly on the world offset — spins in place,
        // placement holds. Ambient dots take no offset (they fill the screen).
        vec3 worldOffset = vec3(uOffsetX, uOffsetY, 0.0) * (1.0 - aAmbient);
        figurePos += uFigRotInv * worldOffset;

        // --- scatter target: a wide, screen-filling field derived from aRand.
        // No extra buffer — hashed into uScatterExtent so mid-gap reads as a
        // full-viewport starfield, and it's stable (reversible) per particle.
        vec3 h = hash3(aRand * 137.0 + 0.5) * 2.0 - 1.0;
        vec3 scatterPos = h * uScatterExtent;

        // Ambient dots are already wide-field, so they don't scatter further.
        float scatter = uScatterMix * (1.0 - aAmbient);
        vec3 pos = mix(figurePos, scatterPos, scatter);

        // --- breathing / drift (gated off under reduced motion via uDrift).
        // Loop, not a line: per-axis frequency spread traces ellipses. Slow
        // (~0.3Hz) and per-particle desynced (aRand*TAU). Amplitude grows with
        // scatter (weightless starfield) and the z-component is widened so the
        // perspective gl_PointSize carries most of the "breath". Ambient dots
        // twinkle on a faster, smaller timescale.
        float amp = (0.045 + 0.32 * uScatterMix) * uDrift;
        float twinkle = mix(1.0, 2.6, aAmbient);   // ambient = faster timescale
        float t = uTime * 0.42 * twinkle + aRand * TAU;
        pos.x += sin(t) * amp;
        pos.y += cos(t * 1.27) * amp;
        pos.z += sin(t * 0.71) * amp * 2.4;        // widened z → depth breathing

        // cursor swell (usta mechanism): dots near the pointer rise toward the
        // camera and grow into a soft 3D hill that follows the mouse — NOT a
        // repulsion void. prox is 1 at the cursor and eases to 0 at a wide soft
        // edge; it's reused below to bloom the dot size + alpha so the effect
        // lives entirely in the dots (no competing cursor ring).
        vec2 d = pos.xy - uMouse.xy;
        float prox = smoothstep(1.6, 0.0, length(d)) * uMouseStrength;
        pos.z += prox * 0.6;                               // lift toward the camera (+z)
        pos.xy += normalize(d + 0.0001) * prox * 0.12;     // gentle outward bulge

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;

        // Size (item 8): power-curve variance so a MINORITY of dots are markedly
        // larger (the usta look), not a uniform layer. pow(aRand,3) keeps most
        // dots small; the long tail gives the few big bright ones. Depth
        // (1/-mv.z) still carries the breathing. Ambient dots are pushed clearly
        // smaller so the figure reads bold and dense against them.
        float sizeVar = mix(0.45, 4.2, pow(aRand, 2.4));
        float size = uSize * sizeVar;
        size *= mix(uDotScale, 1.0, aAmbient);     // per-beat figure dot size (Earth = finer); ambient unaffected
        size *= mix(1.0, 0.72, aAmbient);          // ambient dots a touch smaller (bigger than before, still faint)
        size *= 1.0 + 0.08 * sin(t * 1.6) * uDrift; // ≤0.1 amplitude size sine
        size *= 1.0 + prox * 2.2;                   // usta swell: dots bloom near the cursor
        gl_PointSize = size * uPixelRatio * (1.0 / -mv.z);

        // Figure dots brighter/bolder; ambient fainter and flickering (distant
        // stars) so the figure mass clearly dominates the field (item 8).
        float baseA = 0.6 + aRand * 0.4;
        float amb = 0.28 + 0.16 * sin(t * 1.9);
        vAlpha = mix(baseA, amb, aAmbient);

        // Earth back-face fade: dim dots whose (rotated) sphere normal points away
        // from the camera, so the far hemisphere stops bleeding through the near one.
        float facing = (modelViewMatrix * vec4(sphereN, 0.0)).z; // >0 → toward camera
        float front = smoothstep(-0.08, 0.5, facing);
        vAlpha *= mix(1.0, front, uBackFade * (1.0 - aAmbient));
        vAlpha *= 1.0 + prox * 0.5;                 // brighter bloom under the cursor
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.06, d) * vAlpha;
        gl_FragColor = vec4(vColor, a);
      }
    `,
  });

  const points = new THREE.Points(geo, material);
  points.frustumCulled = false; // positions computed in the shader
  scene.add(points);

  /* ---------------------------------------------------------------
     MORPH CONTROL — freeze current state into A, set B to target.
     --------------------------------------------------------------- */
  let currentShape = 'hero';
  let accentTween: gsap.core.Tween | null = null;
  let offsetTween: gsap.core.Tween | null = null;
  let offsetTweenY: gsap.core.Tween | null = null;
  let scaleTween: gsap.core.Tween | null = null;
  let dotTween: gsap.core.Tween | null = null;
  // The Earth needs finer dots to read as a map; abstract figures stay bold.
  const dotScaleFor = (name: string) => (name === 'hero' ? 0.5 : 1);

  // Figure placement cache (#2 fix + item 7): shape → { x, y, scale } in world
  // units. The figure is SCALED to fit the largest empty region opposite the
  // beat's text and CENTRED in it — so it stays fully on-screen AND clear of the
  // text (not edge-pushed off-screen). Populated once layout is ready + on resize.
  // (camera/plane/figExtent referenced here exist by the first call, in initScroll.)
  const placements: Record<string, { x: number; y: number; scale: number }> = {};
  const placeRay = new THREE.Raycaster();
  const FIT = 0.72;        // gap between the scaled figure and the text/edges
  const SCALE_MIN = 0.3;   // hard floor — never shrink a figure to a speck. Low
                           // enough that a tall figure (the globe) can still fit
                           // a narrow mobile strip instead of being floored too
                           // big and forced over the text.
  function recomputePlacements() {
    const secs = Array.from(document.querySelectorAll<HTMLElement>('[data-shape]'));
    const W = innerWidth, H = innerHeight;
    const margin = Math.min(W, H) * 0.05;
    // World units per screen pixel at the z=0 plane, for gap → world sizing.
    const worldH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    const worldW = worldH * camera.aspect;
    const wpx = worldW / W, wpy = worldH / H;
    for (const sec of secs) {
      const shape = sec.dataset.shape!;
      let textEl: Element | null = null;
      for (const s of ['.hero__inner', '.split__pad', '.bot__inner']) {
        const el = sec.querySelector(s);
        if (el) { textEl = el; break; }
      }
      if (!textEl) { placements[shape] = { x: 0, y: 0, scale: 1 }; continue; }
      // Text rect as it sits when this beat is CENTRED (its scatter=0 rest
      // state). x is scroll-independent; the vertical is derived from the
      // document offset so the result is stable at any current scroll position.
      const r = textEl.getBoundingClientRect();
      const secRect = sec.getBoundingClientRect();
      const secMid = secRect.top + scrollY + secRect.height / 2;
      const top = (r.top + scrollY) - (secMid - H / 2);
      const tr = { left: r.left, right: r.right, top, bottom: top + r.height };
      // Four empty strips around the text; centre the figure in the LARGEST and
      // scale it to fit. Desktop → a side strip wins (figure beside text); mobile
      // (full-width text) → a top/bottom strip wins (figure above/below).
      const gaps = [
        { area: Math.max(0, tr.left) * H,      cx: Math.max(0, tr.left) / 2,         cy: H / 2,                            w: Math.max(0, tr.left),      h: H },
        { area: Math.max(0, W - tr.right) * H, cx: (Math.min(W, tr.right) + W) / 2,  cy: H / 2,                            w: Math.max(0, W - tr.right), h: H },
        { area: W * Math.max(0, tr.top),       cx: W / 2,                            cy: Math.max(0, tr.top) / 2,          w: W, h: Math.max(0, tr.top) },
        { area: W * Math.max(0, H - tr.bottom),cx: W / 2,                            cy: (Math.min(H, tr.bottom) + H) / 2, w: W, h: Math.max(0, H - tr.bottom) },
      ];
      gaps.sort((a, b) => b.area - a.area);
      const g = gaps[0];
      const cx = Math.max(margin, Math.min(W - margin, g.cx));
      const cy = Math.max(margin, Math.min(H - margin, g.cy));
      // Scale so the figure's natural half-extent fits the gap's half-extent.
      const ext = figExtent[shape] ?? { x: 2.5, y: 2.5 };
      let scale = Math.max(
        SCALE_MIN,
        Math.min(1, ((g.w / 2) * wpx / ext.x) * FIT, ((g.h / 2) * wpy / ext.y) * FIT)
      );
      // Viewport-fit clamp (#8): keep the SCALED figure (+ a little dot bloom)
      // inside the viewport on ANY aspect ratio. First shrink scale if the gap
      // let the figure grow past the screen on either axis.
      const halfW = worldW / 2, halfH = worldH / 2;
      const mW = margin * wpx, pad = 0.4;
      scale = Math.min(scale, Math.max(SCALE_MIN, (halfW - mW - pad) / ext.x));
      scale = Math.min(scale, Math.max(SCALE_MIN, (halfH - mW - pad) / ext.y));
      // Then clamp the CENTRE to the chosen empty STRIP — not symmetrically to the
      // screen centre. A screen-centre clamp pulls a tall figure back over the text
      // on a narrow portrait viewport: the mobile hero text is full-width, so the
      // screen centre sits INSIDE the text rect and the old clamp dragged the globe
      // onto the words. Constraining the centre to the gap box keeps the figure in
      // the empty region by construction; the strip is itself within the screen, so
      // this also satisfies the on-screen requirement. If the strip is smaller than
      // the figure on an axis, leave it gap-centred (best effort).
      const exXpx = (ext.x * scale + pad) / wpx;  // figure half-extent, screen px
      const exYpx = (ext.y * scale + pad) / wpy;
      const gx0 = Math.max(margin, g.cx - g.w / 2), gx1 = Math.min(W - margin, g.cx + g.w / 2);
      const gy0 = Math.max(margin, g.cy - g.h / 2), gy1 = Math.min(H - margin, g.cy + g.h / 2);
      let scx = cx, scy = cy;
      if (gx1 - gx0 >= 2 * exXpx) scx = Math.min(gx1 - exXpx, Math.max(gx0 + exXpx, scx));
      if (gy1 - gy0 >= 2 * exYpx) scy = Math.min(gy1 - exYpx, Math.max(gy0 + exYpx, scy));
      // Clamped strip-centre screen point → world at z=0 (same plane the cursor uses).
      placeRay.setFromCamera(new THREE.Vector2((scx / W) * 2 - 1, -(scy / H) * 2 + 1), camera);
      const hit = new THREE.Vector3();
      const ok = placeRay.ray.intersectPlane(plane, hit);
      placements[shape] = { x: ok ? hit.x : 0, y: ok ? hit.y : 0, scale };
    }
  }

  // Swap the figure target to `name` WHILE the cloud is scattered. uMix is
  // snapped to 1 instantly (the figure is invisible behind the scatter field
  // at the peak), so when uScatterMix ramps back 0 the dots reconverge onto
  // the new shape — no visible cross-fade between figures. Keeps morphTo's
  // A/B baking for the accent-colour handoff.
  function morphTo(name: string) {
    if (!SHAPES[name] || name === currentShape) return;
    const def = SHAPES[name];
    const B = geo.attributes.aPosB as any;
    (B.array as Float32Array).set(def.pos);
    B.needsUpdate = true;
    uniforms.uMix.value = 1; // figure target IS B

    // Accent-colour handoff (smooth recolour through the scatter).
    const cA = geo.attributes.aColA as any;
    const cB = geo.attributes.aColB as any;
    const ca = cA.array as Float32Array;
    const cb = cB.array as Float32Array;
    const am = uniforms.uAccentMix.value;
    for (let i = 0; i < ca.length; i++) ca[i] = ca[i] + (cb[i] - ca[i]) * am;
    fillAccent(cb as Float32Array, def);
    cA.needsUpdate = true;
    cB.needsUpdate = true;
    uniforms.uAccentMix.value = 0;

    currentShape = name;

    // Tween figure placement — scaled to fit and centred in the empty region
    // opposite its text, both axes (#2 fix + item 7).
    const pl = placements[name] ?? { x: 0, y: 0, scale: 1 };
    if (offsetTween) offsetTween.kill();
    if (offsetTweenY) offsetTweenY.kill();
    if (scaleTween) scaleTween.kill();
    offsetTween  = gsap.to(uniforms.uOffsetX, { value: pl.x, duration: 1.2, ease: 'power2.inOut' });
    offsetTweenY = gsap.to(uniforms.uOffsetY, { value: pl.y, duration: 1.2, ease: 'power2.inOut' });
    scaleTween   = gsap.to(uniforms.uFigureScale, { value: pl.scale, duration: 1.2, ease: 'power2.inOut' });
    if (dotTween) dotTween.kill();
    dotTween     = gsap.to(uniforms.uDotScale, { value: dotScaleFor(name), duration: 1.2, ease: 'power2.inOut' });
    gsap.to(uniforms.uBackFade, { value: name === 'hero' ? 1 : 0, duration: 1.2, ease: 'power2.inOut', overwrite: true });
    if (accentTween) accentTween.kill();
    accentTween = gsap.to(uniforms.uAccentMix, { value: 1, duration: 1.0, ease: 'power1.inOut' });
  }

  /* ---------------------------------------------------------------
     CURSOR → WORLD (raycast onto z=0) + pointer parallax
     --------------------------------------------------------------- */
  const pointer = new THREE.Vector2(-10, -10);
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hitPt = new THREE.Vector3();
  const targetMouse = new THREE.Vector3();
  const targetRot = { x: 0, y: 0 };

  addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(plane, hitPt)) targetMouse.copy(hitPt);
    gsap.to(uniforms.uMouseStrength, { value: 1, duration: 0.4, overwrite: true });
    targetRot.y = (e.clientX / innerWidth - 0.5) * 0.4;
    targetRot.x = (e.clientY / innerHeight - 0.5) * 0.3;
  });
  addEventListener('pointerleave', () => {
    gsap.to(uniforms.uMouseStrength, { value: 0, duration: 0.6 });
  });

  /* ---------------------------------------------------------------
     RENDER LOOP
     --------------------------------------------------------------- */
  const clock = new THREE.Clock();
  let scrollSpin = 0;
  function tick() {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.lerp(targetMouse, 0.12);
    points.rotation.y += (targetRot.y - points.rotation.y) * 0.04 + (reduceMotion ? 0 : 0.0009);
    points.rotation.x += (targetRot.x - points.rotation.x) * 0.04;
    points.rotation.z = scrollSpin;
    // Feed the shader the inverse of the cloud's current rotation so the
    // world-space placement offset cancels the spin (figure stays pinned).
    points.updateMatrix();
    uniforms.uFigRotInv.value.setFromMatrix4(points.matrix).invert();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  /* ---------------------------------------------------------------
     RESIZE
     --------------------------------------------------------------- */
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    uniforms.uPixelRatio.value = Math.min(devicePixelRatio, 2);
    ScrollTrigger.refresh();
    // Re-derive placements for the new viewport and re-apply the current beat's.
    recomputePlacements();
    const pc = placements[currentShape] ?? { x: 0, y: 0, scale: 1 };
    gsap.to(uniforms.uOffsetX, { value: pc.x, duration: 0.4 });
    gsap.to(uniforms.uOffsetY, { value: pc.y, duration: 0.4 });
    gsap.to(uniforms.uFigureScale, { value: pc.scale, duration: 0.4 });
  });

  /* ---------------------------------------------------------------
     LOADER count-up, then bloom into the globe.
     --------------------------------------------------------------- */
  function runLoader() {
    const o = { v: 0 };
    gsap.to(o, {
      v: 100,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (loaderNum) loaderNum.textContent = String(Math.round(o.v));
      },
      onComplete: () => {
        if (loaderEl) loaderEl.classList.add('is-done');
        ScrollTrigger.refresh();
      },
    });
  }

  /* ---------------------------------------------------------------
     SMOOTH SCROLL (Lenis) driving GSAP's ticker.
     Exposed as window.__lenis for the verification harness.
     --------------------------------------------------------------- */
  function initLenis() {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------------------------------------------------------
     SCROLL ORCHESTRATION — morph per beat + reveal copy.
     --------------------------------------------------------------- */
  function initScroll() {
    // Derive every beat's figure placement from its text rect, then place the
    // hero figure immediately (no tween) so it's correct from the first frame.
    recomputePlacements();
    const ph = placements['hero'] ?? { x: 0, y: 0, scale: 1 };
    uniforms.uOffsetX.value = ph.x;
    uniforms.uOffsetY.value = ph.y;
    uniforms.uFigureScale.value = ph.scale;
    uniforms.uDotScale.value = dotScaleFor('hero');
    uniforms.uBackFade.value = 1;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-shape]')
    );

    // Scrub-driven scatter across each gap between consecutive sections.
    // The trigger spans from one section's centre to the next section's centre;
    // uScatterMix follows a 0→1→0 arc (1 at the boundary midpoint). The figure
    // target is swapped to the next shape AT the scatter peak so the reconverge
    // lands on the new figure. Fully scrub-tied → reverses exactly on scroll-up.
    for (let i = 0; i < sections.length - 1; i++) {
      const fromShape = sections[i].dataset.shape!;
      const toShape = sections[i + 1].dataset.shape!;
      let swapped = false;
      ScrollTrigger.create({
        trigger: sections[i],
        // centre of this section → centre of the next section.
        start: 'center center',
        endTrigger: sections[i + 1],
        end: 'center center',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          // 0→1→0 across the gap (sine bump peaks at the midpoint).
          uniforms.uScatterMix.value = Math.sin(p * Math.PI);
          // At the peak, swap the figure target in the scroll direction.
          if (p > 0.5 && !swapped) {
            morphTo(toShape);
            swapped = true;
          } else if (p < 0.5 && swapped) {
            morphTo(fromShape);
            swapped = false;
          }
        },
      });
    }

    // Global scroll → subtle z-spin of the cloud.
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        scrollSpin = self.progress * Math.PI * 0.5;
      },
    });

    // Reveal copy blocks as they enter. data-hero-critical elements are
    // EXCLUDED from this so name+role are always visible (never opacity 0).
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        }
      );
    });
  }

  // Boot sequence.
  initLenis();
  initScroll();
  runLoader();
  window.__darkScene = true;

  // Intro bloom: collapse → globe.
  gsap.to(uniforms.uMix, { value: 1, duration: 2.2, ease: 'power3.out', delay: 0.25 });
}
