import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {OmarBust} from '../components/characters';
import {BrowserFrame, Cursor, Shot, Words} from '../components/ui';
import {PRICE_BOX, PRODUCT_NAME, PRODUCT_PHOTO, PRODUCT_PRICE, PRODUCT_SHOT_H} from '../data';
import {C, clamp, ease, enter, exitAt, INTER, POPPINS, RADIUS, SHADOW, springAt} from '../theme';

const START = 465;
const BUBBLE = {x: 650, y: 250, w: 620};
const FRAME_W = 860;
const FRAME_H = Math.round((FRAME_W * PRODUCT_SHOT_H) / 1440);
const FRAME = {x: 150, y: 540 - (FRAME_H + 56) / 2, w: FRAME_W, h: FRAME_H + 56};
const MESSAGE = 'Bro. Check this one.';

export const Scene4: React.FC = () => {
  const f = useCurrentFrame() + START;

  // Bubble pops with overshoot 0 -> 1.08 -> 1
  const pop = interpolate(f, [465, 474, 480], [0, 1.08, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const typed = MESSAGE.slice(0, Math.max(0, Math.floor((f - 478) / 2)));
  const preview = springAt(f, 500);
  const bubbleExit = exitAt(f, 522);

  // Card -> browser frame (shared element), 14 frames from f520
  const cardRect = {x: BUBBLE.x + 28, y: BUBBLE.y + 236, w: BUBBLE.w - 56, h: 190};
  const ex = ease(f, [521, 535], [0, 1], Easing.inOut(Easing.cubic));
  const rect = {
    x: cardRect.x + (FRAME.x - cardRect.x) * ex,
    y: cardRect.y + (FRAME.y - cardRect.y) * ex,
    w: cardRect.w + (FRAME.w - cardRect.w) * ex,
    h: cardRect.h + (FRAME.h - cardRect.h) * ex,
  };

  // Cursor taps the card at f520
  const cur = {
    x: ease(f, [503, 518], [1240, cardRect.x + 380]),
    y: ease(f, [503, 518], [900, cardRect.y + 120]),
  };
  const press = interpolate(f, [518, 520, 523], [0, 1, 0], clamp);

  // Price ring + zoom
  const ring = ease(f, [534, 554], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1 + 0.2 * springAt(f, 540);

  // Background wipe grey -> white
  const wipe = ease(f, [575, 612], [0, 1], Easing.inOut(Easing.cubic));
  const edge = wipe * 2120 - 100;

  const [currency, amount] = [PRODUCT_PRICE.split(' ')[0], PRODUCT_PRICE.split(' ').slice(1).join(' ')];
  const pip = f >= 555 && f < 575;

  return (
    <AbsoluteFill style={{background: C.grey}}>
      {/* wipe */}
      {wipe > 0 && (
        <>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: Math.max(0, edge), background: C.white}} />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: edge,
              width: 100,
              background: `linear-gradient(90deg, ${C.greenTint}, rgba(233,244,236,0))`,
            }}
          />
        </>
      )}

      {/* Chat bubble */}
      {f < 532 && (
        <div
          style={{
            position: 'absolute',
            left: BUBBLE.x,
            top: BUBBLE.y,
            width: BUBBLE.w,
            transform: `scale(${pop}) translateY(${bubbleExit.y}px)`,
            transformOrigin: '20% 100%',
            opacity: bubbleExit.opacity,
          }}
        >
          <div
            style={{
              background: C.green,
              borderRadius: '36px 36px 36px 10px',
              padding: '26px 28px 30px',
              boxShadow: '0 20px 50px rgba(17,16,16,0.22)',
              minHeight: 200 + 200 * preview,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  background: C.greenTint,
                  color: C.green,
                  fontFamily: POPPINS,
                  fontWeight: 800,
                  fontSize: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                F
              </div>
              <div style={{fontFamily: POPPINS, fontWeight: 700, fontSize: 34, color: C.white}}>Faisal</div>
            </div>
            <div style={{fontFamily: INTER, fontWeight: 500, fontSize: 44, color: C.white, marginTop: 22, height: 56}}>
              {typed}
              {typed.length < MESSAGE.length && f >= 478 && (f % 10 < 5) && <span style={{opacity: 0.8}}>|</span>}
            </div>
          </div>
        </div>
      )}

      {/* Link preview card that grows into the browser frame */}
      {f >= 500 && (
        <div
          style={{
            position: 'absolute',
            left: rect.x,
            top: rect.y + (1 - preview) * 60,
            width: rect.w,
            height: rect.h,
            opacity: Math.min(1, preview * 1.5),
            borderRadius: RADIUS,
            overflow: 'hidden',
            background: C.white,
            boxShadow: SHADOW,
          }}
        >
          {ex < 1 && (
            <div style={{position: 'absolute', inset: 0, display: 'flex', gap: 22, padding: 18, opacity: 1 - ex * 2.5}}>
              <div style={{width: 170, height: 154, borderRadius: 18, overflow: 'hidden', position: 'relative', flexShrink: 0, background: C.white}}>
                <Img
                  src={staticFile('screens/product.png')}
                  style={{
                    position: 'absolute',
                    width: 1440 * (170 / PRODUCT_PHOTO.w),
                    left: -PRODUCT_PHOTO.x * (170 / PRODUCT_PHOTO.w),
                    top: -PRODUCT_PHOTO.y * (170 / PRODUCT_PHOTO.w) + 4,
                  }}
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8}}>
                <div style={{fontFamily: INTER, fontWeight: 500, fontSize: 26, color: C.green}}>buytech.ae</div>
                <div style={{fontFamily: POPPINS, fontWeight: 700, fontSize: 28, lineHeight: 1.2, color: C.ink}}>
                  {PRODUCT_NAME}
                </div>
              </div>
            </div>
          )}
          {ex > 0 && (
            <div style={{position: 'absolute', left: 0, top: 0, opacity: interpolate(ex, [0.3, 0.8], [0, 1], clamp)}}>
              <BrowserFrame width={rect.w} height={rect.h - 56}>
                <Shot src="screens/product.png" width={rect.w}>
                  {/* zoomed price */}
                  {f >= 540 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: PRICE_BOX.x,
                        top: PRICE_BOX.y,
                        width: PRICE_BOX.w,
                        height: PRICE_BOX.h,
                        overflow: 'hidden',
                        background: C.white,
                        transform: `scale(${zoom})`,
                        borderRadius: 10,
                        boxShadow: `0 10px 30px rgba(17,16,16,${0.18 * (zoom - 1) * 5})`,
                      }}
                    >
                      <Img src={staticFile('screens/product.png')} style={{position: 'absolute', width: 1440, left: -PRICE_BOX.x, top: -PRICE_BOX.y}} />
                    </div>
                  )}
                  <svg width={1440} height={PRODUCT_SHOT_H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                    <rect
                      x={PRICE_BOX.x - 26}
                      y={PRICE_BOX.y - 22}
                      width={PRICE_BOX.w + 52}
                      height={PRICE_BOX.h + 44}
                      rx={50}
                      fill="none"
                      stroke={C.green}
                      strokeWidth={8}
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={1 - ring}
                      opacity={ring > 0 ? 1 : 0}
                      transform={`rotate(-2 ${PRICE_BOX.x + PRICE_BOX.w / 2} ${PRICE_BOX.y + PRICE_BOX.h / 2})`}
                    />
                  </svg>
                </Shot>
              </BrowserFrame>
            </div>
          )}
        </div>
      )}
      {f >= 503 && f < 532 && <Cursor x={cur.x} y={cur.y} press={press} opacity={interpolate(f, [526, 531], [1, 0], clamp)} />}

      {/* Price column */}
      {f >= 534 && (
        <div style={{position: 'absolute', left: 1060, top: 300, width: 440}}>
          <div style={{fontFamily: POPPINS, fontWeight: 700, fontSize: 40, color: C.ink, ...enter(f, 536)}}>Same camera.</div>
          <div style={{fontFamily: POPPINS, fontWeight: 800, color: C.ink, lineHeight: 1, marginTop: 18, ...enter(f, 541)}}>
            <div style={{fontSize: 52}}>{currency}</div>
            <div style={{fontSize: 88, letterSpacing: -2}}>{amount}</div>
          </div>
          <Words
            text="A price that finally makes sense."
            frame={f}
            start={556}
            style={{fontFamily: POPPINS, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: C.green, marginTop: 30}}
          />
        </div>
      )}

      {/* Omar, picture in picture */}
      {pip && (
        <div
          style={{
            position: 'absolute',
            left: 440,
            top: 690,
            width: 300,
            height: 320,
            borderRadius: RADIUS,
            overflow: 'hidden',
            background: C.greenTint,
            boxShadow: '0 20px 50px rgba(17,16,16,0.25)',
            border: `6px solid ${C.white}`,
          }}
        >
          <svg width={300} height={320} viewBox="-150 -110 300 320">
            <OmarBust
              tee={C.grey}
              brow={ease(f, [557, 563], [0, 8])}
              smile={ease(f, [559, 567], [0, 1])}
            />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
