import React from 'react';

const getLaunchedCompanyForMessage = (message) => {
  if (!message) return null;
  const msgUpper = message.toUpperCase();
  if (!msgUpper.includes("LAUNCHED")) return null;
  
  const baseCompanies = [
    { name: 'Wallet', icon: '👛', image: '/company-wallet.png' },
    { name: 'Quick Commerce', icon: '🛒', image: '/company-quick-commerce.png' },
    { name: 'Snacks', icon: '🍿', image: '/company-snacks.png' },
    { name: 'Restro - Chain', icon: '🍽️', image: '/company-restro-chain.png' },
    { name: 'Contract Farming', icon: '🌾', image: '/company-contract-farming.png' }, 
    { name: 'Agri IoT', icon: '📡', image: '/company-agri-iot.png' }, 
    { name: 'Smart Storage', icon: '📦', image: '/company-smart-storage.png' }, 
    { name: 'Robo - Packaging', icon: '🤖', image: '/company-robo-packaging.png' }, 
    { name: 'Traceability', icon: '🔗', image: '/company-traceability.png' },
  ];

  const match = baseCompanies.find(comp => {
    const cleanCompName = comp.name.toUpperCase().replace(/[^A-Z]/g, '');
    const cleanMsg = msgUpper.replace(/[^A-Z]/g, '');
    return cleanMsg.includes(cleanCompName);
  });
  
  return match || null;
};

const SuccessBanner = ({ message, onClose }) => {
  const matchedCompany = getLaunchedCompanyForMessage(message);

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto">
      {/* Dark overlay specifically for the success banner focus */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* The Banner */}
      <div 
        className="relative z-10 w-full bg-gradient-to-r from-transparent via-[#FFC240] to-transparent py-4 md:py-6 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 shadow-[0_0_40px_rgba(255,194,64,0.4)]"
      >
        <div className="flex items-center justify-center gap-6 md:gap-10 px-8">
          {matchedCompany && (
            <div className="w-24 h-24 md:w-36 md:h-36 flex items-center justify-center shrink-0 -my-12 relative z-[110]">
               <img 
                 src={matchedCompany.image} 
                 alt={matchedCompany.name} 
                 className="w-[200%] h-[200%] max-w-none object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.85)] animate-[bounce_3.5s_infinite] -translate-y-6" 
               />
            </div>
          )}
          
          <div className="bg-black/20 px-8 py-2 border-y-2 border-[#FFFFFF]/50 backdrop-blur-md">
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-[0.2em] bg-gradient-to-b from-[#FFFFFF] to-[#FFC240] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight text-center">
              {message}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessBanner;
