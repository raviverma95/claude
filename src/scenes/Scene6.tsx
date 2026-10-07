import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {KraftBox, Layla, OmarProfileCamera, OmarStanding} from '../components/characters';
import {FinalPhoto, PHOTO} from '../components/FinalPhoto';
import {BeachView} from '../components/views';
import {C, bounce, clamp, ease, POPPINS, springAt} from '../theme';

const START = 810;
const OMAR_K = 1.15;

const TheDoor: React.FC<{f: number}> = ({f}) => {
  // Rider + box slide in from the right
  const riderIn = ease(f, [810, 824], [520, 0], Easing.out(Easing.cubic));
  // Omar steps in from the left
  const omarX = ease(f, [812, 830], [300, 760], Easing.out(Easing.cubic));
  const walking = f < 830;
  // Hand-over
  const hand = ease(f, [830, 842], [0, 1]);
  const boxX = 1250 - 150 * hand + riderIn;
  const boxY = 600 + 10 * hand;
  const notes = ease(f, [834, 846], [0, 1]);
  const tag = springAt(f, 838, {damping: 10, stiffness: 180, mass: 0.6});
  const smile = ease(f, [832, 840], [0.4, 1]);

  // Omar's hands in his own (unscaled) coordinates
  const toLocal = (x: number, y: number): [number, number] => [(x - omarX) / OMAR_K, (y - 330) / OMAR_K];
  const front = toLocal(boxX - 100, boxY + 10);
  const grab = ease(f, [826, 832], [0, 1]);
  const frontHand: [number, number] = [80 + (front[0] - 80) * grab, 280 + (front[1] - 280) * grab];
  const backHand: [number, number] = [110 + 90 * notes, 300 + 20 * notes];

  return (
    <AbsoluteFill style={{background: C.sand}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {/* morning light */}
        <path d="M200 0 L760 0 L1240 1080 L620 1080 Z" fill="#fff" opacity={0.28} />
        {/* floor */}
        <rect y={985} width={1920} height={95} fill="#E7D8C3" />
        {/* door frame and bright doorway */}
        <rect x={1290} y={60} width={630} height={925} fill="#FBF6EE" />
        <rect x={1270} y={40} width={40} height={945} fill="#fff" />
        <rect x={1270} y={40} width={650} height={40} fill="#fff" />
        {/* Layla pulling at Omar's tee */}
        <g transform={`translate(${omarX - 172} ${1020 - 286 * OMAR_K + bounce(f, 14)}) scale(${OMAR_K})`}>
          <Layla pose="pull" />
        </g>
        {/* Omar */}
        <g transform={`translate(${omarX} ${330 + (walking ? bounce(f, 8) : 0)}) scale(${OMAR_K})`}>
          <OmarStanding
            tee={C.green}
            frontHand={frontHand}
            backHand={backHand}
            smile={smile}
            step={walking ? f * 0.6 : 0}
            backHandContent={
              notes < 1 ? (
                <g transform={`translate(${backHand[0] - 30} ${backHand[1] - 36}) rotate(-8)`} opacity={1 - interpolate(notes, [0.7, 1], [0, 1], clamp)}>
                  <rect width={84} height={44} rx={6} fill="#CFE6D5" />
                  <rect x={10} y={8} width={84} height={44} rx={6} fill="#BFDDC7" />
                </g>
              ) : null
            }
          />
        </g>
        {/* Box */}
        <g transform={`translate(${boxX} ${boxY})`}>
          <KraftBox />
        </g>
        {/* Rider, foreground, seen from the chest down */}
        <g transform={`translate(${riderIn} 0)`}>
          <rect x={1560} y={-60} width={520} height={860} rx={60} fill={C.green} />
          <path d="M1620 40 L1560 300" stroke={C.greenDark} strokeWidth={6} opacity={0.5} />
          <rect x={1580} y={780} width={480} height={320} fill={C.ink} />
          {/* arm: sleeve from the shoulder, then forearm to the box */}
          <path d={`M1490 360 L${boxX + 62} ${boxY + 28}`} stroke="#8D5B3C" strokeWidth={54} strokeLinecap="round" />
          <circle cx={boxX + 66} cy={boxY + 28} r={34} fill="#8D5B3C" />
          <path d="M1610 230 L1500 350" stroke={C.green} strokeWidth={120} strokeLinecap="round" />
        </g>
      </svg>
      {/* Next day tag */}
      {f >= 838 && (
        <div
          style={{
            position: 'absolute',
            left: boxX - 110,
            top: boxY - 160,
            width: 220,
            textAlign: 'center',
            transform: `translateY(${(1 - tag) * 30}px) scale(${0.6 + 0.4 * tag})`,
            opacity: Math.min(1, tag * 2),
          }}
        >
          <span
            style={{
              display: 'inline-block',
              background: C.white,
              color: C.green,
              fontFamily: POPPINS,
              fontWeight: 700,
              fontSize: 36,
              padding: '10px 26px',
              borderRadius: 20,
              boxShadow: '0 12px 30px rgba(17,16,16,0.14)',
            }}
          >
            Next day
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

const TheShot: React.FC<{f: number}> = ({f}) => {
  const focus = ease(f, [870, 880], [0, 40], Easing.out(Easing.cubic));
  const snap = springAt(f, 872, {damping: 12, stiffness: 260, mass: 0.5});
  const laylaX = 1330;
  const laylaY = 700 + bounce(f, 12);
  const k = 0.9;
  const sq = {x: laylaX - 95, y: laylaY - 95, s: 190};
  return (
    <AbsoluteFill>
      <BeachView w={1920} h={1080} golden frame={f} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${laylaX} ${laylaY}) scale(${k})`}>
          <Layla pose="stand" />
        </g>
        {f >= 872 && (
          <g
            transform={`translate(${sq.x + sq.s / 2} ${sq.y + sq.s / 2}) scale(${1.5 - 0.5 * snap}) translate(${-sq.s / 2} ${-sq.s / 2})`}
            opacity={Math.min(1, snap * 2)}
            fill="none"
            stroke={C.green}
            strokeWidth={6}
            strokeLinecap="round"
          >
            {[
              'M0 36 L0 0 L36 0',
              `M${sq.s - 36} 0 L${sq.s} 0 L${sq.s} 36`,
              `M${sq.s} ${sq.s - 36} L${sq.s} ${sq.s} L${sq.s - 36} ${sq.s}`,
              `M36 ${sq.s} L0 ${sq.s} L0 ${sq.s - 36}`,
            ].map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        )}
        <g transform="translate(540 430) scale(1.6)">
          <OmarProfileCamera tee={C.green} focus={focus} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Scene6: React.FC = () => {
  const f = useCurrentFrame() + START;
  if (f < 858) return <TheDoor f={f} />;
  if (f < 887) {
    return (
      <AbsoluteFill>
        <TheShot f={f} />
        {f >= 884 && <AbsoluteFill style={{background: '#fff'}} />}
      </AbsoluteFill>
    );
  }
  const push = ease(f, [887, 930], [1, 1.04], Easing.inOut(Easing.sin));
  const settle = ease(f, [887, 895], [1.04, 1], Easing.out(Easing.cubic));
  const glow = interpolate(f, [887, 893], [0.9, 0], clamp);
  return (
    <AbsoluteFill style={{background: C.greenTint}}>
      <div
        style={{
          position: 'absolute',
          left: (1920 - PHOTO.w) / 2 - PHOTO.border,
          top: (1080 - PHOTO.h) / 2 - PHOTO.border,
          transform: `rotate(2deg) scale(${push * settle})`,
        }}
      >
        <FinalPhoto />
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: glow}} />
    </AbsoluteFill>
  );
};
