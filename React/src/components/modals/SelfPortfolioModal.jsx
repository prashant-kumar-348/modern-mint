import React, { useState } from 'react';
import { X, Lock, Edit2 } from 'lucide-react';

export default function SelfPortfolioModal({ onClose, player, sendAction }) {
  const [renamingCompany, setRenamingCompany] = useState(null);
  const [newName, setNewName] = useState('');

  const handleRenameSubmit = (companyName) => {
    if (newName.trim() !== '') {
      sendAction('phase2_action', {
        actionType: 'rename_company',
        companyName: companyName,
        newName: newName,
        amount: 0
      });
    }
    setRenamingCompany(null);
    setNewName('');
  };
  // Use mock data from the player prop, or fallback
  const ownedCompanies = player?.ownedCompanies || [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-6 font-sans animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[85vh] bg-[#0a1914] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 border-[#55ffb0] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-[20%] duration-300 ease-out"
      >
        {/* Header */}
        <div className="bg-[#1c4d3d]/50 border-b border-[#55ffb0]/30 px-6 py-4 flex items-center justify-between">
            <div>
               <div className="text-[10px] text-[#55ffb0] uppercase tracking-[0.3em] font-mono mb-1">Corporate Portfolio Overview</div>
               <h2 className="text-2xl font-black text-white uppercase tracking-wider">{player?.name || 'Your Portfolio'}</h2>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-black/40 rounded-full p-1.5 cursor-pointer">
              <X size={24} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
            
            {ownedCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <Lock size={48} className="text-[#a4d8c2] mb-4" />
                    <h3 className="text-xl font-bold text-[#55ffb0] uppercase tracking-widest">No Companies Owned</h3>
                    <p className="text-sm text-[#a4d8c2] mt-2">Acquire companies on the main board to build your portfolio.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {ownedCompanies.map((company, idx) => (
                        <div key={idx} className="bg-[#081510] rounded-xl p-4 border border-[#1c4d3d] shadow-lg flex flex-col">
                            
                            {/* Card Header */}
                            <div className="bg-[#0a1914] border border-[#55ffb0]/20 rounded-lg p-3 flex flex-col mb-4 shadow-inner relative">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded border border-[#55ffb0]/50 bg-[#1c4d3d]/50 flex items-center justify-center text-xl shadow-inner shrink-0">
                                      {company.icon || '🏢'}
                                  </div>
                                  <div className="flex-1">
                                      <h3 className="font-black text-sm text-white uppercase tracking-wider">{company.customName || company.name}</h3>
                                  </div>
                                </div>
                                
                                {renamingCompany === company.name ? (
                                  <div className="mt-3 flex gap-2">
                                    <input 
                                      type="text"
                                      autoFocus
                                      value={newName}
                                      onChange={(e) => setNewName(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(company.name)}
                                      className="flex-1 bg-black border border-[#55ffb0]/50 rounded px-2 py-1 text-xs text-white outline-none"
                                      placeholder="New Name..."
                                    />
                                    <button onClick={() => handleRenameSubmit(company.name)} className="bg-[#55ffb0] text-black text-xs font-bold px-2 rounded">
                                      SAVE
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => { setRenamingCompany(company.name); setNewName(company.customName || company.name); }}
                                    className="text-[#a4d8c2] hover:text-[#55ffb0] text-[9px] uppercase font-bold tracking-widest flex items-center gap-1 mt-2 self-start transition-colors"
                                  >
                                    <Edit2 size={10} /> CHANGE OR GIVE A NEW NAME
                                  </button>
                                )}
                            </div>

                            {/* Data Table */}
                            <div className="flex-1 bg-[#0a1914] rounded-lg border border-[#1c4d3d]/50 p-3">
                                {/* Headers */}
                                <div className="grid grid-cols-[28px_1fr_1fr_1fr_1fr_1fr] gap-1 text-[8px] text-[#a4d8c2] uppercase font-black mb-3 pb-2 border-b border-[#1c4d3d] text-center items-end leading-tight tracking-wider">
                                    <div className="text-left text-[#55ffb0]">TEAM</div>
                                    <div className="text-left">STAGE</div>
                                    <div>INVEST<br/>($K)</div>
                                    <div>PROJ<br/>REV ($K)</div>
                                    <div>VAL<br/>($K)</div>
                                    <div className="text-red-400">LOAN<br/>($K)</div>
                                </div>

                                {/* Active Stage Row */}
                                <div className="grid grid-cols-[28px_1fr_1fr_1fr_1fr_1fr] gap-1 items-center text-[10px] text-white text-center font-mono py-2 px-1 bg-[#1c4d3d]/20 rounded border border-[#55ffb0]/20">
                                    <div className="font-black text-[#55ffb0] text-xs text-left">{company.team}</div>
                                    <div className="text-left font-bold text-[10px] font-sans">{company.stage}</div>
                                    <div className="font-medium">{company.invest}</div>
                                    <div className="font-medium">{company.revenue}</div>
                                    <div className="font-medium">{company.valuation}</div>
                                    <div className="font-medium text-red-400">{company.loan}</div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
