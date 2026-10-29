import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import {CAPTIONS} from './captions';
import {CAPTION_BOTTOM, clamp, ease, fadeOut, FPS, LOGO, pop, POPPINS, S, SAFE, SAFE_W, textIn} from './brand';

/** Render `*word*` as a red word; the rest in the given colour. */
export const Stressed: React.FC<{text: string; red: string}> = ({text, red}) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((part, i) =>
      part.startsWith('*') ? (
        <span key={i} style={{color: red}}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);

/** Burned-in caption: white on a navy-900 pill at 85%, stressed word in red-400, just above the bottom safe zone. */
export const Captions: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / FPS;
  const c = CAPTIONS.find((x) => x.onScreen && t >= x.start - 0.03 && t < x.end + 0.12);
  if (!c) return null;
  const at = Math.round(c.start * FPS) - 1;
  const p = interpolate(frame, [at, at + 4.5], [0.95, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        width: SAFE_W,
        bottom: 1920 - CAPTION_BOTTOM,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: 'rgba(22,26,66,0.85)',
          color: S.white,
          fontFamily: POPPINS,
          fontWeight: 700,
          fontSize: 56,
          lineHeight: 1.15,
          padding: '24px 40px',
          borderRadius: 999,
          textAlign: 'center',
          maxWidth: SAFE_W,
          boxSizing: 'border-box',
          transform: `scale(${p})`,
          opacity: interpolate(frame, [at, at + 2], [0, 1], clamp),
        }}
      >
        <Stressed text={c.text} red={S.red400} />
      </div>
    </div>
  );
};

/** A word with the brand's red underline bar, drawn left to right 0.3 s after `at`. */
export const Underlined: React.FC<{children: React.ReactNode; frame: number; at: number; color?: string}> = ({
  children,
  frame,
  at,
  color = S.red500,
}) => {
  const p = ease(frame, [at, at + 9], [0, 1]);
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      {children}
      <span
        style={{
          position: 'absolute',
          left: 0,
          bottom: -6,
          height: 12,
          width: `${p * 100}%`,
          borderRadius: 999,
          background: color,
        }}
      />
    </span>
  );
};

export type HeadLine = {text: string; at: number; red?: boolean; underline?: boolean; size?: number};

/** USP headline (88px / 800, CAPS): each line slides up and fades in on its own frame. */
export const Headline: React.FC<{
  lines: HeadLine[];
  frame: number;
  top: number;
  dark?: boolean;
  align?: 'left' | 'center';
  out?: number;
}> = ({lines, frame, top, dark, align = 'left', out}) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE.left,
      width: SAFE_W,
      top,
      textAlign: align,
      fontFamily: POPPINS,
      fontWeight: 800,
      lineHeight: 1.05,
      textTransform: 'uppercase',
      color: dark ? S.white : S.ink,
      opacity: out !== undefined ? fadeOut(frame, out) : 1,
    }}
  >
    {lines.map((l) => {
      const red = dark ? S.red400 : S.red500;
      const body = l.underline ? (
        <Underlined frame={frame} at={l.at + 8} color={red}>
          {l.text}
        </Underlined>
      ) : (
        l.text
      );
      return (
        <div key={l.text} style={{fontSize: l.size ?? 88, color: l.red ? red : undefined, marginBottom: 6, ...textIn(frame, l.at)}}>
          {body}
        </div>
      );
    })}
  </div>
);

/** One crop of the logo PNG at a given display width. */
const LogoPart: React.FC<{src: string; width: number; part: 'all' | 'hand' | 'sparks' | 'word'; style?: React.CSSProperties}> = ({
  src,
  width,
  part,
  style,
}) => {
  const k = width / LOGO.w;
  // sparks sit top-left of the icon; the hand is the rest of the icon
  const clips: Record<string, string> = {
    all: 'none',
    sparks: `polygon(0 0, ${120 * k}px 0, ${120 * k}px ${70 * k}px, ${75 * k}px ${105 * k}px, 0 ${105 * k}px)`,
    hand: `polygon(0 ${105 * k}px, ${75 * k}px ${105 * k}px, ${120 * k}px ${70 * k}px, ${120 * k}px 0, ${LOGO.iconW * k}px 0, ${LOGO.iconW * k}px 100%, 0 100%)`,
    word: `inset(0 0 0 ${LOGO.wordX * k}px)`,
  };
  return <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: 0, width, clipPath: clips[part], ...style}} />;
};

