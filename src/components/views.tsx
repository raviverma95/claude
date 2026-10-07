import React from 'react';
import {interpolateColors} from 'remotion';
import {C} from '../theme';
import {Layla, LaylaPose} from './characters';

/** Jebel Jais sunrise. t: 0 (dark) to 1 (sun up). Drawn in a w x h box. */
export const SunriseView: React.FC<{w: number; h: number; t: number}> = ({w, h, t}) => {
  const top = interpolateColors(t, [0, 1], [C.ink, '#B9776A']);
  const bottom = interpolateColors(t, [0, 1], ['#2B2A2A', C.sunrise]);
  const sunY = h * 0.5 + 120 * (1 - t);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display: 'block'}}>
      <defs>
        <linearGradient id={`sky${w}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.7" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#sky${w})`} />
      <circle cx={w * 0.55} cy={sunY} r={w * 0.14} fill={C.sunrise} />
      <circle cx={w * 0.55} cy={sunY} r={w * 0.22} fill={C.sunrise} opacity={0.25} />
      <path
        d={`M0 ${h * 0.56} L${w * 0.18} ${h * 0.47} L${w * 0.34} ${h * 0.53} L${w * 0.5} ${h * 0.44} L${w * 0.7} ${h * 0.52} L${w * 0.86} ${h * 0.46} L${w} ${h * 0.5} L${w} ${h} L0 ${h} Z`}
        fill="#7D8380"
      />
      <path
        d={`M0 ${h * 0.64} L${w * 0.22} ${h * 0.56} L${w * 0.42} ${h * 0.63} L${w * 0.62} ${h * 0.57} L${w * 0.82} ${h * 0.64} L${w} ${h * 0.6} L${w} ${h} L0 ${h} Z`}
        fill="#585D5B"
      />
      <path
        d={`M0 ${h * 0.74} L${w * 0.16} ${h * 0.68} L${w * 0.38} ${h * 0.75} L${w * 0.58} ${h * 0.69} L${w * 0.8} ${h * 0.76} L${w} ${h * 0.7} L${w} ${h} L0 ${h} Z`}
        fill="#363938"
      />
    </svg>
  );
};

const Kite: React.FC<{x: number; y: number; s: number; color: string; sway: number}> = ({x, y, s, color, sway}) => (
  <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${s})`}>
    <path d="M0 -26 L18 0 L0 30 L-18 0 Z" fill={color} />
    <path d="M0 -26 L0 30 M-18 0 L18 0" stroke="#fff" strokeWidth={1.5} opacity={0.6} />
    <path d="M0 30 Q-10 60 6 90 Q18 120 2 150" stroke={C.ink} strokeWidth={1.2} fill="none" opacity={0.5} />
  </g>
);

/** Kite Beach. `golden` = the sharp golden-hour version for the final photo. */
export const BeachView: React.FC<{
  w: number;
  h: number;
  golden?: boolean;
  frame: number;
  layla?: {x: number; pose: LaylaPose; phase: number; scale: number; lift?: number; ghosts?: boolean};
  yellowBlurX?: number;
}> = ({w, h, golden, frame, layla, yellowBlurX}) => {
  const horizon = h * 0.44;
  const shore = h * 0.56;
  const ground = h * 0.86;
  const id = `b${w}${golden ? 'g' : 'p'}`;
  const drawLayla = (x: number, opacity: number, key: string) =>
    layla && (
      <g key={key} opacity={opacity} transform={`translate(${x} ${ground - 286 * layla.scale - (layla.lift ?? 0)}) scale(${layla.scale})`}>
        <Layla pose={layla.pose} phase={layla.phase} />
      </g>
    );
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display: 'block'}}>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={golden ? '#F7C98E' : '#DCE6EA'} />
          <stop offset="1" stopColor={golden ? C.sunrise : '#EEF2F2'} />
        </linearGradient>
        <filter id={`blur${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={w * 0.03} />
        </filter>
      </defs>
      <rect width={w} height={horizon} fill={`url(#sky${id})`} />
      {golden && <circle cx={w * 0.78} cy={horizon - h * 0.02} r={h * 0.09} fill="#FBE3B8" />}
      <rect y={horizon} width={w} height={shore - horizon} fill={C.sea} />
      {golden && (
        <g opacity={0.8}>
          <rect x={w * 0.6} y={horizon + 6} width={w * 0.34} height={4} rx={2} fill="#FBE3B8" />
          <rect x={w * 0.68} y={horizon + 18} width={w * 0.2} height={3} rx={1.5} fill="#FBE3B8" />
        </g>
      )}
      <path d={`M0 ${shore} Q${w * 0.5} ${shore - 10} ${w} ${shore} L${w} ${h} L0 ${h} Z`} fill={C.sand} />
      <path d={`M0 ${shore + 4} Q${w * 0.5} ${shore - 6} ${w} ${shore + 4}`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.8} />
      <Kite x={w * 0.24} y={h * 0.14} s={h / 600} color={C.sunrise} sway={Math.sin(frame / 14) * 8} />
      <Kite x={w * 0.66} y={h * 0.2} s={h / 760} color="#E2675A" sway={Math.sin(frame / 17 + 1) * 10} />
      {layla?.ghosts &&
        [3, 2, 1].map((g) => drawLayla(layla.x - g * w * 0.06, 0.4 - g * 0.1, `g${g}`))}
      {layla && drawLayla(layla.x, 1, 'main')}
      {yellowBlurX !== undefined && (
        <g filter={`url(#blur${id})`}>
          <ellipse cx={yellowBlurX} cy={ground - h * 0.12} rx={w * 0.16} ry={h * 0.07} fill={C.dress} />
          <ellipse cx={yellowBlurX + w * 0.04} cy={ground - h * 0.2} rx={w * 0.06} ry={h * 0.04} fill={C.skin} opacity={0.7} />
        </g>
      )}
    </svg>
  );
};
