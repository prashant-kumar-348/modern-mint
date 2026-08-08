import React from 'react';
import { X } from 'lucide-react';

const AVATAR_IMAGE_BY_ID = {
  1: 'https://modernmintgame.com/cdn/shop/files/01.png?v=1772091663&width=2000',
  2: 'https://modernmintgame.com/cdn/shop/files/03.png?v=1772091662&width=2000',
  3: 'https://modernmintgame.com/cdn/shop/files/02.png?v=1772091663&width=2000',
  4: 'https://modernmintgame.com/cdn/shop/files/05.png?v=1772091663&width=2000',
  5: 'https://modernmintgame.com/cdn/shop/files/04.png?v=1772091663&width=2000',
};

export default function PersonaSelectModal({ onClose, onSelectPersona, players = [] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl flex flex-col items-center bg-zinc-950/90 border border-white/10 rounded-2xl p-8 shadow-2xl">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white p-2 cursor-pointer z-10">
          <X size={24} />
        </button>

        <div className="text-center mb-10">
          <h3 className="text-2xl font-black text-white uppercase tracking-widest">Select Negotiation Partner</h3>
          <p className="text-gray-400 text-sm mt-2 font-medium">Choose an active player or AI bot to propose your Deal Sheet to</p>
          <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-4"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 w-full my-4">
          {players.length > 0 ? (
            players.map((p, idx) => {
              const avatarSrc = p.avatarId && AVATAR_IMAGE_BY_ID[p.avatarId]
                ? AVATAR_IMAGE_BY_ID[p.avatarId]
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}&backgroundColor=1f2937`;

              const pColor = p.color || '#d4af37';

              return (
                <div 
                  key={p.id || idx} 
                  onClick={() => onSelectPersona(p.name)}
                  className="flex flex-col items-center cursor-pointer group w-64 p-6 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-[#d4af37]/50 transition-all hover:scale-105"
                >
                  <div 
                    className="relative w-36 h-36 rounded-full border-4 shadow-xl overflow-hidden bg-black mb-4 transition-all"
                    style={{ borderColor: pColor }}
                  >
                    <img src={avatarSrc} alt={p.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                  </div>
                  
                  <h3 className="text-white font-bold text-lg text-center uppercase tracking-wider truncate w-full">
                    {p.name}
                  </h3>
                  
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-800 text-gray-300 mt-2 uppercase tracking-widest border border-white/5">
                    {p.role || 'Player'}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 font-mono text-sm uppercase tracking-widest py-8">
              No other players in the lobby
            </div>
          )}
        </div>

      </div>
    </div>
  );
}