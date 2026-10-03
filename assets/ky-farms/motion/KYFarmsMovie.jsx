// KY Farms — brand motion piece. Illustrated flat-shape scenes driven by the
// animations.jsx timeline engine. Mounted as a child of <Stage> (which provides
// the TimelineContext). All engine globals are read lazily off `A` (= window) so
// evaluation order vs animations.jsx never matters.

const A = window;

// ── local math / easing (no window dependency) ──────────────────────────────
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = {
  outCubic:   (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuad:    (t) => 1 - (1 - t) * (1 - t),
  outBack:    (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  inOutSine:  (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outExpo:    (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};
// staggered sub-progress: returns 0..1 for item i, spread across [s,e]
const stagger = (p, s, e, i, n, span = 0.4) => {
  const each = (e - s - span) / Math.max(1, n - 1);
  const a = s + each * i;
  return clamp((p - a) / span, 0, 1);
};

const serif = "'Cormorant Garamond', Georgia, serif";
const sans  = "'Hanken Grotesk', system-ui, sans-serif";

const C = {
  cream: '#f4efe2', paper: '#fbf8f1', white: '#ffffff',
  forest: '#33451c', forest2: '#283813', ink: '#2b3a18',
  leaf: '#6ea22f', leaf2: '#8cc63f', leafLite: '#a9d36a', leafDk: '#4f7a22',
  honey: '#e7a52f', honeyLite: '#f3c860', honeyDeep: '#cf8a1c', honeyDk: '#a8690f',
  soil: '#6e4a2a', soilDeep: '#3c2814', soil2: '#8a5c33',
  far: '#cdd9a8', mid: '#9bbf63', near: '#5e7d2f',
  sky: '#f6ead2', peach: '#f4d6a4',
};

// ───────────────────────── shared illustration pieces ───────────────────────

function hexPath(cx, cy, r) {
  let pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L') + ' Z';
}

function Flower({ cx, cy, s = 1, petal = '#eaa0c0', core = '#f3c84e', n = 6 }) {
  const petals = [];
  for (let i = 0; i < n; i++) {
    petals.push(
      <ellipse key={i} cx={0} cy={-17} rx={8.5} ry={16} fill={petal}
        transform={`rotate(${(360 / n) * i})`} />
    );
  }
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {petals}
      <circle cx={0} cy={0} r={8.5} fill={core} />
    </g>
  );
}

function Leaf({ x, y, rot = 0, s = 1, color = C.leaf2, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0,0 C 6,-34 36,-50 70,-44 C 54,-14 24,6 0,0 Z" fill={color} />
      <path d="M2,-3 C 20,-18 40,-30 60,-40" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Cow({ x, y, s = 1, bob = 0, color = C.soil }) {
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* legs */}
      {[-46, -16, 18, 48].map((lx, i) => (
        <rect key={i} x={lx} y={-30} width="11" height="34" rx="4" fill={C.soilDeep} />
      ))}
      {/* tail */}
      <path d="M70,-78 C 88,-66 86,-40 80,-22" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="-20" r="6" fill={C.soilDeep} />
      {/* body */}
      <ellipse cx="8" cy="-74" rx="72" ry="44" fill={color} />
      {/* cream patches */}
      <ellipse cx="-12" cy="-66" rx="22" ry="17" fill="#efe7d4" opacity="0.92" />
      <ellipse cx="34" cy="-86" rx="15" ry="12" fill="#efe7d4" opacity="0.92" />
      {/* head (lowered, grazing) */}
      <g transform="translate(-66,-40)">
        <ellipse cx="-14" cy="0" rx="28" ry="24" fill={color} />
        <ellipse cx="-30" cy="8" rx="16" ry="13" fill="#e9d9c2" />
        <circle cx="-34" cy="6" r="2.6" fill={C.soilDeep} />
        <circle cx="-26" cy="9" r="2.6" fill={C.soilDeep} />
        <circle cx="-6" cy="-8" r="2.8" fill={C.soilDeep} />
        <path d="M-22,-22 C -30,-34 -16,-34 -10,-24 Z" fill={color} />
        <path d="M2,-22 C 8,-34 18,-30 16,-20 Z" fill={color} />
        {/* horns */}
        <path d="M-12,-22 C -10,-32 -4,-32 -2,-26" stroke="#d9c9ad" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Bee({ x, y, rot = 0, flutter = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* wings */}
      <g transform={`scale(1 ${0.55 + 0.45 * Math.abs(Math.sin(flutter))})`} style={{ transformOrigin: 'center' }}>
        <ellipse cx="-2" cy="-16" rx="14" ry="9" fill="rgba(255,255,255,0.78)" stroke="rgba(120,90,30,0.35)" />
        <ellipse cx="10" cy="-15" rx="11" ry="7" fill="rgba(255,255,255,0.72)" stroke="rgba(120,90,30,0.35)" />
      </g>
      {/* body */}
      <ellipse cx="0" cy="0" rx="22" ry="15" fill={C.honeyLite} />
      <path d="M-6,-13 A 22 15 0 0 1 -6 13 L -2 11 A 18 13 0 0 0 -2 -11 Z" fill={C.soilDeep} />
      <path d="M6,-12 A 20 14 0 0 1 6 12 L 10 9 A 16 11 0 0 0 10 -9 Z" fill={C.soilDeep} />
      <circle cx="-20" cy="0" r="9" fill={C.soilDeep} />
      <path d="M-26,-6 C -32,-12 -32,-12 -34,-16" stroke={C.soilDeep} strokeWidth="2" />
      <path d="M-26,6 C -32,12 -32,12 -34,16" stroke={C.soilDeep} strokeWidth="2" />
      <path d="M22,0 l 10,0" stroke={C.honeyDeep} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

// ───────────────────────────── text label ───────────────────────────────────

function Label({ p, eyebrow, title, sub, x = 130, y = 720, color = C.forest, eyeColor = C.leaf }) {
  const inT = ease.outCubic(clamp((p - 0.12) / 0.26, 0, 1));
  const ty = (1 - inT) * 30;
  const subT = ease.outCubic(clamp((p - 0.22) / 0.26, 0, 1));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 660, opacity: inT, transform: `translateY(${ty}px)`, willChange: 'transform,opacity' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, whiteSpace: 'nowrap' }}>
        <span style={{ width: 46, height: 2, background: eyeColor, display: 'block', flex: 'none' }} />
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, letterSpacing: '0.34em', textTransform: 'uppercase', color: eyeColor }}>{eyebrow}</span>
      </div>
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 90, lineHeight: 1.0, color, letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontFamily: sans, fontWeight: 400, fontSize: 25, lineHeight: 1.45, color, opacity: 0.74 * subT, marginTop: 22, maxWidth: 520, transform: `translateY(${(1 - subT) * 12}px)` }}>{sub}</div>
    </div>
  );
}

