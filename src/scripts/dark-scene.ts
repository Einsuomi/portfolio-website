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

  /* ---------------------------------------------------------------
     SHAPE GENERATORS — each returns a Float32Array of length COUNT*3.
     Several also return a per-particle "accent mask" used to light
     specific particles (e.g. Luxembourg, wordmark glyphs).
     --------------------------------------------------------------- */

  // Hero — rotating globe with Western Europe / Luxembourg lit.
  // Luxembourg ≈ 49.6°N, 6.1°E. We light particles whose lat/lon land
  // near that node, plus a soft band over Western Europe.
  const LUX_LAT = (49.6 * Math.PI) / 180;
  const LUX_LON = (6.1 * Math.PI) / 180;
  const accentGlobe = new Float32Array(COUNT); // 0 = base, 1 = Luxembourg node, 0.5 = W. Europe

  function makeGlobe(): Float32Array {
    const a = new Float32Array(COUNT * 3);
    const k = RADIUS * 1.18;
    // Luxembourg position on the unit sphere (for proximity lighting).
    const lx = Math.cos(LUX_LAT) * Math.cos(LUX_LON);
    const ly = Math.sin(LUX_LAT);
    const lz = Math.cos(LUX_LAT) * Math.sin(LUX_LON);
    for (let i = 0; i < COUNT; i++) {
      // Even point distribution (fibonacci sphere).
      const yv = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - yv * yv));
      const th = GOLDEN * i;
      const nx = Math.cos(th) * r;
      const ny = yv;
      const nz = Math.sin(th) * r;
      a[i * 3] = nx * k;
      a[i * 3 + 1] = ny * k;
      a[i * 3 + 2] = nz * k;

      // Proximity to Luxembourg → bright node.
      const dLux = (nx - lx) ** 2 + (ny - ly) ** 2 + (nz - lz) ** 2;
      // Western Europe band: northern hemisphere, longitudes around 0–15°E.
      const lon = Math.atan2(nz, nx);
      const inEurope = ny > 0.35 && ny < 0.78 && lon > -0.25 && lon < 0.45;
      if (dLux < 0.012) accentGlobe[i] = 1;
      else if (inEurope) accentGlobe[i] = 0.5;
      else accentGlobe[i] = 0;
    }
    return a;
  }

  /* --- particle-text: render a word to an offscreen canvas, sample dark
     pixels, scatter the rest behind so EVERY particle has a target. --- */
  function makeWordmark(text: string): { pos: Float32Array; accent: Float32Array } {
    const pos = new Float32Array(COUNT * 3);
    const accent = new Float32Array(COUNT);
    const c = document.createElement('canvas');
    const W = 600;
    const H = 200;
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    // Condensed display face matches the cream Anton wordmarks on the page.
    let fontSize = 150;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Shrink the font until the word fits the canvas width.
    do {
      ctx.font = `700 ${fontSize}px Anton, "Arial Narrow", Impact, sans-serif`;
      fontSize -= 4;
    } while (ctx.measureText(text).width > W - 24 && fontSize > 20);
    ctx.fillText(text, W / 2, H / 2 + 4);

    const data = ctx.getImageData(0, 0, W, H).data;
    // Collect glyph pixels (sampled on a grid to keep the count manageable).
    const pts: { x: number; y: number }[] = [];
    const step = 2;
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x, y });
      }
    }

    const scale = 0.012; // canvas px → world units
    const ratio = pts.length ? Math.min(1, (COUNT * 0.82) / pts.length) : 0;
    let gi = 0; // glyph particle cursor
    for (let i = 0; i < COUNT; i++) {
      // Assign ~82% of particles to glyph points, the rest to a faint field.
      const useGlyph = pts.length > 0 && i / COUNT < 0.82 && Math.random() < (ratio || 1);
      if (useGlyph) {
        const p = pts[(gi++) % pts.length];
        pos[i * 3] = (p.x - W / 2) * scale;
        pos[i * 3 + 1] = -(p.y - H / 2) * scale;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
        accent[i] = 1; // glyph particle — themed accent color
      } else {
        // Diffuse backing field behind the word.
        const ang = Math.random() * TAU;
        const rad = Math.sqrt(Math.random()) * RADIUS * 1.7;
        pos[i * 3] = Math.cos(ang) * rad;
        pos[i * 3 + 1] = Math.sin(ang) * rad * 0.6;
        pos[i * 3 + 2] = -1.4 - Math.random() * 1.2;
        accent[i] = 0;
      }
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
  const neste = makeWordmark('NESTE');
  const postnord = makeWordmark('POSTNORD');
  const basware = makeWordmark('BASWARE');

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
  geo.setAttribute('position', new THREE.BufferAttribute(startPos.slice(), 3));

  const uniforms = {
    uTime: { value: 0 },
    uMix: { value: 0 },
    uAccentMix: { value: 1 },
    uMouse: { value: new THREE.Vector3() },
    uMouseStrength: { value: 0 },
    uSize: { value: isMobile ? 13 : 17 },
    uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
    uDrift: { value: reduceMotion ? 0 : 1 },
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
      uniform float uTime;
      uniform float uMix;
      uniform float uAccentMix;
      uniform vec3  uMouse;
      uniform float uMouseStrength;
      uniform float uSize;
      uniform float uPixelRatio;
      uniform float uDrift;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = mix(aColA, aColB, uAccentMix);
        vec3 pos = mix(aPosA, aPosB, uMix);

        // gentle ambient drift
        float t = uTime * 0.4 + aRand * 6.2831;
        pos.x += sin(t) * 0.05 * uDrift;
        pos.y += cos(t * 1.3) * 0.05 * uDrift;
        pos.z += sin(t * 0.7) * 0.05 * uDrift;

        // cursor repulsion in the XY plane
        vec2 d = pos.xy - uMouse.xy;
        float dist = length(d);
        float radius = 1.4;
        float push = smoothstep(radius, 0.0, dist) * uMouseStrength;
        pos.xy += normalize(d + 0.0001) * push * 0.9;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;

        float size = uSize * (0.6 + aRand * 0.8);
        gl_PointSize = size * uPixelRatio * (1.0 / -mv.z);
        vAlpha = 0.5 + aRand * 0.5;
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
  let posTween: gsap.core.Tween | null = null;
  let accentTween: gsap.core.Tween | null = null;

  function morphTo(name: string) {
    if (!SHAPES[name] || name === currentShape) return;
    const def = SHAPES[name];
    const A = geo.attributes.aPosA as any;
    const B = geo.attributes.aPosB as any;
    const a0 = A.array as Float32Array;
    const b0 = B.array as Float32Array;
    const mix = uniforms.uMix.value;
    // Bake the current interpolated positions into A.
    for (let i = 0; i < a0.length; i++) a0[i] = a0[i] + (b0[i] - a0[i]) * mix;
    b0.set(def.pos);
    A.needsUpdate = true;
    B.needsUpdate = true;
    uniforms.uMix.value = 0;

    // Same handoff for the accent color so glyphs/nodes recolor smoothly.
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

    if (posTween) posTween.kill();
    if (accentTween) accentTween.kill();
    posTween = gsap.to(uniforms.uMix, { value: 1, duration: 1.7, ease: 'power2.inOut' });
    accentTween = gsap.to(uniforms.uAccentMix, { value: 1, duration: 1.2, ease: 'power1.inOut' });
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
     CUSTOM CURSOR — swelling ring on data-cursor targets.
     --------------------------------------------------------------- */
  function initCursor() {
    const cursor = document.querySelector('.cursor') as HTMLElement | null;
    if (!cursor) return;
    const cx = { x: innerWidth / 2, y: innerHeight / 2 };
    addEventListener('pointermove', (e) => {
      cx.x = e.clientX;
      cx.y = e.clientY;
    });
    let lx = cx.x;
    let ly = cx.y;
    function loop() {
      lx += (cx.x - lx) * 0.2;
      ly += (cx.y - ly) * 0.2;
      cursor!.style.left = lx + 'px';
      cursor!.style.top = ly + 'px';
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
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
    document.querySelectorAll<HTMLElement>('[data-shape]').forEach((sec) => {
      const shape = sec.dataset.shape!;
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => morphTo(shape),
        onEnterBack: () => morphTo(shape),
      });
    });

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
  initCursor();
  initScroll();
  runLoader();
  window.__darkScene = true;

  // Intro bloom: collapse → globe.
  gsap.to(uniforms.uMix, { value: 1, duration: 2.2, ease: 'power3.out', delay: 0.25 });
}
