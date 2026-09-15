import React from 'react';
import { Composition } from 'remotion';
import { DemoVideo } from './DemoVideo';
import { FPS, TOTAL_DURATION } from './timeline';

export const Root: React.FC = () => {
  return (
    <Composition
      id="DemoVideo"
      component={DemoVideo}
      durationInFrames={TOTAL_DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