// ───────────────────────────── SCENES ───────────────────────────────────────

function SceneDawn({ p, t, openingLine }) {
  const sunY = lerp(900, 560, ease.outCubic(clamp(p / 0.75, 0, 1)));
  const zoom = 1 + 0.05 * p;
  const birdX = t * 26;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 58%' }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="s1sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fcf4e0" />
              <stop offset="0.5" stopColor="#f8e4bf" />
              <stop offset="1" stopColor="#f3cf96" />
            </linearGradient>
            <radialGradient id="s1glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fbdf94" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fbdf94" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="1920" height="1080" fill="url(#s1sky)" />
          <circle cx="960" cy={sunY} r="360" fill="url(#s1glow)" />
          <circle cx="960" cy={sunY} r="112" fill="#f7d066" />
          {/* birds */}
          {[[520, 250], [600, 300], [1360, 230]].map(([bx, by], i) => (
            <path key={i} d={`M${bx + (birdX % 1920) * 0} 0`} />
          ))}
          {[[520, 250, 1], [575, 286, 0.8], [1340, 240, 0.9]].map(([bx, by, sc], i) => {
            const wx = ((bx + birdX) % 2100) - 90;
            return <path key={'b' + i} d={`M${wx},${by} q ${10 * sc},-${9 * sc} ${20 * sc},0 q ${10 * sc},-${9 * sc} ${20 * sc},0`} stroke={C.forest} strokeOpacity="0.5" strokeWidth={2.4} fill="none" strokeLinecap="round" />;
          })}
          {/* hills */}
          <path d="M0,620 C 380,560 720,600 1010,576 C 1320,550 1640,592 1920,572 L1920,1080 L0,1080 Z" fill={C.far} />
          <path d="M0,720 C 420,664 820,724 1240,684 C 1560,654 1800,712 1920,690 L1920,1080 L0,1080 Z" fill={C.mid} />
          <path d="M0,838 C 360,792 780,856 1180,812 C 1520,776 1740,834 1920,816 L1920,1080 L0,1080 Z" fill={C.near} />
          {/* tiny tree clusters on the near ridge */}
          <g fill="#4a6726">
            <circle cx="300" cy="826" r="20" /><circle cx="330" cy="820" r="16" /><rect x="306" y="826" width="6" height="22" fill="#5a3c22" />
            <circle cx="1500" cy="804" r="22" /><circle cx="1534" cy="800" r="17" /><rect x="1508" y="804" width="6" height="24" fill="#5a3c22" />
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: ease.outCubic(clamp((p - 0.18) / 0.3, 0, 1)) }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, letterSpacing: '0.42em', textTransform: 'uppercase', color: C.leafDk, marginBottom: 22 }}>A Family Farm</div>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 84, color: C.forest, letterSpacing: '-0.01em' }}>{openingLine || 'Where good things grow.'}</div>
      </div>
    </div>
  );
}

