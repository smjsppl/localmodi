import React from 'react';

const Watermark = ({ opacity = 0.05, scale = 0.7 }) => {
  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{
        backgroundImage: `url('/images/watermark.png')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: `${scale * 100}%`,
        opacity: opacity,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
};

export default Watermark;
