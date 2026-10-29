import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile} from 'remotion';
import {phraseAt} from './captions';
import {clamp, ease, pop, POPPINS, S, SAFE, SAFE_CX, SAFE_W, sec, textIn} from './brand';
import {Chip, Headline, LogoSting, PhoneFrame, Photo, Underlined} from './components';
import {PHONE, PRICE, PRICE_PLACEHOLDER, ROUTE, URL} from './data';
import {AusMap, Box, BoxBody, BoxStyle, Cab, Car, City, House, Wheel} from './drawings';
import {useWide, WIDE} from './format';

/** Text column used by the wide (1920 x 1080) layouts. */
const COL = {left: WIDE.left, width: WIDE.colW};

const white: React.CSSProperties = {background: S.white};

// Key beats, all derived from the measured voiceover
const PRICE_AT = sec(phraseAt(5, 'instantly')) + 22;
const MAP_AT = sec(30.75);
const BRISBANE = sec(phraseAt(7, 'Brisbane'));
const ROUTE_AT = {Sydney: MAP_AT + 4, Brisbane: BRISBANE + 2, Perth: BRISBANE + 20, Hobart: BRISBANE + 36};
const COUNT_FROM = ROUTE_AT.Hobart + 12;
const STAT_LAND = COUNT_FROM + 18;

/** Frames at which the brand finger snap plays: logo sting, price reveal, 60+ stat, end card. */
export const SNAPS = {
  logo: sec(15.05),
  price: PRICE_AT,
  stat: STAT_LAND,
  end: sec(50.0),
  final: sec(53.4), // the music's final downbeat
};

