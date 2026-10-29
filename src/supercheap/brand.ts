import {Easing, interpolate, spring, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

/** Tokens from the Supercheap Video Brand guideline (tokens.json). */
export const S = {
  red500: '#ed1a38',
  red400: '#ff4d63',
  red600: '#c8102e',
  red100: '#fde8eb',
  navy700: '#242a66',
  navy900: '#161a42',
  navy100: '#e8e9f3',
  white: '#ffffff',
  surface: '#f6f6fa',
  ink: '#242a66',
  muted: '#6b6f8e',
  skin: '#e0ac8a',
  skinShade: '#c99272',
  hair: '#2b2342',
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;

/** Safe zones on the 1080 x 1920 frame: no text in the top 220 / bottom 380 px. */
export const SAFE = {top: 220, bottom: 380, left: 64, right: 160};
export const SAFE_W = W - SAFE.left - SAFE.right; // 856
export const SAFE_CX = SAFE.left + SAFE_W / 2; // 492
export const CAPTION_BOTTOM = H - SAFE.bottom; // 1540

export const RADIUS = {sm: 12, md: 28, pill: 999};

export const POPPINS = 'Poppins';
for (const w of ['400', '500', '600', '700', '800']) {
  loadFont({family: POPPINS, weight: w, url: staticFile(`fonts/Poppins-${w}.woff2`), format: 'woff2'});
}

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const sec = (s: number) => Math.round(s * FPS);

/** Brand "text in": slide up 40 px + fade over 0.25 s, ease-out. */
export const textIn = (f: number, at: number) => {
  const p = interpolate(f, [at, at + 7.5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return {opacity: p, transform: `translateY(${(1 - p) * 40}px)`};
};

/** Brand "text out": fade over 0.15 s. */
export const fadeOut = (f: number, at: number) => interpolate(f, [at, at + 4.5], [1, 0], clamp);

/** Big kinetic slam for the hook: drops in from 125% scale with a tiny settle. */
export const slam = (f: number, at: number) => {
  const s = spring({frame: f - at, fps: FPS, config: {damping: 13, stiffness: 260, mass: 0.6}});
  return {opacity: interpolate(f, [at, at + 3], [0, 1], clamp), transform: `scale(${1.25 - 0.25 * s})`};
};

export const pop = (f: number, at: number, config = {damping: 12, stiffness: 220, mass: 0.6}) =>
  spring({frame: f - at, fps: FPS, config});

export const ease = (f: number, [a, b]: [number, number], [from, to]: [number, number], easing = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});

/** Logo geometry (public/supercheap/logo.png, 1920 x 516; icon x 0-277, wordmark from x 323). */
export const LOGO = {w: 1920, h: 516, iconW: 290, wordX: 316};
