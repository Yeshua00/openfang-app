import { ReactNode } from 'react';

interface ZoomWrapperProps {
  children: ReactNode;
}

function ZoomWrapper({ children }: ZoomWrapperProps) {
  return (
    <div className="zoom-wrapper">
      {children}
      <style>{`
        .zoom-wrapper {
          width: 100%;
          min-height: 100vh;
          transform: scale(0.8);
          transform-origin: top center;
          min-height: calc(100vh / 0.8);
        }
      `}</style>
    </div>
  );
}

export default ZoomWrapper;
