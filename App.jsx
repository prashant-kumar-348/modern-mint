import React, { useState, useEffect } from 'react';
import { ref, set } from "firebase/database";
import { db } from './firebase'; // Make sure this path matches where you saved firebase.js
import { 
  Coins, 
  Truck, 
  Cpu, 
  Users, 
  FileText, 
  DollarSign, 
  X, 
  Check, 
  ShieldAlert,
  Percent,
  Layers,
  ArrowRight,
  UserCheck
} from 'lucide-react';

import BankLoanModal from './components/modals/BankLoanModal';
import DealSheetModal from './components/modals/DealSheetModal';
import BottomDashboard from './components/dashboard/BottomDashboard';
import { GameProvider } from './context/GameContext';

function App() {
  const [activeModal, setActiveModal] = useState(null);
  // === NEW CODE ADDED HERE: STATE ===
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  
  // HUD interactive state
  const [capital, setCapital] = useState(12.5); // $12.5M
  const [logistics, setLogistics] = useState(8); // x8
  const [tech, setTech] = useState(6); // x6
  const [dealCount, setDealCount] = useState(0);
  const [actionCount, setActionCount] = useState(2);

  // Bank Loan state
  const [loans, setLoans] = useState({
    Farma: { current: 0, increment: 1.0, max: 5.0, interest: '12%' },
    Kheti: { current: 0, increment: 0.5, max: 3.0, interest: '8%' },
    Storg: { current: 0, increment: 1.5, max: 6.0, interest: '10%' }
  });

  // Deal Sheet state
  const [dealForm, setDealForm] = useState({
    cash: '',
    equity: '',
    loan: '',
    royalty: '',
    terms: '',
    proposerSigned: false,
    receiverSigned: false
  });

  const handleGetLoan = (company) => {
    setLoans(prev => {
      const currentLoan = prev[company].current;
      const maxLoan = prev[company].max;
      const inc = prev[company].increment;
      if (currentLoan + inc <= maxLoan) {
        return {
          ...prev,
          [company]: {
            ...prev[company],
            current: parseFloat((currentLoan + inc).toFixed(1))
          }
        };
      }
      return prev;
    });
  };

  const handleFinalizeLoan = () => {
    const totalNewLoans = Object.values(loans).reduce((sum, item) => sum + item.current, 0);
    if (totalNewLoans > 0) {
      setCapital(prev => parseFloat((prev + totalNewLoans).toFixed(2)));
    }
    setActiveModal(null);
  };

  const handleResetLoans = () => {
    setLoans({
      Farma: { current: 0, increment: 1.0, max: 5.0, interest: '12%' },
      Kheti: { current: 0, increment: 0.5, max: 3.0, interest: '8%' },
      Storg: { current: 0, increment: 1.5, max: 6.0, interest: '10%' }
    });
  };

  const submitDeal = (e) => {
    e.preventDefault();
    if (!dealForm.proposerSigned || !dealForm.receiverSigned) {
      alert("Both parties must sign the Deal Sheet before finalizing!");
      return;
    }
    setDealCount(prev => prev + 1);
    setActionCount(prev => Math.max(0, prev - 1));
    setActiveModal(null);
    setDealForm({
      cash: '',
      equity: '',
      loan: '',
      royalty: '',
      terms: '',
      proposerSigned: false,
      receiverSigned: false
    });
  };

  // ==========================================
  // FIREBASE MULTIPLAYER LOBBY LOGIC
  // ==========================================

  // 1. Generates a random 4-character room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MINT-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // 2. Creates the room in Firebase and copies the share link
  const handleCreateGame = async () => {
    try {
      const newRoomCode = generateRoomCode();

      // Create the room in Firebase Realtime Database
      const roomRef = ref(db, 'rooms/' + newRoomCode);
      await set(roomRef, {
        status: 'lobby',
        createdAt: Date.now(),
        players: {
          player1: { name: "Host (You)", isReady: false }
        }
      });

      // Update the browser URL without refreshing the page
      const newUrl = `${window.location.origin}?room=${newRoomCode}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      
      // Copy the link to clipboard
      navigator.clipboard.writeText(newUrl);
      
      alert(`Game Created! Room Code: ${newRoomCode}\n\nThe Share Link has been copied to your clipboard!`);
      
    } catch (error) {
      // If Firebase fails, this will catch the error and tell you why!
      console.error("Firebase Connection Error:", error);
      alert(`Failed to create game: ${error.message}`);
    }
  };

  // ==========================================

  return (
    <GameProvider>
      <div className="relative w-screen h-screen overflow-hidden bg-[#030806] text-[#a4d8c2] select-none font-sans">
      
      {/* === NEW CODE ADDED HERE: TEST BUTTON AND MODAL === */}
      <button 
        className="absolute top-10 left-1/2 -translate-x-1/2 z-50 text-white bg-green-600 px-4 py-2 font-bold pointer-events-auto shadow-lg rounded"
        onClick={() => setIsLoanModalOpen(true)}
      >
        Test Open Bank Loan
      </button>

      {/* Render the Modal conditionally */}
      {isLoanModalOpen && (
        <BankLoanModal onClose={() => setIsLoanModalOpen(false)} />
      )}
      {/* =================================================== */}

      {/* 3D WebGL Canvas Background Layer (Pointer clicks pass through this) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        {/*
          Unity WebGL Canvas will be injected here:
          <Unity canvasClassName="w-full h-full" />
        */}
        
        {/* Premium cybernetic background overlay grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(28,77,61,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(28,77,61,0.2)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#030806_95%)] pointer-events-none"></div>
        
        <div className="text-center opacity-25">
          <div className="text-xs uppercase tracking-[0.4em] text-[#55ffb0] mb-2">Simulation Space</div>
          <div className="font-mono text-sm tracking-[0.2em] border border-[#1c4d3d]/30 rounded-lg px-8 py-4 bg-[#0a1914]/40 backdrop-blur-sm">
            &lt; UNITY 3D WEBGL BOARD CANVAS &gt;
          </div>
        </div>
      </div>

      {/* HUD 2D Overlay (pointer-events-none, grid aligns HUD components) */}
      <div className="relative z-10 grid grid-cols-[340px_1fr_340px] grid-rows-[1fr_auto] h-full w-full p-6 gap-6 pointer-events-none">
        
        {/* LEFT COLUMN: Team Tokens */}
        <div className="col-start-1 row-start-1 flex flex-col justify-start pointer-events-auto">
          <div className="glass-panel rounded-xl p-5 border-l-4 border-l-[#d4af37]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1c4d3d]/50 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#a4d8c2]/60">Corporation Status</span>
                <h2 className="text-[#d4af37] font-bold text-lg tracking-wider">TEAM TOKENS</h2>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#55ffb0] animate-pulse shadow-[0_0_8px_#55ffb0]"></div>
            </div>

            {/* Token Rows */}
            <div className="space-y-4">
              {/* Capital Token */}
              <div className="flex items-center justify-between bg-[#0a1914]/50 border border-[#1c4d3d]/30 rounded-lg p-3 hover:border-[#55ffb0]/40 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#d4af37]/10 rounded-lg text-[#d4af37] group-hover:scale-105 transition-transform">
                    <Coins size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#a4d8c2]/50">Capital Asset</div>
                    <div className="text-xs text-[#a4d8c2]/80">Gold Reserves</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#d4af37]">${capital}M</div>
                  <div className="text-[9px] text-[#55ffb0]">+12.5% yield</div>
                </div>
              </div>

              {/* Logistics Token */}
              <div className="flex items-center justify-between bg-[#0a1914]/50 border border-[#1c4d3d]/30 rounded-lg p-3 hover:border-[#55ffb0]/40 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#55ffb0]/10 rounded-lg text-[#55ffb0] group-hover:scale-105 transition-transform">
                    <Truck size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#a4d8c2]/50">Logistics</div>
                    <div className="text-xs text-[#a4d8c2]/80">Supply Pipelines</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#55ffb0]">x{logistics}</div>
                  <div className="text-[9px] text-[#a4d8c2]/60">Operational</div>
                </div>
              </div>

              {/* Technology Token */}
              <div className="flex items-center justify-between bg-[#0a1914]/50 border border-[#1c4d3d]/30 rounded-lg p-3 hover:border-[#55ffb0]/40 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00e1ff]/10 rounded-lg text-[#00e1ff] group-hover:scale-105 transition-transform">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#a4d8c2]/50">Technology</div>
                    <div className="text-xs text-[#a4d8c2]/80">Patents & R&D</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#00e1ff]">x{tech}</div>
                  <div className="text-[9px] text-[#00e1ff]/80">Level 4 Node</div>
                </div>
              </div>
            </div>

            {/* Extra cosmetic readout to feel ultra premium */}
            <div className="mt-4 pt-3 border-t border-[#1c4d3d]/30 flex items-center justify-between text-[10px] text-[#a4d8c2]/40 font-mono">
              <span>SYSTEM LOAD: OPTIMAL</span>
              <span>INDEX: 94.2 pts</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: (Empty space for 3D Board) */}
        <div className="col-start-2 row-start-1 pointer-events-none"></div>

        {/* RIGHT COLUMN: Session Lobby */}
        <div className="col-start-3 row-start-1 flex flex-col justify-start pointer-events-auto">
          <div className="glass-panel rounded-xl p-5 border-r-4 border-r-[#55ffb0]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1c4d3d]/50 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#a4d8c2]/60">Active Lobby</span>
                <h2 className="text-[#55ffb0] font-bold text-lg tracking-wider">SESSION LOBBY</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-[#55ffb0]/10 border border-[#55ffb0]/30 rounded-full px-2.5 py-0.5 text-[9px] text-[#55ffb0] font-mono">
                <Users size={10} />
                <span>4/4</span>
              </div>
            </div>

            {/* Players List */}
            <div className="space-y-3">
              {/* Player 1 */}
              <div className="flex items-center justify-between bg-[#0a1914]/40 border border-[#1c4d3d]/20 rounded-lg p-2.5 hover:bg-[#0a1914]/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse shadow-[0_0_6px_#ef4444]"></span>
                  <span className="text-sm font-medium text-white">Ruthless Negotiator</span>
                </div>
                <span className="text-[9px] uppercase font-mono tracking-wider text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/30">
                  Host
                </span>
              </div>

              {/* Player 2 */}
              <div className="flex items-center justify-between bg-[#0a1914]/40 border border-[#1c4d3d]/20 rounded-lg p-2.5 hover:bg-[#0a1914]/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#55ffb0] shadow-[0_0_4px_#55ffb0]"></span>
                  <span className="text-sm font-medium text-[#a4d8c2]">Conservative Gua</span>
                </div>
                <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">
                  Ready
                </span>
              </div>

              {/* Player 3 */}
              <div className="flex items-center justify-between bg-[#0a1914]/40 border border-[#1c4d3d]/20 rounded-lg p-2.5 hover:bg-[#0a1914]/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse shadow-[0_0_6px_#3b82f6]"></span>
                  <span className="text-sm font-medium text-[#a4d8c2]">Robotic Strategist</span>
                </div>
                <span className="text-[9px] uppercase font-mono tracking-wider text-blue-400 bg-blue-950/30 px-2 py-0.5 rounded border border-blue-900/30">
                  Thinking
                </span>
              </div>

              {/* Player 4 */}
              <div className="flex items-center justify-between bg-[#0a1914]/40 border border-[#1c4d3d]/20 rounded-lg p-2.5 hover:bg-[#0a1914]/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] shadow-[0_0_4px_#eab308]"></span>
                  <span className="text-sm font-medium text-[#a4d8c2]">Greedy Opportun</span>
                </div>
                <span className="text-[9px] uppercase font-mono tracking-wider text-yellow-400 bg-yellow-950/30 px-2 py-0.5 rounded border border-yellow-900/30">
                  Away
                </span>
              </div>
            </div>

            {/* Game Logs Mock Feed */}
            <div className="mt-4 pt-4 border-t border-[#1c4d3d]/30">
              <span className="text-[10px] uppercase tracking-wider text-[#a4d8c2]/50 font-bold block mb-2">Event Feed</span>
              <div className="font-mono text-[9px] text-[#a4d8c2]/40 space-y-1.5 h-20 overflow-y-auto">
                <div>[18:24] Farma Corp stock values dropped 2.1%.</div>
                <div>[18:24] Greedy Opportun took $3M Loan.</div>
                <div>[18:23] Phase 2 Lobby initiated.</div>
                <div>[18:23] Ruthless Negotiator connected.</div>
              </div>
            </div>

            {/* NEW: CREATE GAME BUTTON */}
            <button 
              onClick={handleCreateGame}
              className="w-full mt-4 py-3 bg-[#0a1914]/80 border border-[#55ffb0] text-[#55ffb0] hover:bg-[#55ffb0] hover:text-[#0a1914] transition-colors font-bold rounded-lg tracking-widest text-xs uppercase cursor-pointer shadow-[0_0_10px_rgba(85,255,176,0.1)] hover:shadow-[0_0_20px_rgba(85,255,176,0.3)]"
            >
              Create New Game
            </button>

          </div>
        </div>

        {/* BOTTOM ROW: Bottom Panel (Spans Center Column) */}
        <div className="col-start-2 row-start-2 flex justify-center items-end pb-2 pointer-events-auto">
          <div className="glass-panel rounded-xl px-6 py-4 flex items-center gap-8 border-b-4 border-b-[#55ffb0] shadow-2xl">
            
            {/* Round info */}
            <div className="border-r border-[#1c4d3d]/50 pr-8">
              <div className="bg-[#55ffb0]/15 text-[#55ffb0] border border-[#55ffb0]/30 rounded px-2.5 py-0.5 text-xs font-bold tracking-widest font-mono uppercase mb-1">
                YEAR 1 | PHASE 2
              </div>
              <div className="text-[10px] text-[#a4d8c2]/60 uppercase tracking-wider">
                Current Turn: <span className="text-white font-medium">Ruthless Negotiator</span>
              </div>
            </div>

            {/* Readouts */}
            <div className="flex items-center gap-8">
              {/* Deal Tracker */}
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest text-[#a4d8c2]/50 mb-0.5">Deal Tracker</div>
                <div className="text-3xl font-extrabold text-[#55ffb0] font-mono leading-none">{dealCount}</div>
              </div>

              {/* Action Tracker */}
              <div className="text-center border-r border-[#1c4d3d]/50 pr-8">
                <div className="text-[10px] uppercase tracking-widest text-[#a4d8c2]/50 mb-0.5">Actions Left</div>
                <div className="text-3xl font-extrabold text-[#d4af37] font-mono leading-none">{actionCount}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pl-2">
              <button 
                onClick={() => setActiveModal('deal')}
                className="px-6 py-3 border border-[#55ffb0] text-[#55ffb0] rounded-lg font-bold tracking-wider text-xs uppercase hover:bg-[#55ffb0]/15 active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(85,255,176,0.1)]"
              >
                OFFER DEAL
              </button>
              <button 
                onClick={() => setActiveModal('loan')}
                className="px-6 py-3 bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0a1914] rounded-lg font-extrabold tracking-wider text-xs uppercase active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#d4af37]/25"
              >
                TAKE BANK LOAN
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* POPUP MODALS WITH BACKDROP */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm pointer-events-auto transition-opacity duration-300">
          
          {/* BANK LOAN MODAL */}
          {activeModal === 'loan' && (
            <div className="bg-red-950/90 border-2 border-red-500 max-w-3xl w-full rounded-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200">
              
              {/* Close Button */}
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Title & Description */}
              <div className="mb-6 flex items-center gap-3 border-b border-red-500/20 pb-4">
                <div className="p-2.5 bg-red-500/10 rounded-lg text-red-500">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-400 tracking-wider">BANK LOAN DEPT.</h3>
                  <p className="text-xs text-red-300/60 uppercase tracking-widest font-mono">Select a Corporation Credit Line</p>
                </div>
              </div>

              {/* Cards Container */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {Object.entries(loans).map(([name, data]) => (
                  <div 
                    key={name} 
                    className="bg-[#1a0a0f]/80 border border-red-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-red-500/60 transition-all shadow-[inset_0_0_12px_rgba(239,68,68,0.03)]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base tracking-wide text-white">{name} Corp</span>
                        <span className="text-[10px] px-2 py-0.5 bg-red-500/15 border border-red-500/30 rounded font-mono text-red-400">
                          {data.interest} APR
                        </span>
                      </div>
                      <div className="text-xs text-red-300/50 mb-4 uppercase font-mono">Financial Services</div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-xs">
                          <span className="text-red-300/40">Credit Limit:</span>
                          <span className="font-bold text-red-400 font-mono">${data.max}M</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-red-300/40">Increment Unit:</span>
                          <span className="font-semibold text-red-300 font-mono">${data.increment}M</span>
                        </div>
                        <div className="pt-2 border-t border-red-500/10 flex justify-between items-end">
                          <span className="text-[10px] text-red-300/50 uppercase">Current Loan:</span>
                          <span className="font-extrabold text-white text-lg font-mono">${data.current}M</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleGetLoan(name)}
                      disabled={data.current + data.increment > data.max}
                      className="w-full py-2 bg-red-950/40 hover:bg-red-500/20 disabled:bg-gray-900/40 border border-red-500/50 disabled:border-red-950/20 text-red-400 disabled:text-red-900/40 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {data.current + data.increment > data.max ? 'LIMIT REACHED' : `GET $${data.increment}M LOAN`}
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Pending and Finalize Button */}
              <div className="bg-[#1f0c12] border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-red-400/60 uppercase tracking-widest font-mono">Total Loan Pending Finalization</div>
                  <div className="text-2xl font-black text-white font-mono mt-0.5">
                    ${Object.values(loans).reduce((sum, item) => sum + item.current, 0).toFixed(1)}M
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleResetLoans}
                    className="px-4 py-2 border border-red-500/30 hover:border-red-500/60 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    RESET LOAN
                  </button>
                  <button 
                    onClick={handleFinalizeLoan}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-extrabold uppercase tracking-widest cursor-pointer shadow-lg shadow-red-900/40 transition-colors"
                  >
                    FINALIZE LOAN
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* DEAL SHEET MODAL */}
          {activeModal === 'deal' && (
            <div className="bg-white text-black max-w-lg w-full rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 border-t-8 border-[#d4af37]">
              
              {/* Close Button */}
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Document Header */}
              <div className="text-center mb-6">
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37] font-extrabold font-mono">Modern Mint Strategy Co.</span>
                <h3 className="text-2xl font-black tracking-tight text-gray-900 mt-1 uppercase">OFFICIAL DEAL SHEET</h3>
                <div className="w-12 h-1 bg-[#d4af37] mx-auto mt-2.5"></div>
              </div>

              {/* Deal Form */}
              <form onSubmit={submitDeal} className="space-y-4">
                
                {/* Financial Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Cash Consideration ($M)</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number"
                        placeholder="0.00"
                        step="0.1"
                        min="0"
                        value={dealForm.cash}
                        onChange={(e) => setDealForm({ ...dealForm, cash: e.target.value })}
                        className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37]"
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
                        value={dealForm.equity}
                        onChange={(e) => setDealForm({ ...dealForm, equity: e.target.value })}
                        className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37]"
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
                        value={dealForm.loan}
                        onChange={(e) => setDealForm({ ...dealForm, loan: e.target.value })}
                        className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37]"
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
                        value={dealForm.royalty}
                        onChange={(e) => setDealForm({ ...dealForm, royalty: e.target.value })}
                        className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Textarea */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Additional Terms & Conditions</label>
                  <textarea 
                    rows="3"
                    placeholder="Enter strategic agreements, merger covenants or collateral details..."
                    value={dealForm.terms}
                    onChange={(e) => setDealForm({ ...dealForm, terms: e.target.value })}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs w-full resize-none outline-none focus:border-[#d4af37] font-sans"
                  ></textarea>
                </div>

                {/* Signature boxes */}
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-100 my-4">
                  {/* Proposer Signature */}
                  <div 
                    onClick={() => setDealForm({ ...dealForm, proposerSigned: !dealForm.proposerSigned })}
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all select-none ${
                      dealForm.proposerSigned 
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-400'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {dealForm.proposerSigned ? (
                        <div className="p-1 bg-emerald-500 text-white rounded-full">
                          <Check size={14} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs uppercase font-mono">
                          RN
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-bold uppercase">Proposer Signature</div>
                    <div className="text-[9px] mt-0.5 font-mono italic">
                      {dealForm.proposerSigned ? 'Signed digitally' : 'Click to Sign'}
                    </div>
                  </div>

                  {/* Receiver Signature */}
                  <div 
                    onClick={() => setDealForm({ ...dealForm, receiverSigned: !dealForm.receiverSigned })}
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all select-none ${
                      dealForm.receiverSigned 
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-400'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {dealForm.receiverSigned ? (
                        <div className="p-1 bg-emerald-500 text-white rounded-full">
                          <Check size={14} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs uppercase font-mono">
                          CG
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-bold uppercase">Receiver Signature</div>
                    <div className="text-[9px] mt-0.5 font-mono italic">
                      {dealForm.receiverSigned ? 'Signed digitally' : 'Click to Sign'}
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-black hover:bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    SUBMIT DEAL SHEET
                  </button>
                </div>

              </form>

            </div>
          )}

        </div>
      )}
      
      {/* === NEW CODE ADDED HERE: BOTTOM DASHBOARD === */}
      <div className="absolute bottom-0 w-full z-50 pointer-events-auto">
        <BottomDashboard />
      </div>
      {/* ============================================== */}
      
      </div>
    </GameProvider>
  );
}

export default App;