function SceneSeedling({ p, t }) {
  const grow = ease.outCubic(clamp((p - 0.08) / 0.34, 0, 1));   // stem
  const stemTopY = 770 - 250 * grow;
  const leafOpen = ease.outBack(clamp((p - 0.32) / 0.26, 0, 1)); // 0..1
  const zoom = 1 + 0.04 * p;
  const sway = Math.sin(t * 1.1) * 2.2;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 70%' }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="s2sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6f0df" /><stop offset="1" stopColor="#eee3c6" />
            </linearGradient>
            <linearGradient id="s2soil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7a512c" /><stop offset="1" stopColor="#4a3119" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1920" height="1080" fill="url(#s2sky)" />
          {/* sun */}
          <circle cx="1560" cy="250" r="78" fill="#f6d479" opacity="0.85" />
          {/* soil mound */}
          <path d="M0,800 C 500,742 900,768 960,768 C 1100,768 1500,748 1920,802 L1920,1080 L0,1080 Z" fill="url(#s2soil)" />
          <path d="M0,800 C 500,742 900,768 960,768 C 1100,768 1500,748 1920,802" fill="none" stroke="#8a5c33" strokeWidth="6" opacity="0.5" />
          {/* background sprouts */}
          {[[660, 9], [1280, 7], [1410, 6]].map(([sx, sc], i) => (
            <g key={i} opacity={0.5} transform={`translate(${sx},770)`}>
              <path d={`M0,0 L0,-${60 * grow}`} stroke={C.leafDk} strokeWidth="7" strokeLinecap="round" />
              <Leaf x={0} y={-60 * grow} rot={-40} s={0.5 * grow} color={C.leaf} />
              <Leaf x={0} y={-60 * grow} rot={40} s={0.5 * grow} flip color={C.leaf} />
            </g>
          ))}
          {/* main sprout */}
          <g transform={`translate(${960 + sway},0)`}>
            <path d={`M0,772 C ${-6 * grow},${772 - 80 * grow} ${6 * grow},${772 - 170 * grow} 0,${stemTopY}`} stroke={C.leaf} strokeWidth="15" fill="none" strokeLinecap="round" />
            {/* mid leaves */}
            <g opacity={grow > 0.5 ? 1 : 0} transform={`translate(0,${772 - 130 * grow})`}>
              <Leaf x={0} y={0} rot={28} s={0.6 * grow} color={C.leaf} flip />
              <Leaf x={0} y={0} rot={-150} s={0.55 * grow} color={C.leafDk} />
            </g>
            {/* crown leaves (the logo sprout) */}
            <g transform={`translate(0,${stemTopY})`}>
              <g transform={`rotate(${-70 + 30 * leafOpen})`}>
                <Leaf x={0} y={0} rot={0} s={1.05 * leafOpen} color={C.leaf2} />
              </g>
              <g transform={`rotate(${70 - 30 * leafOpen})`}>
                <Leaf x={0} y={0} rot={0} s={1.05 * leafOpen} color={C.leafLite} flip />
              </g>
            </g>
          </g>
          {/* blooming flowers */}
          {[[420, 742, '#eaa0c0'], [1500, 726, '#f0b6cf'], [300, 760, '#f3c84e'], [1640, 770, '#e9a7c4']].map(([fx, fy, col], i) => {
            const b = stagger(p, 0.5, 0.94, i, 4, 0.32);
            const eb = ease.outBack(b);
            return (
              <g key={i}>
                <path d={`M${fx},772 L${fx},${fy + 18}`} stroke={C.leafDk} strokeWidth="6" strokeLinecap="round" opacity={b} />
                <Flower cx={fx} cy={fy} s={0.95 * eb} petal={col} />
              </g>
            );
          })}
        </svg>
      </div>
      <Label p={p} eyebrow="Seedlings & Blooms" title={<span>Grown from<br />a single seed.</span>} sub="Vegetable starts, flowers and ornamentals, nurtured from seed to a thriving plant." y={150} />
    </div>
  );
}

