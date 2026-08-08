import React from "react";
import { useGameState, useGameActions } from "../../context/GameContext";
import { useUnityBridge } from "../../hooks/useUnityBridge";
import PillButton from "./PillButton";
import FinancialStat from "./FinancialStat";
import TrackerBadge from "./TrackerBadge";

/**
 * BottomDashboard
 * ----------------
 * The full-width floating control panel anchored to the bottom of the
 * screen. Structurally it's three tiers, matching the reference build:
 *
 *   1. Trackers row — floats just above the bar (Deal Tracker / Action Tracker)
 *   2. Control bar  — Year/Phase/Turn, Take Bank Loan, Offer a Deal, LOCK THE DEAL
 *   3. Financial strip — Net Worth, Total Valuation, Cash in Hand, Current Loan + Interest
 *
 * This component only reads/writes GameContext and calls the Unity bridge —
 * it never owns business logic (loan math, deal validity, turn rules all
 * live in Unity). That keeps it trivially testable in isolation.
 */
export default function BottomDashboard() {
  const { timeline, financials, trackers } = useGameState();
  const { openBankLoanModal, openDealFlow } = useGameActions();
  const { sendLockDeal } = useUnityBridge();

  const handleLockDeal = () => {
    // Unity is the authority on whether the deal is actually lockable;
    // React just relays the intent and lets Unity drive the outcome
    // (which may come back as a TURN_CHANGED or GAME_EVENT_TRIGGERED event).
    sendLockDeal();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-6 pb-4">
      {/* Tier 1 — floating trackers, anchored above the bar's left edge */}
      <div className="flex gap-3 mb-3 w-fit">
        <TrackerBadge label="Deal Tracker" value={trackers.deal} />
        <TrackerBadge label="Action Tracker" value={trackers.action} />
      </div>

      {/* Tiers 2 & 3 — the main glass bar */}
      <div className="glass-panel bg-gradient-to-b from-panel-800/95 to-panel-900/95 px-6 py-4">
        {/* Control row */}
        <div className="flex items-center justify-between gap-6">
          <TimelineBlock label="Year" value={timeline.year} />
          <TimelineBlock label="Phase" value={timeline.phase} />
          <TimelineBlock label="Turn" value={timeline.turn} />

          <div className="flex-1 flex items-center justify-center gap-4">
            <PillButton variant="action" onClick={openBankLoanModal}>
              Take Bank Loan
            </PillButton>
            <PillButton variant="action" onClick={openDealFlow}>
              Offer a Deal
            </PillButton>
          </div>

          <PillButton variant="primary" onClick={handleLockDeal}>
            Lock the Deal
          </PillButton>
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-white/5" />

        {/* Financial strip */}
        <div className="flex items-center justify-between gap-4">
          <FinancialStat label="Net Worth" value={financials.netWorth} icon="♛" />
          <FinancialStat label="Total Valuation" value={financials.totalValuation} />
          <FinancialStat label="Cash in Hand" value={financials.cashInHand} />
          <FinancialStat label="Current Loan + Interest" value={financials.currentLoanAndInterest} />

          {/* BANK shortcut — floats at the trailing edge of the strip */}
          <PillButton variant="icon" onClick={openBankLoanModal} className="shrink-0">
            <BankIcon />
            <span className="text-[9px] font-display font-bold tracking-wider text-gold-400">
              BANK
            </span>
          </PillButton>
        </div>
      </div>
    </div>
  );
}

function TimelineBlock({ label, value }) {
  return (
    <div className="flex flex-col items-start gap-0.5 min-w-[56px]">
      <span className="text-[11px] font-body uppercase tracking-wider text-emerald-100/50">
        {label}
      </span>
      <span className="font-display font-bold text-2xl text-white leading-none">{value}</span>
    </div>
  );
}

function BankIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gold-400">
      <path d="M12 2 1 8v2h22V8L12 2zM3 11v8H1v2h22v-2h-2v-8h-2v8h-3v-8h-2v8H10v-8H8v8H5v-8H3z" />
    </svg>
  );
}
