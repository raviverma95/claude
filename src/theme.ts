import {Easing, interpolate, spring, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Poppins and Inter from Google Fonts, vendored in public/fonts so renders work offline.
export const POPPINS = 'Poppins';
export const INTER = 'Inter';
for (const [family, weight, file] of [
  [POPPINS, '700', 'Poppins-700'],
  [POPPINS, '800', 'Poppins-800'],
  [INTER, '500', 'Inter-500'],
]) {
  loadFont({family, weight, url: staticFile(`fonts/${file}.woff2`), format: 'woff2'});
}

export const C = {
  green: '#409455',
  greenDark: '#2F7341',
  greenTint: '#E9F4EC',
  ink: '#111010',
  white: '#FFFFFF',
  sand: '#F3E9DC',
  sunrise: '#F2A65A',
  grey: '#8A8F8C',
  skin: '#C98F62',
  skinShade: '#B57C51',
  hair: '#151313',
  dress: '#F4C542',
  sea: '#BFD9E3',
  kraft: '#C9A27A',
};

export const FPS = 30;
export const SHADOW = '0 12px 40px rgba(17,16,16,0.10)';
export const RADIUS = 28;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const ENTER_SPRING = {damping: 14, stiffness: 120, mass: 0.8};

/** Default entrance: spring from scale 0.92, opacity 0, 24 px rise. */
export const enter = (frame: number, start: number) => {
  const s = spring({frame: frame - start, fps: FPS, config: ENTER_SPRING});
  return {
    opacity: interpolate(s, [0, 0.6], [0, 1], clamp),
    transform: `translateY(${(1 - s) * 24}px) scale(${0.92 + 0.08 * s})`,
  };
};

export const springAt = (frame: number, start: number, config = ENTER_SPRING) =>
  spring({frame: frame - start, fps: FPS, config});

/** Default exit: 8 frames, fade and 16 px drop. Returns {opacity, y}. */
export const exitAt = (frame: number, start: number) => {
  const p = interpolate(frame, [start, start + 8], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  return {opacity: 1 - p, y: 16 * p};
};

export const ease = (
  frame: number,
  [a, b]: [number, number],
  [from, to]: [number, number],
  easing = Easing.inOut(Easing.cubic),
) => interpolate(frame, [a, b], [from, to], {...clamp, easing});

/** Bounce loop used by Layla: 12 frame cycle. */
export const bounce = (frame: number, height = 10) =>
  -Math.abs(Math.sin((Math.PI * frame) / 12)) * height;
