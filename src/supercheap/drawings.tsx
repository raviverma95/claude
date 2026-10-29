import React from 'react';
import {Img, staticFile} from 'remotion';
import {LOGO, POPPINS, S} from './brand';

/* ------------------------------------------------------------------ */
/* Person on the couch (problem scenes)                                */
/* ------------------------------------------------------------------ */

/**
 * Drawn in a 1080 x 900 box. rub: hands at the temples (with a small circular
 * rub), lid: laptop lid 1 open .. 0 shut, slump: 0 upright .. 1 sighing.
 */
export const CouchPerson: React.FC<{frame: number; rub: number; lid: number; slump: number}> = ({frame, rub, lid, slump}) => {
  const dy = slump * 18;
  const r = rub * 5;
  const hx = Math.cos(frame / 3) * r;
  const hy = Math.sin(frame / 3) * r;
  // hands: at temples when rubbing, resting on the laptop when not
  const lerp = (a: number, b: number) => a + (b - a) * rub;
  const handL = [lerp(470, 452) + hx, lerp(660, 318 + dy) + hy];
  const handR = [lerp(610, 628) - hx, lerp(660, 318 + dy) - hy];
  const elbowL = [lerp(420, 392), lerp(600, 470 + dy)];
  const elbowR = [lerp(660, 688), lerp(600, 470 + dy)];
  return (
    <svg width={1080} height={900} viewBox="0 0 1080 900" style={{display: 'block'}}>
      {/* sofa */}
      <rect x={150} y={330} width={780} height={320} rx={70} fill={S.navy700} />
      <rect x={90} y={590} width={900} height={190} rx={60} fill="#2c3378" />
      <rect x={70} y={470} width={150} height={310} rx={60} fill="#2c3378" />
      <rect x={860} y={470} width={150} height={310} rx={60} fill="#2c3378" />
      <rect x={150} y={780} width={36} height={60} rx={10} fill="#2c3378" />
      <rect x={894} y={780} width={36} height={60} rx={10} fill="#2c3378" />
      <g transform={`translate(0 ${dy})`}>
        {/* legs */}
        <path d="M455 690 L455 640 Q540 610 625 640 L625 690 Z" fill="#3b4285" />
        <rect x={440} y={660} width={200} height={70} rx={30} fill="#3b4285" />
        {/* torso */}
        <path d="M430 450 Q430 410 480 404 L600 404 Q650 410 650 450 L640 680 L440 680 Z" fill={S.surface} />
        <rect x={518} y={372} width={44} height={44} fill={S.skinShade} />
        {/* head */}
        <ellipse cx={540} cy={318} rx={74} ry={84} fill={S.skin} />
        <path d="M466 318 C460 240 500 222 540 222 C590 222 620 244 614 312 C604 278 584 262 540 262 C500 262 478 280 466 318 Z" fill={S.hair} />
        {/* face: eyes shut, worried brows, frown */}
        <path d={`M505 ${322} q12 ${8} 24 0`} stroke={S.navy900} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M551 ${322} q12 ${8} 24 0`} stroke={S.navy900} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M502 298 L530 306 M578 298 L550 306" stroke={S.hair} strokeWidth={6} strokeLinecap="round" />
        <path d={`M520 ${364 + slump * 2} q20 ${-12 + slump * 4} 40 0`} stroke={S.navy900} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      {/* laptop: base on the lap, lid seen from behind */}
      <g transform={`translate(0 ${dy})`}>
        <path d="M398 668 L682 668 L700 690 L380 690 Z" fill="#c9ccda" />
        <g transform={`translate(0 668) scale(1 ${Math.max(0.04, lid)}) translate(0 -668)`}>
          <rect x={410} y={500} width={260} height={168} rx={14} fill="#dfe1ec" />
          <circle cx={540} cy={584} r={16} fill="#c9ccda" />
        </g>
      </g>
      {/* arms */}
      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={`M452 ${440 + dy} L${elbowL[0]} ${elbowL[1]} L${handL[0]} ${handL[1]}`} stroke={S.surface} strokeWidth={46} />
        <path d={`M628 ${440 + dy} L${elbowR[0]} ${elbowR[1]} L${handR[0]} ${handR[1]}`} stroke={S.surface} strokeWidth={46} />
      </g>
      <circle cx={handL[0]} cy={handL[1]} r={26} fill={S.skin} />
      <circle cx={handR[0]} cy={handR[1]} r={26} fill={S.skin} />
    </svg>
  );
};

/** Browser tab strip with 15 squeezed tabs and a red count badge. */
export const TabStrip: React.FC<{tabs: number; width: number}> = ({tabs, width}) => (
  <div style={{position: 'relative', width, height: 96, background: '#2c3378', borderRadius: 24, padding: '20px 18px 0', boxSizing: 'border-box'}}>
    <div style={{display: 'flex', gap: 6, height: '100%'}}>
      {Array.from({length: tabs}).map((_, i) => (
        <div key={i} style={{flex: 1, background: i === tabs - 1 ? S.white : 'rgba(255,255,255,0.55)', borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: 14, height: 14, borderRadius: 4, background: i === tabs - 1 ? S.red500 : S.navy700, opacity: 0.6}} />
        </div>
      ))}
    </div>
    <div
      style={{
        position: 'absolute',
        right: -22,
        top: -26,
        width: 76,
        height: 76,
        borderRadius: 38,
        background: S.red500,
        color: S.white,
        fontFamily: POPPINS,
        fontWeight: 800,
        fontSize: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 6px #161a42',
      }}
    >
      {tabs}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Competitor noise (generic, unnamed)                                 */
/* ------------------------------------------------------------------ */

export const AdCard: React.FC<{w: number; claim: string; tag?: string; claimColor?: string; style?: React.CSSProperties}> = ({
  w,
  claim,
  tag = 'Ad',
  claimColor = S.red400,
  style,
}) => (
  <div style={{width: w, background: S.navy700, borderRadius: 28, padding: '26px 30px', boxSizing: 'border-box', ...style}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{fontFamily: POPPINS, fontWeight: 700, fontSize: 24, color: S.navy900, background: S.navy100, borderRadius: 8, padding: '2px 12px'}}>{tag}</div>
      <div style={{height: 22, flex: 1, borderRadius: 11, background: 'rgba(255,255,255,0.75)'}} />
    </div>
    <div style={{height: 16, width: '82%', borderRadius: 8, background: 'rgba(255,255,255,0.3)', marginTop: 20}} />
    <div style={{height: 16, width: '64%', borderRadius: 8, background: 'rgba(255,255,255,0.3)', marginTop: 12}} />
    <div style={{fontFamily: POPPINS, fontWeight: 800, fontSize: 40, color: claimColor, marginTop: 18}}>{claim}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Australia map                                                       */
/* ------------------------------------------------------------------ */

// Simplified coastline (lon, lat), clockwise from Cape York
const MAINLAND: [number, number][] = [
  [142.5, -10.7], [143.5, -14], [145.4, -16.9], [146.3, -19], [149, -21.5], [150.8, -23], [153.1, -25.5], [153.6, -28.2],
  [153.1, -30.5], [152.5, -32.5], [151.2, -33.9], [150.2, -35.8], [149.9, -37.5], [147.5, -37.9], [146.3, -39.1], [144.9, -37.9],
  [143.6, -38.8], [141.6, -38.4], [140, -37.6], [139.7, -36.4], [138.5, -35.6], [138.1, -34.2], [137.7, -35.1], [136.8, -35.3],
  [137.5, -33.5], [135.9, -34.8], [135.2, -34.5], [134.2, -32.9], [131.5, -31.5], [129, -31.7], [126, -32.3], [123.6, -33.9],
  [119.9, -34], [117.9, -35.1], [115, -34.3], [115.7, -33.3], [115.7, -31.6], [115, -29.5], [114, -26.5], [113.4, -24.5],
  [113.8, -22], [114.6, -21.8], [116.7, -20.6], [118.8, -20.3], [121, -19.5], [122.3, -18], [123.6, -16.5], [125.2, -14.5],
  [127.8, -14.2], [129.4, -14.9], [130.3, -12.5], [132.6, -11.5], [135.9, -12.2], [136.8, -12.2], [136, -13.6], [135.4, -14.9],
  [137.8, -16.5], [139.3, -17.4], [140.8, -17.4], [141.6, -15], [141.5, -12.5],
];
const TASMANIA: [number, number][] = [
  [144.6, -40.7], [146.4, -41.1], [148.3, -40.9], [148.3, -42.2], [147.9, -43.2], [146.9, -43.6], [145.9, -43.5], [145.2, -42.2],
];

export const CITIES = {
  Melbourne: [144.96, -37.81],
  Sydney: [151.21, -33.87],
  Brisbane: [153.03, -27.47],
  Perth: [115.86, -31.95],
  Hobart: [147.33, -42.88],
} as const;

export type City = keyof typeof CITIES;

export const MAP = {lon0: 112.5, lat0: -10, k: 21};
export const proj = ([lon, lat]: readonly [number, number] | [number, number]): [number, number] => [
  (lon - MAP.lon0) * MAP.k,
  (MAP.lat0 - lat) * MAP.k,
];
const pathOf = (pts: [number, number][]) => 'M' + pts.map((p) => proj(p).map((v) => v.toFixed(1)).join(' ')).join(' L') + ' Z';

/** Map in its own coordinates (about 880 x 720). `routes` gives each route's draw progress 0..1. */
export const AusMap: React.FC<{routes: Partial<Record<City, number>>; dots: Partial<Record<City, number>>; land: number}> = ({routes, dots, land}) => {
  const mel = proj(CITIES.Melbourne);
  const label = (name: City, dx: number, dy: number, anchor: 'start' | 'end') => {
    const [x, y] = proj(CITIES[name]);
    const p = dots[name] ?? 0;
    return (
      <g key={name} opacity={Math.min(1, p * 1.5)}>
        <circle cx={x} cy={y} r={12 * p} fill={name === 'Melbourne' ? S.red500 : S.navy700} />
        <circle cx={x} cy={y} r={22 * p} fill="none" stroke={name === 'Melbourne' ? S.red500 : S.navy700} strokeWidth={4} opacity={0.35} />
        <text x={x + dx} y={y + dy} textAnchor={anchor} fontFamily={POPPINS} fontWeight={600} fontSize={40} fill={S.navy700}>
          {name}
        </text>
      </g>
    );
  };
  return (
    <svg width={900} height={740} viewBox="-10 -10 900 740" style={{display: 'block', overflow: 'visible'}}>
      <g opacity={land}>
        <path d={pathOf(MAINLAND)} fill={S.navy100} stroke="#cfd2e6" strokeWidth={4} strokeLinejoin="round" />
        <path d={pathOf(TASMANIA)} fill={S.navy100} stroke="#cfd2e6" strokeWidth={4} strokeLinejoin="round" />
      </g>
      {(Object.keys(routes) as City[]).map((name) => {
        const [x, y] = proj(CITIES[name]);
        const mx = (mel[0] + x) / 2;
        const my = (mel[1] + y) / 2;
        const len = Math.hypot(x - mel[0], y - mel[1]);
        // bow each route to the north so they read as journeys
        const nx = -(y - mel[1]) / len;
        const ny = (x - mel[0]) / len;
        const bend = Math.min(160, len * 0.28) * (ny > 0 ? -1 : 1);
        const d = `M${mel[0]} ${mel[1]} Q${mx + nx * bend} ${my + ny * bend} ${x} ${y}`;
        return (
          <path
            key={name}
            d={d}
            fill="none"
            stroke={S.red500}
            strokeWidth={8}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - (routes[name] ?? 0)}
          />
        );
      })}
      {label('Melbourne', -26, 52, 'end')}
      {label('Sydney', -26, 14, 'end')}
      {label('Brisbane', -26, 14, 'end')}
      {label('Perth', 26, 14, 'start')}
      {label('Hobart', 30, 14, 'start')}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Trucks, houses, boxes, car                                          */
/* ------------------------------------------------------------------ */

export type BoxStyle = 'mine' | 'a' | 'b';
const BOX: Record<BoxStyle, {fill: string; tape: string; line: string}> = {
  mine: {fill: S.red100, tape: S.red500, line: S.red600},
  a: {fill: S.navy100, tape: S.navy700, line: S.navy700},
  b: {fill: S.white, tape: S.navy700, line: S.navy700},
};

export const Box: React.FC<{x: number; y: number; s: number; kind: BoxStyle; rot?: number}> = ({x, y, s, kind, rot = 0}) => {
  const c = BOX[kind];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-50} y={-42} width={100} height={84} rx={8} fill={c.fill} stroke={c.line} strokeWidth={5} />
      <rect x={-9} y={-42} width={18} height={84} fill={c.tape} />
    </g>
  );
};

export const House: React.FC<{x: number; y: number; door: string}> = ({x, y, door}) => (
  <g transform={`translate(${x} ${y})`} strokeLinejoin="round">
    <path d="M-90 0 L0 -78 L90 0 L90 96 L-90 96 Z" fill={S.white} stroke={S.navy700} strokeWidth={8} />
    <rect x={-20} y={40} width={40} height={56} rx={6} fill={door} />
    <rect x={-66} y={14} width={34} height={30} rx={4} fill={S.navy100} stroke={S.navy700} strokeWidth={5} />
    <rect x={32} y={14} width={34} height={30} rx={4} fill={S.navy100} stroke={S.navy700} strokeWidth={5} />
  </g>
);

const Wheel: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 42}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={S.navy900} />
    <circle cx={x} cy={y} r={r * 0.45} fill="#c9ccda" />
  </g>
);

/** Truck cab facing right, front at x+220. */
export const Cab: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`} strokeLinejoin="round">
    <path d="M0 -230 L130 -230 Q175 -230 195 -180 L220 -110 L220 0 L0 0 Z" fill={S.white} stroke={S.navy700} strokeWidth={8} />
    <path d="M110 -205 L145 -205 Q165 -205 175 -180 L192 -130 L110 -130 Z" fill={S.navy100} stroke={S.navy700} strokeWidth={6} />
    <rect x={200} y={-60} width={26} height={34} rx={6} fill={S.red500} />
    <Wheel x={150} y={6} />
  </g>
);

