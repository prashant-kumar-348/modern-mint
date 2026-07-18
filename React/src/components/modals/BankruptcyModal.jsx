import React, { useState } from 'react';

const BankruptcyModal = ({ player, onClose, onResolve }) => {
  const [selectedCompany, setSelectedCompany] = useState('');
  
  const shortfall = Math.abs(player.cash);
  
  const handleCrackDeal = () => {
    onResolve('crack_deal');
  };
  
  const handleSellCompany = () => {
    if (selectedCompany) {
      onResolve('sell_company', selectedCompany);
    }
  };
  
  const handleSurvivalLoan = () => {
    onResolve('survival_loan');
  };
  
  const handleRestart = () => {
    onResolve('restart');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 select-none font-sans">
      <div className="w-[600px] max-w-full bg-[#1c0a0a] border-2 border-red-500 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col gap-6 relative overflow-hidden text-center">
        
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_70%)] pointer-events-none"></div>
        
        <h2 className="text-4xl font-black text-red-500 tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] relative z-10">
          BANKRUPTCY DECLARED
        </h2>
        
        <div className="bg-red-950/50 p-4 rounded-xl border border-red-500/30 text-white font-bold relative z-10">
          <p className="text-lg mb-1">Your cash has fallen below $0.</p>
          <p className="text-3xl text-red-400 font-mono tracking-wider drop-shadow-md">
            SHORTFALL: ${shortfall}K
          </p>
        </div>

        <p className="text-gray-300 text-sm relative z-10">
          You must resolve your debt before continuing. Choose one of the 4 lifelines below:
        </p>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          {/* Option 1: Crack a Deal */}
          <div className="bg-black/60 border border-gray-600 rounded-xl p-4 flex flex-col items-center justify-between gap-3 text-center">
             <h3 className="text-lg font-black text-[#55ffb0]">CRACK A DEAL</h3>
             <p className="text-[10px] text-gray-400">Ask another player for a bailout. Use the global Transfer button. Click here when your cash is $\ge$ 0.</p>
             <button onClick={handleCrackDeal} className="w-full py-2 bg-gradient-to-r from-green-700 to-green-900 rounded font-bold hover:from-green-600 hover:to-green-800 transition-colors text-xs uppercase tracking-widest text-white">Check Balance</button>
          </div>

          {/* Option 2: Sell a Company */}
          <div className="bg-black/60 border border-gray-600 rounded-xl p-4 flex flex-col items-center justify-between gap-3 text-center">
             <h3 className="text-lg font-black text-yellow-500">SELL COMPANY</h3>
             <p className="text-[10px] text-gray-400">Liquidate an asset. Refund = (Launch + Stage Up) - Active Loan.</p>
             {player.ownedCompanies?.length > 0 ? (
               <div className="w-full flex flex-col gap-2">
                 <select 
                   value={selectedCompany} 
                   onChange={(e) => setSelectedCompany(e.target.value)}
                   className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-xs text-white"
                 >
                   <option value="">Select Company</option>
                   {player.ownedCompanies.map(c => (
                     <option key={c.name} value={c.name}>{c.name}</option>
                   ))}
                 </select>
                 <button onClick={handleSellCompany} disabled={!selectedCompany} className="w-full py-2 bg-gradient-to-r from-yellow-700 to-yellow-900 rounded font-bold hover:from-yellow-600 hover:to-yellow-800 transition-colors disabled:opacity-50 text-xs uppercase tracking-widest text-white">Sell</button>
               </div>
             ) : (
               <p className="text-xs text-gray-500 font-italic mt-2">No companies owned</p>
             )}
          </div>

          {/* Option 3: Survival Bank Loan */}
          <div className="bg-black/60 border border-gray-600 rounded-xl p-4 flex flex-col items-center justify-between gap-3 text-center">
             <h3 className="text-lg font-black text-orange-500">SURVIVAL LOAN</h3>
             <p className="text-[10px] text-gray-400">Borrow exactly your shortfall (${shortfall}K). Interest rate becomes 30% per round.</p>
             <button onClick={handleSurvivalLoan} className="w-full py-2 bg-gradient-to-r from-orange-700 to-orange-900 rounded font-bold hover:from-orange-600 hover:to-orange-800 transition-colors text-xs uppercase tracking-widest text-white mt-auto">Take Loan</button>
          </div>

          {/* Option 4: Restart */}
          <div className="bg-black/60 border border-gray-600 rounded-xl p-4 flex flex-col items-center justify-between gap-3 text-center">
             <h3 className="text-lg font-black text-red-500">RESTART</h3>
             <p className="text-[10px] text-gray-400">Wipe your entire portfolio and all debt. Reset cash to $500K.</p>
             <button onClick={handleRestart} className="w-full py-2 bg-gradient-to-r from-red-700 to-red-900 rounded font-bold hover:from-red-600 hover:to-red-800 transition-colors text-xs uppercase tracking-widest text-white mt-auto">Full Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankruptcyModal;
