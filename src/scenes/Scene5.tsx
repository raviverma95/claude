import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Icon, IconName} from '../components/characters';
import {BrowserFrame, Shot} from '../components/ui';
import {ADD_TO_CART, COLLECTION_CARDS} from '../data';
import {C, clamp, ease, INTER, POPPINS, RADIUS, SHADOW, springAt} from '../theme';

const START = 615;
const FW = 1000;
const FH = Math.round((FW * 900) / 1440);
const K = FW / 1440; // display px per screenshot px

const CHIPS: {at: number; icon: IconName; title: string; sub?: string}[] = [
  {at: 640, icon: 'boxTick', title: 'Brand new, sealed'},
  {at: 690, icon: 'van', title: 'Express Delivery', sub: 'Free UAE delivery, next day'},
  {at: 745, icon: 'handCoin', title: 'Cash on Delivery', sub: 'Pay when it reaches you'},
];

/** Soft greenTint highlight sweeping over one product card. */
const Sweep: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => {
  if (p <= 0 || p >= 1) return null;
  const {w, h} = COLLECTION_CARDS;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 16}}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: w * 0.9,
          left: -w + p * w * 2.1,
          background: C.greenTint,
          opacity: 0.8,
          mixBlendMode: 'multiply',
          transform: 'skewX(-12deg)',
          borderRadius: 16,
        }}
      />
    </div>
  );
};

export const Scene5: React.FC = () => {
  const f = useCurrentFrame() + START;

  const homeScroll = ease(f, [618, 675], [0, 900 / K]);
  const toCollection = ease(f, [675, 689], [0, 1], Easing.inOut(Easing.cubic));
  const colScroll = ease(f, [692, 735], [0, 600 / K]);
  const toProduct = ease(f, [735, 749], [0, 1], Easing.inOut(Easing.cubic));
  const pulse = interpolate(f, [762, 780], [0, 1], clamp);
  const pressed = interpolate(f, [760, 762, 766], [0, 1, 0], clamp);

  const cards = COLLECTION_CARDS;
  const sweepOrder = [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ];

  const frameIn = springAt(f, 615);

  // Chip stack: each lands, earlier ones nudge up 12 px
  const landed = CHIPS.map((c) => springAt(f, c.at));
  const chipTop = 290;

  return (
    <AbsoluteFill style={{background: C.white}}>
      <div
        style={{
          position: 'absolute',
          left: 560 - 520,
          top: 540 - 520,
          width: 1040,
          height: 1040,
          borderRadius: 520,
          background: C.greenTint,
          transform: `scale(${0.85 + 0.15 * frameIn})`,
        }}
      />
      <div style={{position: 'absolute', left: 70, top: 540 - (FH + 56) / 2, perspective: 1800}}>
        <div style={{transform: `rotateY(-6deg) rotateZ(-1deg)`, transformOrigin: '0% 50%'}}>
          <BrowserFrame width={FW} height={FH}>
            {/* home */}
            {toCollection < 1 && (
              <div style={{position: 'absolute', inset: 0, transform: `translateX(${-toCollection * FW}px)`}}>
                <Shot src="screens/home.png" width={FW} scroll={homeScroll} />
              </div>
            )}
            {/* collection */}
            {toCollection > 0 && toProduct < 1 && (
              <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - toCollection) * FW - toProduct * FW}px)`}}>
                <Shot src="screens/collection.png" width={FW} scroll={colScroll}>
                  {sweepOrder.map(([c, r], i) => (
                    <Sweep key={i} x={cards.xs[c]} y={cards.ys[r]} p={interpolate(f, [690 + i * 5, 702 + i * 5], [0, 1], clamp)} />
                  ))}
                </Shot>
              </div>
            )}
            {/* product */}
            {toProduct > 0 && (
              <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - toProduct) * FW}px)`}}>
                <Shot src="screens/product.png" width={FW}>
                  <div
                    style={{
                      position: 'absolute',
                      left: ADD_TO_CART.x,
                      top: ADD_TO_CART.y,
                      width: ADD_TO_CART.w,
                      height: ADD_TO_CART.h,
                      borderRadius: 25,
                      border: `${6 * (1 - pulse)}px solid ${C.green}`,
                      transform: `scale(${1 + pulse * 0.6})`,
                      opacity: pulse > 0 && pulse < 1 ? 1 - pulse : 0,
                      boxSizing: 'border-box',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: ADD_TO_CART.x,
                      top: ADD_TO_CART.y,
                      width: ADD_TO_CART.w,
                      height: ADD_TO_CART.h,
                      borderRadius: 25,
                      background: C.green,
                      opacity: 0.35 * pressed,
                    }}
                  />
                </Shot>
              </div>
            )}
          </BrowserFrame>
        </div>
      </div>

      {/* USP chips */}
      {CHIPS.map((c, i) => {
        if (f < c.at) return null;
        const s = landed[i];
        const nudge = landed.slice(i + 1).reduce((a, b) => a + b, 0) * 12;
        const top = chipTop + i * 172 - nudge;
        return (
          <div
            key={c.title}
            style={{
              position: 'absolute',
              left: 1100,
              top,
              width: 400,
              minHeight: 124,
              boxSizing: 'border-box',
              background: C.white,
              borderRadius: RADIUS,
              boxShadow: SHADOW + ', 0 1px 3px rgba(17,16,16,0.06)',
              padding: '22px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: interpolate(s, [0, 0.5], [0, 1], clamp),
              transform: `translateX(${(1 - s) * 80}px)`,
            }}
          >
            <Icon name={c.icon} size={56} progress={interpolate(f, [c.at + 6, c.at + 18], [0, 1], clamp)} />
            <div>
              <div style={{fontFamily: POPPINS, fontWeight: 700, fontSize: 30, color: C.ink, lineHeight: 1.15, whiteSpace: 'nowrap'}}>{c.title}</div>
              {c.sub && (
                <div style={{fontFamily: INTER, fontWeight: 500, fontSize: 26, color: C.grey, lineHeight: 1.25, marginTop: 4}}>{c.sub}</div>
              )}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
