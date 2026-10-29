import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {phraseAt} from './captions';
import {clamp, ease, pop, POPPINS, S, SAFE, SAFE_W, sec, slam, textIn} from './brand';
import {Stressed, Underlined, PhoneFrame} from './components';
import {AdCard, CouchPerson, TabStrip} from './drawings';

const navy: React.CSSProperties = {background: S.navy900};

/* Scene 1 (0-3.1 s): quote overload. Hook over a fast-scrolling feed of ads. */
const FEED = ['From $990*', 'Call for a quote', '$3,480', 'Quote in 48 hrs', 'Best price!', '$2,150 + fees', 'Enquire now', '$4,020', 'Price on request', '$1,875*', 'Lowest rates!', 'Book a callback'];

export const Hook: React.FC<{f: number}> = ({f}) => {
  // fast scroll with hard jump cuts every 10 frames
  const cut = Math.floor(f / 10);
  const scroll = (f % 10) * 34 + cut * 290;
  const count = Math.round(interpolate(f, [4, 20], [1, 50], {...clamp, easing: Easing.out(Easing.cubic)}));
  const quotesAt = sec(1.45);
  return (
    <AbsoluteFill style={navy}>
      <div style={{position: 'absolute', left: 90, right: 90, top: 0, bottom: 0, overflow: 'hidden', opacity: 0.32, filter: 'blur(1.5px)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: -(scroll % 2400) - 200, display: 'flex', flexDirection: 'column', gap: 28}}>
          {Array.from({length: 24}).map((_, i) => (
            <AdCard key={i} w={900} claim={FEED[(i + cut * 5) % FEED.length]} tag={i % 3 === 1 ? 'Sponsored' : 'Ad'} claimColor={S.navy100} />
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: SAFE_W,
          top: 560,
          textAlign: 'center',
          fontFamily: POPPINS,
          fontWeight: 800,
          color: S.white,
          lineHeight: 1,
          letterSpacing: -1,
          textTransform: 'uppercase',
        }}
      >
        <div style={{fontSize: 230, ...slam(f, 3)}}>{count}</div>
        <div style={{fontSize: 96, marginTop: 6, ...slam(f, 11)}}>removalists.</div>
        <div style={{fontSize: 116, marginTop: 44, color: S.red400, ...slam(f, quotesAt)}}>
          <Underlined frame={f} at={quotesAt + 8} color={S.red400}>
            50 quotes.
          </Underlined>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Scenes 2 and 4: the couch. Scene 2 rubs temples; scene 4 shuts the laptop and sighs. */
export const Couch: React.FC<{f: number; closing?: boolean}> = ({f, closing}) => {
  const start = closing ? sec(12.1) : sec(3.1);
  const lid = closing ? ease(f, [start + 8, start + 18], [1, 0], Easing.in(Easing.quad)) : 1;
  const slump = closing ? ease(f, [start + 22, start + 40], [0, 1]) : 0;
  const rub = closing ? ease(f, [start, start + 8], [1, 0]) : 1;
  const zoom = interpolate(f, [start, start + (closing ? 87 : 57)], [1, closing ? 1.04 : 1.06], clamp);
  const tabsIn = pop(f, start + 6);
  return (
    <AbsoluteFill style={navy}>
      <div style={{position: 'absolute', left: 0, top: 420, transform: `scale(${zoom})`, transformOrigin: '540px 600px'}}>
        {!closing && (
          <div style={{position: 'absolute', left: 300, top: -110, opacity: Math.min(1, tabsIn * 1.5), transform: `translateY(${(1 - tabsIn) * 30}px)`}}>
            <TabStrip tabs={15} width={480} />
          </div>
        )}
        <CouchPerson frame={f} rub={rub} lid={lid} slump={slump} />
      </div>
    </AbsoluteFill>
  );
};

/* Scene 3 (5.0-12.1 s): callbacks, fine print, everyone's "cheapest". */
const QuoteLine: React.FC<{f: number; at: number; text: React.ReactNode; top?: number}> = ({f, at, text, top = 250}) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE.left,
      width: SAFE_W,
      top,
      textAlign: 'center',
      fontFamily: POPPINS,
      fontWeight: 700,
      fontSize: 72,
      lineHeight: 1.1,
      color: S.white,
      zIndex: 5,
      ...textIn(f, at),
    }}
  >
    {typeof text === 'string' ? <Stressed text={text} red={S.red400} /> : text}
  </div>
);

const Callback: React.FC<{f: number; start: number}> = ({f, start}) => {
  const noAnswer = f >= start + 34;
  const ring = (k: number) => ((f - start + k * 10) % 30) / 30;
  const emails = [0, 1, 2, 3].map((i) => pop(f, start + 40 + i * 6));
  return (
    <>
      <QuoteLine f={f} at={start + 2} text={'“We\'ll call you *back*...”'} />
      <div style={{position: 'absolute', left: 290, top: 480}}>
        {!noAnswer &&
          [0, 1, 2].map((k) => (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: 250 - 260 * (0.6 + ring(k)),
                top: 400 - 260 * (0.6 + ring(k)),
                width: 520 * (0.6 + ring(k)),
                height: 520 * (0.6 + ring(k)),
                borderRadius: '50%',
                border: `6px solid rgba(255,255,255,${0.35 * (1 - ring(k))})`,
              }}
            />
          ))}
        <PhoneFrame x={0} y={0} w={500} h={800} style={{transform: `rotate(${noAnswer ? 0 : Math.sin(f * 1.7) * 2.5}deg)`}}>
          <div style={{position: 'absolute', inset: 0, background: S.navy100, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 120}}>
            <div style={{width: 160, height: 160, borderRadius: 80, background: S.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width={90} height={90} viewBox="0 0 90 90">
                <circle cx={45} cy={32} r={20} fill={S.navy700} />
                <path d="M10 86 Q10 56 45 56 Q80 56 80 86 Z" fill={S.navy700} />
              </svg>
            </div>
            <div style={{fontFamily: POPPINS, fontWeight: 700, fontSize: 44, color: S.navy700, marginTop: 30}}>Removalist</div>
            <div style={{fontFamily: POPPINS, fontWeight: 500, fontSize: 34, color: noAnswer ? S.red600 : S.muted, marginTop: 6}}>
              {noAnswer ? 'No answer' : 'Calling…'}
            </div>
          </div>
        </PhoneFrame>
        {/* inbox fills with "we'll get back to you" */}
        {emails.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -60 + i * 22,
              top: 420 + i * 92,
              width: 620,
              background: S.white,
              borderRadius: 24,
              padding: '20px 26px',
              boxSizing: 'border-box',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              display: 'flex',
              gap: 18,
              alignItems: 'center',
              opacity: Math.min(1, p * 1.5),
              transform: `translateX(${(1 - p) * 300}px)`,
            }}
          >
            <svg width={52} height={52} viewBox="0 0 52 52">
              <rect x={2} y={10} width={48} height={34} rx={6} fill={S.navy100} stroke={S.navy700} strokeWidth={3} />
              <path d="M4 13 L26 30 L48 13" stroke={S.navy700} strokeWidth={3} fill="none" />
            </svg>
            <div style={{fontFamily: POPPINS, fontWeight: 600, fontSize: 32, color: S.navy700}}>We'll get back to you…</div>
          </div>
        ))}
      </div>
    </>
  );
};

