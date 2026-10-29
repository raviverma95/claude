import {createContext, useContext} from 'react';

/**
 * The ad renders in two formats from the same scenes and timings:
 * 'vertical' (1080 x 1920, the master) and 'wide' (1920 x 1080, YouTube HD).
 * Scenes read the format and pick the matching layout.
 */
export type Format = 'vertical' | 'wide';
export const FormatContext = createContext<Format>('vertical');
export const useWide = () => useContext(FormatContext) === 'wide';

/** Wide frame: brand guideline sizes x 0.6 for captions and small text; headlines a little larger. */
export const WIDE = {
  w: 1920,
  h: 1080,
  left: 120, // text column
  colW: 880,
  captionBottom: 1080 - 64,
  captionSize: 38,
  headline: 76,
};