/**
 * The logo, with the brand sting starting at `at`: the hand snaps
 * (100 -> 92 -> 104 -> 100% over 0.4 s), three sparks pop, then the wordmark
 * wipes in left to right.
 */
export const LogoSting: React.FC<{frame: number; at: number; width: number; white?: boolean}> = ({frame, at, width, white}) => {
  const src = white ? 'supercheap/logo-white.png' : 'supercheap/logo.png';
  const k = width / LOGO.w;
  const snap = interpolate(frame, [at, at + 3, at + 8, at + 12], [1, 0.92, 1.04, 1], clamp);
  const handIn = interpolate(frame, [at - 3, at], [0, 1], clamp);
  const sparks = pop(frame, at + 3, {damping: 9, stiffness: 300, mass: 0.4});
  const wipe = ease(frame, [at + 8, at + 19], [0, 1]);
  const pivot = `${LOGO.iconW * k * 0.55}px ${LOGO.h * k * 0.6}px`;
  return (
    <div style={{position: 'relative', width, height: LOGO.h * k}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`}}>
        <LogoPart src={src} width={width} part="word" />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${snap})`, transformOrigin: pivot, opacity: handIn}}>
        <LogoPart src={src} width={width} part="hand" />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: Math.min(1, sparks * 1.5),
          transform: `scale(${0.5 + 0.5 * sparks})`,
          transformOrigin: `${120 * k}px ${105 * k}px`,
        }}
      >
        <LogoPart src={src} width={width} part="sparks" />
      </div>
    </div>
  );
};

/** A photo filling a box (object-fit cover) with a slow Ken Burns push. */
export const Photo: React.FC<{
  src: string;
  frame: number;
  from: number;
  to: number;
  zoom?: [number, number];
  pan?: [number, number]; // object-position x %, start -> end
  posY?: number;
  style?: React.CSSProperties;
}> = ({src, frame, from, to, zoom = [1, 1.06], pan = [50, 50], posY = 50, style}) => {
  const z = interpolate(frame, [from, to], zoom, clamp);
  const x = interpolate(frame, [from, to], pan, clamp);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${x}% ${posY}%`,
          transform: `scale(${z})`,
          transformOrigin: `${x}% ${posY}%`,
        }}
      />
    </div>
  );
};

/** A phone in navy-700 with a white screen. Children are drawn in screen coordinates. */
export const PhoneFrame: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 64,
      background: S.navy700,
      boxShadow: '0 30px 80px rgba(22,26,66,0.35)',
      ...style,
    }}
  >
    <div style={{position: 'absolute', inset: 16, borderRadius: 50, overflow: 'hidden', background: S.white}}>{children}</div>
    <div style={{position: 'absolute', left: w / 2 - 60, top: 30, width: 120, height: 30, borderRadius: 15, background: S.navy700}} />
  </div>
);

/** Proof chip: white pill, subhead text, red tick. */
export const Chip: React.FC<{text: string; frame: number; at: number; dark?: boolean}> = ({text, frame, at, dark}) => {
  const p = pop(frame, at);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 18,
        background: S.white,
        color: S.navy700,
        fontFamily: POPPINS,
        fontWeight: 600,
        fontSize: 44,
        padding: '22px 38px',
        borderRadius: 999,
        boxShadow: dark ? 'none' : '0 12px 34px rgba(22,26,66,0.18)',
        opacity: Math.min(1, p * 1.6),
        transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`,
      }}
    >
      <svg width={40} height={40} viewBox="0 0 40 40">
        <circle cx={20} cy={20} r={20} fill={S.red500} />
        <path d="M11 20.5 L17.5 27 L29.5 14" stroke="#fff" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {text}
    </div>
  );
};