const FinePrint: React.FC<{f: number; start: number}> = ({f, start}) => {
  const zoom = ease(f, [start + 10, start + 50], [0.9, 1.12]);
  const circle = ease(f, [start + 18, start + 34], [0, 1]);
  return (
    <>
      <QuoteLine
        f={f}
        at={start + 2}
        text={
          <>
            “<span style={{color: S.red400}}>*Conditions</span> apply”
          </>
        }
      />
      <div style={{position: 'absolute', left: 160, top: 430, transform: `scale(${zoom}) rotate(-3deg)`, transformOrigin: '380px 860px'}}>
        <div style={{width: 760, height: 900, background: S.white, borderRadius: 28, padding: '56px 60px', boxSizing: 'border-box', fontFamily: POPPINS, color: S.navy700}}>
          <div style={{fontWeight: 600, fontSize: 30, letterSpacing: 2, color: S.muted}}>MOVING QUOTE</div>
          <div style={{fontWeight: 700, fontSize: 44, marginTop: 10}}>Interstate move</div>
          {[0.9, 0.7, 0.8, 0.6].map((w, i) => (
            <div key={i} style={{height: 18, width: `${w * 100}%`, borderRadius: 9, background: S.navy100, marginTop: 26}} />
          ))}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 50, borderTop: `3px solid ${S.navy100}`, paddingTop: 30}}>
            <div style={{fontWeight: 600, fontSize: 36}}>Total</div>
            <div style={{fontWeight: 800, fontSize: 64}}>$2,890*</div>
          </div>
          {[0.95, 0.85, 0.9].map((w, i) => (
            <div key={i} style={{height: 12, width: `${w * 100}%`, borderRadius: 6, background: S.navy100, marginTop: 22}} />
          ))}
          <div style={{position: 'relative', display: 'inline-block', marginTop: 46, fontWeight: 400, fontSize: 28, color: S.muted}}>
            *Extra charges may apply
            <svg width={480} height={130} viewBox="0 0 480 130" style={{position: 'absolute', left: -50, top: -40, overflow: 'visible'}}>
              <ellipse cx={240} cy={60} rx={225} ry={52} fill="none" stroke={S.red500} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circle} transform="rotate(-2 240 60)" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

