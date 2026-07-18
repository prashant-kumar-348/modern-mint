import React from 'react';
import { X } from 'lucide-react';

export default function PersonaSelectModal({ onClose, onSelectPersona }) {
  const personas = [
    { id: 'greedy', name: 'GREEDY\nOPPORTUNIST', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Greedy&backgroundColor=1f2937', border: 'border-[#404040]' },
    { id: 'conservative', name: 'CONSERVATIVE\nGUARDIAN', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guardian&backgroundColor=0f172a', border: 'border-[#d4af37]' },
    { id: 'robotic', name: 'ROBOTIC\nSTRATEGIST', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robot&backgroundColor=0f766e', border: 'border-[#2d878d]' },
    { id: 'market', name: 'MARKET\nMANIPULATOR', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Market&backgroundColor=451a03', border: 'border-[#d4af37]' },
    { id: 'trend', name: 'TREND\nCHASER', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trend&backgroundColor=3b0764', border: 'border-[#d4af37]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl flex flex-col items-center">
        
        <button onClick={onClose} className="absolute -top-16 right-0 text-white/50 hover:text-white p-2">
          <X size={32} />
        </button>

        <div className="flex flex-col items-center gap-16 mt-12 w-full">
          
          {/* Top Row: 3 Personas */}
          <div className="flex justify-center gap-8 md:gap-16 w-full">
            {personas.slice(0, 3).map((p) => (
              <div 
                key={p.id} 
                onClick={() => onSelectPersona(p.name.replace('\n', ' '))}
                className="relative flex flex-col items-center cursor-pointer group"
              >
                {/* Name Text */}
                <h3 className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 text-white font-black text-2xl md:text-4xl uppercase tracking-widest text-center leading-none z-10 drop-shadow-[0_5px_8px_rgba(0,0,0,1)] whitespace-pre-line group-hover:scale-105 transition-transform w-[140%]">
                  {p.name}
                </h3>
                
                {/* Circle */}
                <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full border-[8px] md:border-[10px] ${p.border} group-hover:scale-105 transition-all overflow-hidden bg-black shadow-[0_15px_40px_rgba(0,0,0,0.8)]`}>
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                  
                  {/* Inner Notches */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${p.border.replace('border-', 'bg-')} shadow-inner`}></div>
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${p.border.replace('border-', 'bg-')} shadow-inner`}></div>
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${p.border.replace('border-', 'bg-')} shadow-inner`}></div>
                  <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${p.border.replace('border-', 'bg-')} shadow-inner`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row: 2 Personas */}
          <div className="flex justify-center gap-8 md:gap-24 w-full">
            {personas.slice(3, 5).map((p) => (
              <div 
                key={p.id} 
                onClick={() => onSelectPersona(p.name.replace('\n', ' '))}
                className="relative flex flex-col items-center cursor-pointer group"
              >
                {/* Name Text */}
                <h3 className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 text-white font-black text-2xl md:text-4xl uppercase tracking-widest text-center leading-none z-10 drop-shadow-[0_5px_8px_rgba(0,0,0,1)] whitespace-pre-line group-hover:scale-105 transition-transform w-[140%]">
                  {p.name}
                </h3>
                
                {/* Circle */}
                <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full border-[8px] md:border-[10px] ${p.border} group-hover:scale-105 transition-all overflow-hidden bg-black shadow-[0_15px_40px_rgba(0,0,0,0.8)]`}>
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                  
                  {/* Inner Notches */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${p.border.replace('border-', 'bg-')} shadow-inner`}></div>
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${p.border.replace('border-', 'bg-')} shadow-inner`}></div>
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${p.border.replace('border-', 'bg-')} shadow-inner`}></div>
                  <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${p.border.replace('border-', 'bg-')} shadow-inner`}></div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}