function SceneBeehive({ p, t }) {
  const zoom = 1 + 0.04 * p;
  // bee path
  const bp = clamp((p - 0.05) / 0.9, 0, 1);
  const bx = lerp(180, 1560, bp);
  const by = 430 + 150 * Math.sin(bp * Math.PI * 3);
  const bdx = 1380 / (Math.PI); // approx
  const slope = 150 * Math.cos(bp * Math.PI * 3) * Math.PI * 3 / 1380 * 1380; // direction
  const beeRot = Math.atan2(150 * Math.cos(bp * Math.PI * 3) * (Math.PI * 3), 1380) * 180 / Math.PI;
  const drip = clamp((p - 0.3) / 0.4, 0, 1);
  const dripY = 250 + ease.outQuad(((t * 0.6) % 1)) * 220;
  // honeycomb cluster centers (pointy-top), right side
  const R = 74;
  const dx = R * Math.sqrt(3);
  const cells = [];
  const baseX = 1330, baseY = 360;
  const layout = [
    [0, 0], [1, 0], [2, 0],
    [-0.5, 1], [0.5, 1], [1.5, 1], [2.5, 1],
    [0, 2], [1, 2], [2, 2],
  ];
  layout.forEach(([cxx, cyy], i) => {
    cells.push([baseX + cxx * dx, baseY + cyy * R * 1.5, i]);
  });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '60% 50%' }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="s3bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fdf0cd" /><stop offset="1" stopColor="#f3c863" />
            </linearGradient>
            <linearGradient id="s3hex" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f7cf6f" /><stop offset="1" stopColor="#e09a1f" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1920" height="1080" fill="url(#s3bg)" />
          {/* honeycomb */}
          {cells.map(([cx, cy, i]) => {
            const f = stagger(p, 0.08, 0.78, i, cells.length, 0.34);
            const ef = ease.outBack(f);
            return (
              <g key={i} opacity={clamp(f * 1.4, 0, 1)} style={{ transformBox: 'fill-box' }}>
                <path d={hexPath(cx, cy, R * (0.4 + 0.6 * ef))} fill="url(#s3hex)" stroke={C.honeyDk} strokeWidth="3" />
                <path d={hexPath(cx, cy - R * 0.18, R * (0.4 + 0.6 * ef) * 0.5)} fill="#fce39a" opacity={0.5 * f} />
              </g>
            );
          })}
          {/* honey dipper + drip */}
          <g transform="translate(470,150)">
            <rect x="-7" y="-30" width="14" height="120" rx="7" fill={C.soil2} />
            <g fill="url(#s3hex)" stroke={C.honeyDk} strokeWidth="2">
              <circle cx="0" cy="110" r="30" />
              <ellipse cx="0" cy="92" rx="30" ry="6" /><ellipse cx="0" cy="104" rx="30" ry="6" /><ellipse cx="0" cy="116" rx="30" ry="6" /><ellipse cx="0" cy="128" rx="30" ry="6" />
            </g>
            <path d={`M0,140 C -8,${150 + 0} -8,${dripY - 470 + 18} 0,${dripY - 470 + 26} C 8,${dripY - 470 + 18} 8,150 0,140 Z`} fill={C.honey} opacity={drip} />
          </g>
          {/* bee trail */}
          {Array.from({ length: 7 }).map((_, k) => {
            const tp = clamp(bp - (k + 1) * 0.035, 0, 1);
            if (tp <= 0) return null;
            const tx = lerp(180, 1560, tp), ty = 430 + 150 * Math.sin(tp * Math.PI * 3);
            return <circle key={k} cx={tx} cy={ty} r={4} fill={C.honeyDk} opacity={0.28 * (1 - k / 7)} />;
          })}
          {/* bee */}
          {bp > 0 && bp < 1 && <Bee x={bx} y={by} rot={beeRot} flutter={t * 26} />}
        </svg>
      </div>
      <Label p={p} eyebrow="Golden Honey" title={<span>Straight from<br />our hives.</span>} sub="Raw, unfiltered honey, made by our bees from the blossoms they tend." y={150} color={C.honeyDk} eyeColor={C.honeyDeep} />
    </div>
  );
}