const STAMPS = ['CHEAPEST!', 'LOWEST PRICE', '#1 CHEAPEST', 'BEST PRICE', 'CHEAPEST MOVERS', 'UNBEATABLE', 'CHEAPEST IN AUS', 'PRICE MATCH', 'CHEAPEST!'];

const Cheapest: React.FC<{f: number; start: number}> = ({f, start}) => (
  <>
    <div style={{position: 'absolute', left: SAFE.left, top: 300, width: SAFE_W, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22}}>
      {STAMPS.map((s, i) => {
        const p = pop(f, start + 4 + i * 4, {damping: 10, stiffness: 260, mass: 0.5});
        const jitter = f > start + 40 ? Math.sin(f * 2.3 + i) * 3 : 0;
        return (
          <div key={i} style={{position: 'relative', opacity: Math.min(1, p * 1.6), transform: `scale(${0.6 + 0.4 * p}) translate(${jitter}px, ${-jitter}px)`}}>
            <AdCard w={271} claim="" style={{height: 330}} />
            <div
              style={{
                position: 'absolute',
                left: 14,
                right: 14,
                top: 150,
                border: `5px solid ${S.red400}`,
                borderRadius: 14,
                padding: '10px 6px',
                textAlign: 'center',
                fontFamily: POPPINS,
                fontWeight: 800,
                fontSize: 30,
                lineHeight: 1.05,
                color: S.red400,
                transform: `rotate(${i % 2 ? 6 : -7}deg)`,
              }}
            >
              {s}
            </div>
          </div>
        );
      })}
    </div>
  </>
);

export const Overload: React.FC<{f: number}> = ({f}) => {
  const b2 = sec(phraseAt(2, 'hiding'));
  const b3 = sec(phraseAt(2, 'every single'));
  const start = sec(5.0);
  return (
    <AbsoluteFill style={navy}>
      {f < b2 && <Callback f={f} start={start} />}
      {f >= b2 && f < b3 && <FinePrint f={f} start={b2} />}
      {f >= b3 && <Cheapest f={f} start={b3} />}
    </AbsoluteFill>
  );
};