/* Scene 5 (15.0-19.0 s): navy -> white wipe, logo sting. */
export const LogoReveal: React.FC<{f: number}> = ({f}) => {
  const start = sec(15.0);
  const wipe = ease(f, [start, start + 8], [0, 1], Easing.out(Easing.cubic));
  const breathe = interpolate(f, [start + 20, start + 120], [1, 1.03], clamp);
  const simple = sec(phraseAt(4, 'simple'));
  const wide = useWide();
  const logoW = wide ? 900 : 820;
  return (
    <AbsoluteFill style={{background: S.navy900}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${wipe * 100}%`, background: S.white}} />
      <div style={{position: 'absolute', left: (wide ? 960 : SAFE_CX) - logoW / 2, top: wide ? 200 : 520, transform: `scale(${breathe})`, transformOrigin: `${logoW / 2}px 110px`}}>
        <LogoSting frame={f} at={SNAPS.logo} width={logoW} />
      </div>
      <Headline
        frame={f}
        top={wide ? 520 : 860}
        align="center"
        {...(wide ? {left: 0, width: WIDE.w} : {})}
        lines={[
          {text: 'Keeps it', at: simple - 6, size: 110},
          {text: 'simple.', at: simple + 2, red: true, underline: true, size: 110},
        ]}
      />
    </AbsoluteFill>
  );
};

/* Scene 6 (19.0-25.0 s): the calculator. */
const SIZES = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom', '5 Bedroom'];

const Tap: React.FC<{f: number; at: number; x: number; y: number}> = ({f, at, x, y}) => {
  if (f < at - 6 || f > at + 12) return null;
  const p = interpolate(f, [at, at + 12], [0, 1], clamp);
  const arrive = interpolate(f, [at - 6, at], [0, 1], clamp);
  return (
    <>
      <div style={{position: 'absolute', left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 34, background: 'rgba(36,42,102,0.25)', opacity: arrive * (1 - p)}} />
      <div style={{position: 'absolute', left: x - 34 - p * 40, top: y - 34 - p * 40, width: 68 + p * 80, height: 68 + p * 80, borderRadius: '50%', border: `4px solid ${S.red500}`, opacity: (1 - p) * (f >= at ? 1 : 0)}} />
    </>
  );
};

export const Calculator: React.FC<{f: number}> = ({f}) => {
  const start = sec(19.0);
  const sizeTap = sec(phraseAt(5, 'home size')) + 26;
  const nextTap = start + 16;
  const step2 = nextTap + 4;
  const priceAt = PRICE_AT;
  const noCallbacks = sec(phraseAt(5, 'No callbacks'));
  const sw = 428; // screen width
  const type = (text: string, at: number) => text.slice(0, Math.max(0, Math.floor((f - at) / 1.2)));
  const slideTo2 = ease(f, [step2, step2 + 8], [0, 1]);
  const slideTo3 = ease(f, [priceAt - 4, priceAt + 4], [0, 1]);
  const priceIn = pop(f, priceAt, {damping: 11, stiffness: 240, mass: 0.6});
  const loading = f >= sizeTap + 4 && f < priceAt - 4;
  const wide = useWide();
  const size = wide ? 96 : 84;
  return (
    <AbsoluteFill style={white}>
      <Headline
        frame={f}
        top={wide ? 340 : 250}
        {...(wide ? COL : {})}
        lines={[
          {text: 'Instant price.', at: start + 6, size},
          {text: 'No callbacks.', at: noCallbacks, red: true, underline: true, size},
        ]}
      />
      <PhoneFrame x={wide ? 1180 : SAFE_CX - 230} y={wide ? 60 : 500} w={460} h={860}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120, borderBottom: `2px solid ${S.navy100}`, display: 'flex', alignItems: 'flex-end', padding: '0 24px 14px'}}>
          <Img src={staticFile('supercheap/logo.png')} style={{width: 210}} />
        </div>
        <div style={{position: 'absolute', left: 0, top: 122, width: sw * 3, height: 706, display: 'flex', transform: `translateX(${-(slideTo2 + slideTo3) * sw}px)`}}>
          {/* step 1: where */}
          <div style={{width: sw, padding: '36px 28px', boxSizing: 'border-box', fontFamily: POPPINS}}>
            <div style={{fontWeight: 800, fontSize: 36, color: S.navy700, lineHeight: 1.15}}>Where are you moving?</div>
            {[
              {label: 'Pickup', text: ROUTE.from, at: start},
              {label: 'Delivery', text: ROUTE.to, at: start + 6},
            ].map((fld) => (
              <div key={fld.label} style={{marginTop: 30}}>
                <div style={{fontWeight: 500, fontSize: 24, color: S.muted}}>{fld.label}</div>
                <div style={{marginTop: 8, border: `2px solid ${S.navy100}`, borderRadius: 16, padding: '18px 20px', fontWeight: 600, fontSize: 30, color: S.navy700, height: 40}}>
                  {type(fld.text, fld.at)}
                </div>
              </div>
            ))}
            <div style={{marginTop: 44, background: S.red500, color: S.white, borderRadius: 999, textAlign: 'center', padding: '20px 0', fontWeight: 700, fontSize: 32}}>Next →</div>
          </div>
          {/* step 2: home size */}
          <div style={{width: sw, padding: '36px 28px', boxSizing: 'border-box', fontFamily: POPPINS}}>
            <div style={{fontWeight: 800, fontSize: 36, color: S.navy700, lineHeight: 1.15}}>What size is your home?</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 30}}>
              {SIZES.map((s) => {
                const chosen = s === ROUTE.size && f >= sizeTap;
                return (
                  <div
                    key={s}
                    style={{
                      height: 110,
                      borderRadius: 20,
                      border: `3px solid ${chosen ? S.red500 : S.navy100}`,
                      background: chosen ? S.red100 : S.white,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 28,
                      color: S.navy700,
                      transform: chosen ? `scale(${1 + 0.05 * Math.max(0, 1 - (f - sizeTap) / 6)})` : undefined,
                    }}
                  >
                    {s}
                  </div>
                );
              })}
            </div>
            {loading && (
              <div style={{marginTop: 34, height: 14, borderRadius: 7, background: S.navy100, overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${interpolate(f, [sizeTap + 4, priceAt - 4], [5, 100], clamp)}%`, background: S.red500, borderRadius: 7}} />
              </div>
            )}
          </div>
          {/* step 3: price */}
          <div style={{width: sw, padding: '44px 28px', boxSizing: 'border-box', fontFamily: POPPINS, textAlign: 'center'}}>
            <div style={{fontWeight: 600, fontSize: 30, color: S.muted}}>Your price</div>
            <div style={{fontWeight: 800, fontSize: 88, color: S.red500, lineHeight: 1.15, marginTop: 6, transform: `scale(${0.7 + 0.3 * priceIn})`, opacity: Math.min(1, priceIn * 2)}}>
              {PRICE ?? PRICE_PLACEHOLDER}
            </div>
            <div style={{fontWeight: 500, fontSize: 26, color: S.navy700, marginTop: 10}}>
              {ROUTE.from.split(' ')[0]} → {ROUTE.to.split(' ')[0]} · {ROUTE.size}
            </div>
            <div style={{marginTop: 48, display: 'inline-flex', alignItems: 'center', gap: 12, background: S.surface, borderRadius: 999, padding: '16px 26px', fontWeight: 600, fontSize: 28, color: S.navy700, ...textIn(f, noCallbacks + 6)}}>
              <span style={{color: S.red500, fontWeight: 800}}>✓</span> No callback needed
            </div>
            <div style={{marginTop: 26, background: S.red500, color: S.white, borderRadius: 999, padding: '20px 0', fontWeight: 700, fontSize: 32, ...textIn(f, noCallbacks + 12)}}>Book now</div>
          </div>
        </div>
        <Tap f={f} at={nextTap} x={sw / 2} y={122 + 36 + 44 + 2 * 128 + 70} />
        <Tap f={f} at={sizeTap} x={sw * 0.27} y={122 + 36 + 44 + 30 + 110 + 16 + 55} />
      </PhoneFrame>
    </AbsoluteFill>
  );
};

