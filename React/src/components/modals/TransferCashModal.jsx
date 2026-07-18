import React, { useState } from 'react';

const TransferCashModal = ({ players, localPlayer, onClose, onTransfer, onOpenFormalizeDeal }) => {
  const [targetPlayerId, setTargetPlayerId] = useState('');
  const [amount, setAmount] = useState(0);

  const availablePlayers = players.filter(p => p.id !== localPlayer.id);

  const handleTransfer = () => {
    if (targetPlayerId && amount > 0) {
      onTransfer(targetPlayerId, amount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 font-sans select-none">
      <div className="w-[400px] bg-[#0a1914] border border-[#55ffb0]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(85,255,176,0.15)] flex flex-col gap-6 relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a4d8c2] hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-black text-[#55ffb0] tracking-widest uppercase text-center">
          Transfer Cash
        </h2>
        
        <div className="flex justify-between items-center bg-black/40 border border-[#1c4d3d] rounded-lg p-3">
          <span className="text-[#a4d8c2] text-xs uppercase">Your Cash</span>
          <span className="text-[#55ffb0] font-mono font-bold">${localPlayer.cash}K</span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#a4d8c2] uppercase tracking-wider">Select Recipient</label>
            <select 
              value={targetPlayerId}
              onChange={(e) => setTargetPlayerId(e.target.value)}
              className="bg-black/50 border border-[#1c4d3d] rounded p-2 text-white text-sm outline-none focus:border-[#55ffb0] transition-colors"
            >
              <option value="">-- Choose Player --</option>
              {availablePlayers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#a4d8c2] uppercase tracking-wider">Amount ($K)</label>
            <input 
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-black/50 border border-[#1c4d3d] rounded p-2 text-white font-mono outline-none focus:border-[#55ffb0] transition-colors"
              placeholder="e.g. 500"
            />
          </div>
        </div>

        <button 
          onClick={handleTransfer}
          disabled={!targetPlayerId || amount <= 0}
          className="w-full bg-[#55ffb0] hover:bg-[#45df90] text-black font-black uppercase tracking-widest py-3 rounded-lg shadow-[0_0_15px_rgba(85,255,176,0.4)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
        >
          Send Funds
        </button>

        <button 
          onClick={() => {
            onClose();
            if (onOpenFormalizeDeal) onOpenFormalizeDeal();
          }}
          className="w-full bg-transparent border border-[#55ffb0]/50 text-[#55ffb0] hover:bg-[#55ffb0]/10 font-bold uppercase tracking-widest py-3 rounded-lg transition-all text-sm"
        >
          Formalize Royalty Deal
        </button>

      </div>
    </div>
  );
};

export default TransferCashModal;
