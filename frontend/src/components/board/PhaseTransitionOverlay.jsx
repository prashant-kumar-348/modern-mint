import React, { useState, useEffect } from 'react';

export default function PhaseTransitionOverlay({ phase }) {
  const [show, setShow] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(phase);

  useEffect(() => {
    if (phase !== currentPhase) {
      setCurrentPhase(phase);
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, currentPhase]);

  useEffect(() => {
    if (phase) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  let imgSrc = '';
  if (phase === 1) imgSrc = '/phase1-transition.png';
  if (phase === 2) imgSrc = '/phase2-transition.png';
  if (phase === 3) imgSrc = '/phase3-transition.png';

  if (!imgSrc) return null;

  return (
    <>
       {/* Preload images to ensure they are ready before animation starts */}
       <div className="hidden">
          <img src="/phase1-transition.png" alt="preload" />
          <img src="/phase2-transition.png" alt="preload" />
          <img src="/phase3-transition.png" alt="preload" />
       </div>
       <div 
         key={phase}
         className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
         style={{
           animation: 'overlayFadeInOut 2.5s ease-in-out forwards',
           backgroundColor: 'rgba(0, 0, 0, 0.75)',
           backdropFilter: 'blur(8px)'
         }}
       >
          <style>{`
            @keyframes overlayFadeInOut {
              0% { opacity: 0; }
              15% { opacity: 1; }
              85% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes scaleUpPop {
              0% { transform: scale(0.8) translateY(20px); opacity: 0; filter: blur(10px); }
              20% { transform: scale(1.05) translateY(0); opacity: 1; filter: blur(0); }
              30% { transform: scale(1) translateY(0); }
              100% { transform: scale(1) translateY(0); }
            }
          `}</style>
          <img 
             src={imgSrc} 
             alt={`Phase ${phase}`} 
             className="w-screen h-screen object-cover drop-shadow-[0_0_80px_rgba(85,255,176,0.3)]" 
             style={{
                animation: 'scaleUpPop 2.5s ease-out forwards'
             }}
          />
       </div>
    </>
  );
}
