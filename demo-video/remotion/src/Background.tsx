import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
      <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`,
  );

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / fps;

  // Slow drifting glow blobs, in Dynasty Nova's coral (#F36858) and deep-navy palette.
  const glow1X = 22 + Math.sin(t * 0.09) * 10;
  const glow1Y = 28 + Math.cos(t * 0.07) * 8;
  const glow2X = 78 + Math.sin(t * 0.06 + 2) * 9;
  const glow2Y = 68 + Math.cos(t * 0.08 + 1) * 10;

  const progress = frame / durationInFrames;
  const vignetteStrength = 0.55 + Math.sin(progress * Math.PI) * 0.05;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(160deg, #05070d 0%, #0a0e17 42%, #0d1220 70%, #05070d 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${glow1X}% ${glow1Y}%, rgba(243,104,88,0.32) 0%, rgba(243,104,88,0) 42%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${glow2X}% ${glow2Y}%, rgba(231,79,64,0.22) 0%, rgba(231,79,64,0) 45%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 60%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 260px rgba(0,0,0,${vignetteStrength})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${NOISE_SVG})`,
          opacity: 0.035,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
};
