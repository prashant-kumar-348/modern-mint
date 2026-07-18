import React, { useState } from 'react';
import { DollarSign, Percent, Layers, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DealSheetModal({ onClose, onSubmitDeal, targetName }) {
  // We can track which sheet we are on (e.g., Sheet 1 of 3)
  const [currentSheetIndex, setCurrentSheetIndex] = useState(1);
  const totalSheets = 3;

  const [dealForm, setDealForm] = useState({
    cash: '', equity: '', loan: '', royalty: '', terms: '', proposerSigned: false, receiverSigned: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dealForm.proposerSigned || !dealForm.receiverSigned) {
      alert("Both parties must sign the Deal Sheet before finalizing!");
      return;
    }
    // Call the submit function passed down from App.jsx so the global notification triggers!
    if (onSubmitDeal) {
        onSubmitDeal(dealForm);
    } else {
        onClose();
    }
  };

  const nextSheet = () => setCurrentSheetIndex(prev => Math.min(prev + 1, totalSheets));
  const prevSheet = () => setCurrentSheetIndex(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex items-center justify-center w-full relative">
      
      {/* LEFT ARROW */}
      <button 
        onClick={prevSheet}
        disabled={currentSheetIndex === 1}
        className="hidden sm:flex absolute -left-16 text-white hover:text-yellow-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={48} />
      </button>

      {/* DEAL SHEET CONTAINER */}
      <div className="bg-white text-black max-w-lg w-full max-h-[90vh] overflow-y-auto hide-scrollbar rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-4 sm:p-6 relative animate-in fade-in zoom-in-95 duration-200 border-t-8 border-[#d4af37]">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10">
          <X size={20} />
        </button>

        {/* Sheet Counter */}
        <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 font-mono tracking-widest">
            {currentSheetIndex} / {totalSheets}
        </div>

        {/* Document Header */}
        <div className="text-center mb-6 mt-2">
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37] font-extrabold font-mono">Modern Mint Strategy Co.</span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 mt-1 uppercase">OFFICIAL DEAL SHEET</h3>
          {/* Dynamically display the selected opponent's name */}
          {targetName && (
             <div className="text-xs font-bold bg-gray-100 text-gray-600 inline-block px-3 py-1 rounded-full mt-2 uppercase tracking-widest">
                 NEGOTIATING WITH: <span className="text-black">{targetName}</span>
             </div>
          )}
          <div className="w-12 h-1 bg-[#d4af37] mx-auto mt-3"></div>
        </div>

        {/* Deal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Cash Consideration ($M)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" placeholder="0.00" step="0.1" min="0" value={dealForm.cash} onChange={(e) => setDealForm({ ...dealForm, cash: e.target.value })} className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37]" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Equity Shares (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" placeholder="0" min="0" max="100" value={dealForm.equity} onChange={(e) => setDealForm({ ...dealForm, equity: e.target.value })} className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37]" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Assumed Debt Loan ($M)</label>
              <div className="relative">
                <Layers size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" placeholder="0.00" step="0.1" min="0" value={dealForm.loan} onChange={(e) => setDealForm({ ...dealForm, loan: e.target.value })} className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37]" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Royalty Commitment (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" placeholder="0" min="0" max="100" value={dealForm.royalty} onChange={(e) => setDealForm({ ...dealForm, royalty: e.target.value })} className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37]" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Additional Terms & Conditions</label>
            <textarea rows="3" placeholder="Enter strategic agreements, merger covenants or collateral details..." value={dealForm.terms} onChange={(e) => setDealForm({ ...dealForm, terms: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs w-full resize-none outline-none focus:border-[#d4af37] font-sans"></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-gray-100 my-4">
            <div onClick={() => setDealForm({ ...dealForm, proposerSigned: !dealForm.proposerSigned })} className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all select-none ${dealForm.proposerSigned ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-400'}`}>
              <div className="flex justify-center mb-1">
                {dealForm.proposerSigned ? <div className="p-1 bg-emerald-500 text-white rounded-full"><Check size={14} /></div> : <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs uppercase font-mono">RN</div>}
              </div>
              <div className="text-[10px] font-bold uppercase">Proposer Signature</div>
              <div className="text-[9px] mt-0.5 font-mono italic">{dealForm.proposerSigned ? 'Signed digitally' : 'Click to Sign'}</div>
            </div>

            <div onClick={() => setDealForm({ ...dealForm, receiverSigned: !dealForm.receiverSigned })} className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all select-none ${dealForm.receiverSigned ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-400'}`}>
              <div className="flex justify-center mb-1">
                {dealForm.receiverSigned ? <div className="p-1 bg-emerald-500 text-white rounded-full"><Check size={14} /></div> : <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs uppercase font-mono">OP</div>}
              </div>
              <div className="text-[10px] font-bold uppercase">Opponent Signature</div>
              <div className="text-[9px] mt-0.5 font-mono italic">{dealForm.receiverSigned ? 'Signed digitally' : 'Click to Sign'}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
            {/* Mobile-only shuffle buttons */}
            <div className="flex sm:hidden justify-between items-center mb-2 px-2">
                <button type="button" onClick={prevSheet} disabled={currentSheetIndex === 1} className="p-2 bg-gray-100 rounded disabled:opacity-50"><ChevronLeft size={16}/></button>
                <span className="text-xs font-bold text-gray-400">Sheet {currentSheetIndex} of {totalSheets}</span>
                <button type="button" onClick={nextSheet} disabled={currentSheetIndex === totalSheets} className="p-2 bg-gray-100 rounded disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
            
            <div className="flex w-full sm:w-auto gap-3 ml-auto">
                <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-4 py-3 sm:py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase hover:bg-gray-50 transition-colors cursor-pointer">
                Cancel
                </button>
                <button type="submit" className="flex-2 sm:flex-none px-6 py-3 sm:py-2 bg-black hover:bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md">
                APPLY DEAL
                </button>
            </div>
          </div>

        </form>
      </div>

      {/* RIGHT ARROW */}
      <button 
        onClick={nextSheet}
        disabled={currentSheetIndex === totalSheets}
        className="hidden sm:flex absolute -right-16 text-white hover:text-yellow-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={48} />
      </button>

    </div>
  );
}