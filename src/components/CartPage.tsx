import React from 'react';
import {C, INTER, POPPINS} from '../theme';
import {GenericCamera} from './characters';

/** Plain grey cart page of an unnamed store. Fixed geometry so cursors can target it. */
export const CART_H = 520;
export const cartLayout = (W: number) => ({
  pill: {x: W - 294, y: 258, w: 230, h: 64},
  checkout: {x: W - 320, y: 418, w: 280, h: 76},
});

export const CartPage: React.FC<{
  W: number;
  counter?: React.ReactNode;
  pillScale?: number;
  pillShake?: number;
}> = ({W, counter, pillScale = 1, pillShake = 0}) => {
  const L = cartLayout(W);
  const abs = (x: number, y: number, w: number, h: number): React.CSSProperties => ({
    position: 'absolute',
    left: x,
    top: y,
    width: w,
    height: h,
  });
  return (
    <div style={{position: 'relative', width: W, height: CART_H, background: C.white}}>
      {/* store bar */}
      <div style={{...abs(0, 0, W, 70), background: '#ECEDEC'}} />
      <div style={{...abs(40, 22, 110, 26), background: '#C9CCCA', borderRadius: 8}} />
      <div style={{...abs(180, 18, W * 0.42, 34), background: C.white, borderRadius: 17}} />
      {/* title */}
      <div style={{...abs(40, 92, 600, 50), fontFamily: POPPINS, fontWeight: 700, fontSize: 40, color: C.ink}}>
        Your cart
      </div>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 150,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 26,
          color: C.grey,
        }}
      >
        In your cart since February
        {counter}
      </div>
      {/* item row */}
      <div style={{...abs(40, 214, W - 80, 152), border: '2px solid #E4E6E4', borderRadius: 20}} />
      <div style={{...abs(62, 234, 140, 112), background: '#F1F2F1', borderRadius: 14}}>
        <svg width={140} height={112} viewBox="-110 -90 220 176">
          <GenericCamera />
        </svg>
      </div>
      <div style={{...abs(228, 254, Math.min(W * 0.22, W - 546), 22), background: '#D5D8D6', borderRadius: 11}} />
      <div style={{...abs(228, 292, W * 0.14, 18), background: '#E4E6E4', borderRadius: 9}} />
      <div
        style={{
          ...abs(L.pill.x, L.pill.y, L.pill.w, L.pill.h),
          background: '#F0F1F0',
          borderRadius: 32,
          border: '2px solid #DADDDB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateX(${pillShake}px) scale(${pillScale})`,
        }}
      >
        <span style={{fontFamily: POPPINS, fontWeight: 700, fontSize: 32, color: C.ink, filter: 'blur(6px)'}}>
          AED 3,349.00
        </span>
      </div>
      {/* subtotal + checkout */}
      <div style={{...abs(40, 422, 180, 22), background: '#E4E6E4', borderRadius: 11}} />
      <div style={{...abs(40, 458, 120, 18), background: '#ECEDEC', borderRadius: 9}} />
      <div
        style={{
          ...abs(L.checkout.x, L.checkout.y, L.checkout.w, L.checkout.h),
          background: '#C9CCCA',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 28,
          color: C.white,
        }}
      >
        Checkout
      </div>
    </div>
  );
};
