import React, { useState } from 'react';
import { ShieldAlert, Users, Coins, RotateCcw } from 'lucide-react';

const safeSessionStorage = {
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn("sessionStorage is blocked:", e);
    }
  }
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validateUsername = (u) => /^[a-zA-Z0-9_]{3,20}$/.test(u);
  const validatePassword = (p) => {
    if (p.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(p)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(p)) return "Password must contain at least one number.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!email) {
      setError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email address format.');
      return;
    }
    if (!isLogin && !username) {
      setError('Username is required.');
      return;
    }
    if (!isLogin && !validateUsername(username)) {
      setError('Username must be 3–20 alphanumeric characters or underscores.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    const passwordError = validatePassword(password);
    if (!isLogin && passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin 
      ? { email, password } 
      : { username, email, password };

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.success && data.data) {
        const { token, user } = data.data;
        safeSessionStorage.setItem('modernmint_token', token);
        safeSessionStorage.setItem('modernmint_username', user.username);
        onLoginSuccess(token, user);
      } else {
        throw new Error('Invalid response structure from server.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#030806] flex flex-col items-center justify-center font-sans text-white relative z-[250] overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[10px] scale-110"
        style={{ backgroundImage: `url('/bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030806_80%)] pointer-events-none"></div>

      <div className="bg-[#0a1914]/85 border border-[#1c4d3d] p-10 md:p-12 rounded-2xl shadow-[0_0_60px_rgba(85,255,176,0.15)] backdrop-blur-md flex flex-col items-center gap-6 relative z-10 w-[420px] max-w-[90%]">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#55ffb0] tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(85,255,176,0.2)] mb-2">
            Modern Mint
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-[#a4d8c2]/70">
            Strategy Negotiation Arena
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/40 border border-[#1c4d3d] p-1 rounded-xl w-full">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${isLogin ? 'bg-[#2A7553] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Log In
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${!isLogin ? 'bg-[#2A7553] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="w-full flex items-start gap-2.5 bg-red-900/20 border border-red-500/50 p-3 rounded-lg text-red-200 text-xs font-mono animate-in slide-in-from-top-2 duration-200">
            <ShieldAlert size={16} className="shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {!isLogin && (
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#a4d8c2]">Username</label>
              <input 
                type="text" 
                placeholder="Enter username"
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-[#1c4d3d] rounded-lg p-3 text-white focus:outline-none focus:border-[#55ffb0] transition-colors font-mono placeholder:text-gray-600 text-sm"
              />
            </div>
          )}

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#a4d8c2]">Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. player@example.com"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-[#1c4d3d] rounded-lg p-3 text-white focus:outline-none focus:border-[#55ffb0] transition-colors font-mono placeholder:text-gray-600 text-sm"
            />
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#a4d8c2]">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-[#1c4d3d] rounded-lg p-3 text-white focus:outline-none focus:border-[#55ffb0] transition-colors font-mono placeholder:text-gray-600 text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2A7553] to-[#1c4d3d] hover:from-[#55ffb0] hover:to-[#2A7553] hover:text-black text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(85,255,176,0.3)] transition-all mt-2 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isLogin ? 'Authenticate Log In' : 'Register Account'}
          </button>
        </form>

        <div className="text-[10px] text-[#a4d8c2]/50 text-center font-mono mt-2">
          {isLogin ? (
            <p>Use preseeded account: <span className="text-[#55ffb0]">priya@example.com</span> / <span className="text-[#55ffb0]">Password123</span></p>
          ) : (
            <p>Password requirements: 8+ characters, 1 uppercase, 1 digit.</p>
          )}
        </div>
      </div>
    </div>
  );
}