/* Scene 7 (25.0-30.0 s): packed by trained, insured removalists. */
export const Insured: React.FC<{f: number}> = ({f}) => {
  const start = sec(25.0);
  const wide = useWide();
  return (
    <AbsoluteFill style={white}>
      {wide ? (
        <Photo src="supercheap/photos/boxes-crew.jpg" frame={f} from={start} to={start + 150} posY={22} zoom={[1.0, 1.06]} />
      ) : (
        <Photo src="supercheap/photos/boxes-crew.jpg" frame={f} from={start} to={start + 150} pan={[72, 84]} zoom={[1.02, 1.08]} />
      )}
      <div style={{position: 'absolute', left: wide ? WIDE.left : SAFE.left, top: wide ? 560 : 1060, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22}}>
        <Chip text="Fully insured" frame={f} at={sec(phraseAt(6, 'insured')) + 10} />
        <Chip text="Trained team" frame={f} at={sec(phraseAt(6, 'trained')) + 12} />
      </div>
    </AbsoluteFill>
  );
};

/* Scene 8 (30.0-35.0 s): branded truck, then the routes map and 60+. */
export const Routes: React.FC<{f: number}> = ({f}) => {
  const start = sec(30.0);
  const mapAt = MAP_AT;
  const routeAt: Record<Exclude<City, 'Melbourne'>, number> = ROUTE_AT;
  const countFrom = COUNT_FROM;
  const land = STAT_LAND;
  const n = Math.round(interpolate(f, [countFrom, land], [0, 60], {...clamp, easing: Easing.out(Easing.cubic)}));
  const statIn = textIn(f, countFrom - 2);
  const wide = useWide();
  if (f < mapAt) {
    return (
      <AbsoluteFill style={white}>
        {wide ? (
          <Photo src="supercheap/photos/truck-highway.jpg" frame={f} from={start} to={mapAt} posY={60} zoom={[1.0, 1.04]} pan={[60, 64]} />
        ) : (
          <Photo src="supercheap/photos/truck-highway.jpg" frame={f} from={start} to={mapAt} pan={[72, 79]} zoom={[1.0, 1.04]} />
        )}
      </AbsoluteFill>
    );
  }
  const routes: Partial<Record<City, number>> = {};
  const dots: Partial<Record<City, number>> = {Melbourne: pop(f, mapAt)};
  for (const [c, at] of Object.entries(routeAt) as [Exclude<City, 'Melbourne'>, number][]) {
    routes[c] = ease(f, [at, at + 14], [0, 1]);
    dots[c] = pop(f, at + 12);
  }
  return (
    <AbsoluteFill style={white}>
      <div style={{position: 'absolute', left: wide ? 960 : 80, top: wide ? 110 : 250}}>
        <AusMap routes={routes} dots={dots} land={ease(f, [mapAt, mapAt + 6], [0, 1])} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: wide ? WIDE.left : SAFE.left,
          top: wide ? 300 : 1030,
          display: 'flex',
          flexDirection: wide ? 'column' : 'row',
          alignItems: wide ? 'flex-start' : 'center',
          gap: wide ? 20 : 34,
          ...statIn,
        }}
      >
        <div style={{fontFamily: POPPINS, fontWeight: 800, fontSize: wide ? 260 : 220, lineHeight: 0.9, letterSpacing: -6, color: S.red500, transform: `scale(${f >= land ? interpolate(f, [land, land + 3, land + 8], [1, 1.08, 1], clamp) : 1})`, transformOrigin: 'left center'}}>
          {n}+
        </div>
        <div style={{fontFamily: POPPINS, fontWeight: 700, fontSize: wide ? 64 : 54, lineHeight: 1.1, color: S.navy700}}>
          interstate routes
          <br />
          across Australia
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Scene 9 (35.0-40.0 s): backloading. */
const SLOTS: [number, number][] = [];
for (let c = 0; c < 6; c++) for (let r = 0; r < 3; r++) SLOTS.push([700 - c * 110, 756 - r * 92]);
const MINE = 3;
const HOUSES: {x: number; kind: BoxStyle; door: string}[] = [
  {x: 230, kind: 'a', door: S.navy700},
  {x: 540, kind: 'b', door: S.red500},
];

