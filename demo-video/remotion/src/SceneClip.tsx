import React from 'react';
import { OffthreadVideo, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { LEXEND } from './fonts';
import type { Scene } from './scenes';

export const SceneClip: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const labelOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <OffthreadVideo
        src={staticFile(scene.src)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
      />
      <div
        style={{
          position: 'absolute',
          left: 26,
          bottom: 22,
          opacity: labelOpacity,
          transform: `translateY(${(1 - labelOpacity) * 10}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(10,12,17,0.55)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 999,
          padding: '9px 18px 9px 14px',
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#F36858',
            boxShadow: '0 0 10px 2px rgba(243,104,88,0.7)',
          }}
        />
        <span
          style={{
            fontFamily: LEXEND,
            fontWeight: 500,
            fontSize: 15,
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: 0.1,
          }}
        >
          {scene.label}
        </span>
      </div>
    </div>
  );
};
