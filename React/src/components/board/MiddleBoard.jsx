import React, { useState } from 'react';

export default function MiddleBoard({ players = [], onDeckClick, currentRound = 1 }) {
  const totalRounds = 9;

  const getStageInitial = (stageIdx) => ['L', 'R', 'G', 'S'][stageIdx] || 'L';

  // 9 Companies in Orbit
  const baseCompanies = [
    { name: 'Wallet', icon: '👛', image: '/company-wallet.png', angle: 0 },
    { name: 'Quick Commerce', icon: '🛒', image: '/company-quick-commerce.png', angle: 50 },
    { name: 'Snacks', icon: '🍿', image: '/company-snacks.png', angle: 90 },
    { name: 'Restro - Chain', icon: '🍽️', image: '/company-restro-chain.png', angle: 135 },
    { name: 'Contract Farming', icon: '🌾', image: '/company-contract-farming.png', angle: 170 }, 
    { name: 'Agri IoT', icon: '📡', image: '/company-agri-iot.png', angle: 205 }, 
    { name: 'Smart Storage', icon: '📦', image: '/company-smart-storage.png', angle: 240 }, 
    { name: 'Robo - Packaging', icon: '🤖', image: '/company-robo-packaging.png', angle: 275 }, 
    { name: 'Traceability', icon: '🔗', image: '/company-traceability.png', angle: 320 },
  ];

  const companies = baseCompanies.map(comp => {
     const tags = [];
     players.forEach(p => {
        if (p.ownedCompanies) {
           const owned = p.ownedCompanies.find(c => c.name.replace(/\s+/g, '').toLowerCase() === comp.name.replace(/\s+/g, '').toLowerCase());
           if (owned) {
              tags.push({ color: p.color || '#55ffb0', text: getStageInitial(owned.stage) });
           }
        }
     });
     return { ...comp, tags };
  });

  return (
    <div className="relative w-full h-full flex flex-col pointer-events-none font-sans text-white overflow-hidden bg-[#061c17]">
      
      {/* City Map Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 48%, #55ffb0 49%, #55ffb0 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, #55ffb0 49%, #55ffb0 51%, transparent 52%),
            radial-gradient(circle at 30% 30%, transparent 60%, #1c4d3d 61%, #1c4d3d 62%, transparent 63%)
          `,
          backgroundSize: '150px 150px, 120px 120px, 300px 300px',
          backgroundPosition: '0 0, 40px 60px, -50px -50px'
        }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#061c17]/60 to-[#030d0a] pointer-events-none"></div>

      {/* MODERN MINT Header */}
      <div className="absolute top-0 w-full flex justify-center pt-2">
         <div className="text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2D8] via-[#d4af37] to-[#8a6818] font-serif font-black uppercase tracking-[0.3em] text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-8 py-2 border-b border-x border-[#144b3c] rounded-b-xl bg-[#061c17]/80 backdrop-blur-sm z-40 pointer-events-auto">
            MODERN MINT
         </div>
         {/* Subtle grid lines extending from title */}
         <div className="absolute top-8 left-0 right-0 h-[1px] bg-[#144b3c]/50 z-30"></div>
         <div className="absolute top-12 left-0 right-0 h-[1px] bg-[#144b3c]/30 z-30"></div>
      </div>

      <div className="flex-1 w-full h-full relative z-10 pt-[80px] pb-[60px] px-14 flex justify-between">
        
        {/* =========================================
            LEFT COLUMN: Rounds & Cards
        ========================================= */}
        <div className="flex gap-8 pointer-events-auto z-30 w-[300px]">
          
          {/* Round Tracker */}
          <div className="flex flex-col items-center w-20 -mt-4">
            <div className="text-xs md:text-[13px] text-[#55ffb0] uppercase font-black tracking-widest mb-4">ROUND/YEAR</div>
            <div className="relative flex flex-col gap-5 items-center w-full">
              {/* Vertical connecting line */}
              <div className="absolute top-0 bottom-0 w-[1px] bg-[#144b3c] -z-10"></div>
              
              {[...Array(totalRounds)].map((_, i) => {
                const r = i + 1;
                const isActive = r === currentRound;
                
                return (
                  <div 
                    key={i} 
                    className={`relative w-12 h-12 rounded-full border flex items-center justify-center text-xl font-bold bg-[#061c17] transition-all
                      ${isActive ? 'border-none shadow-[0_0_20px_rgba(229,193,88,0.6)] scale-125' : 'border-[#144b3c] text-[#30a887]'}`}
                  >
                    {isActive ? (
                       <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,#e5c158,#c05c5c,#2a5a6b)] flex items-center justify-center border-2 border-[#fff2d8]/50 overflow-hidden shadow-inner">
                          <img src="/action-token.png" alt="Active Round Token" className="w-[120%] h-[120%] object-cover" />
                       </div>
                    ) : (
                       r
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cards Stack */}
          <div className="flex flex-col justify-between h-full pt-6 pb-2 w-[125px]">
            
            {/* Bankruptcy Card (Custom Image) */}
            <div className="w-full aspect-[2.5/3.5] bg-[#111] rounded-md shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer border-2 border-[#1c4d3d]">
               <img src="/bankruptcy-card.jpg" alt="Bankruptcy Card" className="absolute inset-0 w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors mix-blend-overlay"></div>
            </div>
            
            {/* Event Card 4-6 (Custom Image) */}
            <div className="w-full aspect-[2.5/3.5] bg-[#111] rounded-md shadow-[0_0_20px_rgba(0,225,255,0.2)] flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer border-2 border-[#1c4d3d]">
               {currentRound >= 4 ? (
                 <>
                   <img src="/event-card.jpg" alt="Event Card 4-6" className="absolute inset-0 w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-[#00e1ff]/10 mix-blend-overlay opacity-50 group-hover:opacity-100 transition-opacity"></div>
                 </>
               ) : (
                 <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#061c17] to-[#0a2e24] flex items-center justify-center flex-col border-2 border-dashed border-[#1c4d3d] p-2 text-center">
                    <span className="text-[#30a887] text-[13px] leading-tight font-black uppercase tracking-widest drop-shadow-md">Round 4<br/>Event</span>
                    <span className="text-4xl mt-3 opacity-50 drop-shadow-xl">🔒</span>
                 </div>
               )}
            </div>

            {/* Event Card 7-9 (Custom Image) */}
            <div className="w-full aspect-[2.5/3.5] bg-[#111] rounded-md shadow-[0_0_20px_rgba(0,225,255,0.2)] flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer border-2 border-[#1c4d3d]">
               {currentRound >= 7 ? (
                 <>
                   <img src="/event-card.jpg" alt="Event Card 7-9" className="absolute inset-0 w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-[#00e1ff]/10 mix-blend-overlay opacity-50 group-hover:opacity-100 transition-opacity"></div>
                 </>
               ) : (
                 <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#061c17] to-[#0a2e24] flex items-center justify-center flex-col border-2 border-dashed border-[#1c4d3d] p-2 text-center">
                    <span className="text-[#30a887] text-[13px] leading-tight font-black uppercase tracking-widest drop-shadow-md">Round 7<br/>Event</span>
                    <span className="text-4xl mt-3 opacity-50 drop-shadow-xl">🔒</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* =========================================
            CENTER: Simulation Space & Radial Orbit
        ========================================= */}
        <div className="flex-1 flex items-center justify-center pointer-events-none relative mt-2">
          
          <div className="relative w-[550px] h-[550px] flex items-center justify-center">
            
            {/* Background colorful radiant glow */}
            <div className="absolute inset-[10%] rounded-full opacity-70 mix-blend-screen blur-3xl pointer-events-none"
                 style={{
                   background: 'conic-gradient(from 0deg, #5b75a6, #844c8c, #c05c5c, #89a868, #5b75a6)'
                 }}
            ></div>

            {/* Outer Golden Rings */}
            <div className="absolute inset-2 rounded-full border-[3px] border-[#c49a45] shadow-[0_0_30px_rgba(229,193,88,0.3)]"></div>
            <div className="absolute inset-4 rounded-full border border-[#c49a45]/40"></div>
            
            {/* Inner Art Deco Golden Wheel */}
            <div className="absolute inset-12 rounded-full border border-[#c49a45]/60 overflow-hidden">
               {/* Decorative wheel spokes/patterns */}
               <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{
                 backgroundImage: `repeating-conic-gradient(from 0deg, transparent 0deg, transparent 15deg, #c49a45 15deg, #c49a45 16deg)`
               }}></div>
            </div>

            {/* Center Diamond with Skyline (Custom Image) */}
            <div onClick={onDeckClick} className="absolute z-20 flex items-center justify-center drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-transform hover:scale-105 cursor-pointer pointer-events-auto">
               <img src="/center-mentor-card.png" alt="Mentor Card 20K" className="w-[180px] h-[180px] object-contain" />
            </div>

            {/* Orbiting Companies */}
            {companies.map((comp, idx) => {
              const radius = 275; 
              const rad = (comp.angle - 90) * (Math.PI / 180);
              let yOffset = Math.sin(rad) * radius;
              let xOffset = Math.cos(rad) * radius;
              
              if (comp.name === 'Contract Farming') {
                 yOffset -= 40; // Nudge it upwards to clear the bottom tracker
              }

              const top = `calc(50% + ${yOffset}px)`;
              const left = `calc(50% + ${xOffset}px)`;

              return (
                <div 
                  key={idx}
                  className="absolute z-30 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform"
                  style={{ top, left }}
                >
                  <div className="relative flex flex-col items-center gap-1">
                     
                     {/* Floating Tags (L / G) */}
                     {comp.tags && comp.tags.length > 0 && (
                        <div className="absolute -top-10 -right-8 flex flex-col gap-1 z-40 drop-shadow-lg">
                          {comp.tags.map((tag, tIdx) => (
                            <div key={tIdx} className="w-8 h-8 rounded-md flex items-center justify-center text-base font-black text-white border-2 border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.6)]" style={{ backgroundColor: tag.color }}>
                               {tag.text}
                            </div>
                          ))}
                        </div>
                     )}

                     {/* Company 3D Illustration / Emoji */}
                     <div className="w-16 h-16 rounded-xl border-transparent flex items-center justify-center text-5xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] mb-1 relative overflow-visible transition-transform">
                       {comp.image ? (
                         <img src={comp.image} alt={comp.name} className="w-[200%] h-[200%] max-w-none object-contain relative z-10 drop-shadow-[0_10px_15px_rgba(0,0,0,0.95)] -translate-y-2" />
                       ) : (
                         <span className="relative z-10 bg-[#0c2e26]/50 p-2 rounded-lg backdrop-blur border border-[#30a887]/30">{comp.icon}</span>
                       )}
                     </div>
                     
                     {/* Golden Plaque Name Tag */}
                     <div className="absolute -bottom-7 w-40 flex justify-center z-30">
                        <div className="bg-gradient-to-b from-[#e5c158] to-[#b38836] px-4 py-2 border-2 border-[#5c4015] rounded text-[10px] font-black uppercase tracking-widest text-[#2a1a08] shadow-[0_4px_10px_rgba(0,0,0,0.8)] relative whitespace-nowrap">
                           {comp.name}
                           {/* Side rivets/decorations */}
                           <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-1.5 h-3.5 border-r border-y border-[#5c4015] rounded-l bg-[#c29641]"></div>
                           <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-1.5 h-3.5 border-l border-y border-[#5c4015] rounded-r bg-[#c29641]"></div>
                        </div>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: Info Boxes & Players
        ========================================= */}
        <div className="flex flex-col justify-between items-end w-[280px] pointer-events-auto z-30 pt-6 pb-2">
          
          {/* Bank Loan Info */}
          <div className="w-full bg-[#0c2e26]/80 backdrop-blur-md border border-[#1d6b56] p-4 pb-8 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-1 border border-[#30a887]/40 rounded-sm"></div>
            <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#55ffb0]"></div>
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#55ffb0]"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#55ffb0]"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#55ffb0]"></div>

            <h3 className="text-[#55ffb0] font-black text-[11px] uppercase tracking-[0.2em] mb-4 text-center relative z-10">Bank Loan</h3>
            <ul className="text-[9px] text-[#a4d8c2] space-y-3 leading-tight list-disc pl-5 font-sans pr-2 relative z-10">
              <li>Pay 10% interest each round</li>
              <li>Borrow up to your eligible limit<br/><span className="text-[7px] text-[#a4d8c2]/60">(see Player Mat)</span></li>
            </ul>
          </div>

          {/* Player Tokens Stack (Avatars with glowing borders) */}
          <div className="flex flex-col justify-center items-center gap-4 w-full z-20 -my-4 relative">
            {(() => {
              // Sort valid players by actionCount ascending (least actions / lowest at the top)
              const sortedPlayers = [...players].sort((a, b) => {
                const acA = a.actionCount || 0;
                const acB = b.actionCount || 0;
                if (acA !== acB) {
                  return acA - acB;
                }
                return players.indexOf(a) - players.indexOf(b);
              });
              
              return sortedPlayers.map((p, sortedIdx) => {
                const originalIdx = players.findIndex(pl => pl.id === p.id);
                const borderColor = p.color || '#55ffb0';
                
                // Determine avatar image path based on their original index in the players roster
                const avatarNum = (originalIdx !== -1 ? originalIdx : sortedIdx) % 4 + 1;
                const avatarSrc = `/player-avatar-${avatarNum}.png`;

                return (
                  <div 
                    key={p.id}
                    className="w-[70px] h-[70px] rounded-full border-4 flex items-center justify-center text-3xl cursor-pointer hover:scale-110 transition-transform relative shadow-[0_10px_20px_rgba(0,0,0,0.8)] bg-black"
                    style={{ 
                      borderColor: borderColor,
                      boxShadow: `0 0 20px ${borderColor}80, inset 0 0 10px rgba(0,0,0,0.8)`
                    }}
                  >
                    {/* Image overlay mock for characters */}
                    <div className="absolute inset-0 rounded-full mix-blend-overlay opacity-50 bg-gradient-to-b from-transparent to-black pointer-events-none"></div>
                    <img src={avatarSrc} alt={p.name} className="w-[120%] h-[120%] object-cover absolute z-10 rounded-full" />
                  </div>
                );
              });
            })()}
          </div>

          {/* PR Services Info */}
          <div className="w-full bg-[#0c2e26]/80 backdrop-blur-md border border-[#1d6b56] p-4 pt-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-1 border border-[#30a887]/40 rounded-sm"></div>
            <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#55ffb0]"></div>
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#55ffb0]"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#55ffb0]"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#55ffb0]"></div>

            <h3 className="text-[#55ffb0] font-black text-[11px] uppercase tracking-[0.2em] mb-4 text-center">PR Services</h3>
            <div className="flex flex-col items-center gap-1.5 text-[9px] text-[#a4d8c2] font-sans">
              <div>Team 3: Pay $500K</div>
              <div>Team 2: Pay $300K</div>
              <div>Team 1: Pay $100K</div>
            </div>
            <div className="text-[8px] text-[#55ffb0] mt-4 text-center uppercase tracking-widest font-bold">Projected Revenue will be DOUBLED</div>
            <div className="text-[6px] text-[#a4d8c2]/50 text-center uppercase tracking-widest mt-1">*One applies per company per round</div>
          </div>

        </div>

      </div>

      {/* =========================================
          BOTTOM ACTION BAR (1-30)
      ========================================= */}
      <div className="absolute bottom-0 left-0 w-full h-[45px] bg-[#061c17]/90 border-t border-[#1d6b56] flex pointer-events-auto z-40 backdrop-blur-sm">
        {[...Array(30)].map((_, i) => {
          const squareNum = i + 1;
          const playersOnSquare = players.filter(p => (p.actionCount || 0) === squareNum);

          return (
            <div 
              key={i}
              className="flex-1 border-r border-[#1d6b56]/50 relative flex flex-col items-center justify-center overflow-hidden hover:bg-[#1d6b56]/40 transition-colors"
            >
              <span className="absolute text-[10px] text-[#30a887]/50 font-bold select-none z-0">{squareNum}</span>
              
              {/* Checkers-style Tokens */}
              {playersOnSquare.length > 0 && (
                 <div className="absolute inset-0 flex items-center justify-center gap-0.5 p-1 z-10">
                    {playersOnSquare.map(p => (
                      <div 
                        key={p.id} 
                        className="w-5 h-5 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.8)] border-2 border-white/30 transition-all duration-300 hover:scale-110"
                        style={{ backgroundColor: p.color }}
                        title={`${p.name}: ${p.actionCount} Actions`}
                      ></div>
                    ))}
                 </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

