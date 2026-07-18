import React, { useState, useEffect, useRef } from 'react';
import { X, Dices, RotateCcw, CheckCircle } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane } from '@react-three/cannon';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import D10 from '../3d/D10';

const multiplierTable = {
  1:  [-2, -3, -4,  0],
  2:  [-2, -2, -2, -1],
  3:  [-1, -1,  0,  1],
  4:  [-1,  0,  1,  2],
  5:  [ 0,  0,  1,  2],
  6:  [ 0,  1,  2,  3],
  7:  [ 1,  1,  2,  3],
  8:  [ 1,  2,  3,  4],
  9:  [ 2,  2,  3,  4],
  10: [ 2,  2,  4,  5]
};

const companyDataMap = {
  'CONTRACT FARMING': [[10,100,500,0], [100,200,1000,20], [1000,1000,25000,200], [2000,2000,70000,400]],
  'AGRI IoT': [[100,10,1000,0], [500,200,6000,200], [1000,1000,18000,2000], [8000,8000,36000,7000]],
  'WALLET': [[100,10,1000,0], [1000,400,2000,400], [1500,2000,36000,800], [2500,12000,98000,5000]],
  'SNACKS': [[10,20,1000,0], [200,200,7000,200], [1000,1000,25000,1000], [4000,4000,220000,8000]],
  'QUICK COMMERCE': [[10,50,1000,0], [200,400,2500,100], [2000,1000,100000,1500], [10000,4000,320000,10000]],
  'SMART STORAGE': [[200,200,2000,200], [3000,1000,12000,2000], [5000,5000,18000,4000], [10000,7000,40000,12000]],
  'RESTRO - CHAIN': [[50,200,1000,200], [500,400,2000,500], [1200,1400,40000,2000], [12000,8000,280000,10000]],
  'TRACEABILITY': [[50,50,500,0], [200,200,2000,200], [500,2000,7500,1000], [10000,10000,38000,5000]],
  'ROBO - PACKAGING': [[100,50,1500,250], [1200,500,4000,1000], [5000,2500,150000,2000], [8000,10000,450000,8000]]
};

// Physics Boundaries
function Borders() {
  usePlane(() => ({ type: "Static", material: { restitution: 0.5 }, rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] })); // Floor
  usePlane(() => ({ type: "Static", material: { restitution: 0.5 }, rotation: [Math.PI / 2, 0, 0], position: [0, 10, 0] })); // Ceiling
  usePlane(() => ({ type: "Static", material: { restitution: 0.5 }, rotation: [0, Math.PI / 2, 0], position: [-4, 0, 0] })); // Left Wall
  usePlane(() => ({ type: "Static", material: { restitution: 0.5 }, rotation: [0, -Math.PI / 2, 0], position: [4, 0, 0] })); // Right Wall
  usePlane(() => ({ type: "Static", material: { restitution: 0.5 }, rotation: [0, 0, 0], position: [0, 0, -4] })); // Back Wall
  usePlane(() => ({ type: "Static", material: { restitution: 0.5 }, rotation: [0, Math.PI, 0], position: [0, 0, 4] })); // Front Wall
  return null;
}

