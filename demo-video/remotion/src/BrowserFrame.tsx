import React from 'react';

interface BrowserFrameProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

const DOT_COLORS = ['#5c5f66', '#5c5f66', '#5c5f66'];

export const CHROME_HEIGHT = 46;
export const FRAME_RADIUS = 20;

export const BrowserFrame: React.FC<BrowserFrameProps> = ({ width, height, children }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: FRAME_RADIUS,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #14161c 0%, #101217 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow:
          '0 2px 0 rgba(255,255,255,0.06) inset, 0 60px 120px -30px rgba(0,0,0,0.75), 0 25px 50px -20px rgba(243,104,88,0.18)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: CHROME_HEIGHT,
          minHeight: CHROME_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          gap: 16,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {DOT_COLORS.map((c, i) => (
            <div
              key={i}
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 999,
              padding: '6px 22px',
              fontFamily:
                "'Lexend', 'Inter', system-ui, sans-serif",
              fontSize: 14,
              color: 'rgba(255,255,255,0.65)',
              letterSpacing: 0.2,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C9.5 2 7.5 4.5 7.5 8v2H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1.5V8c0-3.5-2-6-4.5-6Zm0 2c1.4 0 2.5 1.7 2.5 4v2h-5V8c0-2.3 1.1-4 2.5-4Z"
                fill="rgba(255,255,255,0.55)"
              />
            </svg>
            dynastynova.com
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  );
};
