import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {BeachView, SunriseView} from '../components/views';
import {C, clamp, ease, enter, exitAt, INTER} from '../theme';

const START = 270;
const PHONE = {cx: 960, top: 60, w: 420, h: 800};
const SCREEN = {x: PHONE.cx - PHONE.w / 2 + 16, y: PHONE.top + 16, w: PHONE.w - 32, h: PHONE.h - 32};
const SPOT = {x: SCREEN.x + 26, y: SCREEN.y + SCREEN.h - 104, w: 78, h: 78};
const WEAK = 'blur(2px) contrast(0.8) saturate(0.6)';

type Rect = {x: number; y: number; w: number; h: number};
const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
  w: a.w + (b.w - a.w) * p,
  h: a.h + (b.h - a.h) * p,
});

/** A captured photo drawn at screen size, cropped to cover rect r. */
const Photo: React.FC<{r: Rect; children: React.ReactNode; radius?: number; border?: number}> = ({r, children, radius = 12, border = 0}) => {
  const s = Math.max(r.w / SCREEN.w, r.h / SCREEN.h);
  return (
    <div
      style={{
        position: 'absolute',
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        overflow: 'hidden',
        borderRadius: radius,
        boxShadow: border ? `0 0 0 ${border}px #fff, 0 8px 24px rgba(17,16,16,0.18)` : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: (r.w - SCREEN.w * s) / 2,
          top: (r.h - SCREEN.h * s) / 2,
          width: SCREEN.w,
          height: SCREEN.h,
          transform: `scale(${s})`,
          transformOrigin: '0 0',
          filter: WEAK,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Scene3: React.FC = () => {
  const f = useCurrentFrame() + START;
  const W = SCREEN.w;
  const H = SCREEN.h;

  // Phone lowers at the end
  const low = ease(f, [450, 462], [0, 1]);
  const k = 1 - 0.2 * low;
  const dy = 60 * low;
  const mapRect = (r: Rect): Rect => ({
    x: PHONE.cx + (r.x - PHONE.cx) * k,
    y: PHONE.top + dy + (r.y - PHONE.top) * k,
    w: r.w * k,
    h: r.h * k,
  });

  // Shot A / B slide
  const slide = ease(f, [360, 368], [0, 1], Easing.inOut(Easing.cubic));
  const sunT = ease(f, [270, 345], [0, 1], Easing.out(Easing.quad));
  const laylaX = interpolate(f, [372, 422], [-40, W + 40], {...clamp, easing: Easing.inOut(Easing.sin)});

  const sunrisePhoto = <SunriseView w={W} h={H} t={ease(330, [270, 345], [0, 1], Easing.out(Easing.quad))} />;
  const beachPhoto = <BeachView w={W} h={H} frame={420} yellowBlurX={W * 0.88} />;

  const full: Rect = {x: SCREEN.x, y: SCREEN.y, w: W, h: H};
  const flyA = ease(f, [332, 346], [0, 1], Easing.inOut(Easing.cubic));
  const flyB = ease(f, [422, 436], [0, 1], Easing.inOut(Easing.cubic));
  const out = ease(f, [450, 463], [0, 1], Easing.out(Easing.cubic));
  const finalA: Rect = {x: 710, y: 792, w: 240, h: 150};
  const finalB: Rect = {x: 970, y: 792, w: 240, h: 150};

  const flash = (at: number) => (f >= at && f < at + 2 ? 0.8 : 0);
  const grey = ease(f, [450, 465], [0, 1]);

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 884,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: INTER,
    fontWeight: 500,
    fontSize: 30,
    color: C.grey,
  };
  const exA = exitAt(f, 352);
  const exB = exitAt(f, 442);

  const phoneTransform = `translateY(${dy}px) scale(${k})`;

  return (
    <AbsoluteFill style={{background: C.white, filter: `grayscale(${grey})`}}>
      {/* Hand + phone share one transform */}
      <AbsoluteFill style={{transform: phoneTransform, transformOrigin: `${PHONE.cx}px ${PHONE.top}px`}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <path d="M1290 1200 L1150 760" stroke={C.skin} strokeWidth={120} strokeLinecap="round" />
          <path d="M1320 1240 L1270 1090" stroke={C.grey} strokeWidth={150} strokeLinecap="round" />
          <ellipse cx={1150} cy={770} rx={70} ry={86} fill={C.skin} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: PHONE.cx - PHONE.w / 2,
            top: PHONE.top,
            width: PHONE.w,
            height: PHONE.h,
            background: C.ink,
            borderRadius: 60,
            boxShadow: '0 24px 60px rgba(17,16,16,0.25)',
          }}
        />
        <div style={{position: 'absolute', left: SCREEN.x, top: SCREEN.y, width: W, height: H, borderRadius: 46, overflow: 'hidden', background: '#000'}}>
          <div style={{position: 'absolute', inset: 0, filter: WEAK}}>
            <div style={{position: 'absolute', left: -slide * W, top: 0}}>
              <SunriseView w={W} h={H} t={sunT} />
            </div>
            <div style={{position: 'absolute', left: (1 - slide) * W, top: 0}}>
              <BeachView
                w={W}
                h={H}
                frame={f}
                layla={f < 425 ? {x: laylaX, pose: 'run', phase: f * 0.9, scale: 0.55, ghosts: true} : undefined}
              />
            </div>
          </div>
          {/* camera UI */}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: 'rgba(17,16,16,0.55)'}} />
          <div style={{position: 'absolute', left: W / 2 - 40, top: H - 116, width: 80, height: 80, borderRadius: 40, border: '6px solid #fff', boxSizing: 'border-box'}}>
            <div style={{position: 'absolute', inset: 6, borderRadius: 40, background: '#fff', transform: `scale(${flash(330) || flash(420) ? 0.85 : 1})`}} />
          </div>
          <div style={{position: 'absolute', left: W / 2 - 60, top: 26, width: 120, height: 34, borderRadius: 17, background: C.ink}} />
          <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash(330) || flash(420)}} />
        </div>
        {/* Photos sitting in the thumbnail spot (inside the phone) */}
        {f >= 332 && f < 450 && (
          <Photo r={lerpRect(full, SPOT, flyA)} radius={interpolate(flyA, [0, 1], [46, 12])}>
            {sunrisePhoto}
          </Photo>
        )}
        {f >= 422 && f < 450 && (
          <Photo r={lerpRect(full, SPOT, flyB)} radius={interpolate(flyB, [0, 1], [46, 12])}>
            {beachPhoto}
          </Photo>
        )}
      </AbsoluteFill>

      {/* Labels */}
      {f < 360 && (
        <div style={{...labelStyle, ...enter(f, 286), opacity: (enter(f, 286).opacity as number) * exA.opacity, translate: `0 ${exA.y}px`}}>
          Jebel Jais, 6:02 am
        </div>
      )}
      {f >= 368 && f < 450 && (
        <div style={{...labelStyle, ...enter(f, 372), opacity: (enter(f, 372).opacity as number) * exB.opacity, translate: `0 ${exB.y}px`}}>
          Kite Beach, first run
        </div>
      )}

      {/* Both blurry photos side by side under the phone */}
      {f >= 450 && (
        <>
          <Photo r={lerpRect(mapRect(SPOT), finalA, out)} border={6 * out}>
            {sunrisePhoto}
          </Photo>
          <Photo r={lerpRect(mapRect(SPOT), finalB, out)} border={6 * out}>
            {beachPhoto}
          </Photo>
          {[
            {r: finalA, t: 'Jebel Jais, 6:02 am'},
            {r: finalB, t: 'Kite Beach, first run'},
          ].map(({r, t}) => (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: r.x - 30,
                width: r.w + 60,
                top: r.y + r.h + 14,
                textAlign: 'center',
                fontFamily: INTER,
                fontWeight: 500,
                fontSize: 26,
                color: C.grey,
                whiteSpace: 'nowrap',
                opacity: out,
              }}
            >
              {t}
            </div>
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
