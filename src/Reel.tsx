import React from 'react';
import {AbsoluteFill, Img, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';
import {Scenes, Soundtrack, VO_LINES} from './BrandIntro';
import {LayoutContext, SQUARE_X} from './layout';
import {C, clamp, FPS, POPPINS} from './theme';

/*
 * 1080 x 1920 reel. Header with the logo, the story in a 1080 x 1080 stage,
 * and a footer band with captions. The header logo is greyscale and the footer
 * ink until the turn at 15.5 s, when the brand green comes in, as in the film.
 */
export const REEL = {w: 1080, h: 1920, stageTop: 300, stage: 1080};
const FOOTER_TOP = REEL.stageTop + REEL.stage;
const TURN = 465;

// Logo PNG geometry (1920 x 819 source): tile left edge to wordmark right edge
const LOGO = {x: 322, y: 263, w: 1275, h: 277};
const HEADER_LOGO_W = 400;

/** Split each VO line into sentence-sized captions, timed by length. */
const CAPTIONS = VO_LINES.slice(0, -1).flatMap((l) => {
  const parts = l.text.match(/[^.]+\.?/g)!.map((p) => p.trim()).filter(Boolean);
  // Keep very short sentences together with the next one
  const chunks: string[] = [];
  for (const p of parts) {
    const last = chunks[chunks.length - 1];
    if (last && (last.length < 22 || p.length < 14) && last.length + p.length < 48) chunks[chunks.length - 1] = `${last} ${p}`;
    else chunks.push(p);
  }
  const total = chunks.reduce((a, c) => a + c.length, 0);
  let t = l.start;
  return chunks.map((text) => {
    const d = ((l.end - l.start) * text.length) / total;
    const c = {start: t, end: t + d, text};
    t += d;
    return c;
  });
});

const HeaderLogo: React.FC<{frame: number}> = ({frame}) => {
  const k = HEADER_LOGO_W / LOGO.w;
  const colour = interpolate(frame, [TURN, TURN + 20], [0, 1], clamp);
  const hide = interpolate(frame, [1022, 1034], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: (REEL.w - HEADER_LOGO_W) / 2,
        top: 150 - (LOGO.h * HEADER_LOGO_W) / LOGO.w / 2 + 20,
        width: HEADER_LOGO_W,
        height: LOGO.h * k,
        overflow: 'hidden',
        opacity: hide,
        filter: `grayscale(${1 - colour})`,
      }}
    >
      <Img src={staticFile('logo.png')} style={{position: 'absolute', width: 1920 * k, left: -LOGO.x * k, top: -LOGO.y * k}} />
    </div>
  );
};

const Caption: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / FPS;
  const c = CAPTIONS.find((x) => t >= x.start - 0.05 && t < x.end + 0.15);
  if (!c) return null;
  const inP = interpolate(t, [c.start - 0.05, c.start + 0.1], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top: FOOTER_TOP + 44,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily: POPPINS,
        fontWeight: 700,
        fontSize: 50,
        lineHeight: 1.22,
        color: C.white,
        opacity: inP,
        transform: `translateY(${(1 - inP) * 12}px)`,
      }}
    >
      {c.text}
    </div>
  );
};

export const Reel: React.FC<{hasVo: boolean; hasMusic: boolean}> = ({hasVo, hasMusic}) => {
  const frame = useCurrentFrame();
  const footer = interpolateColors(frame, [TURN, TURN + 20], [C.ink, C.green]);
  const progress = frame / 1139;
  return (
    <AbsoluteFill style={{background: C.white}}>
      <HeaderLogo frame={frame} />
      {/* stage: the centre square of the 1920 x 1080 canvas */}
      <div style={{position: 'absolute', left: 0, top: REEL.stageTop, width: REEL.stage, height: REEL.stage, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -SQUARE_X, top: 0, width: 1920, height: 1080}}>
          <LayoutContext.Provider value="reel">
            <Scenes />
          </LayoutContext.Provider>
        </div>
      </div>
      {/* footer band */}
      <div style={{position: 'absolute', left: 0, right: 0, top: FOOTER_TOP, bottom: 0, background: footer}}>
        <div style={{position: 'absolute', left: 0, top: 0, height: 8, width: `${progress * 100}%`, background: 'rgba(255,255,255,0.35)'}} />
      </div>
      <Caption frame={frame} />
      <Soundtrack hasVo={hasVo} hasMusic={hasMusic} />
    </AbsoluteFill>
  );
};
