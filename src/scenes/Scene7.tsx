import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';
import {Icon, IconName} from '../components/characters';
import {FinalPhoto, usePhoto} from '../components/FinalPhoto';
import {useReel} from '../layout';
import {Words} from '../components/ui';
import {C, clamp, ease, enter, INTER, POPPINS, RADIUS, SHADOW, springAt} from '../theme';

const START = 930;

const CARDS: {icon: IconName; title: string; sub: string}[] = [
  {icon: 'van', title: 'Express Delivery', sub: 'Free UAE delivery, next day'},
  {icon: 'handCoin', title: 'Cash on Delivery', sub: 'Pay when it reaches you'},
  {icon: 'chatSmile', title: 'Human Support', sub: 'WhatsApp a real person, not a bot'},
  {icon: 'returnBox', title: '15-Day Returns', sub: 'Full refund, no questions'},
];
// Landscape: 2 x 2 grid. Reel: one column, so each card has room to breathe.
const GRIDS = {
  landscape: {cols: 2, w: 520, h: 220, x: 420, y: 300, gap: 40},
  reel: {cols: 1, w: 900, h: 196, x: 510, y: 110, gap: 24},
};

// Logo geometry in the 1920 x 819 source PNG
const SRC_W = 1920;
const TILE = {x: 322, y: 263, w: 276, h: 276, r: 48};
const WORD = {x: 647, y: 305, w: 952, h: 236};
const BOWL = {cx: 436 - 322, cy: 432 - 263, r: 37};
const LOGO_W = 1597 - 322; // tile left edge to wordmark right edge

// Final lockup
const K = 760 / LOGO_W; // logo about 760 px wide
const LOGO_LEFT = 960 - 380;
const LOGO_TOP = 352;
const TILE_FINAL = {cx: LOGO_LEFT + (TILE.w / 2) * K, cy: LOGO_TOP + (TILE.h / 2) * K};
const BIG = 1.6; // tile scale while it is alone in the centre
const TILE_CENTRE = {cx: 960, cy: 500};

/** One crop of the logo PNG, in source pixels, placed with its top-left at (0,0). */
const LogoCrop: React.FC<{x: number; y: number; w: number; h: number; style?: React.CSSProperties}> = ({x, y, w, h, style}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', ...style}}>
    <Img src={staticFile('logo.png')} style={{position: 'absolute', left: -x, top: -y, width: SRC_W}} />
  </div>
);

