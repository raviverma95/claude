import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import {C, clamp, enter, INTER, POPPINS, RADIUS, SHADOW} from '../theme';


/** Text that appears word by word, 3 frames apart. */
export const Words: React.FC<{
  text: string;
  frame: number;
  start: number;
  style?: React.CSSProperties;
  gap?: number;
}> = ({text, frame, start, style, gap = 3}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', columnGap: '0.28em', ...style}}>
    {text.split(' ').map((w, i) => (
      <span key={i} style={{display: 'inline-block', ...enter(frame, start + i * gap)}}>
        {w}
      </span>
    ))}
  </div>
);

export const Headline: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: POPPINS,
      fontWeight: 800,
      fontSize: 88,
      lineHeight: 1.05,
      color: C.ink,
      letterSpacing: -1.5,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Browser frame: white card, 28 px radius, 56 px top bar with dots and address pill. */
export const BrowserFrame: React.FC<{
  width: number;
  height: number; // height of the content area (excluding the bar)
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({width, height, children, style}) => (
  <div
    style={{
      width,
      height: height + 56,
      background: C.white,
      borderRadius: RADIUS,
      boxShadow: SHADOW + ', 0 2px 6px rgba(17,16,16,0.06)',
      overflow: 'hidden',
      position: 'relative',
      ...style,
    }}
  >
    <div
      style={{
        height: 56,
        background: '#F2F3F2',
        display: 'flex',
        alignItems: 'center',
        padding: '0 22px',
        gap: 10,
      }}
    >
      {['#D9DBD9', '#D9DBD9', '#D9DBD9'].map((c, i) => (
        <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
      ))}
      <div
        style={{
          marginLeft: 24,
          flex: 1,
          maxWidth: 420,
          height: 34,
          borderRadius: 17,
          background: C.white,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 20,
          color: C.grey,
        }}
      >
        buytech.ae
      </div>
    </div>
    <div style={{position: 'relative', width, height, overflow: 'hidden'}}>{children}</div>
  </div>
);

/** A screenshot shown at a given width, scrolled by `scroll` screenshot pixels. */
export const Shot: React.FC<{
  src: string;
  width: number;
  scroll?: number;
  children?: React.ReactNode;
}> = ({src, width, scroll = 0, children}) => {
  const k = width / 1440;
  return (
    <div style={{position: 'absolute', left: 0, top: -scroll * k, width}}>
      <Img src={staticFile(src)} style={{width, display: 'block'}} />
      {/* Overlay layer in screenshot pixel space */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1440,
          transform: `scale(${k})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** A simple arrow cursor. (x, y) is the tip. */
export const Cursor: React.FC<{x: number; y: number; press?: number; opacity?: number}> = ({
  x,
  y,
  press = 0,
  opacity = 1,
}) => (
  <svg
    width={44}
    height={52}
    viewBox="0 0 22 26"
    style={{
      position: 'absolute',
      left: x - 3,
      top: y - 2,
      opacity,
      transform: `scale(${1 - 0.15 * press})`,
      transformOrigin: '3px 2px',
      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
      zIndex: 50,
    }}
  >
    <path
      d="M2 1 L2 20 L7 15.5 L10.5 23.5 L13.8 22 L10.4 14.3 L17 14 Z"
      fill={C.ink}
      stroke={C.white}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </svg>
);

/** White full-frame flash. */
export const Flash: React.FC<{frame: number; at: number; len: number; peak?: number}> = ({
  frame,
  at,
  len,
  peak = 1,
}) => {
  if (frame < at || frame >= at + len + 2) return null;
  const o = interpolate(frame, [at, at + len, at + len + 2], [peak, peak, 0], clamp);
  return <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: o, zIndex: 100}} />;
};

export const Fill: React.FC<{children?: React.ReactNode; style?: React.CSSProperties}> = ({
  children,
  style,
}) => <div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>{children}</div>;
