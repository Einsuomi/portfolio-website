/* =================================================================
   light-scene.ts — the glowing data-pipeline the camera rides for
   the light homepage (/light). Ported from Tong's v4 demo
   (vectrfl.com feel) into one TypeScript module, with the demo's
   generic tool-stages remapped to our 7 real beats and ALL panel
   copy left in the DOM (this module never injects text).

   Feel preserved from v4:
   - camera rides a winding glowing pipeline curve through landmarks
   - instanced rounded "keycap" tile ground, accent-tinted per beat
   - procedural additive glow + exponential fog (no post-processing)
   - flowing data packets + a comet riding the camera position
   - telemetry HUD, right-edge stage rail, fading 3D labels

   Layered behind real-HTML stage panels that this module fades in/out
   by scroll progress (it animates the existing DOM, never replaces it).

   Imported dynamically AFTER first paint by light.astro, so the static
   HTML hero is the LCP, not the canvas. Bails to the static stacked
   sections under prefers-reduced-motion or when WebGL is unavailable.
   ================================================================= */
import * as THREE from 'three';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenisLight?: Lenis;
    __lightScene?: boolean;
  }
}

/* -----------------------------------------------------------------
   BEAT MAP — the 7 real beats, in travel order, each placed along
   the pipeline (p: 0→1) with a per-beat accent and a landmark type.
   Copy is NOT here — it lives in the DOM (light.astro / timeline.ts).
   Only id, position, colour, layout and landmark shape live here.
   ----------------------------------------------------------------- */
type Layout = 'center' | 'left' | 'right';
type LandmarkType =
  | 'world' | 'energy' | 'network' | 'scale'
  | 'cluster' | 'stream' | 'endnode';

interface BeatNode {
  id: string;
  p: number;
  color: number;
  layout: Layout;
  type: LandmarkType;
  label: string; // short HUD/rail/3D label
}

const BEATS: BeatNode[] = [
  { id: 'hero',     p: 0.00, color: 0x1ea7ff, layout: 'center', type: 'world',   label: 'Origin' },
  { id: 'neste',    p: 0.16, color: 0x16c79a, layout: 'left',   type: 'energy',  label: 'Neste' },
  { id: 'postnord', p: 0.33, color: 0x2d8cef, layout: 'right',  type: 'network', label: 'PostNord' },
  { id: 'basware',  p: 0.50, color: 0x7c5cff, layout: 'left',   type: 'scale',   label: 'Basware' },
  { id: 'projects', p: 0.67, color: 0xff8a3c, layout: 'right',  type: 'cluster', label: 'Projects' },
  { id: 'writes',   p: 0.84, color: 0xff5d8f, layout: 'left',   type: 'stream',  label: 'Writes' },
  { id: 'bot',      p: 1.00, color: 0x1ea7ff, layout: 'center', type: 'endnode', label: 'Talk' },
];

/* Path + camera tuning, lifted from the v4 demo's TUNING. */
const TUNING = {
  fogColor: 0xeaf0f7,
  fogDensity: 0.0072,
  path: { segs: 11, span: 62, lat: 42, rise: 9 },
  cam: { height: 13.5, back: 17, side: 3.5, lookAhead: 0.022, lookUp: 2.5 },
};

/* -----------------------------------------------------------------
   GUARD — reduced motion / WebGL-fail stay on the static stacked HTML.
   ----------------------------------------------------------------- */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
const loaderEl = document.getElementById('loader');

/** Reveal plain stacked HTML and drop the loader without any WebGL. */
function fallbackToStatic() {
  document.documentElement.classList.add('no-scene');
  if (loaderEl) loaderEl.classList.add('is-done');
}

if (reduceMotion || !canvas) {
  fallbackToStatic();
} else {
  // boot() is async (font-race fix); .catch handles both sync throws and async rejects.
  boot(canvas).catch((err) => {
    console.warn('[light-scene] WebGL unavailable, using static fallback:', err);
    fallbackToStatic();
  });
}

