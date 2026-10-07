import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Scene1} from './scenes/Scene1';
import {Scene2} from './scenes/Scene2';
import {Scene3} from './scenes/Scene3';
import {Scene4} from './scenes/Scene4';
import {Scene5} from './scenes/Scene5';
import {Scene6} from './scenes/Scene6';
import {Scene7} from './scenes/Scene7';
import {C, FPS, INTER} from './theme';

export type BrandIntroProps = {hasVo: boolean; hasMusic: boolean; captions: boolean};

/** Voiceover lines: start/end in seconds (end is an estimate of where each line finishes). */
export const VO_LINES: {start: number; end: number; text: string}[] = [
  {start: 0.4, end: 4.5, text: 'Omar has had the same camera sitting in his cart for eight months.'},
  {start: 4.8, end: 9.0, text: 'Every payday he opens it. Looks at the price. Closes the tab.'},
  {start: 9.3, end: 15.5, text: "Meanwhile, life keeps happening. Sunrise at Jebel Jais. His daughter's first run on Kite Beach. All on a phone doing its best."},
  {start: 15.8, end: 20.5, text: 'Then a friend sends him a link. Same camera. A price that finally makes sense.'},
  {start: 20.8, end: 27.0, text: 'Brand new, sealed. Free delivery, next day. And he pays when it reaches him.'},
  {start: 27.3, end: 31.0, text: 'This time, the photo looks the way the moment felt.'},
  {start: 34.6, end: 37.6, text: 'BuyTech. Great shots, minus the big price tag.'},
];

/** Music at 70% in gaps, ducked to 25% under each VO line, clean fade at the end. */
const musicVolume = (frame: number, hasVo: boolean) => {
  const t = frame / FPS;
  let v = 0.7;
  if (hasVo) {
    for (const l of VO_LINES) {
      const duck = interpolate(t, [l.start - 0.25, l.start, l.end, l.end + 0.3], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      v = Math.min(v, 0.7 - 0.45 * duck);
    }
  }
  return v * interpolate(t, [36.7, 38], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};

const SCENES: [number, number, React.FC][] = [
  [0, 135, Scene1],
  [135, 270, Scene2],
  [270, 465, Scene3],
  [465, 615, Scene4],
  [615, 810, Scene5],
  [810, 930, Scene6],
  [930, 1140, Scene7],
];

const Captions: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / FPS;
  const line = VO_LINES.slice(0, -1).find((l) => t >= l.start && t < l.end);
  if (!line) return null;
  return (
    <div style={{position: 'absolute', bottom: 34, left: 420, right: 420, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          background: 'rgba(17,16,16,0.78)',
          color: C.white,
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 28,
          lineHeight: 1.3,
          padding: '10px 20px',
          borderRadius: 14,
          textAlign: 'center',
        }}
      >
        {line.text}
      </div>
    </div>
  );
};

export const BrandIntro: React.FC<BrandIntroProps> = ({hasVo, hasMusic, captions}) => (
  <AbsoluteFill style={{background: C.white}}>
    {SCENES.map(([from, to, Scene]) => (
      <Sequence key={from} from={from} durationInFrames={to - from}>
        <Scene />
      </Sequence>
    ))}
    {captions && (
      <Sequence>
        <CaptionLayer />
      </Sequence>
    )}
    {hasVo && <Audio src={staticFile('audio/vo.mp3')} />}
    {hasMusic && <Audio src={staticFile('audio/music.mp3')} volume={(f) => musicVolume(f, hasVo)} />}
  </AbsoluteFill>
);

const CaptionLayer: React.FC = () => <Captions frame={useCurrentFrame()} />;
