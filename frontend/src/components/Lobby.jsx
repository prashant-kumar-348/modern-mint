import React, { useState } from 'react';

export default function Lobby({ onJoin, existingRoomId }) {
  console.log("Lobby render:", { existingRoomId });
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('Player' + Math.floor(Math.random() * 1000));
  const [role, setRole] = useState('Founder');

  const handleAction = async () => {
    if (existingRoomId) {
      onJoin(existingRoomId, username, role);
    } else {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/api/create-room', { method: 'POST' });
        const data = await res.json();
        onJoin(data.roomId, username, role);
      } catch (e) {
        console.error(e);
        alert('Failed to create room');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-screen h-screen bg-[#030806] flex flex-col items-center justify-center font-sans text-white relative z-[200] overflow-hidden">
      
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[10px] scale-110"
        style={{ backgroundImage: `url('/bg.jpg')` }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030806_80%)] pointer-events-none"></div>
      
      <div className="bg-[#0a1914]/80 border border-[#1c4d3d] p-12 rounded-2xl shadow-[0_0_50px_rgba(28,77,61,0.5)] flex flex-col items-center gap-8 relative z-10 w-[400px]">
        <h1 className="text-4xl font-black text-[#55ffb0] tracking-widest uppercase drop-shadow-md text-center">
          Modern Mint
        </h1>
        
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-[#a4d8c2]">Your Name</label>
          <input 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-black/50 border border-[#1c4d3d] rounded p-3 text-white focus:outline-none focus:border-[#55ffb0] transition-colors font-mono"
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-[#a4d8c2]">Select Role</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
              <input type="radio" name="role" value="Founder" checked={role === 'Founder'} onChange={() => setRole('Founder')} className="accent-[#55ffb0]" /> Founder
            </label>
            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
              <input type="radio" name="role" value="Investor" checked={role === 'Investor'} onChange={() => setRole('Investor')} className="accent-[#55ffb0]" /> Investor
            </label>
          </div>
        </div>

        <button 
          onClick={handleAction}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#2A7553] to-[#1c4d3d] hover:from-[#55ffb0] hover:to-[#2A7553] hover:text-black text-white font-bold uppercase tracking-widest py-4 rounded shadow-lg transition-all"
        >
          {loading ? 'Creating...' : existingRoomId ? 'Join Game' : 'Create New Game'}
        </button>

        <p className="text-[#a4d8c2] text-xs text-center opacity-70">
          {existingRoomId 
            ? "You are joining an active negotiation room. Choose your role to enter."
            : "Share the URL with friends after creating to invite them to your lobby."}
        </p>
      </div>
    </div>
  );
}
