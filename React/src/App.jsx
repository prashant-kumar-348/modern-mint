import React, { useState, useEffect } from 'react';
import { ref, set } from "firebase/database";
import { db } from './firebase';
import {
  Coins,
  Truck,
  Cpu,
  Users,
  X,
  ShieldAlert,
  Landmark,
  Crown,
  Mic,
  Send,
  Search,
  FileText,
  Activity
} from 'lucide-react';

import BankLoanModal from './components/modals/BankLoanModal';
import DealSheetModal from './components/modals/DealSheetModal';
import MentorCardModal from './components/modals/MentorCardModal';
import MentorInventoryModal from './components/modals/MentorInventoryModal';
import PersonaSelectModal from './components/modals/PersonaSelectModal';
import PlayerMatModal from './components/modals/PlayerMatModal';
import SelfPortfolioModal from './components/modals/SelfPortfolioModal';
import TransferCashModal from './components/modals/TransferCashModal';
import MiddleBoard from './components/board/MiddleBoard';
import { GameProvider } from './context/GameContext';
import { useMultiplayer } from './hooks/useMultiplayer';
import Lobby from './components/Lobby';
import VoiceChatManager from './components/VoiceChatManager';
import Phase2Dashboard from './components/board/Phase2Dashboard';
import Phase2Manager from './components/board/Phase2Manager';
import PhaseEndScreenModal from './components/modals/PhaseEndScreenModal';
import Phase3DiceModal from './components/modals/Phase3DiceModal';
import BankruptcyModal from './components/modals/BankruptcyModal';
import FormalizeDealModal from './components/modals/FormalizeDealModal';
import RoyaltyProposalModal from './components/modals/RoyaltyProposalModal';
import RepayLoanModal from './components/modals/RepayLoanModal';
import PhaseTransitionOverlay from './components/board/PhaseTransitionOverlay';
const safeSessionStorage = {
  getItem: (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn("sessionStorage is blocked:", e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn("sessionStorage is blocked:", e);
    }
  }
};

const getPlayerGradient = (color) => {
  if (color === '#ef4444') return 'from-[#571717] to-[#843040]';
  if (color === '#55ffb0') return 'from-[#112a20] to-[#1c4d3d]';
  if (color === '#d4af37') return 'from-[#2d2006] to-[#5e481b]';
  if (color === '#00e1ff') return 'from-[#072430] to-[#0e4e68]';
  return 'from-gray-800 to-gray-700';
};

const getCompanyShortName = (name) => {
  const upper = name.toUpperCase();
  if (upper.includes("FARM")) return "FARMA";
  if (upper.includes("SNACKS") || upper.includes("RESTRO")) return "KHANAA";
  if (upper.includes("COMM")) return "QUICKY";
  if (upper.includes("WALLET")) return "WALLET";
  if (upper.includes("IOT")) return "AGRI";
  if (upper.includes("STOR")) return "SMARTY";
  if (upper.includes("TRACE")) return "TRACE";
  if (upper.includes("ROBO")) return "ROBO";
  return upper.split(' ')[0];
};

