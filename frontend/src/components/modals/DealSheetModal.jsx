import React, { useState } from 'react';
import { DollarSign, Percent, Layers, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DealSheetModal({ 
  onClose, 
  onSubmitDeal, 
  targetName, 
  opponents = [], 
  readOnly = false, 
  deals = [],
  username = '' 
}) {
  const isViewMode = readOnly;
  
  // Total number of sheets depends on mode
  const totalSheets = isViewMode ? deals.length : opponents.length;
  
  // Initialize active sheet index
  const [currentSheetIndex, setCurrentSheetIndex] = useState(() => {
    if (isViewMode) return 1;
    const idx = opponents.findIndex(p => p.name === targetName);
    return idx !== -1 ? idx + 1 : 1;
  });

  // Deal forms state for proposal mode (one form per opponent)
  const [dealForms, setDealForms] = useState(() => {
    if (isViewMode) return {};
    const initial = {};
    opponents.forEach(p => {
      initial[p.name] = {
        cash: '', 
        equity: '', 
        loan: '', 
        royalty: '', 
        terms: '', 
        proposerSigned: false, 
        receiverSigned: false
      };
    });
    return initial;
  });

  const nextSheet = () => setCurrentSheetIndex(prev => Math.min(prev + 1, totalSheets));
  const prevSheet = () => setCurrentSheetIndex(prev => Math.max(prev - 1, 1));

  // Determine current active content
  let currentOpponent = null;
  let currentDeal = null;
  let activeForm = {};

  if (isViewMode) {
    currentDeal = deals[currentSheetIndex - 1];
    if (currentDeal) {
      const partnerName = currentDeal.proposer === username ? currentDeal.partner : currentDeal.proposer;
      activeForm = {
        cash: currentDeal.cash,
        equity: currentDeal.equity,
        loan: currentDeal.loan,
        royalty: currentDeal.royalty,
        terms: currentDeal.terms,
        proposerSigned: true,
        receiverSigned: currentDeal.status === 'accepted'
      };
      currentOpponent = { name: partnerName };
    }
  } else {
    currentOpponent = opponents[currentSheetIndex - 1];
    if (currentOpponent) {
      activeForm = dealForms[currentOpponent.name] || {
        cash: '', equity: '', loan: '', royalty: '', terms: '', proposerSigned: false, receiverSigned: false
      };
    }
  }

  const updateField = (field, value) => {
    if (isViewMode || !currentOpponent) return;
    setDealForms(prev => ({
      ...prev,
      [currentOpponent.name]: {
        ...prev[currentOpponent.name],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) {
      onClose();
      return;
    }
    if (!activeForm.proposerSigned || !activeForm.receiverSigned) {
      alert("Both parties must sign the Deal Sheet before finalizing!");
      return;
    }
    if (onSubmitDeal && currentOpponent) {
      onSubmitDeal(activeForm, currentOpponent.name);
    } else {
      onClose();
    }
  };

  // If view mode and no deals exist
  if (isViewMode && totalSheets === 0) {
    return (
      <div className="bg-zinc-950/90 text-white rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 max-w-md w-full relative flex flex-col items-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer">
          <X size={20} />
        </button>
        <div className="text-center my-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-extrabold font-mono">Modern Mint Strategy Co.</span>
          <h3 className="text-xl font-black mt-2 uppercase">Deal Tracker</h3>
          <div className="w-12 h-1 bg-[#d4af37] mx-auto my-4"></div>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest py-8">
            No Deals Finalised Yet
          </p>
          <button onClick={onClose} className="px-6 py-2 bg-[#d4af37] text-black text-xs font-black uppercase tracking-wider rounded-lg shadow-md hover:bg-[#fff2d8] transition-colors cursor-pointer">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full relative pointer-events-auto">
      
      {/* LEFT ARROW */}
      <button 
        type="button"
        onClick={prevSheet}
        disabled={currentSheetIndex === 1}
        className="hidden sm:flex absolute -left-16 text-white hover:text-yellow-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft size={48} />
      </button>

      {/* DEAL SHEET CONTAINER */}
      <div className="bg-white text-black max-w-lg w-full max-h-[90vh] overflow-y-auto hide-scrollbar rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-4 sm:p-6 relative border-t-8 border-[#d4af37] border-b-2 border-x border-gray-200">
        
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10">
          <X size={20} />
        </button>

        {/* Sheet Counter */}
        <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 font-mono tracking-widest select-none">
            {currentSheetIndex} / {totalSheets}
        </div>

        {/* Document Header */}
        <div className="text-center mb-6 mt-2">
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37] font-extrabold font-mono">Modern Mint Strategy Co.</span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 mt-1 uppercase">
            {isViewMode ? 'RECORDED DEAL SHEET' : 'OFFICIAL DEAL SHEET'}
          </h3>
          {currentOpponent && (
             <div className="text-xs font-bold bg-gray-100 text-gray-600 inline-block px-3 py-1 rounded-full mt-2 uppercase tracking-widest select-none">
                 NEGOTIATING WITH: <span className="text-black">{currentOpponent.name}</span>
             </div>
          )}
          {isViewMode && currentDeal && (
            <div className="mt-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase shadow-sm tracking-wider text-white ${
                currentDeal.status === 'accepted' ? 'bg-emerald-600' : currentDeal.status === 'rejected' ? 'bg-rose-600' : 'bg-amber-600'
              }`}>
                {currentDeal.status}
              </span>
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
                <input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.1" 
                  min="0" 
                  disabled={isViewMode}
                  value={activeForm.cash} 
                  onChange={(e) => updateField('cash', e.target.value)} 
                  className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37] disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Equity Shares (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  placeholder="0" 
                  min="0" 
                  max="100" 
                  disabled={isViewMode}
                  value={activeForm.equity} 
                  onChange={(e) => updateField('equity', e.target.value)} 
                  className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37] disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Assumed Debt Loan ($M)</label>
              <div className="relative">
                <Layers size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.1" 
                  min="0" 
                  disabled={isViewMode}
                  value={activeForm.loan} 
                  onChange={(e) => updateField('loan', e.target.value)} 
                  className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37] disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Royalty Commitment (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  placeholder="0" 
                  min="0" 
                  max="100" 
                  disabled={isViewMode}
                  value={activeForm.royalty} 
                  onChange={(e) => updateField('royalty', e.target.value)} 
                  className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37] disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Additional Terms & Conditions</label>
            <textarea 
              rows="3" 
              placeholder="Enter strategic agreements, merger covenants or collateral details..." 
              disabled={isViewMode}
              value={activeForm.terms} 
              onChange={(e) => updateField('terms', e.target.value)} 
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs w-full resize-none outline-none focus:border-[#d4af37] disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed font-sans"
            />
          </div>

          {/* SIGNATURES BLOCK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-gray-100 my-4">
            <div 
              onClick={() => {
                if (!isViewMode) {
                  updateField('proposerSigned', !activeForm.proposerSigned);
                }
              }} 
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all select-none ${
                activeForm.proposerSigned 
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-400'
              } ${isViewMode ? 'cursor-default pointer-events-none' : ''}`}
            >
              <div className="flex justify-center mb-1">
                {activeForm.proposerSigned ? (
                  <div className="p-1 bg-emerald-500 text-white rounded-full"><Check size={14} /></div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs uppercase font-mono">
                    {username ? username.substring(0, 2).toUpperCase() : 'RN'}
                  </div>
                )}
              </div>
              <div className="text-[10px] font-bold uppercase">Proposer Signature</div>
              <div className="text-[9px] mt-0.5 font-mono italic">
                {activeForm.proposerSigned ? 'Signed digitally' : 'Click to Sign'}
              </div>
            </div>

            <div 
              onClick={() => {
                if (!isViewMode) {
                  updateField('receiverSigned', !activeForm.receiverSigned);
                }
              }} 
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all select-none ${
                activeForm.receiverSigned 
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-400'
              } ${isViewMode ? 'cursor-default pointer-events-none' : ''}`}
            >
              <div className="flex justify-center mb-1">
                {activeForm.receiverSigned ? (
                  <div className="p-1 bg-emerald-500 text-white rounded-full"><Check size={14} /></div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs uppercase font-mono">
                    {currentOpponent ? currentOpponent.name.substring(0, 2).toUpperCase() : 'OP'}
                  </div>
                )}
              </div>
              <div className="text-[10px] font-bold uppercase">Opponent Signature</div>
              <div className="text-[9px] mt-0.5 font-mono italic">
                {activeForm.receiverSigned ? 'Signed digitally' : 'Click to Sign'}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
            {/* Mobile-only navigation layout */}
            <div className="flex sm:hidden justify-between items-center mb-2 px-2">
                <button type="button" onClick={prevSheet} disabled={currentSheetIndex === 1} className="p-2 bg-gray-100 rounded disabled:opacity-50"><ChevronLeft size={16}/></button>
                <span className="text-xs font-bold text-gray-400 font-mono">Sheet {currentSheetIndex} of {totalSheets}</span>
                <button type="button" onClick={nextSheet} disabled={currentSheetIndex === totalSheets} className="p-2 bg-gray-100 rounded disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
            
            <div className="flex w-full sm:w-auto gap-3 ml-auto">
                <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-4 py-3 sm:py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase hover:bg-gray-50 transition-colors cursor-pointer">
                  {isViewMode ? 'Close' : 'Cancel'}
                </button>
                {!isViewMode && (
                  <button type="submit" className="flex-2 sm:flex-none px-6 py-3 sm:py-2 bg-black hover:bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md">
                    APPLY DEAL
                  </button>
                )}
            </div>
          </div>

        </form>
      </div>

      {/* RIGHT ARROW */}
      <button 
        type="button"
        onClick={nextSheet}
        disabled={currentSheetIndex === totalSheets}
        className="hidden sm:flex absolute -right-16 text-white hover:text-yellow-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight size={48} />
      </button>

    </div>
  );
}