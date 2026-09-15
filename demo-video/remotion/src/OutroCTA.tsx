import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { LEXEND } from './fonts';

export const OutroCTA: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();
  const frame = Math.max(localFrame, 0);

  const in1 = spring({ frame, fps, config: { damping: 200, mass: 0.7 }, durationInFrames: 24 });
  const in2 = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200, mass: 0.7 },
    durationInFrames: 24,
  });
  const in3 = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200, mass: 0.7 },
    durationInFrames: 24,
  });

  const pulse = 1 + Math.sin(frame / fps * 2 * Math.PI * 0.6) * 0.015;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
      }}
    >
      <div
        style={{
          opacity: in1,
          transform: `translateY(${(1 - in1) * 22}px)`,
          fontFamily: LEXEND,
          fontWeight: 800,
          fontSize: 72,
          color: 'white',
          letterSpacing: -1.5,
          marginBottom: 18,
        }}
      >
        Dynasty Nova
      </div>
      <div
        style={{
          opacity: in2,
          transform: `translateY(${(1 - in2) * 22}px)`,
          fontFamily: LEXEND,
          fontWeight: 500,
          fontSize: 26,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 44,
        }}
      >
        Le premier serveur officiel ouvre le 26 septembre 2026
      </div>
      <div
        style={{
          opacity: in3,
          transform: `translateY(${(1 - in3) * 18}px) scale(${pulse})`,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
        }}
      >
        <div
          style={{
            fontFamily: LEXEND,
            fontWeight: 700,
            fontSize: 22,
            color: 'white',
            background: 'linear-gradient(135deg, #F36858 0%, #E74F40 100%)',
            padding: '18px 38px',
            borderRadius: 999,
            boxShadow: '0 20px 50px -10px rgba(243,104,88,0.55)',
          }}
        >
          S&apos;inscrire à la liste d&apos;attente
        </div>
        <div
          style={{
            fontFamily: LEXEND,
            fontWeight: 600,
            fontSize: 22,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 0.4,
          }}
        >
          dynastynova.com
        </div>
      </div>
    </div>
  );
};
