import React from 'react';
import { Handshake } from 'lucide-react';

const RoyaltyProposalModal = ({ proposal, onClose, sendAction }) => {
  if (!proposal) return null;

  const handleAccept = () => {
    sendAction('accept_royalty_agreement', proposal);
    onClose();
  };

  const handleReject = () => {
    sendAction('reject_royalty_agreement', { proposerId: proposal.proposerId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[400] flex items-center justify-center p-4 font-sans select-none">
      <div className="w-[400px] bg-[#0a1914] border border-[#ffb055]/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,176,85,0.2)] flex flex-col gap-6 relative">
        
        <div className="text-center">
          <Handshake className="w-12 h-12 text-[#ffb055] mx-auto mb-2" />
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">
            Royalty Proposal
          </h2>
          <p className="text-sm text-white/80">
            <strong className="text-[#ffb055]">{proposal.proposerName}</strong> wants to lock in a deal:
          </p>
        </div>

        <div className="bg-[#112a22] rounded-lg p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-xs text-white/50 uppercase tracking-widest">Company</span>
            <span className="text-[#55ffb0] font-bold">{proposal.companyName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/50 uppercase tracking-widest">Royalty Cut</span>
            <span className="text-[#ffb055] font-black text-lg">{proposal.percentage}%</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleReject}
            className="flex-1 py-3 bg-transparent border border-red-500/50 text-red-500 font-bold uppercase tracking-widest rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Reject
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 py-3 bg-[#55ffb0] text-black font-black uppercase tracking-widest rounded-lg hover:bg-[#43d995] transition-colors"
          >
            Accept
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoyaltyProposalModal;