function SceneLivestock({ p, t }) {
  const zoom = 1 + 0.045 * p;
  const cloud1 = ((t * 14) % 2200) - 200;
  const cloud2 = ((t * 9 + 800) % 2200) - 200;
  const enter = ease.outCubic(clamp(p / 0.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 60%' }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="s4sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef4dd" /><stop offset="1" stopColor="#dfeac0" />
            </linearGradient>
            <linearGradient id="s4field" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9cc25a" /><stop offset="1" stopColor="#6c9234" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1920" height="1080" fill="url(#s4sky)" />
          <circle cx="320" cy="220" r="74" fill="#f6d985" opacity="0.85" />
          {/* clouds */}
          {[[cloud1, 200, 1], [cloud2, 320, 0.8]].map(([cx, cy, sc], i) => (
            <g key={i} fill="#fcfaf2" opacity="0.92" transform={`translate(${cx},${cy}) scale(${sc})`}>
              <ellipse cx="0" cy="0" rx="60" ry="34" /><ellipse cx="56" cy="8" rx="46" ry="28" /><ellipse cx="-52" cy="10" rx="42" ry="26" />
            </g>
          ))}
          {/* rolling hills */}
          <path d="M0,560 C 420,512 820,556 1240,520 C 1560,492 1800,540 1920,520 L1920,1080 L0,1080 Z" fill="#bcd486" />
          <path d="M0,660 C 460,612 900,668 1360,628 L1920,660 L1920,1080 L0,1080 Z" fill="url(#s4field)" />
          {/* fence */}
          <g opacity={enter}>
            {Array.from({ length: 9 }).map((_, i) => (
              <rect key={i} x={120 + i * 210} y="612" width="13" height="92" rx="3" fill="#9a6a3c" />
            ))}
            <rect x="120" y="628" width="1810" height="9" rx="4" fill="#a9764380" />
            <rect x="120" y="664" width="1810" height="9" rx="4" fill="#a9764380" />
          </g>
          {/* cows */}
          <g opacity={enter}>
            <Cow x={560} y={832} s={1.18} bob={Math.sin(t * 1.3) * 4} color={C.soil} />
            <Cow x={1040} y={870} s={1.34} bob={Math.sin(t * 1.1 + 1) * 4} color="#5a3b22" />
            <Cow x={1480} y={838} s={1.12} bob={Math.sin(t * 1.5 + 2) * 4} color={C.soil2} />
          </g>
          {/* foreground grass */}
          {Array.from({ length: 40 }).map((_, i) => {
            const gx = i * 50 + 10;
            const s2 = Math.sin(t * 1.4 + i) * 5;
            return <path key={i} d={`M${gx},1080 C ${gx + s2},1010 ${gx + s2},990 ${gx + 6 + s2},966`} stroke="#4f7327" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9" />;
          })}
        </svg>
      </div>
      <Label p={p} eyebrow="Pasture-Raised" title={<span>Raised on<br />open pasture.</span>} sub="Grass-fed livestock, brought up unhurried and cared for by hand." y={150} />
    </div>
  );
}

function SceneLockup({ p, t, tagline }) {
  const logoIn = ease.outCubic(clamp((p - 0.06) / 0.36, 0, 1));
  const logoScale = lerp(0.86, 1, ease.outBack(clamp((p - 0.06) / 0.5, 0, 1)));
  const lineW = ease.inOutCubic(clamp((p - 0.4) / 0.28, 0, 1));
  const tagIn = ease.outCubic(clamp((p - 0.5) / 0.3, 0, 1));
  const kickIn = ease.outCubic(clamp((p - 0.66) / 0.3, 0, 1));
  const locIn = ease.outCubic(clamp((p - 0.78) / 0.22, 0, 1));
  const glow = 0.5 + 0.5 * Math.sin(t * 0.8);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* soft radial glow */}
      <div style={{ position: 'absolute', width: 1200, height: 1200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,224,160,0.45) 0%, rgba(245,224,160,0) 62%)', opacity: 0.5 + 0.4 * glow }} />
      {/* drifting leaves */}
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const seed = i * 137.5;
          const baseX = 160 + (i * 250) % 1700;
          const driftY = 1080 - ((t * (26 + i * 5) + seed * 3) % 1300);
          const rot = (t * (18 + i * 4) + seed) % 360;
          return <g key={i} transform={`translate(${baseX + Math.sin(t * 0.6 + i) * 40},${driftY}) rotate(${rot}) scale(0.7)`} opacity="0.5"><Leaf x={0} y={0} color={i % 2 ? C.leafLite : C.leaf} /></g>;
        })}
      </svg>
      {/* logo */}
      <div style={{ position: 'relative', opacity: logoIn, transform: `scale(${logoScale})`, willChange: 'transform,opacity' }}>
        <img src="uploads/ky-logo.png" alt="KY Farms" style={{ width: 760, height: 760, objectFit: 'contain', display: 'block', marginBottom: -120, marginTop: -120 }} />
      </div>
      {/* divider */}
      <div style={{ width: 460 * lineW, height: 2, background: C.leaf, margin: '6px 0 0', opacity: lineW }} />
      {/* tagline */}
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 58, color: C.forest, marginTop: 30, opacity: tagIn, transform: `translateY(${(1 - tagIn) * 16}px)`, letterSpacing: '-0.005em' }}>{tagline || 'Naturally grown. Honestly raised.'}</div>
      {/* offerings kicker */}
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, letterSpacing: '0.32em', textTransform: 'uppercase', color: C.leafDk, marginTop: 26, opacity: kickIn, display: 'flex', gap: 18, alignItems: 'center' }}>
        <span>Livestock</span><span style={{ color: C.honey }}>·</span><span>Seedlings</span><span style={{ color: C.honey }}>·</span><span>Honey</span>
      </div>
      {/* location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28, opacity: 0.85 * locIn, transform: `translateY(${(1 - locIn) * 10}px)` }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" fill={C.honey} /><circle cx="12" cy="10" r="2.6" fill="#fff" /></svg>
        <span style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 500, fontSize: 32, color: C.forest, letterSpacing: '0.01em' }}>Bishoftu, Ethiopia</span>
      </div>
    </div>
  );
}

// ───────────────────────────── timeline assembly ────────────────────────────

const SCENES = [
  { start: 0.0,  end: 7.0,  Comp: SceneDawn },
  { start: 6.5,  end: 13.6, Comp: SceneSeedling },
  { start: 13.1, end: 20.2, Comp: SceneBeehive },
  { start: 19.7, end: 26.8, Comp: SceneLivestock },
  { start: 26.3, end: 33.0, Comp: SceneLockup },
];

function SceneHolder({ start, end, Comp, extra }) {
  const fade = 0.6;
  return (
    <A.Sprite start={start} end={end}>
      {({ localTime, progress, duration }) => {
        let o = 1;
        if (localTime < fade) o = ease.outCubic(clamp(localTime / fade, 0, 1));
        else if (localTime > duration - fade) o = ease.outCubic(clamp((duration - localTime) / fade, 0, 1));
        return (
          <div style={{ position: 'absolute', inset: 0, opacity: o, willChange: 'opacity' }}>
            <Comp p={progress} t={localTime} {...(extra || {})} />
          </div>
        );
      }}
    </A.Sprite>
  );
}

function KYFarmsMovie(props) {
  const tagline = (props && props.tagline) || 'Naturally grown. Honestly raised.';
  const openingLine = (props && props.openingLine) || 'Where good things grow.';
  const showGrain = props ? props.showGrain !== false : true;
  const showVignette = props ? props.vignette !== false : true;
  const showWatermark = props ? props.showWatermark !== false : true;
  const extra = { tagline, openingLine };
  const time = A.useTime ? A.useTime() : 0;
  // corner brandmark: fade in at the start, fade out as the full lockup arrives
  let corner = 1;
  if (time < 1.2) corner = clamp((time - 0.3) / 0.9, 0, 1);
  else if (time > 25.4) corner = clamp((26.4 - time) / 1.0, 0, 1);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', background: C.cream }}>
      {SCENES.map((s, i) => <SceneHolder key={i} {...s} extra={extra} />)}
      {/* unifying vignette */}
      {showVignette && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 240px rgba(40,30,10,0.16)' }} />}
      {/* film grain hint */}
      {showGrain && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04, mixBlendMode: 'multiply', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")' }} />}
      {/* persistent corner brandmark */}
      {showWatermark && (
        <img src="uploads/ky-logo.png" alt="KY Farms" style={{ position: 'absolute', top: 14, right: 44, width: 184, height: 184, objectFit: 'contain', opacity: 0.94 * corner, pointerEvents: 'none', filter: 'drop-shadow(0 2px 7px rgba(30,40,12,0.18))' }} />
      )}
    </div>
  );
}

window.KYFarmsMovie = KYFarmsMovie;
if (typeof module !== 'undefined') module.exports = { KYFarmsMovie };
