import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const COMPANY_TEMPLATES = [
  'CONTRACT FARMING',
  'AGRI IoT',
  'WALLET',
  'SNACKS',
  'QUICK COMMERCE',
  'SMART STORAGE',
  'RESTRO - CHAIN',
  'TRACEABILITY',
  'ROBO - PACKAGING'
];

const MentorInventoryModal = ({ onClose, player, players, onPlayCard }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [targetPlayerId, setTargetPlayerId] = useState('');
  const [targetCompanyName, setTargetCompanyName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mentorCards = player?.mentorCards || [];

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setTargetPlayerId('');
    setTargetCompanyName('');
    setErrorMsg('');
  };

  const handleApplyLater = () => {
    setSelectedCard(null);
  };

  const handleApplyNow = () => {
    if (!selectedCard) return;

    const effect = selectedCard.effectType;
    
    // Validate target player
    const needsPlayer = ['skip_rival_turn', 'mutual_draw', 'halve_rival_cash'].includes(effect);
    if (needsPlayer && !targetPlayerId) {
      setErrorMsg('Please select a target rival player.');
      return;
    }

    // Validate target company
    const needsCompany = [
      'free_stage_up', 'free_pr', 'free_workforce', 'half_cost_stage_up', 
      'double_revenue', 'half_cost_all_stages', 'tech_revenue_boost', 
      'reduce_tax', 'end_game_valuation_boost', 'sell_company_half_price', 
      'block_stage_up'
    ].includes(effect);
    
    if (needsCompany && !targetCompanyName) {
      setErrorMsg('Please select a target company.');
      return;
    }

    // Validate quick launch template
    if (effect === 'quick_launch_retain' && !targetCompanyName) {
      setErrorMsg('Please select a company to launch.');
      return;
    }

    // Call callback to send play action to backend
    onPlayCard(selectedCard.id, targetPlayerId, targetCompanyName);
    setSelectedCard(null);
  };

  // Determine if a card needs targets
  const getCardRequirements = (card) => {
    if (!card) return { needsPlayer: false, needsCompany: false, needsTemplates: false };
    const effect = card.effectType;
    return {
      needsPlayer: ['skip_rival_turn', 'mutual_draw', 'halve_rival_cash'].includes(effect),
      needsCompany: [
        'free_stage_up', 'free_pr', 'free_workforce', 'half_cost_stage_up', 
        'double_revenue', 'half_cost_all_stages', 'tech_revenue_boost', 
        'reduce_tax', 'end_game_valuation_boost', 'sell_company_half_price', 
        'block_stage_up'
      ].includes(effect),
      needsTemplates: effect === 'quick_launch_retain'
    };
  };

  const { needsPlayer, needsCompany, needsTemplates } = getCardRequirements(selectedCard);
  const rivals = players.filter(p => p.id !== player.id);
  const ownedCompanies = player.ownedCompanies || [];
  
  // Templates that are not owned yet
  const unownedTemplates = COMPANY_TEMPLATES.filter(
    tName => !ownedCompanies.some(c => c.name === tName)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 font-sans animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[75vh] bg-[#1a080b] border-4 border-[#FFC240] rounded-3xl flex flex-col overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-300">
        
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,194,64,0.05)_0%,transparent_70%)] pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 bg-[#0d0406] border-b border-[#FFC240]/30 px-8 py-5 flex items-center justify-between shadow-lg">
          <h2 className="text-2xl font-black text-[#FFC240] uppercase tracking-widest flex items-center gap-3">
            <span className="text-3xl">🃏</span> Stored Mentor Cards
          </h2>
          <button 
            onClick={onClose} 
            className="text-white/50 hover:text-white transition-colors bg-white/5 rounded-full p-2.5 cursor-pointer border border-white/10 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#1a080b] to-[#0a0304]">
          {mentorCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentorCards.map((card, idx) => (
                <div 
                  key={card.uniqueId || card.id || idx} 
                  onClick={() => handleCardClick(card)}
                  className="bg-gradient-to-br from-[#40121d] to-[#1c070c] border-2 border-[#FFC240]/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between text-center group hover:scale-[1.03] active:scale-95 transition-all hover:border-[#FFC240] cursor-pointer relative overflow-hidden"
                >
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-[#FFC240]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="w-16 h-16 bg-[#FFF2D8] rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner border border-[#3A141A]/20">
                    {card.icon || '🃏'}
                  </div>
                  <h3 className="text-[#FFC240] font-black uppercase tracking-wider mb-2 text-lg leading-tight">
                    {card.name || card.title}
                  </h3>
                  <div className="bg-black/35 text-white/40 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase border border-white/5 mb-4">
                    {card.type}
                  </div>
                  <p className="text-white/80 leading-relaxed text-xs">
                    {card.description || card.desc}
                  </p>
                  
                  <div className="mt-5 w-full py-2 bg-white/5 group-hover:bg-[#FFC240] text-white group-hover:text-black font-black text-[10px] tracking-wider rounded-xl uppercase transition-colors border border-white/10 group-hover:border-transparent">
                    Activate Card
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/40">
              <span className="text-7xl mb-4 animate-bounce">📭</span>
              <p className="text-lg font-black uppercase tracking-widest">Your inventory is empty</p>
              <p className="text-xs text-white/30 mt-2 font-mono">Buy mentor cards during Phase 2 to store them here.</p>
            </div>
          )}
        </div>

        {/* Selected Card Option Overlay / Prompt */}
        {selectedCard && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#250d11] border-2 border-[#FFC240] rounded-3xl p-8 shadow-[0_0_50px_rgba(255,194,64,0.3)] flex flex-col gap-5 text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
              
              {/* Card Details display */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#FFF2D8] rounded-full flex items-center justify-center text-4xl mb-3 border border-[#3A141A]/20">
                  {selectedCard.icon || '🃏'}
                </div>
                <h3 className="text-[#FFC240] font-black uppercase tracking-wider text-xl leading-none">
                  {selectedCard.name || selectedCard.title}
                </h3>
                <span className="text-[9px] font-black bg-black/40 px-2 py-0.5 rounded text-white/50 border border-white/5 uppercase mt-2 tracking-widest">
                  {selectedCard.type}
                </span>
                <p className="text-white/80 text-xs leading-relaxed mt-4 bg-black/20 p-4 rounded-xl border border-white/5 max-w-sm">
                  {selectedCard.description}
                </p>
              </div>

              {/* Dynamic Target Selection UI */}
              {(needsPlayer || needsCompany || needsTemplates) && (
                <div className="flex flex-col gap-2.5 text-left bg-black/30 p-4 rounded-xl border border-white/5 mt-1">
                  <span className="text-[10px] font-black text-[#FFC240] tracking-widest uppercase">Target Selection Required:</span>
                  
                  {/* Select Company Target */}
                  {needsCompany && (
                    <select
                      value={targetCompanyName}
                      onChange={(e) => {
                        setTargetCompanyName(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full bg-[#18080a] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFC240]"
                    >
                      <option value="">-- Select Company --</option>
                      {ownedCompanies.map(c => (
                        <option key={c.name} value={c.name}>{c.name} (Stage: {['Launch', 'Retain', 'Grow', 'Scale'][c.stage || 0]})</option>
                      ))}
                    </select>
                  )}

                  {/* Select Template Target (for launching) */}
                  {needsTemplates && (
                    <select
                      value={targetCompanyName}
                      onChange={(e) => {
                        setTargetCompanyName(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full bg-[#18080a] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFC240]"
                    >
                      <option value="">-- Select Template to Launch --</option>
                      {unownedTemplates.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  )}

                  {/* Select Rival Player Target */}
                  {needsPlayer && (
                    <select
                      value={targetPlayerId}
                      onChange={(e) => {
                        setTargetPlayerId(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full bg-[#18080a] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFC240]"
                    >
                      <option value="">-- Select Rival Player --</option>
                      {rivals.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (${p.cash}K Cash)</option>
                      ))}
                    </select>
                  )}

                  {errorMsg && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider animate-pulse mt-1">
                      ⚠️ {errorMsg}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons: Apply Now vs Apply Later */}
              <div className="grid grid-cols-2 gap-4 mt-3">
                <button
                  onClick={handleApplyNow}
                  className="py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(34,197,94,0.3)] border border-white/10 active:scale-95 cursor-pointer"
                >
                  Apply Now
                </button>
                <button
                  onClick={handleApplyLater}
                  className="py-3.5 bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 text-white/80 hover:text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md border border-white/10 active:scale-95 cursor-pointer"
                >
                  Apply Later
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MentorInventoryModal;
