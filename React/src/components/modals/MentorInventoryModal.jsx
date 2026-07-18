import React from 'react';
import { X } from 'lucide-react';

const MentorInventoryModal = ({ onClose, mentorCards }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 font-sans animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[70vh] bg-[#2A0D12] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-[#FFC240] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-[#1A080B] border-b border-[#FFC240]/30 px-6 py-4 flex items-center justify-between shadow-md">
          <h2 className="text-2xl font-black text-[#FFC240] uppercase tracking-widest flex items-center gap-3">
            <span className="text-3xl">🃏</span> Your Mentor Cards
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-black/40 rounded-full p-2 cursor-pointer border border-white/10 hover:bg-white/10">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#2A0D12] to-[#1A080B]">
          {mentorCards && mentorCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentorCards.map((card, idx) => (
                <div key={card.uniqueId || idx} className="bg-gradient-to-br from-[#501625] to-[#2A0D12] border border-[#FFC240]/50 rounded-xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform hover:border-[#FFC240] cursor-default">
                   <div className="w-16 h-16 bg-[#FFF2D8] rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner border border-[#3A141A]/20">
                     {card.icon || '🃏'}
                   </div>
                   <h3 className="text-[#FFC240] font-black uppercase tracking-wider mb-2 text-xl leading-none">
                     {card.name || card.title}
                   </h3>
                   <div className="w-1/2 h-[1px] bg-[#FFC240]/30 mb-4"></div>
                   <p className="text-white/80 leading-relaxed text-sm">
                     {card.description || card.desc}
                   </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/50">
              <span className="text-6xl mb-4 opacity-50">📭</span>
              <p className="text-xl font-bold uppercase tracking-widest">No Mentor Cards Owned</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default MentorInventoryModal;
