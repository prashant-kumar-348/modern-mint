import React, { useState } from 'react';
import { X, Handshake } from 'lucide-react';

const FormalizeDealModal = ({ players, localPlayer, onClose, sendAction }) => {
  const [founderId, setFounderId] = useState('');
  const [investorId, setInvestorId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [percentage, setPercentage] = useState(10);

  const handlePropose = () => {
    if (founderId && investorId && companyName && percentage > 0) {
      // The target player is the ONE WHO IS NOT the local player
      const targetPlayerId = localPlayer.id === founderId ? investorId : founderId;
      
      sendAction('propose_royalty_agreement', {
        targetPlayerId,
        founderId,
        investorId,
        companyName,
        percentage
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 font-sans select-none">
      <div className="w-[450px] bg-[#0a1914] border border-[#55ffb0]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(85,255,176,0.15)] flex flex-col gap-6 relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-1">
            <Handshake className="text-[#55ffb0]" />
            Formalize Deal
          </h2>
          <p className="text-sm text-white/60">Lock in a Royalty Agreement.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#55ffb0] mb-2 font-semibold">Founder</label>
            <select 
              value={founderId}
              onChange={(e) => setFounderId(e.target.value)}
              className="w-full bg-[#112a22] text-white p-3 rounded-lg outline-none border border-transparent focus:border-[#55ffb0]/50"
            >
              <option value="" disabled>Select Founder</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.id === localPlayer.id ? '(You)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-[#55ffb0] mb-2 font-semibold">Investor</label>
            <select 
              value={investorId}
              onChange={(e) => setInvestorId(e.target.value)}
              className="w-full bg-[#112a22] text-white p-3 rounded-lg outline-none border border-transparent focus:border-[#55ffb0]/50"
            >
              <option value="" disabled>Select Investor</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.id === localPlayer.id ? '(You)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-[#55ffb0] mb-2 font-semibold">Company Name</label>
            <input 
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
              placeholder="e.g. AGRI IOT"
              className="w-full bg-[#112a22] text-white p-3 rounded-lg outline-none border border-transparent focus:border-[#55ffb0]/50"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-[#55ffb0] mb-2 font-semibold">Royalty Percentage (%)</label>
            <input 
              type="number"
              min="1"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full bg-[#112a22] text-white p-3 rounded-lg outline-none border border-transparent focus:border-[#55ffb0]/50"
            />
          </div>
        </div>

        <button 
          onClick={handlePropose}
          disabled={!founderId || !investorId || !companyName || percentage <= 0 || founderId === investorId || (founderId !== localPlayer.id && investorId !== localPlayer.id)}
          className="w-full py-4 bg-[#55ffb0] text-[#0a1914] font-black uppercase tracking-widest rounded-lg hover:bg-[#43d995] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Send Proposal
        </button>

      </div>
    </div>
  );
};

export default FormalizeDealModal;