function App() {
  const [activeModal, setActiveModal] = useState(null); 
  // 'deal', 'topup', 'mentor', 'team_action', 'pe_fund', 'phaseEnd'
  const [activeTopPanel, setActiveTopPanel] = useState(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState(null);
  const [isBankrupt, setIsBankrupt] = useState(false);
  const [royaltyProposal, setRoyaltyProposal] = useState(null);

  // Responsive Desktop Scaling (Letterboxed)
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const baseWidth = 1920;
      const baseHeight = 1080;
      const scaleX = window.innerWidth / baseWidth;
      const scaleY = window.innerHeight / baseHeight;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const [isTalking, setIsTalking] = useState(false);
  const [dealTarget, setDealTarget] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });

  const [launchedCompanies, setLaunchedCompanies] = useState({
    1: { launched: true, logo: '🌾', stage: 'L', teamColor: 'from-gray-300 to-gray-500' },
    2: { launched: true, logo: '📡', stage: 'G', teamColor: 'from-yellow-600 to-yellow-800' },
    3: { launched: false, logo: '📦', stage: 'L', teamColor: 'from-[#b87333] to-[#8c5220]' },
    4: { launched: false, logo: '🚚', stage: 'S', teamColor: 'from-blue-400 to-blue-600' }
  });

  const [roomId, setRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room');
  });
  const [username, setUsername] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUsername = params.get('username');
    if (urlUsername) {
      safeSessionStorage.setItem('modernmint_username', urlUsername);
      return urlUsername;
    }
    return safeSessionStorage.getItem('modernmint_username') || '';
  });
  const [role, setRole] = useState(() => {
    return safeSessionStorage.getItem('modernmint_role') || 'Founder';
  });

  console.log("App Render Context:", { roomId, username, search: window.location.search });

  // Keep URL in sync with roomId and remove username parameter to keep links shareable
  useEffect(() => {
    if (roomId) {
      const params = new URLSearchParams(window.location.search);
      let updated = false;
      if (params.get('room') !== roomId) {
        params.set('room', roomId);
        updated = true;
      }
      if (params.has('username')) {
        params.delete('username');
        updated = true;
      }
      if (updated) {
        const newUrl = `?${params.toString()}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    }
  }, [roomId]);

  const { gameState, notification: serverNotification, sendAction, socketId, drawnCard, clearDrawnCard } = useMultiplayer(roomId, username, role);
  const gamePhase = gameState?.phase || 1;
  const gameRound = gameState?.round || 1;

  useEffect(() => {
    setNotification(serverNotification);
  }, [serverNotification]);

  // Trigger Phase 2 End Screen when everyone locks
  useEffect(() => {
    if (gamePhase === 2 && gameState?.players?.length > 0 && gameState.players.every(p => p.isLocked)) {
      if (activeModal !== 'phaseEnd') {
        setActiveModal('phaseEnd');
      }
    }
  }, [gameState?.players, gamePhase, activeModal]);

  // Listen for phase2_end_proceed and phase 3 events
  useEffect(() => {
    const handleProceed = () => {
      sendAction('end_phase2_turn', {});
    };
    const handleSecondChance = () => {
      sendAction('second_chance_roll', {});
    };
    const handleBankruptcy = (e) => {
      console.log("BANKRUPTCY TRIGGERED", e.detail);
      setIsBankrupt(true);
    };
    const handleBankruptcyCleared = () => {
      setIsBankrupt(false);
    };

    const handleRoyaltyProposal = (e) => {
      setRoyaltyProposal(e.detail);
    };

    window.addEventListener('royalty_proposal_received', handleRoyaltyProposal);

    window.addEventListener('phase2_end_proceed', handleProceed);
    window.addEventListener('trigger_second_chance', handleSecondChance);
    window.addEventListener('trigger_bankruptcy', handleBankruptcy);
    window.addEventListener('bankruptcy_cleared', handleBankruptcyCleared);

    return () => {
      window.removeEventListener('phase2_end_proceed', handleProceed);
      window.removeEventListener('trigger_second_chance', handleSecondChance);
      window.removeEventListener('trigger_bankruptcy', handleBankruptcy);
      window.removeEventListener('bankruptcy_cleared', handleBankruptcyCleared);
      window.removeEventListener('royalty_proposal_received', handleRoyaltyProposal);
    };
  }, [sendAction]);

  // If no room is joined, or no username is selected, show Lobby
  if (!roomId || !username) {
    return (
      <Lobby 
        existingRoomId={roomId} 
        onJoin={(id, name) => { 
          safeSessionStorage.setItem('modernmint_username', name);
          setRoomId(id); 
          setUsername(name); 
          
          // Ensure URL only has room ID
          const params = new URLSearchParams(window.location.search);
          params.set('room', id);
          params.delete('username');
          const newUrl = `?${params.toString()}`;
          window.history.replaceState({ path: newUrl }, '', newUrl);
        }} 
      />
    );
  }
  
  if (!gameState) {
    return (
      <div className="w-screen h-screen bg-[#030806] flex items-center justify-center text-[#55ffb0] font-mono tracking-widest uppercase">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#55ffb0] border-t-transparent rounded-full animate-spin"></div>
          <div>Connecting to Server...</div>
        </div>
      </div>
    );
  }

  const companyDataMap = {
    'CONTRACT FARMING': [[10,100,500,0], [100,200,1000,20], [1000,1000,2500,200], [2000,2000,10000,400]],
    'AGRI IoT': [[100,10,1000,0], [500,300,3000,300], [1500,1500,6000,2000], [8000,8000,36000,7000]],
    'WALLET': [[50,10,1000,0], [1200,400,3000,400], [1500,2000,8000,1800], [7000,10000,36000,5000]],
    'SNACKS': [[10,20,1000,0], [300,200,1500,200], [1000,1100,7500,1500], [6000,4000,32000,8000]],
    'QUICK COMMERCE': [[10,30,100,0], [200,400,2500,100], [2000,1200,10000,800], [10000,4000,50000,6000]],
    'SMART STORAGE': [[200,200,2000,200], [3000,1600,5000,2000], [3000,5400,9000,4000], [10000,7500,40000,12000]],
    'RESTRO - CHAIN': [[150, 300, 1000, 200], [300, 400, 2000, 500], [1200, 1400, 4000, 2000], [12000, 8000, 26000, 15000]],
    'TRACEABILITY': [[30,30,300,0], [300,200,2000,200], [1200,2000,7500,1000], [10000,8000,38000,5000]],
    'ROBO - PACKAGING': [[100,150,1500,200], [1200,500,4000,1000], [5000,2500,15000,2000], [4000,9000,45000,8000]]
  };

  const { players, deals, phase } = gameState;
  const localPlayer = (socketId ? players.find(p => p.id === socketId) : null) || players.find(p => p.name === username) || players[0];
  const localPlayerName = localPlayer?.name || username;
  
  const capital = localPlayer?.capital ?? 0;
  const globalLoan = localPlayer?.loan ?? 0;
  const cash = localPlayer?.cash ?? 0;
  const valuation = localPlayer?.valuation ?? 0;
  const isLocked = localPlayer?.isLocked || false;

  // Player-specific metrics
  const localPlayerDeals = (deals || []).filter(d => 
    d.proposer?.toLowerCase() === localPlayerName.toLowerCase() || 
    d.partner?.toLowerCase() === localPlayerName.toLowerCase()
  );
  const localDealCount = localPlayerDeals.length;
  const localActionCount = localPlayer?.actionCount ?? 0;

  const augmentedPlayers = players.map(p => ({
    ...p,
    isLocal: socketId ? (p.id === socketId) : (p.name === username),
    hasLocked: p.isLocked
  }));

  // Global Notification
  const showGlobalNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  const handleFinalizeLoan = (totalNewLoans, activeCompanies, loanBreakdown) => {
    if (totalNewLoans > 0) {
      sendAction('take_loan', { amount: totalNewLoans, loanBreakdown: loanBreakdown, companiesString: activeCompanies || 'YOUR COMPANIES' });
    }
    setActiveModal(null);
  };

  const submitDeal = (dealForm) => {
    sendAction('offer_deal', { 
      targetPlayer: dealTarget || 'Random Player',
      cash: Number(dealForm.cash) || 0,
      loan: Number(dealForm.loan) || 0
    });
    setActiveModal(null);
    setDealTarget(null);
  };

  const isMyPhase1Turn = gamePhase === 1 && gameState?.players?.[gameState?.phase1TurnIndex || 0]?.id === socketId;
  const activePhase1Player = gamePhase === 1 ? gameState?.players?.[gameState?.phase1TurnIndex || 0] : null;

  const isMyPhase2Turn = gamePhase === 2 && gameState?.players?.[gameState?.phase2TurnIndex || 0]?.id === socketId;
  const activePhase2Player = gamePhase === 2 ? gameState?.players?.[gameState?.phase2TurnIndex || 0] : null;

  const phase3Founders = (gameState?.players || []).filter(p => p.role === 'Founder');
  const isMyPhase3Turn = gamePhase === 3 && phase3Founders[gameState?.phase3TurnIndex || 0]?.id === socketId;
  const activePhase3Player = gamePhase === 3 ? phase3Founders[gameState?.phase3TurnIndex || 0] : null;

  const isCurrentPlayerTurnActive = 
    gamePhase === 1 ? isMyPhase1Turn : 
    gamePhase === 2 ? isMyPhase2Turn : 
    gamePhase === 3 ? isMyPhase3Turn : 
    true;

  const isTurnLocked = isLocked || !isCurrentPlayerTurnActive;

  const activePlayerObj = 
    gamePhase === 1 ? activePhase1Player :
    gamePhase === 2 ? activePhase2Player :
    gamePhase === 3 ? activePhase3Player :
    null;



  const handleLockDeal = () => {
    if (!isLocked) {
      if (gamePhase === 1) {
        sendAction('lock_phase1', {});
      } else if (gamePhase === 2) {
        sendAction('end_phase2_turn', {});
      } else {
        sendAction('lock_turn', {});
      }
    }
  };

  const handleLaunchCompany = (playerId) => {
    sendAction('launch_company', { targetPlayerId: playerId });
  };

  return (
    <GameProvider>
        <VoiceChatManager roomName={roomId} username={username} isTalking={isTalking} />
        <PhaseTransitionOverlay phase={gamePhase} />
        
        {isBankrupt && localPlayer && (
           <BankruptcyModal 
             player={localPlayer} 
             onResolve={(option, companyName) => sendAction('resolve_bankruptcy', { option, companyName })} 
           />
        )}
        
        {activeModal === 'transfer' && localPlayer && (
           <TransferCashModal 
             players={gameState?.players || []} 
             localPlayer={localPlayer} 
             onClose={() => setActiveModal(null)}
             onTransfer={(targetPlayerId, amount) => sendAction('transfer_cash', { targetPlayerId, amount })} 
             onOpenFormalizeDeal={() => setActiveModal('formalize_deal')}
           />
        )}

        {activeModal === 'formalize_deal' && localPlayer && (
          <FormalizeDealModal
            players={gameState?.players || []}
            localPlayer={localPlayer}
            onClose={() => setActiveModal(null)}
            sendAction={sendAction}
          />
        )}

        {royaltyProposal && (
          <RoyaltyProposalModal
            proposal={royaltyProposal}
            onClose={() => setRoyaltyProposal(null)}
            sendAction={sendAction}
          />
        )}

        <div className="relative w-screen h-screen overflow-hidden bg-[#030806] flex items-center justify-center font-sans">
        
        {/* Background Image with Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[10px] scale-110"
          style={{ backgroundImage: `url('/bg.jpg')` }}
        />

        <div 
          className="relative z-10 w-[1920px] h-[1080px] shrink-0 overflow-hidden text-[#a4d8c2] select-none"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
        >

        {/* DEV: FORCE PHASE BUTTON */}
        <button 
          onClick={() => sendAction('force_next_phase', {})}
          className="absolute top-4 left-4 z-50 bg-red-600 text-white font-black uppercase text-xs px-4 py-2 rounded pointer-events-auto hover:bg-red-500 shadow-lg border border-red-400"
        >
          Dev: Force Next Phase
        </button>

        {/* TOP NOTIFICATION PROMPTS */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto">
          {isLocked ? (
            <div className="bg-black/80 border border-[#d4af37] text-white px-8 py-3 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] text-center animate-in slide-in-from-top">
              <h3 className="text-xl font-bold tracking-widest uppercase mb-1">Waiting for Others!</h3>
              <p className="text-xs text-[#d4af37]">Waiting for remaining players to lock their turns...</p>
            </div>
          ) : activeTopPanel === 'prompts' ? (
            <div className="rounded-xl p-[2px] bg-gradient-to-r from-[#8a6818] via-[#FFE885] to-[#8a6818] shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-black/95 rounded-[10px] px-24 py-6 text-center min-w-[500px] md:min-w-[650px] flex flex-col items-center justify-center">
                <h2 className="text-white text-xl md:text-2xl font-medium tracking-wide mb-1">Offer Deal</h2>
                <p className="text-[#d4af37] text-xs md:text-sm tracking-wider">Press 'Offer Deal' to proceed</p>
              </div>
            </div>
          ) : isTalking ? (
            <div className="bg-gradient-to-b from-[#1a1202] to-black border border-[#d4af37] text-white px-8 py-3 rounded-lg text-center opacity-95 transition-opacity flex flex-col items-center shadow-[0_0_20px_rgba(212,175,55,0.2)] min-w-[300px]">
              <h3 className="text-sm font-bold tracking-widest uppercase text-[#d4af37] mb-2 flex items-center gap-2"><Mic size={16} /> Active Negotiations</h3>
              <div className="flex items-center gap-4 bg-black/50 border border-[#d4af37]/30 px-4 py-2 rounded-lg w-full">
                <div className="w-8 h-8 rounded-full bg-black border border-[#d4af37] flex items-center justify-center animate-pulse shrink-0">
                   <Mic size={14} className="text-[#d4af37]" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-white uppercase tracking-wider">Voice Channel</div>
                  <div className="text-[#d4af37]">Speak to negotiate</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* MASSIVE GOLDEN NOTIFICATION BANNER */}
        {notification.show && (
          <div className="absolute top-[45%] left-0 w-full bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] py-6 z-[100] shadow-[0_0_40px_rgba(245,158,11,0.4)] border-y-2 border-white/40 flex items-center justify-center animate-in zoom-in-y duration-300 pointer-events-none">
            <h1 className="text-white text-2xl md:text-4xl font-black uppercase tracking-[0.2em] drop-shadow-lg text-center px-4">
              {notification.message}
            </h1>
          </div>
        )}

        {/* 3D WebGL Canvas Background Layer */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(28,77,61,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(28,77,61,0.2)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#030806_95%)] pointer-events-none"></div>
          <div className="text-center opacity-25">
            <div className="text-xs uppercase tracking-[0.4em] text-[#55ffb0] mb-2">Simulation Space</div>
            <div className="font-mono text-sm tracking-[0.2em] border border-[#1c4d3d]/30 rounded-lg px-8 py-4 bg-[#0a1914]/40 backdrop-blur-sm">
              &lt; UNITY 3D WEBGL BOARD CANVAS &gt;
            </div>
          </div>
        </div>

        {/* HUD 2D Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          
          {/* === UPPER HALF: BOARD & TOP CORNERS === */}
          <div className="absolute inset-0 flex justify-center pt-6 z-10">
            
            {/* Top-Left: Tokens & Action Prompts */}
            <div className="absolute left-6 top-6 pointer-events-auto flex flex-col gap-6 z-50">
              <div className="text-white font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] leading-tight drop-shadow-md">
                Team Tokens<br/>Available
              </div>
              <div className="flex items-start gap-4">
                {/* Coins Column */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-2 border-gray-400"></div>
                    <span className="text-white font-bold text-sm tracking-wider">X 12</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-2 border-yellow-700"></div>
                    <span className="text-white font-bold text-sm tracking-wider">X 8</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#b87333] to-[#8c5220] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-2 border-[#b87333]"></div>
                    <span className="text-white font-bold text-sm tracking-wider">X 6</span>
                  </div>
                </div>

                {/* Buttons Column */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setActiveTopPanel(prev => prev === 'prompts' ? null : 'prompts')}
                    className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                      activeTopPanel === 'prompts' 
                        ? 'bg-gradient-to-br from-[#FFE885] via-[#d4af37] to-[#F59E0B] text-black border-transparent shadow-[0_0_15px_rgba(212,175,55,0.6)] scale-105' 
                        : 'bg-black/60 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/20 hover:scale-105'
                    }`}
                  >
                    <Search size={18} />
                  </button>
                  <button 
                    onClick={() => setIsTalking(prev => !prev)}
                    className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-lg select-none ${isTalking ? 'bg-[#d4af37] text-black border-[#d4af37] scale-105 shadow-[0_0_15px_rgba(212,175,55,0.6)]' : 'bg-black/60 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/20 hover:scale-105'}`}
                  >
                    <Mic size={18} />
                  </button>
                  <button 
                    onClick={() => setActiveModal('transfer')}
                    title="Transfer Cash"
                    className="w-10 h-10 border rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-lg select-none bg-black/60 border-[#55ffb0] text-[#55ffb0] hover:bg-[#55ffb0]/20 hover:scale-105"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
            {/* Top-Right: Player Roster */}
            <div className="absolute right-6 top-6 pointer-events-auto flex flex-col items-end gap-2 w-[300px] z-50">
              {augmentedPlayers.map(player => (
                <div key={player.id} className="w-full flex flex-col items-end gap-1">
                  <div className="flex gap-2 items-start w-full justify-end">
                    {/* Figma Circular Avatar */}
                    <div 
                      onClick={() => setExpandedPlayerId(prev => prev === player.id ? null : player.id)}
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 border-2 overflow-hidden bg-gray-900 transition-all cursor-pointer hover:opacity-95 select-none"
                      style={{ 
                        borderColor: player.color,
                        boxShadow: `0 0 10px ${player.color}80`
                      }}
                    >
                      <Users size={14} style={{ color: player.color }} />
                    </div>
                    
                    {/* Banner or Expanded Dropdown */}
                    <div 
                      onClick={() => setExpandedPlayerId(prev => prev === player.id ? null : player.id)}
                      className="cursor-pointer hover:opacity-95 transition-opacity select-none"
                    >
                      {expandedPlayerId === player.id && !player.isLocal ? (
                        <div className="w-[152px] min-h-[97px] rounded-[5px] bg-gradient-to-b from-[#36646C] to-[#201F1F] p-2 shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex flex-col items-center font-sans animate-in fade-in zoom-in-[0.98] duration-200 border border-white/5">
                          <div className="text-white text-[12px] mt-0.5 mb-2.5 font-normal tracking-wide drop-shadow-md">
                            {player.name}
                          </div>
                          <div className="flex flex-col gap-2.5 w-full px-2 pb-1">
                            {player.ownedCompanies.length > 0 ? (
                              player.ownedCompanies.map((c, i) => (
                                <div key={i} className="flex items-center justify-between w-full">
                                  <div className="text-[20px] filter drop-shadow-md leading-none">
                                    {c.icon || '🏢'}
                                  </div>
                                  <div className="w-[22px] h-[22px] bg-[#4B7981]/40 border border-[#64969E]/50 rounded-[3px] flex items-center justify-center text-white text-[11px] font-normal shadow-sm backdrop-blur-sm">
                                    {c.stage}
                                  </div>
                                  <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#e5e5e5] to-[#737373] border border-[#a3a3a3] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_5px_rgba(0,0,0,0.6)]">
                                    <span className="text-[9px] font-black text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                                      {c.team === 'RN' ? '1' : c.team === 'GT' ? '2' : c.team === 'GD' ? '3' : '4'}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-[9px] text-white/40 italic text-center py-2 w-full">No assets owned</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={`w-[152px] h-[30px] rounded-[5px] flex items-center justify-between px-3 bg-gradient-to-r ${getPlayerGradient(player.color)} shadow-lg border border-white/5`}>
                          <span className="text-[10px] font-bold text-white tracking-wide truncate">{player.name}</span>
                          <span className="text-white/80 text-[8px] ml-1">▼</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {expandedPlayerId === player.id && player.isLocal && (
                      // Local Player Detailed Company List
                      <div className="bg-gradient-to-b from-[#ebd6d6] to-[#fff4d4] border-2 border-[#d4af37] rounded-[20px] overflow-hidden mt-1.5 animate-in slide-in-from-top-2 w-full text-[10px] flex flex-col font-sans shadow-xl">
                        <div className="grid grid-cols-[1.2fr_1fr_1.1fr_1fr_1fr] text-[9px] text-[#b87333] font-bold border-b border-[#b87333]/30 text-center leading-tight bg-white/20 uppercase tracking-wider py-1.5">
                          <div className="flex flex-col items-center border-r border-[#b87333]/20 py-0.5">
                            <span>Company</span>
                            <span className="text-[6px] text-[#b87333]/70 lowercase mt-0.5">$k</span>
                          </div>
                          <div className="flex flex-col items-center border-r border-[#b87333]/20 py-0.5">
                            <span>Invest</span>
                            <span className="text-[6px] text-[#b87333]/70 lowercase mt-0.5">$k</span>
                          </div>
                          <div className="flex flex-col items-center border-r border-[#b87333]/20 py-0.5">
                            <span>Projected Rev</span>
                            <span className="text-[6px] text-[#b87333]/70 lowercase mt-0.5">$k</span>
                          </div>
                          <div className="flex flex-col items-center border-r border-[#b87333]/20 py-0.5">
                            <span>Valuation</span>
                            <span className="text-[6px] text-[#b87333]/70 lowercase mt-0.5">$k</span>
                          </div>
                          <div className="flex flex-col items-center py-0.5">
                            <span>Loan</span>
                            <span className="text-[6px] text-[#b87333]/70 lowercase mt-0.5">$k</span>
                          </div>
                        </div>
                        {Array.from({ length: 4 }).map((_, idx) => {
                          const c = player.ownedCompanies[idx];
                          if (c) {
                            
                            let valInvest = c.invest;
                            let valRev = c.revenue;
                            let valVal = c.valuation;
                            let valLoan = c.loan;
                            
                            if (companyDataMap[c.name] && companyDataMap[c.name][c.stage]) {
                              valInvest = companyDataMap[c.name][c.stage][0];
                              valRev = companyDataMap[c.name][c.stage][1];
                              valVal = companyDataMap[c.name][c.stage][2];
                              valLoan = companyDataMap[c.name][c.stage][3];
                            }
                            
                            const loanPercent = valVal > 0 ? Math.round((valLoan / valVal) * 100) : (valLoan || 0);
                            return (
                              <div key={idx} className="grid grid-cols-[1.2fr_1fr_1.1fr_1fr_1fr] items-center text-center font-sans border-b border-[#b87333]/20 last:border-0 hover:bg-white/5 transition-colors">
                                <div className="border-r border-[#b87333]/20 py-1.5 flex flex-col items-center justify-center">
                                  <div className="flex items-center gap-1.5 relative">
                                    <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] leading-none select-none">{c.icon || '🏢'}</span>
                                    <div className="flex flex-col gap-0.5 items-start">
                                      <span className="bg-[#571717] text-white text-[6px] font-black px-1 py-0.5 rounded-[2px] uppercase tracking-wider leading-none">{c.stage}</span>
                                      <div className="w-3.5 h-3.5 rounded-full bg-gray-600/80 border border-white/20 flex items-center justify-center text-[6px] font-black text-white leading-none">
                                        {c.team || 'RN'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-1.5 font-black text-[9px] text-white uppercase tracking-wider drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.9)] text-center leading-none">
                                    {getCompanyShortName(c.name)}
                                  </div>
                                </div>
                                <div className="border-r border-[#b87333]/20 py-1.5 text-xs font-bold text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)] font-sans">
                                  {valInvest !== undefined ? valInvest : ''}
                                </div>
                                <div className="border-r border-[#b87333]/20 py-1.5 text-xs font-bold text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)] font-sans">
                                  {valRev !== undefined ? valRev : ''}
                                </div>
                                <div className="border-r border-[#b87333]/20 py-1.5 text-xs font-bold text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)] font-sans">
                                  {valVal !== undefined ? valVal : ''}
                                </div>
                                <div className="py-1.5 text-xs font-bold text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)] font-sans">
                                  {loanPercent}%
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div key={idx} className="grid grid-cols-[1.2fr_1fr_1.1fr_1fr_1fr] items-stretch text-center font-sans border-b border-[#b87333]/20 last:border-0 h-[64px]">
                                <div className="flex items-center justify-center border-r border-[#b87333]/20">
                                  <span className="text-2xl font-black text-[#571717]/10 select-none">{idx + 1}</span>
                                </div>
                                <div className="border-r border-[#b87333]/20"></div>
                                <div className="border-r border-[#b87333]/20"></div>
                                <div className="border-r border-[#b87333]/20"></div>
                                <div></div>
                              </div>
                            );
                          }
                        })}
                      </div>
                  )}
                </div>
              ))}
            </div>

            {/* Center: Constrained Middle Board */}
            <div className="w-full max-w-[1450px] h-full max-h-[760px] pointer-events-auto relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1c4d3d] rounded-xl overflow-hidden bg-[#0a1914] scale-[0.9] origin-top">
               <MiddleBoard players={augmentedPlayers} onDeckClick={() => setActiveModal('buy_mentor')} currentRound={gameRound} />
            </div>

          </div>

          {/* === LOWER HALF: DESK AREA & TRACKERS === */}
          <div className="absolute bottom-[130px] w-full h-[240px] flex justify-center items-end gap-8 z-20">
            
            {/* Bottom-Left: Trackers */}
            <div className="absolute left-6 bottom-4 pointer-events-auto flex flex-col gap-3">
              <div 
                onClick={() => setActiveModal('dealSheets')}
                className="bg-gradient-to-r from-black to-[#397564] border border-white/5 rounded-[10px] px-4 w-[214px] h-[42px] flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.4)] cursor-pointer hover:opacity-90 transition-opacity"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Deal Tracker</span>
                <span className="text-[40px] font-black bg-gradient-to-b from-white to-[#FFC240] bg-clip-text text-transparent leading-none select-none">{localDealCount}</span>
              </div>
              <div className="bg-gradient-to-r from-black to-[#397564] border border-white/5 rounded-[10px] px-4 w-[214px] h-[42px] flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Action Tracker</span>
                <span className="text-[40px] font-black bg-gradient-to-b from-white to-[#FFC240] bg-clip-text text-transparent leading-none select-none">{localActionCount}</span>
              </div>
            </div>

            {/* Desk Element 1: Launch Status List */}
            <div className="flex flex-col gap-2 mb-2 pointer-events-auto">
              {augmentedPlayers.map((player, idx) => {
                const comp = player.ownedCompanies && player.ownedCompanies.length > 0 ? player.ownedCompanies[0] : null;
                const getStageInitial = (stageIdx) => ['L', 'R', 'G', 'S'][stageIdx] || 'L';
                const getCompanyIcon = (name) => {
                  const map = {'CONTRACT FARMING': '🌾', 'AGRI IoT': '📡', 'WALLET': '👛', 'SNACKS': '🍿', 'QUICK COMMERCE': '🛒', 'SMART STORAGE': '📦', 'RESTRO - CHAIN': '🍽️', 'TRACEABILITY': '🔍', 'ROBO - PACKAGING': '🤖'};
                  return map[name] || '🏢';
                };

                return (
                  <div key={player.id} className="flex items-center gap-2 bg-[#0a1914]/80 border border-[#1c4d3d] p-1.5 rounded-lg shadow-md w-[140px] h-[36px]">
                    <span className="text-[10px] font-mono text-gray-400 w-2 shrink-0">{idx + 1}.</span>
                    {comp ? (
                      <div className="flex-1 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded px-1 transition-colors h-full">
                        {/* Logo */}
                        <div className="w-6 h-6 rounded-full bg-[#112a20] border border-[#1c4d3d] flex items-center justify-center shadow-inner text-[10px]">{getCompanyIcon(comp.name)}</div>
                        {/* Stage Level */}
                        <div className="w-4 h-4 bg-red-900 border border-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-sm">{getStageInitial(comp.stage)}</div>
                        {/* Team (Token) */}
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm border border-white/20"></div>
                      </div>
                    ) : (
                      <div className="flex-1 bg-[#112a20]/50 text-gray-500 text-[8px] font-bold uppercase h-full rounded shadow-inner flex items-center justify-center text-center">
                        NO COMPANY
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desk Element 2: Mini Player Mat */}
            <div 
              onClick={() => setActiveModal('playerMat')}
              className="pointer-events-auto cursor-pointer transition-all duration-300 scale-[0.65] translate-y-2 hover:scale-[0.95] hover:-translate-y-6 relative z-10 hover:z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-lg bg-[#4A1720] border-2 border-[#2A0D12] p-2 flex gap-2 origin-bottom mb-6"
            >
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  "CONTRACT FARM", "AGRI IoT", "WALLET",
                  "SNACKS", "QUICK COMM", "SMART STOR",
                  "RESTRO CHAIN", "TRACEABILITY", "ROBO-PACK"
                ].map((name, i) => (
                  <div key={i} className="w-[75px] h-[95px] bg-[#7D3C4A] border border-[#3A141A] rounded flex flex-col items-center p-1 overflow-hidden">
                    <div className="w-full bg-[#FFF2D8] rounded-md flex items-center justify-center mb-1 p-1 min-h-[24px]">
                      <span className="text-[9px] font-black text-[#4A1720] leading-tight text-center break-words w-full">{name}</span>
                    </div>
                    <div className="w-full flex-1 border-t border-white/20 mt-1 flex flex-col justify-evenly">
                      <div className="w-full h-[2px] bg-white/20 rounded"></div>
                      <div className="w-full h-[2px] bg-white/20 rounded"></div>
                      <div className="w-full h-[2px] bg-white/20 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 w-[75px]">
                <div className="h-[40px] bg-[#FFF2D8] rounded flex items-center justify-center p-1 text-center"><span className="text-[10px] font-black text-[#4A1720] leading-tight">2ND<br/>CHANCE</span></div>
                <div className="h-[70px] bg-[#FFF2D8] rounded flex items-center justify-center p-1 text-center"><span className="text-[10px] font-black text-[#4A1720] leading-tight">MULTIPLIER</span></div>
                <div className="flex-1 bg-[#FFF2D8] rounded flex items-center justify-center p-1 text-center"><span className="text-[10px] font-black text-[#4A1720] leading-tight">NOTES</span></div>
              </div>
            </div>

            {/* Desk Element 3: Owned Mentor Cards (Inventory) */}
            {localPlayer && localPlayer.mentorCards && (
              <div 
                onClick={() => setActiveModal('mentorInventory')}
                className="relative w-[160px] h-[160px] pointer-events-auto cursor-pointer group mb-6 ml-6"
                title="Your Owned Mentor Cards"
              >
                <div className="absolute -top-2 -right-2 bg-red-600 border-2 border-white text-white font-black text-xs w-6 h-6 rounded-full flex items-center justify-center z-50 drop-shadow-md">
                   {localPlayer.mentorCards.length}
                </div>
                {localPlayer.mentorCards.length === 0 ? (
                  <img 
                    src="/center-mentor-card.png" 
                    alt="Empty Mentor Inventory" 
                    className="absolute inset-0 w-full h-full object-contain origin-bottom opacity-50 grayscale cursor-pointer" 
                  />
                ) : (
                  localPlayer.mentorCards.map((card, idx) => {
                    const maxCards = Math.min(localPlayer.mentorCards.length, 3);
                    const displayIdx = idx >= maxCards ? maxCards - 1 : idx;
                    const rotation = (displayIdx - (maxCards - 1)/2) * 10;
                    return (
                      <img 
                        key={card.id || idx} 
                        src="/center-mentor-card.png" 
                        alt="Owned Mentor Card" 
                        className="absolute inset-0 w-full h-full object-contain origin-bottom transition-transform drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]" 
                        style={{ transform: `rotate(${rotation}deg)` }}
                      />
                    );
                  })
                )}
              </div>
            )}

            {/* Bottom-Right: Static BANK icon */}
            <div 
              onClick={() => !isLocked && setActiveModal('loan')}
              className="absolute right-6 bottom-4 pointer-events-auto flex flex-col items-center group cursor-pointer hover:scale-105 transition-transform"
            >
              <svg width="54" height="42" viewBox="0 0 60 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFAEF" />
                    <stop offset="100%" stopColor="#FFC240" />
                  </linearGradient>
                </defs>
                {/* Roof */}
                <path d="M30 4 L5 18 H55 Z" stroke="url(#goldGradient)" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
                {/* Architrave */}
                <rect x="8" y="20" width="44" height="3.5" rx="1" fill="url(#goldGradient)" />
                {/* Pillars */}
                <rect x="13.5" y="23.5" width="4.5" height="14" rx="0.5" fill="url(#goldGradient)" />
                <rect x="27.75" y="23.5" width="4.5" height="14" rx="0.5" fill="url(#goldGradient)" />
                <rect x="42.5" y="23.5" width="4.5" height="14" rx="0.5" fill="url(#goldGradient)" />
                {/* Base Steps */}
                <rect x="8" y="37.5" width="44" height="3" rx="0.5" fill="url(#goldGradient)" />
                <rect x="5" y="40.5" width="50" height="3" rx="0.5" fill="url(#goldGradient)" />
              </svg>
              {/* Separator Line */}
              <div className="w-[48px] h-[3px] rounded-full bg-[#FFC240] mt-1 shadow-[0_1px_5px_rgba(0,0,0,0.5)]"></div>
              {/* Text */}
              <span className="text-[11px] font-black uppercase tracking-widest mt-1 bg-gradient-to-b from-[#FFFFFF] to-[#FFC240] bg-clip-text text-transparent drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-sans">Bank</span>
            </div>

          </div>
        </div>

        {/* FULL WIDTH BOTTOM DASHBOARD */}
        <div className="absolute bottom-0 w-full z-40 pointer-events-auto flex flex-col">
          {/* Main Bar */}
          <div className="bg-[#112a20] border-t-2 border-[#1c4d3d] w-full flex items-stretch h-[60px] md:h-[70px]">
            
            {/* Left: Time */}
            <div className="flex items-center gap-6 px-6 md:px-10 shrink-0">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] md:text-[10px] text-white/70 uppercase tracking-widest leading-none mb-1">Round</span>
                <span className="text-2xl md:text-3xl font-black text-white leading-none drop-shadow-md">{gameRound}</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] md:text-[10px] text-white/70 uppercase tracking-widest leading-none mb-1">Phase</span>
                <span className="text-2xl md:text-3xl font-black text-white leading-none drop-shadow-md">{gamePhase}</span>
              </div>
              <div className="flex flex-col items-center justify-center min-w-[60px]">
                <span className="text-[8px] md:text-[10px] text-white/70 uppercase tracking-widest leading-none mb-1">Turn</span>
                <div className="flex items-center gap-2 h-9 select-none">
                  {/* Left side: column of small inactive tokens */}
                  <div className="flex flex-col gap-0.5 justify-center">
                    {(gameState?.players || []).map((p) => {
                      const isActive = activePlayerObj && p.id === activePlayerObj.id;
                      if (isActive) return null;
                      const color = p.color || '#55ffb0';
                      return (
                        <div 
                          key={p.id}
                          className="w-2.5 h-2.5 rounded-full border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${color} 0%, #000 120%)`,
                            opacity: 0.3
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Right side: large active token */}
                  {activePlayerObj ? (
                    <div 
                      className="w-7 h-7 rounded-full border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.8)] relative group transition-all"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${activePlayerObj.color || '#55ffb0'} 20%, #000 100%)`,
                        boxShadow: `0 0 12px ${(activePlayerObj.color || '#55ffb0')}a0, inset 0 2px 4px rgba(255,255,255,0.4)`
                      }}
                    >
                      {/* Glossy highlight overlay */}
                      <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none"></div>
                    </div>
                  ) : (
                    <span className="text-sm font-black text-white leading-none">All</span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Action Buttons */}
            <div className="flex-1 flex justify-center items-center gap-6 border-l border-[#1c4d3d]">
              {gamePhase === 1 ? (
                <>
                  <button
                    onClick={() => !isTurnLocked && setActiveModal('loan')}
                    disabled={isTurnLocked}
                    className={`px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#2e8b57] to-[#1c5435] border border-[#55ffb0]/20 text-white font-semibold tracking-wide select-none cursor-pointer transition-all ${isTurnLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:from-[#3cb371] hover:to-[#228b22] hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(46,139,87,0.4)]'}`}
                  >
                    Take Bank Loan
                  </button>
                  <button
                    onClick={() => !isTurnLocked && setActiveModal('personaSelect')}
                    disabled={isTurnLocked}
                    className={`px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#2e8b57] to-[#1c5435] border border-[#55ffb0]/20 text-white font-semibold tracking-wide select-none cursor-pointer transition-all ${isTurnLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:from-[#3cb371] hover:to-[#228b22] hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(46,139,87,0.4)]'}`}
                  >
                    Offer a Deal
                  </button>
                </>
              ) : gamePhase === 2 ? (
                <Phase2Dashboard isLocked={isTurnLocked} onActionClick={(action) => setActiveModal(action)} />
              ) : (
                <>
                  <button
                    onClick={() => !isTurnLocked && setActiveModal('phase3Dice')}
                    disabled={isTurnLocked}
                    className={`px-6 py-2 rounded-2xl text-[10px] md:text-xs font-bold transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-gradient-to-br from-[#4ade80] to-[#166534] text-white text-center flex flex-col items-center justify-center min-w-[120px] h-[52px] leading-tight border border-[#e5c158] shadow-[0_0_15px_rgba(229,193,88,0.4)] ${isTurnLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:from-[#52ea90] hover:to-[#1b753d] hover:scale-105 active:scale-95'}`}
                  >
                    <span>Roll</span>
                    <span>the Dice</span>
                  </button>
                  <button
                    onClick={() => !isTurnLocked && setActiveModal('loanRepay')}
                    disabled={isTurnLocked}
                    className={`px-6 py-2 rounded-2xl text-[10px] md:text-xs font-bold transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-gradient-to-br from-[#4ade80] to-[#166534] text-white text-center flex flex-col items-center justify-center min-w-[120px] h-[52px] leading-tight border border-[#166534] ${isTurnLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:from-[#52ea90] hover:to-[#1b753d] hover:scale-105 active:scale-95'}`}
                  >
                    <span>Repay</span>
                    <span>Loan</span>
                  </button>
                </>
              )}
            </div>

            {/* Right: End Turn / Lock Button */}
            <div className="w-[120px] md:w-[150px] lg:w-[180px] h-full flex items-center justify-center border-l border-[#1c4d3d]">
              <button 
                onClick={handleLockDeal}
                disabled={isTurnLocked}
                className={`relative group overflow-hidden bg-gradient-to-br from-[#d4af37] via-[#FFE885] to-[#8a6818] text-black font-black uppercase tracking-widest text-[10px] md:text-[11px] lg:text-xs py-2 md:py-3 px-3 md:px-5 lg:px-6 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform ${isTurnLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(255,232,133,0.6)]'}`}
              >
                {/* Shine effect */}
                {!isTurnLocked && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"></div>}
                
                <div className="flex flex-col items-center gap-0.5 relative z-10 text-center">
                 {isLocked ? (
                   <span className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] leading-tight text-xs">Waiting for<br/>other players...</span>
                 ) : !isCurrentPlayerTurnActive ? (
                   <span className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] leading-tight text-xs">Waiting for<br/>your turn...</span>
                 ) : (
                   <span className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] leading-tight">
                     {gamePhase === 1 ? (
                       <>END<br/>PHASE 1</>
                     ) : gamePhase === 2 ? (
                       <>END<br/>ACTIONS</>
                     ) : (
                       <>END<br/>PHASE 3</>
                     )}
                   </span>
                 )}
                </div>
               </button>
            </div>
          </div>

          {/* Sub-Bar: Financials */}
          <div className="flex w-full bg-black border-t border-[#1c4d3d] h-[55px] md:h-[60px] items-center px-4 relative">
            
            <div className="flex items-center justify-center gap-6 md:gap-12 lg:gap-20 w-full">
              
              <div className="flex items-center gap-3">
                <span className="text-white uppercase font-bold tracking-widest text-[10px] md:text-xs text-right leading-tight">Net<br/>Worth</span>
                <div className="bg-[#2A7553] text-white font-mono font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-xs md:text-sm">
                  <Crown size={14} className="text-[#FFE885]"/> ${capital}M
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-white uppercase font-bold tracking-widest text-[10px] md:text-xs text-right leading-tight">Total<br/>Valuation</span>
                <div className="bg-[#2A7553] text-[#55ffb0] font-mono font-bold px-4 py-2 rounded-lg shadow-md text-xs md:text-sm">${valuation}M</div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-white uppercase font-bold tracking-widest text-[10px] md:text-xs text-right leading-tight">Cash in<br/>Hand</span>
                <div className="bg-[#2A7553] text-[#55ffb0] font-mono font-bold px-4 py-2 rounded-lg shadow-md text-xs md:text-sm">${cash}K</div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-white uppercase font-bold tracking-widest text-[10px] md:text-xs text-right leading-tight">Current Loan<br/>+ Interest</span>
                <div className="bg-[#2A7553] text-[#ff6b6b] font-mono font-bold px-4 py-2 rounded-lg shadow-md text-xs md:text-sm">${globalLoan}K</div>
              </div>

            </div>

            {/* Blue Cash Deck Visual */}
            <div className="absolute right-12 md:right-20 bottom-1 flex flex-col items-center pointer-events-auto cursor-pointer hover:-translate-y-1 transition-transform z-50">
              <div className="w-16 h-12 bg-[#8ba4c9] rounded-sm border border-[#506a8f] shadow-[0_5px_15px_rgba(0,0,0,0.5)] transform -rotate-2 relative flex items-start justify-between p-1 overflow-hidden">
                 <span className="text-[5px] font-black text-[#506a8f]">50K</span>
                 <div className="w-full h-[1px] bg-[#506a8f]/30 absolute top-3 left-0"></div>
                 <div className="w-full h-[1px] bg-[#506a8f]/30 absolute bottom-3 left-0"></div>
                 <div className="absolute w-16 h-12 bg-[#a3bcdc] rounded-sm border border-[#506a8f] shadow-[0_2px_5px_rgba(0,0,0,0.4)] transform rotate-2 -top-1 left-1 flex flex-col justify-between p-1">
                    <div className="flex justify-between w-full">
                       <span className="text-[5px] font-black text-[#506a8f] leading-none">50K</span>
                       <div className="w-1 h-3 bg-[#e8e4c9] border border-[#506a8f]"></div>
                    </div>
                    <div className="flex justify-center w-full">
                       <div className="w-3 h-3 border border-[#506a8f]/50 rounded-full flex items-center justify-center">
                          <span className="text-[4px] text-[#506a8f]">✦</span>
                       </div>
                    </div>
                    <div className="flex justify-between w-full">
                       <span className="text-[5px] font-black text-[#506a8f] leading-none transform rotate-180">50K</span>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>

        {/* PHASE 2 MODAL MANAGER */}
        {gamePhase === 2 && <Phase2Manager activeModal={activeModal} setActiveModal={setActiveModal} sendAction={sendAction} localPlayer={localPlayer} currentRound={gameRound} />}

        {/* MENTOR CARD MODAL (Accessible Anytime) */}
        {activeModal === 'buy_mentor' && (
          <MentorCardModal 
            onClose={() => setActiveModal(null)} 
            onBuy={() => {
              sendAction('phase2_action', {
                actionType: 'buy_mentor',
                companyName: null,
                amount: 20
              });
            }}
            drawnCard={drawnCard}
            clearDrawnCard={clearDrawnCard}
            notification={notification}
          />
        )}

        {/* POPUP MODALS WITH BACKDROP */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm pointer-events-auto transition-opacity duration-300">
            
            {/* DEAL SHEETS MODAL */}
            {activeModal === 'dealSheets' && (
              <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button 
                  onClick={() => setActiveModal(null)}
                  className="absolute -top-12 right-0 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors cursor-pointer border border-white/20"
                >
                  <X size={24} />
                </button>
                
                {/* Stacked Cards */}
                <div className="relative w-[450px] h-[550px]">
                  {/* Back Card */}
                  <div className="absolute inset-0 bg-gray-200 rounded-xl shadow-2xl transform rotate-3 translate-x-4 border border-gray-300"></div>
                  {/* Middle Card */}
                  <div className="absolute inset-0 bg-gray-100 rounded-xl shadow-2xl transform -rotate-2 -translate-x-2 border border-gray-300"></div>
                  {/* Front Card */}
                  <div className="absolute inset-0 bg-white rounded-xl shadow-2xl p-6 border-t-8 border-[#d4af37] flex flex-col items-center z-10 overflow-y-auto">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-extrabold font-mono mb-2">Modern Mint Strategy Co.</div>
                    <h3 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Deal Sheet</h3>
                    <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-4 mb-6"></div>
                    
                    <div className="w-full flex-1 flex flex-col gap-4 text-left">
                      {localPlayerDeals.length > 0 ? localPlayerDeals.map((deal, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">{deal.id}</span>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">{deal.status}</span>
                          </div>
                          <p className="text-sm text-gray-800 font-medium">
                            Offered ${deal.cash}M for {deal.equity}% equity.
                          </p>
                          <p className="text-[10px] text-gray-500 italic mt-1">"{deal.terms}"</p>
                          <div className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Partner: {deal.partner}</div>
                        </div>
                      )) : (
                        <div className="text-gray-400 font-mono text-sm uppercase tracking-widest text-center mt-12">
                          No Deals Executed Yet
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 w-full flex justify-between border-t border-gray-200 pt-4 shrink-0">
                       <div className="text-xs font-bold text-gray-400">Total Deals: {localDealCount}</div>
                       <div className="text-xs font-bold text-[#d4af37] cursor-pointer hover:text-[#b08d29]">View All History</div>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {activeModal === 'loan' && (
              <BankLoanModal 
                onClose={() => setActiveModal(null)} 
                onFinalize={handleFinalizeLoan} 
                ownedCompanies={localPlayer.ownedCompanies || []} 
                companyDataMap={companyDataMap} 
              />
            )}

            {activeModal === 'loanRepay' && (
              <RepayLoanModal
                onClose={() => setActiveModal(null)}
                player={localPlayer}
                sendAction={sendAction}
              />
            )}

            {activeModal === 'selfPortfolio' && (
              <SelfPortfolioModal 
                onClose={() => setActiveModal(null)} 
                player={players.find(p => p.isLocal)} 
                sendAction={sendAction}
              />
            )}

            {activeModal === 'personaSelect' && (
              <PersonaSelectModal
                onClose={() => setActiveModal(null)}
                onSelectPersona={(name) => {
                  setDealTarget(name);
                  setActiveModal('deal');
                }}
              />
            )}

            {activeModal === 'deal' && (
              <DealSheetModal
                onClose={() => setActiveModal(null)}
                onSubmitDeal={submitDeal}
                targetName={dealTarget}
              />
            )}

            {activeModal === 'playerMat' && (
              <PlayerMatModal onClose={() => setActiveModal(null)} ownedCompanies={localPlayer?.ownedCompanies || []} />
            )}

            {activeModal === 'mentorInventory' && (
              <MentorInventoryModal onClose={() => setActiveModal(null)} mentorCards={localPlayer?.mentorCards || []} />
            )}

            {activeModal === 'phaseEnd' && (
              <PhaseEndScreenModal player={localPlayer} />
            )}

            {activeModal === 'phase3Dice' && (
              <Phase3DiceModal 
                onClose={() => setActiveModal(null)} 
                player={localPlayer} 
                sendAction={sendAction} 
                gameState={gameState} 
                roomId={roomId}
              />
            )}

          </div>
        )}

        </div>
      </div>
    </GameProvider>
  );
}

export default App;