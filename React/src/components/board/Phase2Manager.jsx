import React, { useState } from 'react';
import Phase2PlayerMatModal from '../modals/Phase2PlayerMatModal';
import MentorCardModal from '../modals/MentorCardModal';
import SuccessBanner from '../modals/SuccessBanner';

const Phase2Manager = ({ activeModal, setActiveModal, sendAction, localPlayer, currentRound, drawnCard, clearDrawnCard }) => {
  const [successMessage, setSuccessMessage] = useState(null);

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
    
    // 3. Formulate success message
    let msg = `PAID $${amount}K! YOU'VE PAID FOR ${companyName}`;
    if (activeModal === 'launch') {
      msg = `PAID $${amount}K! YOU'VE LAUNCHED ${companyName}`;
    } else if (activeModal === 'stage_up') {
      let newStage = "RETAIN";
      const comp = localPlayer?.ownedCompanies?.find(c => c.name === companyName);
      if (comp) {
        if (comp.stage === 0) newStage = "RETAIN";
        else if (comp.stage === 1) newStage = "GROW";
        else if (comp.stage === 2) newStage = "SCALE";
        else if (comp.stage === 3) newStage = "SCALE";
      }
      msg = `${companyName} UPGRADED TO ${newStage} STAGE!`;
    } else if (activeModal === 'buy_pr') {
      msg = `PAID $${amount}K! YOU'VE BOUGHT PR FOR ${companyName}`;
    } else if (activeModal === 'upgrade_workforce') {
      msg = `WORKFORCE UPGRADED FOR ${companyName}!`;
    }

    setSuccessMessage(msg);

    // 4. Auto-hide success banner after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleMentorAction = (type, cost) => {
    sendAction('phase2_action', {
      actionType: 'buy_mentor',
      companyName: null,
      amount: Number(cost)
    });
    // Removed closing modal here, as it will close after the reveal step now.
  };

  const isMatActive = ['launch', 'stage_up', 'buy_pr', 'upgrade_workforce'].includes(activeModal);
  const isMentorActive = activeModal === 'buy_mentor';

  return (
    <>
      {isMatActive && (
        <Phase2PlayerMatModal 
          onClose={handleClose} 
          onPaymentComplete={handlePaymentComplete}
          ownedCompanies={localPlayer?.ownedCompanies || []}
          actionType={activeModal}
          currentRound={currentRound}
        />
      )}



      {successMessage && (
        <SuccessBanner 
          message={successMessage} 
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </>
  );
};

export default Phase2Manager;
