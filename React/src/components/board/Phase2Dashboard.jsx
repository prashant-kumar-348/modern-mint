import React from 'react';

const Phase2Dashboard = ({ isLocked, onActionClick }) => {
  const buttonBaseClass = "px-4 md:px-6 py-2.5 md:py-3.5 rounded-2xl text-[10px] md:text-xs font-bold transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-[#14532d]/40 flex-1 whitespace-nowrap";
  
  const getButtonClass = (actionName) => {
    if (isLocked) {
      return `${buttonBaseClass} opacity-50 cursor-not-allowed bg-gray-900 text-gray-500 border-gray-800`;
    }
    return `${buttonBaseClass} bg-gradient-to-br from-[#4ade80] to-[#166534] text-white hover:from-[#52ea90] hover:to-[#1b753d] hover:scale-105 active:scale-95`;
  };

  return (
    <>
      <button
        onClick={() => !isLocked && onActionClick && onActionClick('launch')}
        disabled={isLocked}
        className={getButtonClass('launch')}
      >
        Launch Company
      </button>
      <button
        onClick={() => !isLocked && onActionClick && onActionClick('stage_up')}
        disabled={isLocked}
        className={getButtonClass('stage_up')}
      >
        Stage Up Company
      </button>
      <button
        onClick={() => !isLocked && onActionClick && onActionClick('upgrade_workforce')}
        disabled={isLocked}
        className={getButtonClass('upgrade_workforce')}
      >
        Upgrading Workforce
      </button>
      <button
        onClick={() => !isLocked && onActionClick && onActionClick('buy_pr')}
        disabled={isLocked}
        className={getButtonClass('buy_pr')}
      >
        Buy PR Services
      </button>
      <button
        onClick={() => !isLocked && onActionClick && onActionClick('buy_mentor')}
        disabled={isLocked}
        className={getButtonClass('buy_mentor')}
      >
        Buy Mentor Card
      </button>
    </>
  );
};

export default Phase2Dashboard;
