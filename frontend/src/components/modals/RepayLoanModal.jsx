import React, { useState } from 'react';
import { X, Landmark } from 'lucide-react';

export default function RepayLoanModal({ onClose, player, sendAction }) {
  const [repayAmount, setRepayAmount] = useState('');

  const standardLoan = player?.loan || 0;
  const survivalLoan = player?.survivalLoan || 0;
  const totalLoan = standardLoan + survivalLoan;
  const cash = player?.cash || 0;

  const maxRepay = Math.min(cash, totalLoan);

  const handleRepay = () => {
    const amount = Number(repayAmount);
    if (amount > 0 && amount <= maxRepay) {
      sendAction('repay_loan', { amount });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0a1914] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 border-[#d4af37] flex flex-col p-8 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-[20%] duration-300 ease-out text-center">
        
        {/* Background FX */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent pointer-events-none"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer z-10">
          <X size={24} />
        </button>

        <div className="w-20 h-20 bg-gradient-to-r from-[#d4af37] to-[#8a6818] rounded-full flex items-center justify-center self-center shadow-[0_0_30px_rgba(212,175,55,0.4)] mb-4">
           <Landmark size={40} className="text-[#0a1914]" />
        </div>

        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-1">Repay Loan</h2>
        <p className="text-[#a4d8c2] text-xs uppercase tracking-widest mb-6">Settle your debts to the bank</p>

        <div className="flex justify-between items-center bg-black/50 border border-[#1c4d3d] rounded-lg p-4 mb-4 text-left">
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Standard Debt</div>
            <div className="text-xl font-mono text-red-400 font-bold">${standardLoan}K</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 text-right">Survival Debt</div>
            <div className="text-xl font-mono text-orange-500 font-bold text-right">${survivalLoan}K</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 px-2">
          <div className="text-[10px] text-white/50 uppercase tracking-widest">Total Debt</div>
          <div className="text-2xl font-black text-red-500">${totalLoan}K</div>
        </div>

        <div className="flex flex-col gap-2 relative z-10 mb-6">
          <label className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider text-left">Repayment Amount ($K)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-mono">$</span>
            <input 
              type="number"
              placeholder="0"
              min="0"
              max={maxRepay}
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              className="w-full bg-black border border-[#d4af37]/50 rounded-lg py-3 pl-8 pr-16 text-white font-mono text-lg outline-none focus:border-[#d4af37] transition-colors"
            />
            <button 
              onClick={() => setRepayAmount(maxRepay)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-[#1c4d3d] text-white px-2 py-1 rounded font-bold uppercase tracking-wider hover:bg-[#256651]"
            >
              MAX
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-left">Available Cash: <span className="text-[#55ffb0]">${cash}K</span></p>
        </div>

        <button 
          onClick={handleRepay}
          disabled={!repayAmount || Number(repayAmount) <= 0 || Number(repayAmount) > maxRepay}
          className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#8a6818] rounded-xl font-black text-[#0a1914] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          Confirm Repayment
        </button>

        <p className="text-[9px] text-gray-500 mt-4 leading-tight">
          Note: Repayments automatically prioritize your Survival Loan (30% interest) over Standard Loans (10% interest).
        </p>
      </div>
    </div>
  );
}
