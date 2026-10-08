import {createContext, useContext} from 'react';

/**
 * Scenes are drawn on a 1920 x 1080 canvas. In the reel, only the centre
 * square (x 420-1500) is shown, so scenes that would be clipped switch to a
 * layout that fits that square.
 */
export type Layout = 'landscape' | 'reel';
export const LayoutContext = createContext<Layout>('landscape');
export const useReel = () => useContext(LayoutContext) === 'reel';

/** Left edge of the centre square on the 1920 canvas. */
export const SQUARE_X = 420;
