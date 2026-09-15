import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { LEXEND } from './fonts';

export const IntroTitle: React.FC<{ exitStart: number; exitDuration: number }> = ({
  exitStart,
  exitDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const in1 = spring({ frame, fps, config: { damping: 200, mass: 0.6 }, durationInFrames: 22 });
  const in2 = spring({
    frame: frame - 8,
    fps,
    config: { damping: 200, mass: 0.6 },
    durationInFrames: 22,
  });

  const exit = interpolate(frame, [exitStart, exitStart + exitDuration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [exitStart, exitStart + exitDuration], [1, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exit,
        transform: `scale(${exitScale})`,
      }}
    >
      <div
        style={{
          opacity: in1,
          transform: `translateY(${(1 - in1) * 26}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#F36858',
            boxShadow: '0 0 24px 6px rgba(243,104,88,0.65)',
          }}
        />
        <span
          style={{
            fontFamily: LEXEND,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          Dynasty Nova
        </span>
      </div>
      <div
        style={{
          opacity: in2,
          transform: `translateY(${(1 - in2) * 30}px)`,
          fontFamily: LEXEND,
          fontWeight: 800,
          fontSize: 64,
          lineHeight: 1.15,
          textAlign: 'center',
          color: 'white',
          maxWidth: 1180,
          letterSpacing: -1,
        }}
      >
        Forgez votre légende
        <br />
        au cœur de l&apos;univers
      </div>
    </div>
  );
};
