import React from 'react';
import {Composition, staticFile} from 'remotion';
import {BrandIntro, BrandIntroProps} from './BrandIntro';

const exists = async (path: string) => {
  try {
    const res = await fetch(staticFile(path), {method: 'HEAD'});
    return res.ok;
  } catch {
    return false;
  }
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="BrandIntro"
      component={BrandIntro}
      durationInFrames={1140}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{hasVo: false, hasMusic: false, captions: false} as BrandIntroProps}
      // Pick up public/audio/vo.mp3 and music.mp3 automatically when they are added.
      calculateMetadata={async ({props}) => ({
        props: {...props, hasVo: await exists('audio/vo.mp3'), hasMusic: await exists('audio/music.mp3')},
      })}
    />
  </>
);
