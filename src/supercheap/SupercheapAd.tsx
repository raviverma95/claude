import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {S, sec} from './brand';
import {voTimings} from './captions';
import {Captions} from './components';
import {Couch, Hook, Overload} from './problem';
import {Backloading, Calculator, EndCard, HouseAndCar, Insured, LogoReveal, Proof, Routes, SNAPS} from './solution';

/** "Who do you trust?" 55 s, 1080 x 1920. Scenes 1-4 navy (problem), 5-12 white (solution). */
export const DURATION = sec(55);

const SCENES: [number, React.FC<{f: number}>][] = [
  [0, Hook],
  [sec(3.1), ({f}) => <Couch f={f} />],
  [sec(5.0), Overload],
  [sec(12.1), ({f}) => <Couch f={f} closing />],
  [sec(15.0), LogoReveal],
  [sec(19.0), Calculator],
  [sec(25.0), Insured],
  [sec(30.0), Routes],
  [sec(35.0), Backloading],
  [sec(40.0), HouseAndCar],
  [sec(45.0), Proof],
  [sec(50.0), EndCard],
];

/** Music: the tense bed sits a little lower under the voice; the upbeat track ducks to 20% under each line. */
const musicVolume = (frame: number) => {
  const t = frame / 30;
  const base = t < 15 ? 0.9 : 0.6;
  const under = t < 15 ? 0.45 : 0.2;
  let v = base;
  for (const l of voTimings) {
    const duck = interpolate(t, [l.start - 0.2, l.start, l.end, l.end + 0.3], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    v = Math.min(v, base - (base - under) * duck);
  }
  return v;
};

export const SupercheapAd: React.FC = () => {
  const frame = useCurrentFrame();
  let idx = 0;
  SCENES.forEach(([from], i) => {
    if (frame >= from) idx = i;
  });
  const Scene = SCENES[idx][1];
  return (
    <AbsoluteFill style={{background: S.white}}>
      <Scene f={frame} />
      <Captions frame={frame} />
      <Audio src={staticFile('supercheap/audio/vo.mp3')} />
      <Audio src={staticFile('supercheap/audio/music.mp3')} volume={musicVolume} />
      {Object.values(SNAPS).map((at) => (
        <Sequence key={at} from={at} durationInFrames={10}>
          <Audio src={staticFile('supercheap/audio/snap.wav')} volume={0.8} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
