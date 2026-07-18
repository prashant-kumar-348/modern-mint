import React from 'react';

const SuccessBanner = ({ message, onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto">
      {/* Dark overlay specifically for the success banner focus */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* The Banner */}
      <div 
        className="relative z-10 w-full bg-gradient-to-r from-transparent via-[#FFC240] to-transparent py-4 md:py-6 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 shadow-[0_0_40px_rgba(255,194,64,0.4)]"
      >
        <div className="bg-black/20 px-8 py-2 border-y-2 border-[#FFFFFF]/50 backdrop-blur-md">
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-[0.2em] bg-gradient-to-b from-[#FFFFFF] to-[#FFC240] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {message}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default SuccessBanner;