export default function Phase3DiceModal({ onClose, player, sendAction, gameState, roomId }) {
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  const [bestRoll, setBestRoll] = useState(player?.currentPhase3Roll || null);
  const [serverRoll, setServerRoll] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [localLifelines, setLocalLifelines] = useState(player?.lifelines || 2);
  
  const diceRef = useRef();

  useEffect(() => {
    const handleInitialResult = (e) => {
      const { roll } = e.detail;
      setServerRoll(roll);
      setIsRolling(true);
    };
    const handleSecondChanceResult = (e) => {
      const { roll, remainingLifelines } = e.detail;
      setLocalLifelines(remainingLifelines);
      setServerRoll(roll);
      setIsRolling(true);
      setShowTable(false);
      setRollResult(null);
    };
    window.addEventListener('initial_roll_result', handleInitialResult);
    window.addEventListener('second_chance_result', handleSecondChanceResult);
    return () => {
      window.removeEventListener('initial_roll_result', handleInitialResult);
      window.removeEventListener('second_chance_result', handleSecondChanceResult);
    };
  }, []);

  // Block Investors entirely
  if (player?.role === 'Investor') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-[#0a1914] border-2 border-[#1c4d3d] rounded-2xl p-12 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#1c4d3d]/50 rounded-full flex items-center justify-center animate-pulse mb-6">
             <Dices size={40} className="text-[#55ffb0]" />
          </div>
          <h2 className="text-white text-3xl font-black uppercase tracking-widest mb-2 text-center">Waiting For Founders</h2>
          <p className="text-white/60 text-center max-w-md">Investors do not participate in the Phase 3 Revenue Roll. Wait for the Founders to lock in their multipliers.</p>
        </div>
      </div>
    );
  }

  // If already claimed, don't allow rolling again
  if (player?.hasClaimedRevenue) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-[#0a1914] border-2 border-[#1c4d3d] rounded-2xl p-12 flex flex-col items-center">
          <CheckCircle size={64} className="text-[#55ffb0] mb-6 drop-shadow-[0_0_20px_rgba(85,255,176,0.6)]" />
          <h2 className="text-white text-3xl font-black uppercase tracking-widest mb-2">Revenue Claimed</h2>
          <p className="text-white/60">You have already completed the Revenue Roll for this round.</p>
          <button onClick={onClose} className="mt-8 px-8 py-3 bg-[#1c4d3d] text-white rounded-xl hover:bg-[#256651] transition-colors font-bold uppercase tracking-wider">Close</button>
        </div>
      </div>
    );
  }

  const handleInitialRoll = () => {
    if (hasRolled) return;
    setHasRolled(true);
    sendAction('initial_roll');
  };

  const handleDiceRest = () => {
    if (isRolling && serverRoll !== null) {
      setRollResult(serverRoll);
      setBestRoll(serverRoll);
      
      // Delay strictly 1000ms as requested
      setTimeout(() => {
         setIsRolling(false);
         setShowTable(true);
      }, 1000);
    }
  };

  const handleSecondChance = () => {
    if (localLifelines <= 0) return;
    sendAction('second_chance_roll');
  };

  const handleClaim = () => {
    if (bestRoll === null) return;
    sendAction('claim_revenue');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 font-sans overflow-hidden animate-in fade-in duration-300">
      
      {/* 3D Canvas Background */}
      <div className={`absolute inset-y-0 left-0 z-0 pointer-events-none transition-all duration-700 ease-in-out ${showTable ? 'w-full lg:w-1/2' : 'w-full'}`}>
         <Canvas shadows>
            <PerspectiveCamera makeDefault position={[0, 10, 0]} rotation={[-Math.PI / 2, 0, 0]} fov={50} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 10, 0]} intensity={1.5} castShadow />
            <Environment preset="city" />
            <Physics 
               gravity={[0, -40, 0]} 
               defaultContactMaterial={{ friction: 0.2, restitution: 0.7, contactEquationStiffness: 1e7, contactEquationRelaxation: 4 }}
            >
               <Borders />
               {hasRolled && <D10 ref={diceRef} onRest={handleDiceRest} isRolling={isRolling} />}
            </Physics>
         </Canvas>
      </div>
      
      {/* Dynamic Background FX based on state */}
      {isRolling && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FFC240]/5 to-transparent animate-[spin_2s_linear_infinite] opacity-50 z-0"></div>}
      
      {/* Header */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-50">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-2 text-center">
          The Revenue Roll
        </h1>
        <p className="text-[#FFC240] font-bold tracking-widest uppercase text-sm drop-shadow-md">Phase 3</p>
      </div>

      {/* Center Cinematic Container */}
      <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center mt-12 z-10 pointer-events-none">
        
        {!hasRolled ? (
          <button 
            onClick={handleInitialRoll}
            className="pointer-events-auto group relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-[#FFC240] to-[#F59E0B] shadow-[0_0_80px_rgba(255,194,64,0.4)] flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <div className="absolute inset-2 rounded-full border-4 border-dashed border-[#2A0D12]/30 group-hover:rotate-180 transition-transform duration-1000 ease-in-out"></div>
            <Dices size={80} className="text-[#2A0D12] mb-4 drop-shadow-md" />
            <span className="text-[#2A0D12] font-black uppercase tracking-widest text-xl">Roll Dice</span>
          </button>
        ) : (
          <div className="flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-24 w-full px-4">
            
            {/* Left side info panel / best roll indicator */}
            {!isRolling && rollResult !== null && (
                <div className="text-center animate-in slide-in-from-bottom-4 fade-in z-20">
                  <p className="text-white/60 text-sm uppercase tracking-widest mb-1">Current Best Roll</p>
                  <p className="text-[#FFC240] text-7xl font-black drop-shadow-[0_0_30px_rgba(255,194,64,0.5)]">{bestRoll}</p>
                </div>
            )}

            {/* The Multiplier Table & Actions */}
            {showTable && (
              <div className="pointer-events-auto flex-1 w-full max-w-2xl bg-[#0a1914]/90 backdrop-blur-md rounded-3xl border-2 border-[#1c4d3d] p-6 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.9)] animate-in slide-in-from-right-12 fade-in duration-700 relative z-20">
                
                <h3 className="text-[#55ffb0] font-black uppercase tracking-widest text-xl mb-6 text-center drop-shadow-md">
                  Multiplier Matrix
                </h3>
                
                {/* Table Header */}
                <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] bg-[#1c4d3d]/50 rounded-t-xl text-[#a4d8c2] text-xs font-bold uppercase tracking-widest py-3 px-2 text-center mb-1 border-b border-[#55ffb0]/20">
                  <div>Roll</div>
                  <div>Team 1</div>
                  <div>Team 2</div>
                  <div>Team 3</div>
                  <div>Team 4</div>
                </div>
                
                {/* Table Body */}
                <div className="flex flex-col gap-1 mb-8">
                  {[1,2,3,4,5,6,7,8,9,10].map((num) => {
                    const rowData = multiplierTable[num];
                    const isMatched = bestRoll === num;
                    return (
                      <div key={num} className={`grid grid-cols-[60px_1fr_1fr_1fr_1fr] text-sm font-mono py-2 px-2 text-center rounded-lg transition-all duration-300 ${isMatched ? 'bg-gradient-to-r from-[#55ffb0]/20 via-[#55ffb0]/40 to-[#55ffb0]/20 border border-[#55ffb0] shadow-[0_0_20px_rgba(85,255,176,0.3)] scale-105 z-10' : 'text-white/70 hover:bg-white/5 border border-transparent'}`}>
                        <div className={`font-black ${isMatched ? 'text-white text-base' : 'text-[#a4d8c2]'}`}>{num}</div>
                        {rowData.map((val, idx) => (
                          <div key={idx} className={`font-bold ${isMatched ? (val < 0 ? 'text-[#ff5555]' : 'text-[#55ffb0]') : (val < 0 ? 'text-[#ff5555]/70' : 'text-white/80')}`}>
                            {val > 0 ? `+${val}` : val}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full mt-4">
                  
                  <button 
                    onClick={handleSecondChance}
                    disabled={localLifelines <= 0 || isRolling}
                    className={`flex-1 flex flex-col items-center justify-center py-4 px-6 rounded-xl border-2 transition-all group ${localLifelines <= 0 || isRolling ? 'bg-[#2A0D12]/50 border-[#ff5555]/20 text-[#ff5555]/40 cursor-not-allowed grayscale' : 'bg-[#2A0D12] border-[#ff5555] text-[#ff5555] hover:bg-[#ff5555] hover:text-white shadow-[0_0_20px_rgba(255,85,85,0.2)] hover:shadow-[0_0_40px_rgba(255,85,85,0.6)]'}`}
                  >
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-lg mb-1">
                      <RotateCcw size={20} className={localLifelines > 0 && !isRolling ? "group-hover:-rotate-180 transition-transform duration-500" : ""} />
                      Second Chance
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                      {localLifelines} Remaining
                    </span>
                  </button>

                  <button 
                    onClick={handleClaim}
                    disabled={isRolling}
                    className="flex-1 flex flex-col items-center justify-center py-4 px-6 rounded-xl bg-gradient-to-br from-[#4ade80] to-[#166534] border-2 border-[#55ffb0] text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(85,255,176,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-lg mb-1">
                      <CheckCircle size={20} />
                      Click to Claim
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80 text-white/80">
                      Lock in Multiplier
                    </span>
                  </button>

                </div>

              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
