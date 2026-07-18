import React, { useState } from "react";
import { X } from "lucide-react";

export default function BankLoanModal({ onClose, onFinalize, ownedCompanies, companyDataMap }) {

  const [loanRequests, setLoanRequests] = useState({});
  
  // Track the team token allocations
  const [teamAllocations, setTeamAllocations] = useState({});

  const totalCurrentLoan = Object.values(loanRequests).reduce((sum, amount) => sum + (Number(amount) || 0), 0);

  const handleAmountChange = (id, value) => {
    setLoanRequests((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleTeamChange = (companyId, stageIndex, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setTeamAllocations((prev) => ({
      ...prev,
      [`${companyId}-${stageIndex}`]: numericValue,
    }));
  };

  const handleFinalise = () => {
    const loanBreakdown = Object.keys(loanRequests)
      .filter(id => Number(loanRequests[id]) > 0)
      .map(name => {
        const comp = ownedCompanies.find(c => c.name === name);
        return {
          companyName: name,
          amount: Number(loanRequests[name]),
          stage: comp ? comp.stage : 0
        };
      });

    const activeCompanyNames = loanBreakdown.map(req => req.companyName);
    const uniqueCompanyNames = [...new Set(activeCompanyNames)].join(' & ').toUpperCase();

    if (onFinalize) {
      onFinalize(totalCurrentLoan, uniqueCompanyNames, loanBreakdown);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-8 font-sans">
      
      <div className="relative w-full max-w-6xl flex flex-col items-center scale-[0.75] sm:scale-[0.8] lg:scale-[0.85] xl:scale-90 origin-center mt-8">
        
        <button 
          onClick={onClose} 
          className="fixed top-0 right-0 -mr-2 pt-1 pr-0 pb-6 pl-6 rounded-bl-[2rem] bg-black/80 text-white/50 hover:text-white hover:bg-white/20 transition-colors z-[110] border-b border-l border-white/20 cursor-pointer flex items-center justify-center"
        >
          <X size={36} strokeWidth={2.5} />
        </button>

        {ownedCompanies.length === 0 ? (
          <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-20 pointer-events-auto w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.03)] relative">
              <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20"></div>
              <span className="text-5xl opacity-40 filter drop-shadow-md">🏛️</span>
            </div>
            <h2 className="text-white text-3xl font-black uppercase tracking-widest drop-shadow-md mb-3">No Portfolio Assets</h2>
            <p className="text-white/60 text-sm max-w-sm text-center font-medium leading-relaxed">
              You must launch companies during Phase 2 before you can borrow capital against them.
            </p>
          </div>
        ) : (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-between gap-8 bg-black/90 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20 z-[120] pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex flex-col items-end">
              <p className="text-gray-400 text-[10px] tracking-widest uppercase leading-none mb-1">Current Loan</p>
              <h2 className="text-white text-3xl font-black leading-none">${totalCurrentLoan}</h2>
            </div>
            <div className="w-[1px] h-10 bg-white/20"></div>
            <button 
              onClick={handleFinalise}
              className="bg-white text-black border border-white rounded-xl px-8 py-3 text-sm font-black tracking-widest uppercase hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            >
              Finalise Loan
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 lg:gap-x-32 gap-y-12 w-full relative pt-8 pb-40 px-4 lg:px-12 pointer-events-auto">
          
          {ownedCompanies.map((company, idx) => {
            const dataRow = companyDataMap[company.name];
            if (!dataRow) return null;
            const stageNames = ["Launch", "Retain", "Grow", "Scale"];
            const currentStageIdx = company.stage || 0;
            const isLoanLocked = company.loanTakenStage === currentStageIdx;
            
            // Generate the stages array dynamically
            const stages = stageNames.map((stg, i) => ({
              stage: stg,
              invest: dataRow[i][0],
              rev: dataRow[i][1],
              val: dataRow[i][2],
              loan: dataRow[i][3]
            }));
            
            const currentLoanAvail = stages[currentStageIdx].loan;
            
            return (
              <div key={idx} className="flex flex-col items-center gap-4">
                  <div 
                    className="relative bg-[#7A2A38] rounded-md p-4 pb-6 flex flex-col justify-start shadow-2xl transition-all w-full ring-1 ring-black/20"
                  >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#FFF9EB] w-[85%] rounded-full py-2 px-4 flex items-center gap-3 shadow-lg border border-[#3A141A]/20 z-10">
                    <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white shrink-0">
                      <div className="w-8 h-8 rounded-full border border-dashed border-gray-400 text-center flex items-center justify-center font-bold text-[#3A141A]">{company.team || 'T'}</div>
                    </div>
                    <div className="flex-1 text-center pr-8">
                      <h3 className="font-black text-2xl text-black leading-none">{company.name}</h3>
                      <p className="text-[11px] font-bold text-gray-800 tracking-wider uppercase mt-1">LVL {currentStageIdx + 1}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex-1 w-full relative">
                    <div className="grid grid-cols-[32px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[10px] text-[#FFD1DA] uppercase tracking-wider font-bold mb-3 pb-1.5 border-b border-white/20 text-center items-end">
                      <div className="text-left">TEAM</div>
                      <div className="text-left">STAGE</div>
                      <div>INVEST<br/>($K)</div>
                      <div>PROJECTED<br/>REV ($K)</div>
                      <div>VALUATION<br/>($K)</div>
                      <div>LOAN<br/>($K)</div>
                    </div>

                    <div className="space-y-3">
                      {stages.map((stage, i) => {
                        const isActive = i === currentStageIdx;
                        return (
                          <div 
                            key={i} 
                            className={`grid grid-cols-[32px_1fr_1fr_1fr_1fr_1fr] gap-2 items-center text-xs sm:text-sm text-center rounded px-1 transition-all ${isActive ? 'bg-[#FFC240]/20 border border-[#FFC240]/50 py-1 font-bold text-white shadow-sm' : 'text-white/80'}`}
                          >
                            <div className="flex justify-start">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength="2"
                                placeholder="-"
                                value={teamAllocations[`${company.name}-${i}`] || ""}
                                onChange={(e) => handleTeamChange(company.name, i, e.target.value)}
                                className="w-7 h-7 bg-black/20 border border-white/40 rounded text-center text-white text-xs font-bold focus:border-white focus:outline-none focus:bg-black/40 focus:ring-1 focus:ring-white transition-all placeholder-white/30"
                              />
                            </div>
                            <div className="text-left font-bold">{stage.stage}</div>
                            <div className="font-mono font-medium">{stage.invest}</div>
                            <div className="font-mono font-medium">{stage.rev}</div>
                            <div className="font-mono font-medium">{stage.val}</div>
                            <div className="font-mono font-medium">{stage.loan}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex items-end gap-3">
                      <div className="text-[10px] text-[#FFD1DA] uppercase font-bold leading-tight w-10 text-right">
                        EQUITY<br/>GIVEN
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-end h-4 border-b border-white/40 mb-1 px-1">
                          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((num) => (
                            <div key={num} className="flex flex-col items-center w-5">
                              <div className={`w-[1px] bg-white/50 ${num % 20 === 0 ? 'h-3' : 'h-1.5'}`}></div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-white/80 px-1 font-mono font-medium">
                          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((num) => (
                            <span key={num} className="w-5 text-center">{num}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center mt-2">
                  <span className="text-white text-3xl font-black leading-none drop-shadow-md">${currentLoanAvail}</span>
                  <span className="text-white font-bold uppercase tracking-widest mt-1 mb-2">MAX LOAN AVAIL</span>
                  
                  {isLoanLocked ? (
                    <div className="bg-[#5a1b26] border border-[#ff4d4d]/50 text-[#ffb3b3] font-black text-xs py-2 px-10 rounded-md shadow-lg opacity-80 cursor-not-allowed">
                      LOAN TAKEN THIS STAGE
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        const isRequested = Number(loanRequests[company.name]) === Number(currentLoanAvail);
                        handleAmountChange(company.name, isRequested ? 0 : Number(currentLoanAvail));
                      }}
                      className={`font-bold text-sm py-2 px-10 rounded-md shadow-lg transition-colors cursor-pointer border ${
                        Number(loanRequests[company.name]) === Number(currentLoanAvail)
                          ? "bg-[#55ffb0] hover:bg-[#45df90] border-[#55ffb0] text-black"
                          : "bg-[#A43B4D] hover:bg-[#8B3241] border-[#C5576A] text-white"
                      }`}
                    >
                      {Number(loanRequests[company.name]) === Number(currentLoanAvail) ? 'Cancel Loan' : 'Take Loan'}
                    </button>
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}