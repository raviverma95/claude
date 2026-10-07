import React from 'react';
import {BeachView} from './views';

export const PHOTO = {w: 1720, h: 968, border: 24};

/** The sharp Kite Beach photo: golden hour, Layla mid-jump. */
export const FinalPhoto: React.FC = () => (
  <div
    style={{
      width: PHOTO.w,
      height: PHOTO.h,
      border: `${PHOTO.border}px solid #fff`,
      boxShadow: '0 30px 80px rgba(17,16,16,0.25)',
      background: '#fff',
    }}
  >
    <BeachView
      w={PHOTO.w}
      h={PHOTO.h}
      golden
      frame={884}
      layla={{x: 1120, pose: 'jump', phase: 0, scale: 1.45, lift: 90}}
    />
  </div>
);