/** Box trailer x..x+w (bottom at y). `cutaway` shows the inside instead of the logo side. */
export const BoxBody: React.FC<{x: number; y: number; w: number; h: number; cutaway?: boolean}> = ({x, y, w, h, cutaway}) => {
  const logoW = w * 0.8;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={-h} width={w} height={h} rx={18} fill={cutaway ? S.navy100 : S.white} stroke={S.navy700} strokeWidth={8} />
      {!cutaway && (
        <foreignObject x={(w - logoW) / 2} y={-h / 2 - (logoW * LOGO.h) / LOGO.w / 2} width={logoW} height={(logoW * LOGO.h) / LOGO.w}>
          <Img src={staticFile('supercheap/logo.png')} style={{width: '100%', display: 'block'}} />
        </foreignObject>
      )}
      <rect x={0} y={-8} width={w} height={14} fill={S.navy700} />
    </g>
  );
};

/** Side-view sedan facing right, wheels on y. */
export const Car: React.FC<{x: number; y: number; tilt?: number}> = ({x, y, tilt = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`} strokeLinejoin="round">
    <path d="M-150 -40 Q-150 -70 -120 -74 L-70 -78 L-30 -122 Q-18 -132 0 -132 L70 -132 Q90 -132 104 -118 L140 -80 L160 -76 Q182 -72 182 -46 L182 -20 L-150 -20 Z" fill={S.navy700} />
    <path d="M-18 -118 L4 -118 L4 -82 L-52 -82 Z M20 -118 L66 -118 Q78 -118 88 -106 L112 -82 L20 -82 Z" fill={S.navy100} />
    <circle cx={-90} cy={-20} r={34} fill={S.navy900} />
    <circle cx={-90} cy={-20} r={15} fill="#c9ccda" />
    <circle cx={122} cy={-20} r={34} fill={S.navy900} />
    <circle cx={122} cy={-20} r={15} fill="#c9ccda" />
    <rect x={168} y={-66} width={14} height={14} rx={4} fill="#ffd38a" />
  </g>
);

export {Wheel};
