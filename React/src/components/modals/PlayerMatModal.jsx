import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';

export default function PlayerMatModal({ onClose, ownedCompanies = [] }) {
  // Exact data extracted from your uploaded Player Mat screenshot
  const companies = [
    { id: 'c1', name: 'CONTRACT FARMING', icon: '🌾', data: [[10,100,500,0], [100,200,1000,20], [1000,1000,25000,200], [2000,2000,70000,400]] },
    { id: 'c2', name: 'AGRI IoT', icon: '📡', data: [[100,10,1000,0], [500,200,6000,200], [1000,1000,18000,2000], [8000,8000,36000,7000]] },
    { id: 'c3', name: 'WALLET', icon: '👛', data: [[100,10,1000,0], [1000,400,2000,400], [1500,2000,36000,800], [2500,12000,98000,5000]] },
    { id: 'c4', name: 'SNACKS', icon: '🍿', data: [[10,20,1000,0], [200,200,7000,200], [1000,1000,25000,1000], [4000,4000,220000,8000]] },
    { id: 'c5', name: 'QUICK COMMERCE', icon: '🛒', data: [[10,50,1000,0], [200,400,2500,100], [2000,1000,100000,1500], [10000,4000,320000,10000]] },
    { id: 'c6', name: 'SMART STORAGE', icon: '📦', data: [[200,200,2000,200], [3000,1000,12000,2000], [5000,5000,18000,4000], [10000,7000,40000,12000]] },
    { id: 'c7', name: 'RESTRO - CHAIN', icon: '🍽️', data: [[50,200,1000,200], [500,400,2000,500], [1200,1400,40000,2000], [12000,8000,280000,10000]] },
    { id: 'c8', name: 'TRACEABILITY', icon: '🔍', data: [[50,50,500,0], [200,200,2000,200], [500,2000,7500,1000], [10000,10000,38000,5000]] },
    { id: 'c9', name: 'ROBO - PACKAGING', icon: '🤖', data: [[100,50,1500,250], [1200,500,4000,1000], [5000,2500,150000,2000], [8000,10000,450000,8000]] },
  ];

  const stages = ["Launch", "Retain", "Grow", "Scale"];
  
  const [teamAllocations, setTeamAllocations] = useState({});
  // Removed local launchedCompanies state; now derived from server ownedCompanies
  const [notes, setNotes] = useState("");

  const handleTeamChange = (companyId, stageIndex, value) => {
    const numericValue = value.replace(/[^0-9]/g, ''); // Ensure only numbers
    setTeamAllocations(prev => ({ ...prev, [`${companyId}-${stageIndex}`]: numericValue }));
  };

  const toggleLaunch = (companyId) => {
    // Disabled in Phase 2 reactive mode: companies can only be launched via the Phase 2 Dashboard actions!
  };

  return (
    // MODIFIED HERE: Added onClick={onClose} to allow clicking the background to close
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-6 font-sans animate-in fade-in duration-300"
      onClick={onClose}
    >
      
      {/* MODIFIED HERE: Added stopPropagation() so clicking the mat doesn't close it, and added animation classes */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[1400px] h-[95vh] bg-[#501625] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-[#2A0D12] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-[20%] duration-300 ease-out"
      >
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-50 transition-colors bg-black/40 rounded-full p-1.5">
          <X size={28} />
        </button>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 md:p-6 flex flex-col xl:flex-row gap-6">
          
          {/* ================================================= */}
          {/* LEFT: 3x3 Grid of Companies                       */}
          {/* ================================================= */}
          <div className="flex-[3] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(company => {
              const isLaunched = ownedCompanies.some(c => c.name === company.name);

              return (
                <div key={company.id} className="bg-[#7D3C4A] rounded-xl p-3 border border-[#3A141A] flex flex-col relative shadow-lg">
                  
                  {/* Card Header (Cream Pill) */}
                  <div className="bg-[#FFF2D8] w-[95%] mx-auto rounded-full py-2 px-3 flex items-center gap-3 shadow-md border border-[#3A141A]/20 -mt-6 mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full border border-dashed border-gray-400 bg-white flex items-center justify-center text-lg shadow-inner">
                      {company.icon}
                    </div>
                    <h3 className="font-black text-xs md:text-sm text-[#4A1720] uppercase tracking-tight leading-none flex-1 text-center pr-4">
                      {company.name}
                    </h3>
                  </div>

                  {/* LAUNCH OVERLAY */}
                  {!isLaunched && (
                     <div className="absolute inset-0 top-5 z-20 flex flex-col items-center justify-center bg-[#7D3C4A]/20 backdrop-blur-[1px] rounded-b-xl border-t border-white/5">
                        <Lock size={32} className="text-white/40 mb-4 drop-shadow-md" />
                        <button 
                          onClick={() => toggleLaunch(company.id)}
                          className="bg-[#FFF2D8] text-[#4A1720] px-6 py-2.5 rounded-full border-2 border-[#4A1720] font-black uppercase tracking-widest hover:bg-[#EAE4D3] hover:scale-105 transition-all shadow-lg text-xs"
                        >
                          Launch Company
                        </button>
                     </div>
                  )}

                  {/* Undo Launch Button */}
                  {isLaunched && (
                     <button onClick={() => toggleLaunch(company.id)} className="absolute top-3 right-3 text-[9px] text-white/30 hover:text-white uppercase font-bold z-10 transition-colors">
                       Undo Launch
                     </button>
                  )}

                  {/* Data Table */}
                  <div className="flex-1 w-full pt-2 flex flex-col">
                    {/* Headers */}
                    <div className="grid grid-cols-[28px_1fr_1fr_1fr_1fr_1fr] gap-1 text-[8px] text-[#FFD1DA] uppercase font-black mb-2 pb-1 border-b border-white/20 text-center items-end leading-tight">
                      <div className="text-left">TEAM</div>
                      <div className="text-left">STAGE</div>
                      <div>Invest<br/>($K)</div>
                      <div>Projected<br/>Rev ($K)</div>
                      <div>Valuation<br/>($K)</div>
                      <div>Loan<br/>($K)</div>
                    </div>

                    {/* Rows */}
                    <div className="flex-1 flex flex-col justify-around pb-2">
                      {stages.map((stage, i) => (
                        <div key={i} className="grid grid-cols-[28px_1fr_1fr_1fr_1fr_1fr] gap-1 items-center text-[10px] text-white text-center">
                          <input
                            type="text" 
                            inputMode="numeric" 
                            maxLength="2" 
                            value={teamAllocations[`${company.id}-${i}`] || ""}
                            onChange={(e) => handleTeamChange(company.id, i, e.target.value)}
                            className="w-6 h-6 bg-transparent border-2 border-white/30 rounded-sm text-center text-white text-xs font-bold outline-none focus:border-white focus:bg-white/10 transition-all placeholder-white/20"
                          />
                          <div className="text-left font-bold text-[11px]">{stage}</div>
                          <div className="font-mono font-medium">{company.data[i][0]}</div>
                          <div className="font-mono font-medium">{company.data[i][1]}</div>
                          <div className="font-mono font-medium">{company.data[i][2]}</div>
                          <div className="font-mono font-medium">{company.data[i][3]}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equity Slider Ruler */}
                  <div className="mt-4 flex items-end gap-2 px-1">
                    <div className="text-[7px] text-[#FFD1DA] uppercase font-bold leading-tight w-8 text-right">
                      EQUITY<br/>GIVEN
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end h-3 border-b border-white/40 mb-0.5 px-0.5">
                        {[0,10,20,30,40,50,60,70,80,90,100].map(num => (
                          <div key={num} className={`w-[1px] bg-white/60 ${num % 20 === 0 ? 'h-2' : 'h-1'}`}></div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[6.5px] text-white/80 font-mono font-medium px-0.5">
                        {[0,10,20,30,40,50,60,70,80,90,100].map(num => (
                           <span key={num} className="w-3 text-center">{num}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* ================================================= */}
          {/* RIGHT: Sidebars (Second Chance, Multiplier, Notes)*/}
          {/* ================================================= */}
          <div className="flex-1 flex flex-col gap-4 min-w-[320px] max-w-sm mx-auto xl:mx-0">
            
            {/* Second Chance Tokens */}
            <div className="bg-[#FFF2D8] rounded-xl border-2 border-[#3A141A] p-4 text-center shadow-lg">
              <h3 className="font-black text-[#4A1720] uppercase tracking-widest mb-3 text-sm">Second Chance</h3>
              <div className="flex justify-center gap-4">
                {/* Active Tokens */}
                <div className="w-14 h-14 rounded-full border-4 border-[#4A1720] bg-black shadow-inner overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-orange-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-[#4A1720] bg-black shadow-inner overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-orange-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                </div>
                {/* Inactive Token */}
                <div className="w-14 h-14 rounded-full border-4 border-gray-500 bg-gray-800 shadow-inner overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-700 to-gray-500 opacity-80"></div>
                </div>
              </div>
            </div>

            {/* Multiplier Table */}
            <div className="bg-[#FFF2D8] rounded-xl border-2 border-[#3A141A] overflow-hidden shadow-lg">
              <div className="p-2 text-[9px] text-center font-black text-[#4A1720] uppercase tracking-wider border-b border-[#3A141A]/20">
                 Actual Revenue = Projected Revenue x Multiplier
              </div>
              <table className="w-full text-center text-[10px] font-bold border-collapse text-black">
                <thead>
                  <tr className="bg-[#E5DCC5]">
                    <th className="border-r border-b border-[#3A141A]/20 p-1 w-12 text-[8px]" rowSpan="2">DICE<br/>ROLL</th>
                    <th className="border-b border-[#3A141A]/20 p-1 tracking-widest text-[10px]" colSpan="4">MULTIPLIER</th>
                  </tr>
                  <tr className="bg-[#E5DCC5] text-[8px]">
                    <th className="border-r border-b border-[#3A141A]/20 p-1">TURN 1<br/>$0K</th>
                    <th className="border-r border-b border-[#3A141A]/20 p-1">TURN 2<br/>$50K</th>
                    <th className="border-r border-b border-[#3A141A]/20 p-1">TURN 3<br/>$100K</th>
                    <th className="border-b border-[#3A141A]/20 p-1">TURN 4<br/>$200K</th>
                  </tr>
                </thead>
                <tbody className="bg-[#FFF2D8] font-mono font-medium">
                  {[
                    [1, -2, -2, -1, 0], [2, -2, -1, 0, 1], [3, -1, -1, 0, 1],
                    [4, -1, 0, 1, 2], [5, 0, 0, 1, 2], [6, 0, 1, 2, 3],
                    [7, 1, 1, 2, 3], [8, 1, 2, 3, 4], [9, 2, 2, 3, 4], [10, 2, 3, 4, 5]
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/50 transition-colors">
                      <td className="border-r border-b border-[#3A141A]/20 p-1 font-bold bg-[#E5DCC5]/30">{row[0]}</td>
                      <td className="border-r border-b border-[#3A141A]/20 p-1">{row[1]}</td>
                      <td className="border-r border-b border-[#3A141A]/20 p-1">{row[2]}</td>
                      <td className="border-r border-b border-[#3A141A]/20 p-1">{row[3]}</td>
                      <td className="border-b border-[#3A141A]/20 p-1">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes Section */}
            <div className="bg-[#FFF2D8] rounded-xl border-2 border-[#3A141A] p-4 shadow-lg flex-1 flex flex-col min-h-[250px] relative">
              <h3 className="font-black text-[#4A1720] uppercase text-sm mb-2 text-center tracking-widest border-b border-[#3A141A]/10 pb-2">Notes / Calculations</h3>
              <textarea 
                className="flex-1 w-full bg-transparent border-none outline-none resize-none text-[#4A1720] font-sans text-sm p-2 font-medium"
                placeholder="Type your notes and calculations here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              {/* Watermark Logo */}
              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-[0.15]">
                 <h1 className="font-black tracking-[0.3em] text-[#4A1720] text-2xl">MODERN MINT</h1>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}