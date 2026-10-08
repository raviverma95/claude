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
import voTimings from '../public/audio/vo-timings.json';

export type BrandIntroProps = {hasVo: boolean; hasMusic: boolean; captions: boolean};

const VO_TEXT = [
  'Omar has had the same camera sitting in his cart for eight months.',
  'Every payday he opens it. Looks at the price. Closes the tab.',
  "Meanwhile, life keeps happening. Sunrise at Jebel Jais. His daughter's first run on Kite Beach. All on a phone doing its best.",
  'Then a friend sends him a link. Same camera. A price that finally makes sense.',
  'Brand new, sealed. Free delivery, next day. And he pays when it reaches him.',
  'This time, the photo looks the way the moment felt.',
  'BuyTech. Great shots, minus the big price tag.',
];

/** Voiceover lines: start/end in seconds, written by scripts/make_vo.py. */
export const VO_LINES = VO_TEXT.map((text, i) => ({...voTimings[i], text}));

/** Music at 40% in gaps, ducked to 12% under each VO line so the voice always sits on top. */
const musicVolume = (frame: number, hasVo: boolean) => {
  const t = frame / FPS;
  let v = 0.4;
  if (hasVo) {
    for (const l of VO_LINES) {
      const duck = interpolate(t, [l.start - 0.25, l.start, l.end, l.end + 0.3], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      v = Math.min(v, 0.4 - 0.28 * duck);
    }
  }
  return v; // the track's own ending and fades are cut into music.mp3 (scripts/make_music.py)
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
