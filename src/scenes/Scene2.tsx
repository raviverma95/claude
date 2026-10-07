import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CartPage, cartLayout, CART_H} from '../components/CartPage';
import {Cursor} from '../components/ui';
import {C, clamp, ease, POPPINS, RADIUS, SHADOW} from '../theme';

const START = 135;
const REPEATS = [140, 182, 224];
const CARD = {x: 420, y: 320, w: 1080};
const STRIP = 60;
const TAB = {x: 18, w: 280};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const Scene2: React.FC = () => {
  const f = useCurrentFrame() + START;
  const L = cartLayout(CARD.w);
  const pillC = {x: CARD.x + L.pill.x + L.pill.w / 2, y: CARD.y + STRIP + L.pill.y + L.pill.h / 2};
  const closeX = {x: CARD.x + TAB.x + TAB.w - 30, y: CARD.y + STRIP / 2 + 4};
  const rest = {x: 1180, y: 900};

  // Which repeat are we in?
  let r = -1;
  REPEATS.forEach((s, i) => {
    if (f >= s) r = i;
  });
  const t = r >= 0 ? f - REPEATS[r] : -1;

  let pageOpacity = 0.4;
  let tabX = CARD.w;
  let tabScale = 1;
  let pillScale = 1;
  let pillShake = 0;
  let cursor = rest;
  let press = 0;

  if (r >= 0 && t < 42) {
    const glideEnd = 20 - 2 * r;
    const toCloseEnd = 34 - 2 * r;
    tabX = ease(t, [0, 8], [CARD.w, TAB.x], Easing.out(Easing.cubic));
    pageOpacity = t < 34 ? ease(t, [0, 8], [0.4, 1]) : ease(t, [34, 40], [1, 0.4]);
    tabScale = ease(t, [34, 40], [1, 0], Easing.in(Easing.cubic));
    const from = r === 0 ? rest : closeX;
    if (t < 8) cursor = from;
    else if (t < glideEnd) {
      const p = ease(t, [8, glideEnd], [0, 1]);
      cursor = {x: lerp(from.x, pillC.x - 30, p), y: lerp(from.y, pillC.y + 10, p)};
    } else if (t < 24) cursor = {x: pillC.x - 30, y: pillC.y + 10};
    else {
      const p = ease(t, [24, toCloseEnd], [0, 1]);
      cursor = {x: lerp(pillC.x - 30, closeX.x, p), y: lerp(pillC.y + 10, closeX.y, p)};
    }
    pillScale = t < glideEnd ? ease(t, [glideEnd - 6, glideEnd], [1, 1.15]) : ease(t, [24, 30], [1.15, 1]);
    pillShake = t >= glideEnd && t < 24 ? 4 * Math.sin(((t - glideEnd) / (24 - glideEnd)) * Math.PI * 4) : 0;
    press = interpolate(t, [33, 34, 36], [0, 1, 0], clamp);
  } else if (r === 2) {
    cursor = closeX;
  }

  const toGrey = ease(f, [264, 270], [0, 1]);

  return (
    <AbsoluteFill style={{background: C.white}}>
      {/* Payday tiles */}
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40, perspective: 900}}>
        {REPEATS.map((s, i) => {
          const rot = ease(f, [s, s + 8], [90, 0], Easing.out(Easing.back(1.4)));
          return (
            <div
              key={i}
              style={{
                width: 250,
                height: 180,
                borderRadius: RADIUS,
                background: C.white,
                boxShadow: SHADOW,
                border: '2px solid #ECEDEC',
                overflow: 'hidden',
                transform: `rotateX(${rot}deg)`,
                transformOrigin: '50% 0%',
                opacity: f >= s ? 1 : 0,
              }}
            >
              <div style={{height: 46, background: C.ink, display: 'flex', justifyContent: 'center', gap: 70, alignItems: 'center'}}>
                <div style={{width: 14, height: 14, borderRadius: 7, background: C.grey}} />
                <div style={{width: 14, height: 14, borderRadius: 7, background: C.grey}} />
              </div>
              <div
                style={{
                  height: 134,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: POPPINS,
                  fontWeight: 700,
                  fontSize: 44,
                  color: C.ink,
                }}
              >
                Payday
              </div>
            </div>
          );
        })}
      </div>
      {/* Laptop card */}
      <div
        style={{
          position: 'absolute',
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: STRIP + CART_H,
          borderRadius: RADIUS,
          overflow: 'hidden',
          boxShadow: SHADOW,
          border: '2px solid #ECEDEC',
          background: C.white,
        }}
      >
        <div style={{height: STRIP, background: '#E3E5E3', position: 'relative'}}>
          <div
            style={{
              position: 'absolute',
              left: tabX,
              top: 12,
              width: TAB.w,
              height: STRIP - 12,
              background: C.white,
              borderRadius: '16px 16px 0 0',
              transform: `scaleX(${tabScale})`,
              transformOrigin: '0 50%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              gap: 12,
            }}
          >
            <div style={{width: 18, height: 18, borderRadius: 5, background: '#C9CCCA'}} />
            <div style={{flex: 1, height: 14, borderRadius: 7, background: '#DADDDB'}} />
            <svg width={22} height={22} viewBox="0 0 22 22">
              <path d="M5 5 L17 17 M17 5 L5 17" stroke={C.grey} strokeWidth={2.6} strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div style={{opacity: pageOpacity}}>
          <CartPage W={CARD.w} pillScale={pillScale} pillShake={pillShake} />
        </div>
      </div>
      <Cursor x={cursor.x} y={cursor.y} press={press} />
      <AbsoluteFill style={{background: C.grey, opacity: toGrey}} />
    </AbsoluteFill>
  );
};
