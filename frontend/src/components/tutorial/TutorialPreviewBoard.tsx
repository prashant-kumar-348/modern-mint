"use client";

import React, { useState, useEffect } from 'react';
import MiddleBoard from '../board/MiddleBoard';
import { MOCK_TUTORIAL_PLAYERS } from './tutorialData';
import { Users, DollarSign, Briefcase } from 'lucide-react';

const AVATAR_IMAGE_BY_ID: Record<number, string> = {
  1: 'https://modernmintgame.com/cdn/shop/files/01.png?v=1772091663&width=2000',
  2: 'https://modernmintgame.com/cdn/shop/files/03.png?v=1772091662&width=2000',
  3: 'https://modernmintgame.com/cdn/shop/files/02.png?v=1772091663&width=2000',
  4: 'https://modernmintgame.com/cdn/shop/files/05.png?v=1772091663&width=2000',
};

export default function TutorialPreviewBoard() {
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

  const localPlayer = MOCK_TUTORIAL_PLAYERS[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030806] flex items-center justify-center font-sans select-none">
      
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[10px] scale-110"
        style={{ backgroundImage: `url('/bg.jpg')` }}
      />

      {/* Main Letterboxed Scale Frame */}
      <div 
        className="relative z-10 w-[1920px] h-[1080px] shrink-0 overflow-hidden text-[#a4d8c2]"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
      >

        {/* TOP NOTIFICATION PROMPTS (MOCK) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
          <div className="rounded-xl p-[2px] bg-gradient-to-r from-[#8a6818] via-[#FFE885] to-[#8a6818] shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <div className="bg-black/95 rounded-[10px] px-16 py-4 text-center flex flex-col items-center justify-center">
              <h2 className="text-white text-lg font-medium tracking-wide mb-0.5">ModernMint Commander Academy</h2>
              <p className="text-[#d4af37] text-xs tracking-wider">Interactive Game Tutorial Preview</p>
            </div>
          </div>
        </div>

        {/* TOP-RIGHT: PLAYER ROSTER */}
        <div 
          data-tutorial="tutorial-player-roster"
          className="absolute right-6 top-6 flex flex-col items-end gap-2 w-[300px] z-50 p-2 rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm"
        >
          {MOCK_TUTORIAL_PLAYERS.map(player => (
            <div key={player.id} className="w-full flex items-center justify-end gap-2">
              <div 
                className="w-[152px] h-[30px] rounded-[5px] flex items-center justify-between px-3 shadow-lg border border-white/10"
                style={{ backgroundColor: player.color + '22', borderColor: player.color }}
              >
                <span className="text-[10px] font-bold text-white tracking-wide truncate">{player.name}</span>
                <span className="text-[9px] font-mono text-gray-300">${player.cash}K</span>
              </div>
              <div 
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 border-2 overflow-hidden bg-gray-900 shadow-md"
                style={{ borderColor: player.color }}
              >
                {player.avatarId && AVATAR_IMAGE_BY_ID[player.avatarId] ? (
                  <img src={AVATAR_IMAGE_BY_ID[player.avatarId]} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <Users size={14} style={{ color: player.color }} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GAME VIEW: CENTER BOARD & SIDEBARS */}
        <div className="absolute top-[100px] w-full h-[620px] flex items-center justify-between px-8">
          
          {/* Left Column Spacer */}
          <div className="w-[200px]"></div>

          {/* Center: Constrained Middle Board */}
          <div 
            data-tutorial="tutorial-game-board"
            className="w-full max-w-[1450px] h-full max-h-[760px] relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1c4d3d] rounded-xl overflow-hidden bg-[#0a1914] scale-[0.9] origin-top"
          >
             <MiddleBoard players={MOCK_TUTORIAL_PLAYERS as any} onDeckClick={() => {}} currentRound={1} />
          </div>

          {/* Right Column Spacer */}
          <div className="w-[200px]"></div>
        </div>

        {/* LOWER HALF: DESK AREA & TRACKERS */}
        <div className="absolute bottom-[130px] w-full h-[240px] flex justify-center items-end gap-8 z-20">
          
          {/* Bottom-Left: Trackers */}
          <div 
            data-tutorial="tutorial-trackers"
            className="absolute left-6 bottom-4 flex flex-col gap-3 p-2 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm"
          >
            <div className="bg-gradient-to-r from-black to-[#397564] border border-white/5 rounded-[10px] px-4 w-[214px] h-[42px] flex items-center justify-between shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">Deal Tracker</span>
              <span className="text-[28px] font-black bg-gradient-to-b from-white to-[#FFC240] bg-clip-text text-transparent">1</span>
            </div>
            <div className="bg-gradient-to-r from-black to-[#397564] border border-white/5 rounded-[10px] px-4 w-[214px] h-[42px] flex items-center justify-between shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">Action Tracker</span>
              <span className="text-[28px] font-black bg-gradient-to-b from-white to-[#FFC240] bg-clip-text text-transparent">3</span>
            </div>
          </div>

          {/* Desk Element: Player Mat & Information Area */}
          <div 
            data-tutorial="tutorial-player-info"
            className="scale-[0.65] translate-y-2 relative z-10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-lg bg-[#4A1720] border-2 border-[#2A0D12] p-2 flex gap-2 origin-bottom mb-6 cursor-default"
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
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5 w-[75px]">
              <div className="h-[40px] bg-[#FFF2D8] rounded flex items-center justify-center p-1 text-center"><span className="text-[10px] font-black text-[#4A1720] leading-tight">2ND<br/>CHANCE</span></div>
              <div className="h-[70px] bg-[#FFF2D8] rounded flex items-center justify-center p-1 text-center"><span className="text-[10px] font-black text-[#4A1720] leading-tight">MULTIPLIER</span></div>
            </div>
          </div>

          {/* Desk Element: Owned Mentor Cards (Card Area) */}
          <div 
            data-tutorial="tutorial-card-area"
            className="relative w-[160px] h-[160px] mb-6 ml-6 cursor-default"
          >
            <div className="absolute -top-2 -right-2 bg-red-600 border-2 border-white text-white font-black text-xs w-6 h-6 rounded-full flex items-center justify-center z-50">
               1
            </div>
            <img 
              src="/center-mentor-card.png" 
              alt="Owned Mentor Card" 
              className="absolute inset-0 w-full h-full object-contain origin-bottom shadow-2xl" 
            />
          </div>

        </div>

        {/* BOTTOM ACTION BAR CONTROLS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div 
            data-tutorial="tutorial-action-bar"
            className="flex items-center gap-4 bg-[#061c17]/90 p-3 rounded-2xl border border-[#d4af37]/40 shadow-2xl backdrop-blur-md"
          >
            <button className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#2e8b57] to-[#1c5435] border border-[#55ffb0]/20 text-white font-semibold tracking-wide shadow-md">
              Take Bank Loan
            </button>
            <button className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#2e8b57] to-[#1c5435] border border-[#55ffb0]/20 text-white font-semibold tracking-wide shadow-md">
              Offer a Deal
            </button>
            <button className="relative overflow-hidden bg-gradient-to-br from-[#d4af37] via-[#FFE885] to-[#8a6818] text-black font-black uppercase tracking-widest text-xs py-3 px-6 rounded-full shadow-lg">
              LOCK THE DEAL
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
