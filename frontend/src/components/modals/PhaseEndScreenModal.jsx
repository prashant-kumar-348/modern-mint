import React from 'react';

const PhaseEndScreenModal = ({ player }) => {
  const totalPaid = player?.phase2Paid || 0;
  const remainingCash = player?.cash || 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="relative w-full max-w-2xl bg-[#0a1914] rounded-2xl shadow-[0_0_80px_rgba(85,255,176,0.15)] border-2 border-[#1c4d3d] flex flex-col items-center justify-center p-12 overflow-hidden">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#55ffb011_1px,transparent_1px),linear-gradient(to_bottom,#55ffb011_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

        {/* Bank Logo / Icon */}
        <div className="relative z-10 w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-gradient-to-b from-[#112a20] to-[#081510] border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          <svg width="40" height="40" viewBox="0 0 60 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 4 L5 18 H55 Z" stroke="#d4af37" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
            <rect x="8" y="20" width="44" height="3.5" rx="1" fill="#d4af37" />
            <rect x="13.5" y="23.5" width="4.5" height="14" rx="0.5" fill="#d4af37" />
            <rect x="27.75" y="23.5" width="4.5" height="14" rx="0.5" fill="#d4af37" />
            <rect x="42.5" y="23.5" width="4.5" height="14" rx="0.5" fill="#d4af37" />
            <rect x="8" y="37.5" width="44" height="3" rx="0.5" fill="#d4af37" />
            <rect x="5" y="40.5" width="50" height="3" rx="0.5" fill="#d4af37" />
          </svg>
        </div>

        <h1 className="relative z-10 text-3xl md:text-4xl font-black text-white uppercase tracking-[0.2em] mb-12 text-center drop-shadow-md">
          Phase 2 <span className="text-[#55ffb0]">Complete</span>
        </h1>

        {/* Financial Summary */}
        <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
          
          <div className="bg-[#112a20]/80 border border-[#1c4d3d] rounded-xl p-6 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[#a4d8c2] text-xs font-bold uppercase tracking-[0.3em] mb-2 text-center">
              Total Paid Amount In This Round
            </span>
            <div className="flex items-center gap-1 text-[#ff5555]">
              <span className="text-2xl font-mono opacity-60">-$</span>
              <span className="text-5xl font-black font-mono">{totalPaid}</span>
              <span className="text-xl font-bold opacity-60">K</span>
            </div>
          </div>

          <div className="bg-[#081510] border border-[#d4af37]/50 rounded-xl p-6 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.1)]">
            <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.3em] mb-2 text-center">
              Remaining Amount
            </span>
            <div className="flex items-center gap-1 text-[#55ffb0]">
              <span className="text-2xl font-mono opacity-60">$</span>
              <span className="text-5xl font-black font-mono">{remainingCash}</span>
              <span className="text-xl font-bold opacity-60">K</span>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <button 
          onClick={() => {
            if (player?.isLocked) return;
            // The parent App component should pass a callback or we can assume it will be handled
            // Let's call a prop if it exists, otherwise just trigger a generic custom event we can listen to
            // Actually, we'll pass an onProceed prop from App.jsx
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('phase2_end_proceed'));
            }
          }}
          className={`relative z-10 mt-12 px-10 py-4 bg-[#FFC240] text-black rounded-full font-black uppercase tracking-widest text-sm transition-all ${player?.isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-[0_0_30px_rgba(255,194,64,0.6)]'}`}
        >
          {player?.isLocked ? 'WAITING FOR OTHERS...' : 'LOCK THE DEAL'}
        </button>

      </div>
    </div>
  );
};

export default PhaseEndScreenModal;