export const Scene7: React.FC = () => {
  const f = useCurrentFrame() + START;
  const PHOTO = usePhoto();
  const GRID = GRIDS[useReel() ? 'reel' : 'landscape'];
  const {w: CARD_W, h: CARD_H} = GRID;

  /* ---------------- Part A ---------------- */
  const photoP = ease(f, [930, 952], [0, 1], Easing.inOut(Easing.cubic));
  const photoOpacity = interpolate(f, [944, 960], [1, 0], clamp);
  const merge = ease(f, [1020, 1035], [0, 1], Easing.inOut(Easing.cubic));
  const MERGE_SIZE = 0.76 * TILE.w * K * BIG;

  /* ---------------- Part B ---------------- */
  const tileGrow = interpolate(f, [1035, 1043, 1050], [0.76, 1.1, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const reveal = ease(f, [1050, 1066], [0, 1], Easing.inOut(Easing.cubic));
  const lens = ease(f, [1066, 1076], [0.6, 1], Easing.out(Easing.back(2)));
  const ringRot = ease(f, [1066, 1078], [0, 90]);
  const ringOpacity = interpolate(f, [1066, 1069, 1076, 1080], [0, 1, 1, 0], clamp);
  const flashP = interpolate(f, [1074, 1078], [0, 1], clamp);
  const slide = ease(f, [1078, 1100], [0, 1], Easing.inOut(Easing.cubic));
  const wordWipe = ease(f, [1080, 1100], [0, 1], Easing.inOut(Easing.quad));
  const breathe = ease(f, [1124, 1140], [1, 1.015], Easing.inOut(Easing.sin));
  const pill = springAt(f, 1110, {damping: 11, stiffness: 160, mass: 0.7});

  const tileScale = K * (BIG + (1 - BIG) * slide) * (f < 1050 ? tileGrow : 1);
  const tileCx = TILE_CENTRE.cx + (TILE_FINAL.cx - TILE_CENTRE.cx) * slide;
  const tileCy = TILE_CENTRE.cy + (TILE_FINAL.cy - TILE_CENTRE.cy) * slide;

  return (
    <AbsoluteFill style={{background: C.white}}>
      {/* The photo from scene 6 shrinks away */}
      {f < 960 && (
        <div
          style={{
            position: 'absolute',
            left: (1920 - PHOTO.w) / 2 - PHOTO.border,
            top: (1080 - PHOTO.h) / 2 - PHOTO.border,
            transform: `translateY(${-360 * photoP}px) rotate(${2 - 2 * photoP}deg) scale(${1.04 - 0.74 * photoP})`,
            opacity: photoOpacity,
          }}
        >
          <FinalPhoto />
        </div>
      )}

      {/* Four USP cards */}
      {f < 1036 &&
        CARDS.map((c, i) => {
          const start = 945 + i * 6;
          if (f < start) return null;
          const col = i % GRID.cols;
          const row = Math.floor(i / GRID.cols);
          const x0 = GRID.x + col * (CARD_W + GRID.gap);
          const y0 = GRID.y + row * (CARD_H + GRID.gap);
          const size = MERGE_SIZE;
          const x = x0 + (TILE_CENTRE.cx - size / 2 - x0) * merge;
          const y = y0 + (TILE_CENTRE.cy - size / 2 - y0) * merge;
          const w = CARD_W + (size - CARD_W) * merge;
          const h = CARD_H + (size - CARD_H) * merge;
          const e = enter(f, start);
          return (
            <div
              key={c.title}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: w,
                height: h,
                boxSizing: 'border-box',
                borderRadius: RADIUS + (TILE.r * K * BIG * 0.76 - RADIUS) * merge,
                background: interpolateColors(merge, [0, 0.6], [C.white, C.green]),
                boxShadow: merge < 0.6 ? SHADOW + ', 0 1px 3px rgba(17,16,16,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '0 34px',
                overflow: 'hidden',
                ...e,
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 24, opacity: interpolate(merge, [0, 0.35], [1, 0], clamp)}}>
                <Icon name={c.icon} size={84} progress={interpolate(f, [start + 10, start + 22], [0, 1], clamp)} />
                <div style={{width: CARD_W - 34 * 2 - 84 - 24}}>
                  <div style={{fontFamily: POPPINS, fontWeight: 700, fontSize: 40, color: C.ink, lineHeight: 1.15, letterSpacing: -0.5, whiteSpace: 'nowrap'}}>
                    {c.title}
                  </div>
                  <div style={{fontFamily: INTER, fontWeight: 500, fontSize: 26, color: C.grey, lineHeight: 1.3, marginTop: 6}}>{c.sub}</div>
                </div>
              </div>
            </div>
          );
        })}

      {/* Logo lockup */}
      {f >= 1035 && (
        <AbsoluteFill style={{transform: `scale(${breathe})`, transformOrigin: '960px 540px'}}>
          {/* wordmark, revealed left to right from behind the tile */}
          {f >= 1080 && (
            <div
              style={{
                position: 'absolute',
                left: LOGO_LEFT + (WORD.x - TILE.x) * K,
                top: LOGO_TOP + (WORD.y - TILE.y) * K,
                width: WORD.w,
                height: WORD.h,
                transform: `scale(${K})`,
                transformOrigin: '0 0',
                clipPath: `inset(0 ${(1 - wordWipe) * 100}% 0 0)`,
              }}
            >
              <LogoCrop {...WORD} />
            </div>
          )}

          {/* tile */}
          <div
            style={{
              position: 'absolute',
              left: tileCx - TILE.w / 2,
              top: tileCy - TILE.h / 2,
              width: TILE.w,
              height: TILE.h,
              transform: `scale(${tileScale})`,
              borderRadius: TILE.r,
              overflow: 'hidden',
            }}
          >
            <div style={{position: 'absolute', inset: 0, background: C.green}} />
            {reveal > 0 && <LogoCrop {...TILE} style={{clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)`}} />}
            {f >= 1066 && f < 1082 && (
              <svg width={TILE.w} height={TILE.h} style={{position: 'absolute', inset: 0}}>
                <circle cx={BOWL.cx} cy={BOWL.cy} r={BOWL.r + 1} fill={C.white} />
                <circle cx={BOWL.cx} cy={BOWL.cy} r={(BOWL.r + 1) * lens} fill={C.green} />
                <circle
                  cx={BOWL.cx}
                  cy={BOWL.cy}
                  r={BOWL.r * 0.7 * lens}
                  fill="none"
                  stroke={C.white}
                  strokeWidth={4}
                  strokeDasharray="22 12"
                  strokeLinecap="round"
                  opacity={ringOpacity}
                  transform={`rotate(${ringRot} ${BOWL.cx} ${BOWL.cy})`}
                />
              </svg>
            )}
            {flashP > 0 && flashP < 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: -60,
                  bottom: -60,
                  width: 90,
                  left: -120 + flashP * (TILE.w + 240),
                  background: 'rgba(255,255,255,0.85)',
                  transform: 'skewX(-20deg)',
                  filter: 'blur(6px)',
                }}
              />
            )}
          </div>

          {/* tagline + url pill */}
          <Words
            text="Great shots, minus the big price tag."
            frame={f}
            start={1100}
            gap={2}
            style={{
              position: 'absolute',
              top: LOGO_TOP + TILE.h * K + 44,
              left: 0,
              right: 0,
              justifyContent: 'center',
              fontFamily: POPPINS,
              fontWeight: 700,
              fontSize: 44,
              color: C.ink,
            }}
          />
          {f >= 1110 && (
            <div style={{position: 'absolute', top: LOGO_TOP + TILE.h * K + 136, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <div
                style={{
                  background: C.green,
                  color: C.white,
                  fontFamily: POPPINS,
                  fontWeight: 700,
                  fontSize: 36,
                  padding: '14px 44px',
                  borderRadius: 40,
                  boxShadow: '0 12px 30px rgba(64,148,85,0.30)',
                  transform: `scale(${pill})`,
                  opacity: Math.min(1, pill * 2),
                }}
              >
                buytech.ae
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
