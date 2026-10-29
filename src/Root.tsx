import React from 'react';
import {Composition, staticFile} from 'remotion';
import {BrandIntro, BrandIntroProps} from './BrandIntro';
import {Reel} from './Reel';
import {DURATION as SUPERCHEAP_DURATION, SupercheapAd} from './supercheap/SupercheapAd';

const exists = async (path: string) => {
  try {
    const res = await fetch(staticFile(path), {method: 'HEAD'});
    return res.ok;
  } catch {
    return false;
  }
};

const calculateMetadata = async <P extends {hasVo: boolean; hasMusic: boolean}>({props}: {props: P}) => ({
  props: {...props, hasVo: await exists('audio/vo.mp3'), hasMusic: await exists('audio/music.mp3')},
});

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
      calculateMetadata={calculateMetadata}
    />
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={1140}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{hasVo: false, hasMusic: false}}
      calculateMetadata={calculateMetadata}
    />
    <Composition id="Supercheap" component={SupercheapAd} durationInFrames={SUPERCHEAP_DURATION} fps={30} width={1080} height={1920} defaultProps={{format: 'vertical' as const}} />
    <Composition id="SupercheapWide" component={SupercheapAd} durationInFrames={SUPERCHEAP_DURATION} fps={30} width={1920} height={1080} defaultProps={{format: 'wide' as const}} />
  </>
);
