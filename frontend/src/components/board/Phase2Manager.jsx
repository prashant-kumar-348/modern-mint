import React from 'react';
import Phase2PlayerMatModal from '../modals/Phase2PlayerMatModal';

const Phase2Manager = ({ activeModal, setActiveModal, sendAction, localPlayer, currentRound, drawnCard, clearDrawnCard, activeEvent }) => {
  const handleClose = () => {
    setActiveModal(null);
  };

  const handlePaymentComplete = (companyName, amount) => {
    // 1. Send Action to Server
    sendAction('phase2_action', {
      actionType: activeModal, // 'launch', 'stage_up', 'buy_pr'
      companyName: companyName,
      amount: Number(amount)
    });

    // 2. Close the mat modal
    setActiveModal(null);
  };

  const handleMentorAction = (type, cost) => {
    sendAction('phase2_action', {
      actionType: 'buy_mentor',
      companyName: null,
      amount: Number(cost)
    });
  };

  const isMatActive = ['launch', 'stage_up', 'buy_pr', 'upgrade_workforce'].includes(activeModal);

  return (
    <>
      {isMatActive && (
        <Phase2PlayerMatModal 
          onClose={handleClose} 
          onPaymentComplete={handlePaymentComplete}
          ownedCompanies={localPlayer?.ownedCompanies || []}
          actionType={activeModal}
          currentRound={currentRound}
          activeEvent={activeEvent}
        />
      )}
    </>
  );
};

export default Phase2Manager;
