import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

const MentorCardModal = ({ onClose, onBuy, drawnCard, clearDrawnCard, notification }) => {
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (notification && notification.show && notification.message.includes('REJECTED')) {
      setIsBuying(false);
    }
  }, [notification]);

  const handleBuyClick = () => {
    setIsBuying(true);
    onBuy();
  };

  const handleAcknowledge = () => {
    clearDrawnCard();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      
      {/* Close Button */}
      {!drawnCard && (
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-3 rounded-full bg-black/50 text-white/50 hover:bg-white hover:text-black transition-all border border-white/20 z-50"
        >
          <X size={28} />
        </button>
      )}

      <div className="flex flex-col items-center justify-center w-full max-w-4xl h-full relative">
        
        {/* STEP 1: PAYMENT CONFIRMATION (No Card Yet) */}
        {!drawnCard && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <h2 className="text-[#FFC240] font-black tracking-widest uppercase text-3xl drop-shadow-md mb-8">
              Buy Mentor Card
            </h2>
            
            <div className="bg-[#2A0D12] border-2 border-[#FFC240]/40 rounded-2xl p-12 flex flex-col items-center shadow-[0_0_40px_rgba(255,194,64,0.15)] text-center">
              <div className="w-24 h-24 bg-[#FFF2D8] rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner border border-[#3A141A]/20">
                🃏
              </div>
              
              <h3 className="text-white text-xl font-bold tracking-wider mb-2">
                Blind Draw from Central Deck
              </h3>
              <p className="text-white/60 mb-8 max-w-md leading-relaxed">
                You need to pay <strong className="text-[#55ffb0]">$20K</strong> to buy a Mentor Card. You may only buy one card per round.
              </p>

              {isBuying ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#FFC240] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[#FFC240] font-bold tracking-widest uppercase text-sm animate-pulse">Drawing Card...</span>
                </div>
              ) : (
                <button 
                  onClick={handleBuyClick}
                  className="w-[280px] bg-gradient-to-br from-[#FFC240] to-[#F59E0B] text-[#2A0D12] font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(255,194,64,0.4)] hover:scale-105 active:scale-95 transition-all tracking-wider uppercase border border-white/40"
                >
                  Confirm Payment
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: REVEAL DRAWN CARD */}
        {drawnCard && (
          <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <h2 className="text-[#55ffb0] font-black tracking-widest uppercase text-2xl drop-shadow-md mb-2">
              Card Drawn!
            </h2>
            <p className="text-white/70 tracking-widest uppercase text-xs mb-8 font-bold">
              {drawnCard.type === 'Play Now' ? 'Immediate Effect Applied' : 'Added to Inventory'}
            </p>

            <div className="relative w-[320px] h-[480px] bg-gradient-to-br from-[#501625] to-[#2A0D12] border-4 border-[#FFC240] shadow-[0_0_50px_rgba(255,194,64,0.6)] rounded-2xl flex flex-col items-center justify-center p-8 mb-8 animate-in slide-in-from-bottom-8">
              <div className="absolute top-4 left-4 bg-black/40 px-3 py-1 rounded text-[9px] font-black tracking-widest uppercase border border-white/10 text-white/80">
                {drawnCard.type}
              </div>

              <div className="w-24 h-24 bg-[#FFF2D8] rounded-full flex items-center justify-center text-5xl mb-8 shadow-inner border border-[#3A141A]/20">
                {drawnCard.icon || '💡'}
              </div>
              <h3 className="text-[#FFC240] font-black text-center uppercase tracking-wider mb-4 text-3xl leading-none">
                {drawnCard.name || drawnCard.title}
              </h3>
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#FFC240]/40 to-transparent mb-6"></div>
              <p className="text-white/80 text-center leading-relaxed text-lg px-2">
                {drawnCard.description || drawnCard.desc}
              </p>
            </div>

            <button 
              onClick={handleAcknowledge}
              className="flex items-center justify-center gap-2 w-[320px] bg-[#55ffb0] text-[#0a1914] font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(85,255,176,0.4)] hover:scale-105 active:scale-95 transition-all tracking-wider uppercase border border-white/40"
            >
              <CheckCircle size={24} />
              Acknowledge
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MentorCardModal;
