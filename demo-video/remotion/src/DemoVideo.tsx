import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { Background } from './Background';
import { BrowserFrame } from './BrowserFrame';
import { SceneClip } from './SceneClip';
import { IntroTitle } from './IntroTitle';
import { OutroCTA } from './OutroCTA';
import { SCENES } from './scenes';
import {
  END_FADE,
  INTRO_EXIT_DUR,
  INTRO_EXIT_START,
  MOCKUP_ENTRANCE_DUR,
  MOCKUP_EXIT_DUR,
  MOCKUP_START,
  OUTRO_START,
  SCENE_TOTAL_FRAMES,
  TRANSITION_FRAMES,
} from './timeline';

const MOCKUP_WIDTH = 1400;
const MOCKUP_HEIGHT = 921;

const MockupGroup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 26, mass: 0.9, stiffness: 120 },
    durationInFrames: MOCKUP_ENTRANCE_DUR,
  });

  const exitStart = SCENE_TOTAL_FRAMES - MOCKUP_EXIT_DUR;
  const exit = interpolate(frame, [exitStart, exitStart + MOCKUP_EXIT_DUR], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(entrance, [0, 1], [0.82, 1]) * interpolate(exit, [0, 1], [0.94, 1]);
  const opacity = Math.min(entrance, exit);

  // Slow, continuous floating tilt — the shots.so / Rotato feel.
  const t = frame / fps;
  const floatY = Math.sin(t * 0.5) * 9;
  const tiltX = 5 + Math.sin(t * 0.35) * 1.6;
  const tiltY = -8 + Math.cos(t * 0.28) * 2.2 + interpolate(entrance, [0, 1], [10, 0]);

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          perspective: 2600,
          perspectiveOrigin: '50% 40%',
        }}
      >
        <div
          style={{
            opacity,
            transform: `translateY(${floatY}px) scale(${scale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <BrowserFrame width={MOCKUP_WIDTH} height={MOCKUP_HEIGHT}>
            <TransitionSeries>
              {SCENES.map((scene, i) => (
                <React.Fragment key={scene.id}>
                  {i > 0 && (
                    <TransitionSeries.Transition
                      presentation={fade()}
                      timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
                    />
                  )}
                  <TransitionSeries.Sequence durationInFrames={scene.durationInFrames}>
                    <SceneClip scene={scene} />
                  </TransitionSeries.Sequence>
                </React.Fragment>
              ))}
            </TransitionSeries>
          </BrowserFrame>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DemoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const endFadeOpacity = interpolate(
    frame,
    [durationInFrames - END_FADE, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill>
      <Background />

      <Sequence from={0} durationInFrames={INTRO_EXIT_START + INTRO_EXIT_DUR}>
        <IntroTitle exitStart={INTRO_EXIT_START} exitDuration={INTRO_EXIT_DUR} />
      </Sequence>

      <Sequence from={MOCKUP_START} durationInFrames={SCENE_TOTAL_FRAMES}>
        <MockupGroup />
      </Sequence>

      <Sequence from={OUTRO_START}>
        <OutroCTA localFrame={frame - OUTRO_START} />
      </Sequence>

      <AbsoluteFill
        style={{ background: 'black', opacity: endFadeOpacity, pointerEvents: 'none' }}
      />
    </AbsoluteFill>
  );
};