export const Backloading: React.FC<{f: number}> = ({f}) => {
  const share = sec(phraseAt(8, 'Backloading'));
  const payLess = sec(phraseAt(8, 'pay less'));
  const flyers = SLOTS.slice(MINE, 15).map((slot, i) => {
    const house = HOUSES[i % 2];
    const at = share + 2 + i * 3.2;
    const p = ease(f, [at, at + 12], [0, 1], Easing.inOut(Easing.quad));
    const x = house.x + (slot[0] - house.x) * p;
    const y = 170 + (slot[1] - 170) * p - Math.sin(p * Math.PI) * 160;
    return {p, x, y, kind: house.kind, at};
  });
  const wide = useWide();
  return (
    <AbsoluteFill style={white}>
      <Headline
        frame={f}
        top={wide ? 360 : 250}
        {...(wide ? COL : {})}
        lines={[
          {text: 'Backloading =', at: share, size: wide ? 82 : 88},
          {text: 'Pay less', at: payLess, red: true, underline: true, size: wide ? 110 : 88},
        ]}
      />
      <svg width={1080} height={900} viewBox="0 0 1080 900" style={{position: 'absolute', left: wide ? 860 : 0, top: wide ? 40 : 520, overflow: 'visible'}}>
        {HOUSES.map((h) => (
          <g key={h.x} opacity={ease(f, [share - 6, share], [0, 1])}>
            <House x={h.x} y={110} door={h.door} />
          </g>
        ))}
        <BoxBody x={60} y={820} w={720} h={380} cutaway />
        <Cab x={780} y={820} />
        <Wheel x={170} y={826} />
        <Wheel x={290} y={826} />
        {SLOTS.slice(0, MINE).map(([x, y], i) => (
          <Box key={i} x={x} y={y} s={1} kind="mine" />
        ))}
        {flyers.map((b, i) => (f >= b.at ? <Box key={i} x={b.x} y={b.y} s={0.6 + 0.4 * b.p} kind={b.kind} rot={(1 - b.p) * 25} /> : null))}
        {/* a "you" tag on your boxes */}
        <g opacity={ease(f, [sec(35.3), sec(35.3) + 6], [0, 1])}>
          <rect x={556} y={548} width={176} height={58} rx={29} fill={S.red500} />
          <text x={644} y={588} textAnchor="middle" fontFamily={POPPINS} fontWeight={700} fontSize={32} fill={S.white}>
            Your stuff
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* Scene 10 (40.0-45.0 s): house + car, one booking. */
export const HouseAndCar: React.FC<{f: number}> = ({f}) => {
  const start = sec(40.0);
  const booking = sec(phraseAt(9, 'One booking'));
  const cut = sec(43.0);
  const deckY = 560;
  const groundY = 640;
  // car: drives in, up the ramp, onto the deck
  const cx = ease(f, [start + 4, start + 46], [-320, 210], Easing.inOut(Easing.cubic));
  const onRamp = interpolate(cx, [-30, 70], [0, 1], clamp);
  const cy = groundY + (deckY - groundY) * onRamp;
  const tilt = cx > -30 && cx < 70 ? -16 : 0;
  const wide = useWide();
  return (
    <AbsoluteFill style={white}>
      <Headline
        frame={f}
        top={wide ? 360 : 250}
        {...(wide ? COL : {})}
        lines={[
          {text: 'House + car.', at: start + 6, size: wide ? 96 : 88},
          {text: 'One booking.', at: booking, red: true, underline: true, size: wide ? 96 : 88},
        ]}
      />
      {f < cut ? (
        <svg width={1080} height={800} viewBox="0 0 1080 800" style={{position: 'absolute', left: wide ? 820 : 0, top: wide ? 130 : 560, overflow: 'visible'}}>
          <rect x={-40} y={groundY + 34} width={1160} height={8} rx={4} fill={S.navy100} />
          {/* car trailer with ramp */}
          <path d={`M-30 ${groundY + 30} L70 ${deckY + 30} L420 ${deckY + 30} L420 ${deckY + 52} L-30 ${groundY + 34} Z`} fill={S.navy700} />
          <rect x={410} y={deckY + 30} width={60} height={14} fill={S.navy700} />
          <Wheel x={300} y={groundY - 2} r={36} />
          {/* truck with branded box body */}
          <BoxBody x={470} y={groundY} w={380} h={330} />
          <Cab x={850} y={groundY} />
          <Wheel x={560} y={groundY + 4} />
          <Wheel x={760} y={groundY + 4} />
          <Car x={cx} y={cy} tilt={tilt} />
        </svg>
      ) : (
        <div
          style={{
            position: 'absolute',
            ...(wide ? {left: 1120, top: 80, width: 640, height: 790} : {left: SAFE_CX - 352, top: 520, width: 704, height: 840}),
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(22,26,66,0.22)',
          }}
        >
          <Photo src="supercheap/photos/people-4.jpg" frame={f} from={cut} to={cut + 60} zoom={[1.08, 1.0]} posY={45} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* Scene 11 (45.0-50.0 s): 10+ years, thousands of moves, real people. */
export const Proof: React.FC<{f: number}> = ({f}) => {
  const start = sec(45.0);
  const years = sec(phraseAt(10, 'Ten-plus'));
  const moves = sec(phraseAt(10, 'Thousands'));
  const people = sec(phraseAt(10, 'Real people'));
  const n = Math.round(interpolate(f, [years, years + 18], [0, 10], {...clamp, easing: Easing.out(Easing.cubic)}));
  const wide = useWide();
  const cards = [
    {src: 'people-1', x: wide ? 900 : 70, rot: -5},
    {src: 'people-2', x: wide ? 1215 : 385, rot: 2},
    {src: 'people-3', x: wide ? 1530 : 700, rot: -3},
  ];
  return (
    <AbsoluteFill style={white}>
      <div style={{position: 'absolute', left: wide ? WIDE.left : SAFE.left, top: wide ? 250 : 250, width: wide ? WIDE.colW : SAFE_W, fontFamily: POPPINS}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 26, ...textIn(f, years - 2)}}>
          <div style={{fontWeight: 800, fontSize: 200, lineHeight: 0.95, letterSpacing: -6, color: S.red500}}>{n}+</div>
          <div style={{fontWeight: 800, fontSize: 88, color: S.navy700}}>YEARS</div>
        </div>
        <div style={{fontWeight: 800, fontSize: wide ? 84 : 70, lineHeight: 1.05, color: S.navy700, marginTop: 18, ...textIn(f, moves)}}>
          <Underlined frame={f} at={moves + 8}>
            THOUSANDS
          </Underlined>
          {wide ? <br /> : ' '}
          OF MOVES
        </div>
      </div>
      {cards.map((c, i) => {
        const p = pop(f, Math.min(people, start + 40) + i * 5);
        return (
          <div
            key={c.src}
            style={{
              position: 'absolute',
              left: c.x,
              top: wide ? 230 : 760,
              width: wide ? 300 : 310,
              height: wide ? 460 : 440,
              borderRadius: 24,
              overflow: 'hidden',
              border: `8px solid ${S.white}`,
              boxShadow: '0 20px 50px rgba(22,26,66,0.25)',
              opacity: Math.min(1, p * 1.5),
              transform: `translateY(${(1 - p) * 120}px) rotate(${c.rot}deg)`,
            }}
          >
            <Photo src={`supercheap/photos/${c.src}.jpg`} frame={f} from={start} to={start + 150} zoom={[1.0, 1.06]} posY={40} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* Scene 12 (50.0-55.0 s): end card. */
export const EndCard: React.FC<{f: number}> = ({f}) => {
  const cta = sec(phraseAt(11, 'Get your price'));
  const ctaIn = pop(f, cta - 2);
  const wide = useWide();
  const logoW = wide ? 760 : 820;
  return (
    <AbsoluteFill style={white}>
      <div style={{position: 'absolute', left: (wide ? 960 : SAFE_CX) - logoW / 2, top: wide ? 110 : 420}}>
        <LogoSting frame={f} at={SNAPS.end} width={logoW} />
      </div>
      <div style={{position: 'absolute', left: wide ? 0 : SAFE.left, width: wide ? WIDE.w : SAFE_W, top: wide ? 380 : 760, textAlign: 'center', fontFamily: POPPINS}}>
        <div style={{fontWeight: 800, fontSize: wide ? 96 : 80, lineHeight: 1.05, color: S.navy700, ...textIn(f, SNAPS.end + 6)}}>STOP COMPARING.</div>
        <div
          style={{
            display: 'inline-block',
            marginTop: wide ? 48 : 64,
            background: S.red500,
            color: S.white,
            fontWeight: 700,
            fontSize: 56,
            padding: '30px 66px',
            borderRadius: 999,
            opacity: Math.min(1, ctaIn * 1.6),
            transform: `scale(${0.85 + 0.15 * ctaIn})`,
          }}
        >
          Get your price now
        </div>
        <div style={{marginTop: wide ? 44 : 56, fontWeight: 600, fontSize: wide ? 40 : 38, color: S.navy700, ...textIn(f, cta + 6)}}>{URL}</div>
        <div style={{marginTop: 10, fontWeight: 700, fontSize: 48, color: S.red600, ...textIn(f, cta + 10)}}>{PHONE}</div>
      </div>
    </AbsoluteFill>
  );
};
