import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CartPage, cartLayout} from '../components/CartPage';
import {OmarBust} from '../components/characters';
import {Cursor} from '../components/ui';
import {useReel} from '../layout';
import {C, clamp, ease, enter, POPPINS, springAt} from '../theme';

const START = 0;
// Landscape: Omar left third, laptop right. Reel: both tightened into the centre square.
const LAYOUTS = {
  landscape: {card: {x: 820, y: 250, w: 680}, omar: {left: 370, top: 300, w: 480}, base: {extra: 140, left: -56}},
  reel: {card: {x: 832, y: 268, w: 620}, omar: {left: 405, top: 390, w: 420}, base: {extra: 68, left: -20}},
};

export const Scene1: React.FC = () => {
  const f = useCurrentFrame() + START;
  const {card: CARD, omar, base} = LAYOUTS[useReel() ? 'reel' : 'landscape'];
  const fadeIn = interpolate(f, [0, 20], [0, 1], clamp);
  const push = ease(f, [20, 135], [1, 1.06], Easing.inOut(Easing.quad));
  const blink = (f >= 60 && f < 63) || (f >= 118 && f < 121) ? 1 : 0;

  const months = Math.max(1, Math.min(8, Math.floor((f - 40) / 8)));
  const landed = springAt(f, 104, {damping: 8, stiffness: 220, mass: 0.6});
  const tick = f >= 40 ? springAt(f, 40 + Math.max(0, months - 1) * 8 + 8, {damping: 12, stiffness: 300, mass: 0.4}) : 0;
  const counterScale = f >= 104 ? 1 + 0.18 * Math.sin(Math.min(1, landed) * Math.PI) : 1 + 0.06 * (1 - tick);

  const L = cartLayout(CARD.w);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{opacity: fadeIn, transform: `scale(${push})`}}>
        <AbsoluteFill
          style={{background: 'radial-gradient(ellipse 900px 620px at 58% 52%, rgba(170,196,232,0.30), rgba(17,16,16,0) 70%)'}}
        />
        {/* Omar */}
        <svg
          width={omar.w}
          height={(omar.w * 790) / 480}
          viewBox="-170 -120 340 560"
          style={{position: 'absolute', left: omar.left, top: omar.top}}
        >
          <OmarBust tee={C.grey} blink={blink} pale={1} chinHand />
        </svg>
        {/* Laptop */}
        <div style={{position: 'absolute', left: CARD.x, top: CARD.y, ...enter(f, 4)}}>
          <div
            style={{
              width: CARD.w + 28,
              padding: 14,
              background: '#1E1E1E',
              borderRadius: 30,
              boxShadow: '0 0 120px rgba(170,196,232,0.35)',
            }}
          >
            <div style={{borderRadius: 18, overflow: 'hidden', position: 'relative'}}>
              <CartPage
                W={CARD.w}
                counter={
                  f >= 40 ? (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 18px',
                        borderRadius: 24,
                        background: C.ink,
                        color: C.white,
                        fontFamily: POPPINS,
                        fontWeight: 700,
                        fontSize: 28,
                        transform: `scale(${counterScale})`,
                        opacity: interpolate(f, [40, 44], [0, 1], clamp),
                      }}
                    >
                      {months} {months === 1 ? 'month' : 'months'}
                    </span>
                  ) : null
                }
              />
              <Cursor x={L.checkout.x + 190} y={L.checkout.y + 46} />
            </div>
          </div>
          <div
            style={{
              margin: '0 auto',
              width: CARD.w + base.extra,
              marginLeft: base.left,
              height: 26,
              background: '#2A2A2A',
              borderRadius: '0 0 24px 24px',
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
