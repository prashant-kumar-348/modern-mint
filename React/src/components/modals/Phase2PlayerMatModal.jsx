import React, { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';

export default function Phase2PlayerMatModal({ onClose, onPaymentComplete, ownedCompanies, actionType, currentRound }) {
  const companies = [
    { id: 'c1', name: 'CONTRACT FARMING', icon: '🌾', data: [[10,100,500,0], [100,200,1000,20], [1000,1000,2500,200], [2000,2000,10000,400]] },
    { id: 'c2', name: 'AGRI IoT', icon: '📡', data: [[100,10,1000,0], [500,300,3000,300], [1500,1500,6000,2000], [8000,8000,36000,7000]] },
    { id: 'c3', name: 'WALLET', icon: '👛', data: [[50,10,1000,0], [1200,400,3000,400], [1500,2000,8000,1800], [7000,10000,36000,5000]] },
    { id: 'c4', name: 'SNACKS', icon: '🍿', data: [[10,20,1000,0], [300,200,1500,200], [1000,1100,7500,1500], [6000,4000,32000,8000]] },
    { id: 'c5', name: 'QUICK COMMERCE', icon: '🛒', data: [[10,30,100,0], [200,400,2500,100], [2000,1200,10000,800], [10000,4000,50000,6000]] },
    { id: 'c6', name: 'SMART STORAGE', icon: '📦', data: [[200,200,2000,200], [3000,1600,5000,2000], [3000,5400,9000,4000], [10000,7500,40000,12000]] },
    { id: 'c7', name: 'RESTRO - CHAIN', icon: '🍽️', data: [[150, 300, 1000, 200], [300, 400, 2000, 500], [1200, 1400, 4000, 2000], [12000, 8000, 26000, 15000]] },
    { id: 'c8', name: 'TRACEABILITY', icon: '🔍', data: [[30,30,300,0], [300,200,2000,200], [1200,2000,7500,1000], [10000,8000,38000,5000]] },
    { id: 'c9', name: 'ROBO - PACKAGING', icon: '🤖', data: [[100,150,1500,200], [1200,500,4000,1000], [5000,2500,15000,2000], [4000,9000,45000,8000]] },
  ];

  const teamUpgradeCosts = {
    'CONTRACT FARMING': [5, 10, 15, 20],
    'AGRI IoT': [5, 10, 15, 20],
    'WALLET': [5, 10, 15, 20],
    'SNACKS': [5, 10, 15, 20],
    'QUICK COMMERCE': [5, 10, 15, 20],
    'SMART STORAGE': [5, 10, 15, 20],
    'RESTRO - CHAIN': [5, 10, 15, 20],
    'TRACEABILITY': [5, 10, 15, 20],
    'ROBO - PACKAGING': [5, 10, 15, 20]
  };

  const stages = ["Launch", "Retain", "Grow", "Scale"];

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [cinematicStep, setCinematicStep] = useState(0);

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    if (actionType === 'stage_up') {
      setCinematicStep(1);
    } else {
      setCinematicStep(2);
    }
  };

  useEffect(() => {
    if (cinematicStep === 1) {
      const timer = setTimeout(() => {
        setCinematicStep(2);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [cinematicStep]);

  let requiredCost = 0;
  if (selectedCompany) {
    if (actionType === 'buy_pr') {
       const ownedData = ownedCompanies.find(c => c.name === selectedCompany.name);
       const prCosts = [100, 300, 500, 700];
       requiredCost = prCosts[ownedData ? (ownedData.team || 1) - 1 : 0] || 100;
    } else if (actionType === 'upgrade_workforce') {
       const ownedData = ownedCompanies.find(c => c.name === selectedCompany.name);
       if (ownedData && teamUpgradeCosts[selectedCompany.name]) {
         requiredCost = teamUpgradeCosts[selectedCompany.name][ownedData.stage];
       }
    } else {
      const ownedData = ownedCompanies.find(c => c.name === selectedCompany.name);
      let targetStageIdx = 0;
      if (actionType === 'stage_up' && ownedData) {
         targetStageIdx = Math.min(ownedData.stage + 1, 3);
      }
      requiredCost = selectedCompany.data[targetStageIdx][0];
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans animate-in fade-in duration-300">
      
      <div className="relative w-full max-w-[1400px] h-[95vh] bg-[#501625]/90 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-[#2A0D12] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 scale-[0.9] xl:scale-100 origin-center">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-50 transition-colors bg-black/40 rounded-full p-2">
          <X size={28} />
        </button>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-content-start">
          {companies.map(company => {
            const ownedData = ownedCompanies.find(c => c.name === company.name);
            const isLaunched = !!ownedData;
            const currentStageIdx = ownedData ? ownedData.stage : -1;
            
            let isLockedForAction = false;
            let lockMessage = "";
            if (actionType === 'launch') {
              if (isLaunched) {
                isLockedForAction = true;
                lockMessage = "ALREADY OWNED";
              } else if (ownedCompanies.length >= 4) {
                isLockedForAction = true;
                lockMessage = "MAX 4 LAUNCHES REACHED";
              }
            } else if (actionType === 'stage_up') {
              if (!isLaunched) {
                isLockedForAction = true;
                lockMessage = "NOT LAUNCHED YET";
              } else if (ownedData.stage >= 3) {
                isLockedForAction = true;
                lockMessage = "MAX STAGE REACHED";
              } else if (ownedData.upgradedRound === currentRound) {
                isLockedForAction = true;
                lockMessage = "MAX 1 UPGRADE PER ROUND";
              }
            } else if (actionType === 'buy_pr') {
              if (!isLaunched) {
                isLockedForAction = true;
                lockMessage = "NOT LAUNCHED YET";
              } else if (ownedData.prBoughtRound === currentRound) {
                isLockedForAction = true;
                lockMessage = "MAX 1 PR PER ROUND";
              }
            } else if (actionType === 'upgrade_workforce') {
              if (!isLaunched) {
                isLockedForAction = true;
                lockMessage = "NOT LAUNCHED YET";
              } else if (ownedData.workforceUpgradedRound === currentRound) {
                isLockedForAction = true;
                lockMessage = "MAX 1 UPGRADE PER ROUND";
              }
            } else {
              isLockedForAction = !isLaunched;
              lockMessage = "NOT LAUNCHED YET";
            }

            return (
              <div 
                key={company.id} 
                onClick={() => !isLockedForAction && handleCompanyClick(company)}
                className={`bg-[#7D3C4A] rounded-xl p-4 border border-[#3A141A] flex flex-col relative shadow-lg transition-transform duration-200 h-[280px] ${isLockedForAction ? 'opacity-40 cursor-not-allowed grayscale-[0.5]' : 'cursor-pointer hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(255,194,64,0.2)] hover:border-[#FFC240]/50'}`}
              >
                {/* Header Pill */}
                <div className="bg-[#FFF2D8] w-[95%] mx-auto rounded-full py-2 px-3 flex items-center gap-3 shadow-md border border-[#3A141A]/20 -mt-7 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-full border border-dashed border-gray-400 bg-white flex items-center justify-center text-xl shadow-inner shrink-0">
                    {company.icon}
                  </div>
                  <h3 className="font-black text-sm text-[#4A1720] uppercase tracking-tight flex-1 text-center pr-4">
                    {company.name}
                  </h3>
                </div>

                {isLockedForAction && (
                  <div className="absolute inset-0 top-5 z-20 flex flex-col items-center justify-center bg-[#7D3C4A]/60 backdrop-blur-[2px] rounded-b-xl border-t border-white/5 pointer-events-none">
                    <Lock size={32} className="text-[#FFC240]/60 mb-2 drop-shadow-md" />
                    <span className="text-[#FFC240]/80 font-black text-[10px] tracking-widest">{lockMessage}</span>
                  </div>
                )}
                
                {/* Data Rows */}
                <div className={`flex-1 w-full pt-1 flex flex-col ${!isLaunched ? 'opacity-30' : 'opacity-100'} pointer-events-none transition-opacity duration-300`}>
                  <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr_1fr] gap-1 text-[9px] text-[#FFD1DA] uppercase font-black mb-2 pb-1 border-b border-white/20 text-center items-end leading-tight">
                    <div className="text-left">TEAM</div><div className="text-left">STAGE</div><div>Invest<br/>($K)</div><div>Projected<br/>Rev ($K)</div><div>Valuation<br/>($K)</div><div>Loan<br/>($K)</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-evenly mb-2">
                    {stages.map((stage, idx) => {
                      const rowData = company.data[idx];
                      const isActiveStage = idx === currentStageIdx;
                      const teamLevel = isLaunched ? (ownedData?.team || 1) : 0;
                      const isTeamUnlocked = idx < teamLevel;
                      return (
                        <div key={idx} className={`grid grid-cols-[30px_1fr_1fr_1fr_1fr_1fr] gap-1 items-center text-xs text-center ${isActiveStage ? 'bg-[#FFC240]/20 rounded-md py-1.5 border border-[#FFC240]/50 shadow-sm' : 'text-white/90 py-1'}`}>
                          <div className={`w-5 h-5 rounded border ml-0.5 flex items-center justify-center text-[10px] font-black transition-all ${isTeamUnlocked ? 'bg-[#55ffb0] border-[#55ffb0] text-black shadow-[0_0_10px_rgba(85,255,176,0.5)]' : 'bg-gray-500/50 border-white/10 text-transparent'}`}>
                            {idx + 1}
                          </div>
                          <div className={`text-left font-black tracking-wide ${isActiveStage ? 'text-[#FFC240]' : 'text-[#FFD1DA]'}`}>{stage}</div>
                          <div className="font-bold">{rowData[0]}</div><div className="font-bold">{rowData[1]}</div><div className="font-bold">{rowData[2]}</div><div className="font-bold">{rowData[3]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
        
        {/* LARGE PAYMENT & MULTIPLIER OVERLAY */}
        {selectedCompany && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => { setSelectedCompany(null); setCinematicStep(0); }}>
            <div className="bg-[#2A0D12] border-2 border-[#FFC240] rounded-2xl shadow-[0_0_50px_rgba(255,194,64,0.3)] flex w-full max-w-5xl h-[85vh] overflow-hidden relative" onClick={e => e.stopPropagation()}>
              
              <button onClick={() => { setSelectedCompany(null); setCinematicStep(0); }} className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors z-50">
                 <X size={24} />
              </button>

              {/* SCREEN 2: Highlight Current Stage */}
              {cinematicStep === 1 && (
                <div className="flex-1 p-8 flex flex-col items-center justify-center animate-in zoom-in duration-500">
                   {(() => {
                     const currentStageIdx = ownedCompanies.find(c => c.name === selectedCompany.name)?.stage || 0;
                     return (
                       <>
                         <h2 className="text-[#FFC240] font-black text-4xl uppercase tracking-widest mb-8">Current Stage</h2>
                         <div className="text-white text-7xl font-black uppercase mb-6 drop-shadow-[0_0_20px_rgba(255,194,64,0.8)]">
                            {stages[currentStageIdx]}
                         </div>
                         <div className="bg-black/50 p-6 rounded-xl border border-white/20 text-center">
                           <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-2">Projected Revenue</p>
                           <p className="text-4xl text-[#55ffb0] font-mono font-black">${selectedCompany.data[currentStageIdx][1]}K</p>
                         </div>
                       </>
                     );
                   })()}
                </div>
              )}

              {/* SCREEN 3: Payment UI */}
              {cinematicStep === 2 && (
                <div className="flex-1 p-8 flex flex-col items-center justify-center relative animate-in slide-in-from-right duration-500">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#FFC240]/50 bg-white flex items-center justify-center text-6xl shadow-inner mb-6">
                    {selectedCompany.icon}
                  </div>
                  <h3 className="font-black text-3xl text-white uppercase tracking-tight mb-2 text-center">
                    {selectedCompany.name}
                  </h3>
                  <p className="text-[#FFC240] font-bold tracking-widest text-sm mb-12">
                    {actionType === 'launch' ? 'LAUNCH COMPANY' : 
                     actionType === 'stage_up' ? 'STAGE UP COMPANY' : 
                     actionType === 'upgrade_workforce' ? 'UPGRADE WORKFORCE' : 
                     'BUY PR SERVICES'}
                  </p>

                  {/* All Actions (Fixed Read-Only) */}
                  <h4 className="text-white/80 font-black uppercase tracking-widest mb-4 text-sm drop-shadow-md">
                    Required Cost
                  </h4>
                  
                  <div className="w-[280px] bg-black/60 border-2 border-[#FFC240]/50 text-white font-mono text-4xl font-bold rounded-xl py-4 flex items-center justify-center gap-2 shadow-inner mb-6">
                    <span className="text-white/50 text-xl">$</span>
                    {requiredCost}
                    <span className="text-white/50 text-xl">K</span>
                  </div>
                  
                  <button 
                    onClick={() => onPaymentComplete(selectedCompany.name, requiredCost)}
                    className="w-[280px] bg-gradient-to-br from-[#FFC240] to-[#F59E0B] text-[#2A0D12] font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(255,194,64,0.4)] hover:scale-105 active:scale-95 transition-all tracking-wider uppercase border border-white/40"
                  >
                    Confirm Payment
                  </button>
                </div>
              )}

              {/* Right Side: Multiplier Table (Only for stage_up and Screen 3) */}
              {actionType === 'stage_up' && cinematicStep === 2 && (
                <div className="flex-1 bg-[#1A080B] border-l border-[#FFC240]/30 p-8 flex flex-col">
                  <div className="mb-6">
                    <h4 className="text-[#FFC240] font-black text-2xl uppercase tracking-wider drop-shadow-md mb-1">
                      Multiplier Table
                    </h4>
                    <p className="text-[#FFD1DA]/70 text-[11px] uppercase tracking-widest font-bold">
                      Actual Revenue = Projected Revenue x Multiplier
                    </p>
                  </div>
                  
                  <div className="flex-1 w-full bg-black/40 rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-inner">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] bg-[#FFC240]/10 border-b border-[#FFC240]/30 text-[#FFC240] text-[10px] uppercase font-black py-3 px-2 text-center items-center">
                      <div className="text-white/80 text-left pl-2">Dice Roll</div>
                      <div>Launch</div>
                      <div>Retain</div>
                      <div>Grow</div>
                      <div>Scale</div>
                    </div>
                    {/* Table Body (12 rows) */}
                    <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map((roll) => (
                        <div key={roll} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] border-b border-white/5 text-white/80 text-xs font-mono py-2 px-2 text-center hover:bg-white/5 transition-colors">
                          <div className="font-black text-white text-left pl-4">{roll}</div>
                          <div className="text-gray-400">-2</div>
                          <div className="text-gray-400">0</div>
                          <div className="text-[#55ffb0]">1</div>
                          <div className="text-[#55ffb0] font-bold">4</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
