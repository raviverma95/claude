import React from 'react';
import {useReel} from '../layout';
import {BeachView} from './views';

const PHOTOS = {
  landscape: {w: 1720, h: 968, border: 24},
  reel: {w: 920, h: 940, border: 22}, // near-square so it still reads as a framed print
};

export const usePhoto = () => PHOTOS[useReel() ? 'reel' : 'landscape'];

/** The sharp Kite Beach photo: golden hour, Layla mid-jump. */
export const FinalPhoto: React.FC = () => {
  const {w, h, border} = usePhoto();
  const k = h / 968;
  return (
    <div
      style={{
        width: w,
        height: h,
        border: `${border}px solid #fff`,
        boxShadow: '0 30px 80px rgba(17,16,16,0.25)',
        background: '#fff',
      }}
    >
      <BeachView w={w} h={h} golden frame={884} layla={{x: w * 0.65, pose: 'jump', phase: 0, scale: 1.45 * k, lift: 90 * k}} />
    </div>
  );
};
