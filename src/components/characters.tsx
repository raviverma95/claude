import React from 'react';
import {C} from '../theme';

type Pt = [number, number];

/* ------------------------------------------------------------------ */
/* Omar                                                                */
/* ------------------------------------------------------------------ */

/** Omar's head, 3/4 view facing right. Centre of head at (0, 0), 132 tall. */
export const OmarHead: React.FC<{
  blink?: number; // 0 open, 1 closed
  smile?: number; // 0 flat, 1 full smile
  brow?: number; // px the eyebrows lift
  pale?: number; // screen light on the face
}> = ({blink = 0, smile = 0, brow = 0, pale = 0}) => {
  const eyeRy = 5.5 * (1 - 0.9 * blink);
  return (
    <g>
      <ellipse cx={-52} cy={8} rx={12} ry={16} fill={C.skinShade} />
      <ellipse cx={0} cy={0} rx={56} ry={66} fill={C.skin} />
      {pale > 0 && (
        <ellipse cx={12} cy={4} rx={46} ry={60} fill="#EEF2F7" opacity={0.32 * pale} />
      )}
      {/* beard */}
      <path
        d="M-54 6 C-52 52 -26 76 6 76 C34 76 54 52 55 8 L49 16 C47 44 30 60 6 60 C-18 60 -42 46 -47 14 Z"
        fill={C.hair}
      />
      {/* moustache */}
      <path d="M-2 30 Q13 23 28 30 L28 35 Q13 30 -2 35 Z" fill={C.hair} />
      {/* hair with side fade */}
      <path
        d="M-57 4 C-63 -58 -20 -81 12 -79 C47 -77 63 -52 57 -14 C50 -36 34 -47 8 -47 C-20 -47 -40 -37 -46 -14 C-50 -6 -52 0 -57 4 Z"
        fill={C.hair}
      />
      <path d="M-57 4 C-58 -10 -56 -22 -50 -30 L-45 -15 C-48 -8 -50 0 -50 7 Z" fill="#4A4441" />
      {/* eyebrows */}
      <rect x={-16} y={-24 - brow} width={21} height={6} rx={3} fill={C.hair} />
      <rect x={20} y={-24 - brow} width={21} height={6} rx={3} fill={C.hair} />
      {/* eyes */}
      <ellipse cx={-5} cy={-4} rx={5.5} ry={eyeRy} fill={C.ink} />
      <ellipse cx={31} cy={-4} rx={5.5} ry={eyeRy} fill={C.ink} />
      {/* mouth */}
      <path
        d={`M2 45 Q14 ${45 + 13 * smile} 26 ${45 - 2 * smile}`}
        stroke={C.ink}
        strokeWidth={4.5}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
};

/** Arm from shoulder to hand: sleeve then skin forearm and rounded hand. */
export const Arm: React.FC<{
  from: Pt;
  to: Pt;
  tee: string;
  bend?: number; // elbow offset, positive bends downward
  handR?: number;
}> = ({from, to, tee, bend = 30, handR = 19}) => {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2 + bend;
  const sx = from[0] + (mx - from[0]) * 0.55;
  const sy = from[1] + (my - from[1]) * 0.55;
  return (
    <g strokeLinecap="round" fill="none">
      <path d={`M${from[0]} ${from[1]} L${mx} ${my} L${to[0]} ${to[1]}`} stroke={C.skin} strokeWidth={28} strokeLinejoin="round" />
      <path d={`M${from[0]} ${from[1]} L${sx} ${sy}`} stroke={tee} strokeWidth={40} />
      <circle cx={to[0]} cy={to[1]} r={handR} fill={C.skin} stroke="none" />
    </g>
  );
};

/** Omar from the chest up. viewBox units: head centre at (0,0). */
export const OmarBust: React.FC<{
  tee: string;
  blink?: number;
  smile?: number;
  brow?: number;
  pale?: number;
  chinHand?: boolean;
}> = ({tee, chinHand, ...face}) => (
  <g>
    <rect x={-20} y={46} width={40} height={60} fill={C.skinShade} />
    <path d="M-128 460 L-128 220 C-128 140 -84 102 0 102 C84 102 128 140 128 220 L128 460 Z" fill={tee} />
    <path d="M-26 102 Q0 124 26 102 Z" fill={C.skinShade} />
    <OmarHead {...face} />
    {chinHand && (
      <g>
        <path d="M74 300 L44 104" stroke={C.skin} strokeWidth={34} strokeLinecap="round" />
        <path d="M92 460 L76 270" stroke={tee} strokeWidth={62} strokeLinecap="round" />
        <ellipse cx={30} cy={84} rx={28} ry={21} fill={C.skin} />
        <ellipse cx={30} cy={84} rx={28} ry={21} fill="#EEF2F7" opacity={0.2 * (face.pale ?? 0)} />
      </g>
    )}
  </g>
);

/** Omar standing, facing right. Head centre at (0,0); feet at about y 600. */
export const OmarStanding: React.FC<{
  tee: string;
  frontHand: Pt;
  backHand: Pt;
  smile?: number;
  blink?: number;
  step?: number; // walk phase, 0 = standing
  backHandContent?: React.ReactNode;
}> = ({tee, frontHand, backHand, smile = 0, blink = 0, step = 0, backHandContent}) => {
  const swing = Math.sin(step) * 16;
  return (
    <g>
      {/* back arm */}
      <Arm from={[-40, 128]} to={backHand} tee={tee} bend={36} />
      {backHandContent}
      {/* legs */}
      <g strokeLinecap="round">
        <path d={`M-34 330 L${-40 - swing} 584`} stroke={C.ink} strokeWidth={66} />
        <path d={`M34 330 L${40 + swing} 584`} stroke="#2A2828" strokeWidth={66} />
      </g>
      <ellipse cx={-30 - swing} cy={598} rx={44} ry={16} fill={C.ink} />
      <ellipse cx={52 + swing} cy={598} rx={44} ry={16} fill={C.ink} />
      {/* torso */}
      <rect x={-20} y={46} width={40} height={60} fill={C.skinShade} />
      <path d="M-100 140 Q-100 100 -60 98 L60 98 Q100 100 100 140 L94 340 L-94 340 Z" fill={tee} />
      <path d="M-24 98 Q0 118 24 98 Z" fill={C.skinShade} />
      <OmarHead smile={smile} blink={blink} />
      {/* front arm */}
      <Arm from={[56, 130]} to={frontHand} tee={tee} bend={40} />
    </g>
  );
};

/** Omar in profile, camera raised to his eye, pointing right. */
export const OmarProfileCamera: React.FC<{tee: string; focus: number}> = ({tee, focus}) => (
  <g>
    {/* torso & shoulders */}
    <rect x={-22} y={46} width={44} height={60} fill={C.skinShade} />
    <path d="M-130 420 C-130 170 -90 100 -10 100 C60 100 96 150 100 230 L100 420 Z" fill={tee} />
    {/* arms up to the camera */}
    <Arm from={[60, 150]} to={[150, 60]} tee={tee} bend={60} handR={22} />
    <Arm from={[-30, 160]} to={[210, 58]} tee={tee} bend={80} handR={22} />
    {/* head in profile */}
    <ellipse cx={0} cy={0} rx={58} ry={66} fill={C.skin} />
    <path d="M-56 0 C-58 -60 -18 -82 14 -79 C46 -76 62 -50 56 -24 C40 -40 10 -44 -14 -36 C-26 -20 -30 -6 -40 6 Z" fill={C.hair} />
    <path d="M-40 6 C-40 50 -12 76 20 76 C42 76 58 58 58 30 L52 32 C48 50 34 58 20 58 C0 58 -18 40 -22 6 Z" fill={C.hair} />
    <ellipse cx={-14} cy={4} rx={11} ry={15} fill={C.skinShade} />
    <rect x={8} y={-26} width={22} height={6} rx={3} fill={C.hair} />
    <path d="M30 44 Q40 52 50 44" stroke={C.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    {/* camera, side view */}
    <g>
      <rect x={44} y={-38} width={30} height={30} rx={6} fill={C.ink} />
      <rect x={70} y={-52} width={112} height={92} rx={14} fill={C.ink} />
      <rect x={100} y={-66} width={44} height={20} rx={5} fill={C.ink} />
      <defs>
        <clipPath id="barrel">
          <rect x={182} y={-36} width={84} height={64} rx={6} />
        </clipPath>
      </defs>
      <rect x={182} y={-36} width={84} height={64} rx={6} fill={C.grey} />
      <g clipPath="url(#barrel)">
        {Array.from({length: 18}).map((_, i) => (
          <rect
            key={i}
            x={200}
            y={-50 + i * 8 + ((focus * 40) / 360) * 64 * 0.9}
            width={40}
            height={3.5}
            fill="#5F6461"
          />
        ))}
      </g>
      <rect x={262} y={-40} width={10} height={72} rx={4} fill={C.ink} />
      <circle cx={150} cy={-36} r={5} fill="#3A3838" />
    </g>
    {/* hands over the camera */}
    <ellipse cx={150} cy={56} rx={26} ry={20} fill={C.skin} />
    <ellipse cx={214} cy={42} rx={24} ry={18} fill={C.skin} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Layla                                                               */
/* ------------------------------------------------------------------ */

export type LaylaPose = 'stand' | 'run' | 'jump' | 'pull';

/** Layla: head centre at (0,0), feet at about y 286 (half Omar's height). */
export const Layla: React.FC<{pose?: LaylaPose; phase?: number; smile?: number}> = ({
  pose = 'stand',
  phase = 0,
  smile = 1,
}) => {
  const run = pose === 'run';
  const jump = pose === 'jump';
  const s = Math.sin(phase);
  const legs: [Pt, Pt][] = run
    ? [
        [[-12, 188], [-12 - 34 * s, 276]],
        [[12, 188], [12 + 34 * s, 276]],
      ]
    : jump
      ? [
          [[-14, 188], [-34, 252]],
          [[14, 188], [34, 252]],
        ]
      : [
          [[-14, 188], [-18, 278]],
          [[14, 188], [18, 278]],
        ];
  const hands: Pt[] = jump
    ? [[-62, -56], [62, -56]]
    : run
      ? [[-46 + 30 * s, 120], [46 - 30 * s, 110]]
      : pose === 'pull'
        ? [[-44, 140], [64, 62]]
        : [[-40, 140], [40, 140]];
  const tail = run ? -18 : 0; // pigtails trail when running
  return (
    <g>
      {/* legs */}
      {legs.map(([a, b], i) => (
        <g key={i}>
          <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} stroke={C.skin} strokeWidth={15} strokeLinecap="round" />
          <ellipse cx={b[0] + 5} cy={b[1] + 4} rx={12} ry={7} fill={C.skin} />
        </g>
      ))}
      {/* arms */}
      {hands.map((h, i) => {
        const sh: Pt = [i === 0 ? -20 : 20, 62];
        return (
          <g key={i}>
            <path d={`M${sh[0]} ${sh[1]} L${h[0]} ${h[1]}`} stroke={C.skin} strokeWidth={13} strokeLinecap="round" />
            <circle cx={h[0]} cy={h[1]} r={9} fill={C.skin} />
          </g>
        );
      })}
      {/* dress */}
      <path d="M-24 46 Q0 40 24 46 L58 190 Q0 204 -58 190 Z" fill={C.dress} />
      <rect x={-8} y={36} width={16} height={14} fill={C.skinShade} />
      {/* pigtails */}
      <circle cx={-46 + tail} cy={-14} r={16} fill={C.hair} />
      <circle cx={46 + tail} cy={-14} r={16} fill={C.hair} />
      {/* head */}
      <circle cx={0} cy={0} r={42} fill={C.skin} />
      <path d="M-43 -2 C-46 -44 -14 -50 0 -50 C14 -50 46 -44 43 -2 C34 -24 14 -30 0 -30 C-14 -30 -34 -24 -43 -2 Z" fill={C.hair} />
      <circle cx={-13} cy={2} r={4.5} fill={C.ink} />
      <circle cx={15} cy={2} r={4.5} fill={C.ink} />
      <path
        d={`M-9 20 Q1 ${20 + 10 * smile} 11 20`}
        stroke={C.ink}
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

/** Generic mirrorless camera, front view. Centre at (0,0), about 200 x 130. */
export const GenericCamera: React.FC<{lensScale?: number}> = ({lensScale = 1}) => (
  <g>
    <rect x={-40} y={-78} width={70} height={30} rx={8} fill={C.ink} />
    <rect x={-100} y={-58} width={200} height={124} rx={20} fill={C.ink} />
    <rect x={56} y={-58} width={44} height={124} rx={18} fill="#262424" />
    <g transform={`scale(${lensScale})`}>
      <circle cx={-6} cy={6} r={50} fill={C.grey} />
      <circle cx={-6} cy={6} r={38} fill="#2C2B2B" />
      <circle cx={-6} cy={6} r={24} fill="#1C1B1B" />
      <ellipse cx={-16} cy={-6} rx={8} ry={5} fill="#fff" opacity={0.85} transform="rotate(-30 -16 -6)" />
    </g>
    <rect x={-88} y={-50} width={14} height={7} rx={3} fill="#3A3838" />
  </g>
);

/** Plain kraft box with one green tape stripe. Centre at (0,0), 180 x 130. */
export const KraftBox: React.FC<{tape?: string}> = ({tape = C.green}) => (
  <g>
    <rect x={-90} y={-60} width={180} height={130} rx={8} fill={C.kraft} />
    <rect x={-90} y={-60} width={180} height={22} rx={6} fill="#B78F66" />
    <rect x={-14} y={-60} width={28} height={130} fill={tape} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Icons (white strokes on a green circle, drawn on with `progress`)   */
/* ------------------------------------------------------------------ */

export type IconName = 'boxTick' | 'van' | 'handCoin' | 'chatSmile' | 'returnBox';

const ICON_PATHS: Record<IconName, string[]> = {
  boxTick: ['M8 13 H40 V19 H8 Z', 'M10 19 V40 H38 V19', 'M17 29 L22 34 L31 25'],
  van: [
    'M4 13 H29 V34 H4 Z',
    'M29 19 H37 L44 27 V34 H29',
    'M8 38 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0',
    'M31 38 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0',
  ],
  handCoin: [
    'M23 14 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0',
    'M4 31 H12 L21 28 H29 C33 28 33 33 29 33 H21',
    'M12 40 H27 L41 31 C44 29 41 25 38 27 L30 31',
  ],
  chatSmile: [
    'M9 9 H39 Q42 9 42 12 V30 Q42 33 39 33 H21 L12 41 V33 H9 Q6 33 6 30 V12 Q6 9 9 9 Z',
    'M17 22 Q24 28 31 22',
  ],
  returnBox: ['M18 19 H30 V31 H18 Z', 'M38 24 A14 14 0 1 1 33.9 14.1', 'M34.5 7.5 L33.9 14.1 L40.5 15'],
};

export const Icon: React.FC<{
  name: IconName;
  size: number;
  progress?: number;
  bg?: string;
  fg?: string;
}> = ({name, size, progress = 1, bg = C.green, fg = C.white}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{flexShrink: 0, display: 'block'}}>
    <circle cx={32} cy={32} r={32} fill={bg} />
    <g transform="translate(8 8)" fill="none" stroke={fg} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name].map((d, i) => (
        <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, Math.max(0, progress))} />
      ))}
    </g>
  </svg>
);