/* =================================================================
   MAIN
   ================================================================= */
async function boot(canvas: HTMLCanvasElement) {
  const isMobile = innerWidth < 760;
  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (o: number) => o * o * (3 - 2 * o);
  const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

  /* ---- renderer / scene / camera (v4 scene.js) ---- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.6 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(TUNING.fogColor);
  scene.fog = new THREE.FogExp2(TUNING.fogColor, TUNING.fogDensity);

  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 1200);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcdd8e8, 1.05));
  const key = new THREE.DirectionalLight(0xffffff, 0.85);
  key.position.set(-30, 60, 20);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfeaff, 0.35);
  fill.position.set(40, 25, -40);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const clock = new THREE.Clock();

  canvas.style.display = 'block';
  document.documentElement.classList.add('has-scene');

  /* ---- the winding curve the camera + pipeline follow (v4 path.js) ---- */
  const pathPts: any[] = [];
  for (let i = 0; i <= TUNING.path.segs; i++) {
    const z = -i * TUNING.path.span;
    const x = Math.sin(i * 0.62) * TUNING.path.lat;
    const y = Math.sin(i * 0.42 + 1) * TUNING.path.rise * 0.4 + 1.4;
    pathPts.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(pathPts, false, 'catmullrom', 0.5);
  const curveLen = curve.getLength();

  /* ---- shared procedural textures (v4 textures.js) ---- */
  function makeGlowTexture() {
    const s = 128;
    const cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const ctx = cv.getContext('2d')!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.65)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const t = new THREE.CanvasTexture(cv);
    t.needsUpdate = true;
    return t;
  }
  function makeFlowTexture() {
    const w = 64, h = 4;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = 'rgba(120,180,255,0.25)';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.45, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const t = new THREE.CanvasTexture(cv);
    t.needsUpdate = true;
    return t;
  }
  const glowTex = makeGlowTexture();

  /* ---- instanced rounded "keycap" ground (v4 ground.js) ---- */
  function roundedTileGeo(w: number, r: number, depth: number) {
    const s = new THREE.Shape();
    const hw = w / 2;
    s.moveTo(-hw + r, -hw);
    s.lineTo(hw - r, -hw); s.quadraticCurveTo(hw, -hw, hw, -hw + r);
    s.lineTo(hw, hw - r);  s.quadraticCurveTo(hw, hw, hw - r, hw);
    s.lineTo(-hw + r, hw); s.quadraticCurveTo(-hw, hw, -hw, hw - r);
    s.lineTo(-hw, -hw + r); s.quadraticCurveTo(-hw, -hw, -hw + r, -hw);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth, bevelEnabled: true, bevelThickness: r * 0.7, bevelSize: r * 0.7, bevelSegments: 2, steps: 1,
    });
    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingBox();
    geo.translate(0, -geo.boundingBox!.min.y, 0);
    return geo;
  }

  function buildGround() {
    const tile = roundedTileGeo(3.4, 0.7, 1.6);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf4f7fc, roughness: 0.92, metalness: 0.0 });
    const spacing = isMobile ? 5.0 : 4.0;
    const skip = isMobile ? 0.5 : 0.34;
    const zEnd = curve.getPoint(1).z;
    const xMin = -90, xMax = 90, zMin = 18, zMax = zEnd - 30;
    const cols = Math.floor((xMax - xMin) / spacing);
    const rows = Math.floor((zMin - zMax) / spacing);

    const samples: any[] = [];
    for (let i = 0; i <= 160; i++) samples.push(curve.getPointAt(i / 160));

    const accents = BEATS.map((s) => ({ p: curve.getPointAt(Math.min(s.p, 0.999)), c: new THREE.Color(s.color) }));
    const colA = new THREE.Color(0xf4f7fc);
    const colB = new THREE.Color(0xd6e4f6);

    const inst: { x: number; z: number; h: number; col: any }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = xMin + c * spacing + (Math.random() - 0.5);
        const z = zMin - r * spacing + (Math.random() - 0.5);
        if (Math.random() < skip) continue;

        let dPath = 1e9;
        for (let s = 0; s < samples.length; s += 2) {
          const dx = x - samples[s].x, dz = z - samples[s].z;
          const d = dx * dx + dz * dz;
          if (d < dPath) dPath = d;
        }
        if (Math.sqrt(dPath) < 3.2) continue; // keep the pipeline corridor clear

        const h = 0.4 + Math.random() * Math.random() * 1.6;
        const col = colA.clone();
        if (Math.random() < 0.16) col.lerp(colB, 0.6);
        let nd = 1e9, near: any = null;
        for (const a of accents) {
          const dd = (x - a.p.x) ** 2 + (z - a.p.z) ** 2;
          if (dd < nd) { nd = dd; near = a; }
        }
        if (near && nd < 170) col.lerp(near.c, 0.42 * (1 - nd / 170));
        inst.push({ x, z, h, col });
      }
    }

    const mesh = new THREE.InstancedMesh(tile, mat, inst.length);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < inst.length; i++) {
      const o = inst[i];
      dummy.position.set(o.x, 0, o.z);
      dummy.scale.set(1, o.h, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, o.col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
  }

  /* ---- the glowing pipeline: additive halo tube + flowing core (v4 pipeline.js) ---- */
  function buildPipeline() {
    const segs = isMobile ? 420 : 700;
    const glowGeo = new THREE.TubeGeometry(curve, segs, 0.9, 10, false);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x6cc5ff, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    const dash = makeFlowTexture();
    dash.wrapS = dash.wrapT = THREE.RepeatWrapping;
    dash.repeat.set(Math.max(20, curveLen / 12), 1);
    const flowMat = new THREE.MeshBasicMaterial({
      map: dash, color: 0xbfe6ff, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const coreGeo = new THREE.TubeGeometry(curve, segs, 0.34, 8, false);
    scene.add(new THREE.Mesh(coreGeo, flowMat));
    return flowMat;
  }

  /* =================================================================
     LANDMARKS — each beat gets a structure that MEANS its beat.
     ================================================================= */
  const TMP = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  function clay(c?: number) {
    return new THREE.MeshStandardMaterial({ color: c ?? 0xeef3fa, roughness: 0.85, metalness: 0.05 });
  }
  function accentMat(hexc: number) {
    return new THREE.MeshBasicMaterial({
      color: hexc, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
  }
  function haloSprite(hexc: number, size: number) {
    const m = new THREE.SpriteMaterial({
      map: glowTex, color: hexc, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55,
    });
    const s = new THREE.Sprite(m);
    s.scale.set(size, size, 1);
    return s;
  }

  /* Hero — WORLD NODE: a wire globe with a bright lit node (Luxembourg /
     W. Europe) ringed by an orbit, on a glowing pad. The origin of it all. */
  function buildWorld(b: BeatNode) {
    const g = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.4, 0.4, 40), clay(0xf4f7fc));
    pad.position.y = 0.2; g.add(pad);
    const R = 3.2, cy = 5.4;
    // latitude/longitude wire rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: b.color, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 1; i <= 4; i++) {
      const lat = (i / 5 - 0.5) * Math.PI;
      const rr = Math.cos(lat) * R;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.035, 6, 40), ringMat);
      ring.rotation.x = Math.PI / 2; ring.position.y = cy + Math.sin(lat) * R; g.add(ring);
    }
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.03, 6, 40), ringMat);
      ring.rotation.y = (i / 6) * Math.PI; ring.position.y = cy; g.add(ring);
    }
    // tilted orbit ring
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(R + 1.4, 0.05, 8, 64), accentMat(b.color));
    orbit.rotation.x = Math.PI / 2.4; orbit.position.y = cy; g.add(orbit);
    // the lit node — Luxembourg / W. Europe, the origin point
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), accentMat(0xffffff));
    const lat = 0.62, lon = 0.5; // approx W. Europe on the front-upper-right
    node.position.set(Math.cos(lat) * Math.cos(lon) * R, cy + Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R);
    g.add(node);
    const nodeHalo = haloSprite(b.color, 5); nodeHalo.position.copy(node.position); g.add(nodeHalo);
    const h = haloSprite(b.color, 16); h.position.y = cy; g.add(h);
    return g;
  }

  /* Neste — ENERGY: a refinery stack of vessels with a rising energy beam
     and an additive flame-glow crown. */
  function buildEnergy(b: BeatNode) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 0.5, 24), clay(0xf4f7fc));
    base.position.y = 0.25; g.add(base);
    // three vessels of decreasing radius
    const radii = [2.0, 1.4, 0.9];
    let y = 0.5;
    radii.forEach((r, i) => {
      const hgt = 3.4 - i * 0.4;
      const vessel = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hgt, 20), clay());
      vessel.position.y = y + hgt / 2; g.add(vessel);
      const band = new THREE.Mesh(new THREE.TorusGeometry(r + 0.05, 0.07, 8, 24), accentMat(b.color));
      band.rotation.x = Math.PI / 2; band.position.y = y + hgt; g.add(band);
      y += hgt + 0.4;
    });
    // rising energy beam + flame crown
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 4.5, 10), accentMat(b.color));
    beam.position.y = y + 2; g.add(beam);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 16), accentMat(b.color));
    crown.position.y = y + 5; g.add(crown);
    const h = haloSprite(b.color, 18); h.position.y = y + 4.5; g.add(h);
    return g;
  }

  /* PostNord — NETWORK: a route graph — hubs (nodes) linked by glowing edges,
     a logistics web rising from a pad. */
  function buildNetwork(b: BeatNode) {
    const g = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.6, 0.4, 6), clay(0xf4f7fc));
    pad.position.y = 0.2; g.add(pad);
    const nodes: any[] = [];
    const N = 9;
    const nodeMat = accentMat(b.color);
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2 + (i % 2) * 0.4;
      const rad = 1.2 + (i % 3) * 1.3;
      const v = new THREE.Vector3(Math.cos(ang) * rad, 2 + (i % 4) * 1.6, Math.sin(ang) * rad);
      nodes.push(v);
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 12), nodeMat);
      node.position.copy(v); g.add(node);
      // mast down to the pad
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, v.y, 6), clay());
      mast.position.set(v.x, v.y / 2, v.z); g.add(mast);
    }
    const verts: number[] = [];
    for (let i = 0; i < N; i++)
      for (let j = i + 1; j < N; j++)
        if (nodes[i].distanceTo(nodes[j]) < 4.5 && Math.random() < 0.7)
          verts.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.add(new THREE.LineSegments(eg, new THREE.LineBasicMaterial({
      color: b.color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false,
    })));
    const h = haloSprite(b.color, 16); h.position.y = 5; g.add(h);
    return g;
  }

  /* Basware — SCALE: a dense grid of identical pillars (1000+ pipelines),
     standardized, governed — a city block of equal towers. */
  function buildScale(b: BeatNode) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.5, 8.4), accentMat(b.color));
    base.material.opacity = 0.5; base.position.y = 0.25; g.add(base);
    const n = 5, gap = 1.6, off = ((n - 1) * gap) / 2;
    const towerMat = clay();
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // uniform height with a gentle wave so the block still reads 3D
        const hgt = 3 + Math.sin(i * 0.9) * 0.6 + Math.cos(j * 0.9) * 0.6;
        const t = new THREE.Mesh(new THREE.BoxGeometry(1.0, hgt, 1.0), towerMat);
        t.position.set(i * gap - off, hgt / 2, j * gap - off); g.add(t);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.12, 1.06), accentMat(b.color));
        cap.position.set(i * gap - off, hgt, j * gap - off); g.add(cap);
      }
    }
    const h = haloSprite(b.color, 16); h.position.y = 5; g.add(h);
    return g;
  }

  /* Projects — CLUSTER: a constellation of distinct built artifacts —
     floating polyhedra of mixed shapes orbiting a core. */
  function buildCluster(b: BeatNode) {
    const g = new THREE.Group();
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.6, 2.4, 12), clay());
    ped.position.y = 1.2; g.add(ped);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), accentMat(b.color));
    core.position.y = 5; g.add(core);
    const shapes = [
      () => new THREE.BoxGeometry(1.1, 1.1, 1.1),
      () => new THREE.TetrahedronGeometry(0.9),
      () => new THREE.OctahedronGeometry(0.85),
      () => new THREE.DodecahedronGeometry(0.8),
    ];
    const artMat = clay(0xeaf4ff);
    const positions: any[] = [];
    const M = 7;
    for (let i = 0; i < M; i++) {
      const ang = (i / M) * Math.PI * 2;
      const rad = 2.6 + (i % 2) * 0.9;
      const v = new THREE.Vector3(Math.cos(ang) * rad, 5 + Math.sin(ang * 1.3) * 1.8, Math.sin(ang) * rad);
      positions.push(v);
      const m = new THREE.Mesh(shapes[i % shapes.length](), artMat);
      m.position.copy(v); m.rotation.set(Math.random(), Math.random(), Math.random()); g.add(m);
      const edge = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), accentMat(b.color));
      edge.position.copy(v).multiplyScalar(1).add(new THREE.Vector3(0, 0.7, 0)); g.add(edge);
    }
    // sparse links from core to artifacts
    const verts: number[] = [];
    for (const v of positions) { verts.push(0, 5, 0, v.x, v.y, v.z); }
    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.add(new THREE.LineSegments(eg, new THREE.LineBasicMaterial({
      color: b.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false,
    })));
    const h = haloSprite(b.color, 17); h.position.y = 5; g.add(h);
    return g;
  }

  /* Writes — STREAM: stacked horizontal bars (lines of text being written),
     a flowing column of prose rising off a desk-like slab. */
  function buildStream(b: BeatNode) {
    const g = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 4.5), clay(0xf4f7fc));
    slab.position.y = 0.2; g.add(slab);
    const rows = 9;
    for (let r = 0; r < rows; r++) {
      const y = 1.4 + r * 0.95;
      // each "line" is a few segments of varying length — text forming
      const segCount = 2 + (r % 3);
      let x = -2.6;
      for (let s = 0; s < segCount; s++) {
        const len = 0.8 + Math.random() * 1.6;
        const isAccent = r === rows - 1 || (r % 4 === 0 && s === 0);
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(len, 0.22, 0.22),
          isAccent ? accentMat(b.color) : clay(),
        );
        bar.position.set(x + len / 2, y, (Math.random() - 0.5) * 0.6); g.add(bar);
        x += len + 0.4;
        if (x > 2.8) break;
      }
    }
    const h = haloSprite(b.color, 15); h.position.set(0, 5, 0); g.add(h);
    return g;
  }

  /* Talk to me — END NODE: a pulsing terminal sphere over a ring, the
     conversational endpoint (bot, disabled). The pulse is driven each frame. */
  let endPulse: any = null;
  let endHalo: any = null;
  function buildEndNode(b: BeatNode) {
    const g = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.4, 40), clay(0xf4f7fc));
    pad.position.y = 0.2; g.add(pad);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.08, 8, 48), accentMat(b.color));
    ring.rotation.x = Math.PI / 2; ring.position.y = 3.5; g.add(ring);
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 24), accentMat(b.color));
    core.position.y = 3.5; g.add(core);
    endPulse = core;
    const h = haloSprite(b.color, 20); h.position.y = 3.5; g.add(h);
    endHalo = h;
    return g;
  }

  const BUILDERS: Record<LandmarkType, (b: BeatNode) => any> = {
    world: buildWorld, energy: buildEnergy, network: buildNetwork,
    scale: buildScale, cluster: buildCluster, stream: buildStream, endnode: buildEndNode,
  };

  /* place a landmark beside the path, oriented toward it (v4 placeLandmark) */
  function placeLandmark(b: BeatNode, group: any, lateral: number) {
    const p = Math.min(b.p, 0.999);
    const pos = curve.getPointAt(p);
    const tan = curve.getTangentAt(p);
    TMP.crossVectors(tan, UP).normalize();
    group.position.copy(pos).addScaledVector(TMP, lateral);
    group.position.y = 0;
    group.lookAt(group.position.x - TMP.x, group.position.y, group.position.z - TMP.z);
    scene.add(group);
    return group;
  }

  /* floating 3D label above a landmark (v4 makeLabel) */
  function makeLabel(b: BeatNode, group: any) {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 64;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#0b1220';
    ctx.font = '600 30px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label.toUpperCase(), 128, 32);
    const tex = new THREE.CanvasTexture(cv);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, opacity: 0 }));
    sp.scale.set(7, 1.75, 1);
    sp.position.copy(group.position);
    sp.position.y += 11;
    scene.add(sp);
    return { sprite: sp, p: b.p };
  }

  const labels: { sprite: any; p: number }[] = [];
  function buildLandmarks() {
    BEATS.forEach((b) => {
      const group = BUILDERS[b.type](b);
      // hero (center) sits on-axis ahead; others alternate sides
      const lateral = b.layout === 'center' ? 0 : (b.layout === 'left' ? 13 : -13);
      placeLandmark(b, group, lateral);
      labels.push(makeLabel(b, group));
    });
  }
  function updateLabels(progress: number) {
    for (const l of labels) {
      const d = Math.abs(progress - l.p);
      l.sprite.material.opacity = Math.max(0, Math.min(1, 1 - d / 0.06)) * 0.9;
    }
  }

  /* ---- background scatter: masts / pipes / blocks kept clear of the path (v4 props.js) ---- */
  function buildScatter() {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xeef3fa, roughness: 0.85, metalness: 0.05 });
    const samples: any[] = [];
    for (let i = 0; i <= 120; i++) samples.push(curve.getPointAt(i / 120));
    const total = isMobile ? 42 : 70;
    const zReach = TUNING.path.segs * TUNING.path.span + 40;
    for (let n = 0; n < total; n++) {
      const x = (Math.random() - 0.5) * 150;
      const z = 18 - Math.random() * zReach;
      let d = 1e9;
      for (let s = 0; s < samples.length; s += 3) {
        const dx = x - samples[s].x, dz = z - samples[s].z;
        const dd = dx * dx + dz * dz;
        if (dd < d) d = dd;
      }
      if (Math.sqrt(d) < 8) continue;
      const r = Math.random();
      let m: any;
      if (r < 0.4) {
        const h = 4 + Math.random() * 8;
        m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, h, 6), mat);
        m.position.set(x, h / 2, z);
      } else if (r < 0.7) {
        const l = 3 + Math.random() * 5;
        m = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, l, 8), mat);
        m.rotation.z = Math.PI / 2; m.rotation.y = Math.random() * Math.PI;
        m.position.set(x, 0.5, z);
      } else {
        const h = 1 + Math.random() * 2;
        m = new THREE.Mesh(new THREE.BoxGeometry(2, h, 1.5), mat);
        m.position.set(x, h / 2, z); m.rotation.y = Math.random() * Math.PI;
      }
      group.add(m);
    }
    scene.add(group);
  }

  /* ---- effects: flowing packets + comet riding the camera + end burst (v4 effects.js) ---- */
  const FXTMP = new THREE.Vector3();
  function buildEffects() {
    const packets: any[] = [];
    const N = isMobile ? 7 : 14;
    for (let i = 0; i < N; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: 0x9cdcff, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9,
      }));
      const sz = 1.4 + Math.random() * 1.2;
      s.scale.set(sz, sz, 1);
      s.userData = { t: Math.random(), speed: (0.012 + Math.random() * 0.02) };
      scene.add(s);
      packets.push(s);
    }
    const cometHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0x4fc3ff, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85,
    }));
    cometHalo.scale.set(7, 7, 1); scene.add(cometHalo);
    const comet = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xffffff, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 1,
    }));
    comet.scale.set(2.6, 2.6, 1); scene.add(comet);

    const end = curve.getPointAt(1);
    const burst = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0x6cc5ff, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0,
    }));
    burst.scale.set(2, 2, 1); burst.position.copy(end); burst.position.y += 2; scene.add(burst);
    const burstRing = new THREE.Mesh(
      new THREE.RingGeometry(2, 2.3, 48),
      new THREE.MeshBasicMaterial({
        color: 0x6cc5ff, transparent: true, opacity: 0, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
    burstRing.rotation.x = -Math.PI / 2; burstRing.position.copy(end); burstRing.position.y += 0.6; scene.add(burstRing);

    return { packets, comet, cometHalo, burst, burstRing };
  }

  type FX = ReturnType<typeof buildEffects>;
  function updateEffects(fx: FX, flowMat: any, t: number, progress: number, activeColor: any) {
    if (flowMat.map) flowMat.map.offset.x -= 0.0096;
    for (const s of fx.packets) {
      s.userData.t = (s.userData.t + s.userData.speed * 0.016) % 1;
      curve.getPointAt(s.userData.t, FXTMP);
      s.position.copy(FXTMP);
      const flick = 0.7 + Math.sin(t * 4 + s.userData.t * 30) * 0.25;
      s.material.opacity = 0.9 * flick;
    }
    const ahead = curve.getPointAt(clamp01(progress + 0.012));
    fx.comet.position.copy(ahead);
    fx.cometHalo.position.copy(ahead);
    (fx.cometHalo.material as any).color.copy(activeColor);
    const pulse = 0.85 + Math.sin(t * 3) * 0.15;
    fx.cometHalo.scale.setScalar(7 * pulse);

    const b = clamp01((progress - 0.9) / 0.1);
    fx.burst.material.opacity = b * 0.9;
    fx.burst.scale.setScalar(2 + b * 26);
    fx.burstRing.material.opacity = b * 0.6;
    fx.burstRing.scale.setScalar(1 + b * 9);
  }

  /* ---- camera follows the path (v4 camera.js) ---- */
  const camSide = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  function updateCamera(progress: number, time: number) {
    const p = clamp01(progress);
    const cp = curve.getPointAt(p);
    const tan = curve.getTangentAt(p);
    camSide.crossVectors(tan, UP).normalize();
    const bob = Math.sin(time * 0.6) * 0.35;
    camera.position.copy(cp)
      .addScaledVector(UP, TUNING.cam.height + bob)
      .addScaledVector(tan, -TUNING.cam.back)
      .addScaledVector(camSide, TUNING.cam.side);
    curve.getPointAt(clamp01(p + TUNING.cam.lookAhead), camLook);
    camLook.y += TUNING.cam.lookUp;
    camera.lookAt(camLook);
  }

  /* =================================================================
     BUILD THE WORLD
     ================================================================= */
  buildGround();
  const flowMat = buildPipeline();

  // Wait for JetBrains Mono before rasterising 3D labels — without this, a cold
  // load bakes the monospace fallback metrics into the cached canvas textures
  // permanently (font-race: label textures are created once, never redrawn).
  if (document.fonts?.load) {
    await document.fonts.load('600 30px "JetBrains Mono"');
    await document.fonts.ready;
  }

  buildLandmarks();
  buildScatter();
  const fx = buildEffects();

  /* =================================================================
     HTML CHROME WIRING — populate the real DOM chrome (HUD, rail) and
     drive panel fades by scroll progress. This module ANIMATES the
     existing DOM; the copy is authored in light.astro, never here.
     ================================================================= */
  const railSegs = BEATS.map((b) => document.getElementById('rail-' + b.id));
  const panels = BEATS.map((b) => document.getElementById('beat-' + b.id));
  const tStage = document.getElementById('t-stage');
  const tProg = document.getElementById('t-prog');
  const tThru = document.getElementById('t-thru');
  const tCoord = document.getElementById('t-coord');
  const cueEl = document.getElementById('cue');
  const rootStyle = document.documentElement.style;

  function updateUI(progress: number) {
    let near = BEATS[0], nd = 1e9;
    for (const b of BEATS) {
      const d = Math.abs(progress - b.p);
      if (d < nd) { nd = d; near = b; }
    }

    // panel fades — smoothstep by distance in progress space
    const HALF = 0.085;
    BEATS.forEach((b, i) => {
      const el = panels[i];
      if (!el) return;
      const d = Math.abs(progress - b.p);
      const o = smooth(clamp01(1 - d / HALF));
      el.style.opacity = o.toFixed(3);
      const dir = progress < b.p ? 1 : -1;
      el.style.transform = `translateY(${((1 - o) * 34 * dir).toFixed(1)}px)`;
      // panels off-stage become non-interactive so links under the cursor
      // belong to the visible panel only
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    });

    // rail active state
    railSegs.forEach((seg, i) => { if (seg) seg.classList.toggle('on', BEATS[i].id === near.id); });

    // accent follows the active stage (drives --acc on chrome + panels)
    rootStyle.setProperty('--acc', hex(near.color));

    // hide scroll cue once moving
    if (cueEl) cueEl.style.opacity = clamp01(1 - progress * 10).toFixed(2);

    // telemetry
    if (tStage) tStage.textContent = near.label.toUpperCase();
    if (tProg) tProg.textContent = (progress * 100).toFixed(1).padStart(5, '0') + '%';
    const evt = Math.floor(2000 + Math.sin(performance.now() * 0.002) * 900 + progress * 6000);
    if (tThru) tThru.textContent = evt.toLocaleString() + ' evt/s';
    if (tCoord) tCoord.textContent = 'x' + camera.position.x.toFixed(0) + ' z' + camera.position.z.toFixed(0);

    return near;
  }

  /* =================================================================
     SCROLL (Lenis smooth scroll, exposed for the verify harness)
     ================================================================= */
  // one+ viewport of scroll per beat drives the camera 0→1
  const track = document.getElementById('track');
  if (track) track.style.height = BEATS.length * 120 + 'vh';

  const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
  window.__lenisLight = lenis;
  const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  function readProgress() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    return Math.min(1, Math.max(0, scrollY / max));
  }

  /* =================================================================
     FIRST FRAME + REVEAL, then the render loop
     ================================================================= */
  updateCamera(0, 0);
  updateUI(0);
  renderer.render(scene, camera);
  requestAnimationFrame(() => {
    if (loaderEl) loaderEl.classList.add('is-done');
    document.documentElement.classList.add('scene-ready');
  });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.6 : 2));
  });

  let progress = 0;
  let lastT = 0;
  const activeColor = new THREE.Color(BEATS[0].color);
  clock.start();
  function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    // Frame-rate-independent smoothing: converge toward the scroll target with
    // a fixed time-constant so the ride feels identical at 30 / 60 / 120 fps and
    // doesn't stall on low-fps / headless renderers. tau ≈ 0.18s.
    const dt = Math.min(0.25, t - lastT);
    lastT = t;
    const target = readProgress();
    const k = 1 - Math.exp(-dt / 0.18);
    progress += (target - progress) * k;

    const near = updateUI(progress);
    activeColor.lerp(new THREE.Color(near.color), Math.min(1, dt * 4));

    updateEffects(fx, flowMat, t, progress, activeColor);
    updateCamera(progress, t);
    updateLabels(progress);

    // pulse the end node (bot terminal)
    if (endPulse && endHalo) {
      const s = 1 + Math.sin(t * 2.4) * 0.12;
      endPulse.scale.setScalar(s);
      endHalo.scale.setScalar(20 * (0.9 + Math.sin(t * 2.4) * 0.18));
    }

    renderer.render(scene, camera);
  }
  loop();

  window.__lightScene = true;
}
