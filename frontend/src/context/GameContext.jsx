import React, { createContext, useContext, useReducer, useCallback } from "react";

/**
 * GameContext is the single client-side source of truth for everything the
 * UI overlay needs to render. It does NOT own game logic — Unity is the
 * authority on rules/state. This context just mirrors what Unity tells us
 * (via useUnityBridge) and tracks transient UI state (which modal is open,
 * in-progress form data, notification banners).
 *
 * Why Context+useReducer over Redux: the state shape is small, updates are
 * mostly "Unity told me X, store X" plus a couple of modal flows — Redux
 * middleware/devtools aren't pulling their weight here. If the dashboard
 * grows (e.g. multiplayer presence, chat, complex undo), swap the reducer
 * below into a Redux slice with minimal churn — the action shapes already
 * look like Redux actions on purpose.
 */

const initialState = {
  timeline: { year: 2, phase: 1, turn: "ALL" },

  financials: {
    netWorth: 100_000_000,
    totalValuation: 0,
    cashInHand: 50_000,
    currentLoanAndInterest: 10_000,
  },

  trackers: { deal: 0, action: 0 },

  tokens: [
    { id: "gold", label: "Gold", multiplier: 12 },
    { id: "silver", label: "Silver", multiplier: 8 },
    { id: "bronze", label: "Bronze", multiplier: 6 },
  ],

  opponents: [
    { id: "ruthless", name: "Ruthless Negotiator", accent: "maroon" },
    { id: "conservative", name: "Conservative Guardian", accent: "gold" },
    { id: "robotic", name: "Robotic Strategist", accent: "teal" },
    { id: "greedy", name: "Greedy Opportunist", accent: "neutral" },
  ],

  // modal: 'none' | 'bankLoan' | 'dealPersonaSelect' | 'dealSheet'
  modal: { active: "none", selectedPersonaId: null },

  notification: { visible: false, message: "" },

  isUnityReady: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "UNITY_BRIDGE_READY":
      return { ...state, isUnityReady: true };

    case "TURN_CHANGED":
      return { ...state, timeline: { ...state.timeline, ...action.payload } };

    case "FINANCIALS_UPDATED":
      return { ...state, financials: { ...state.financials, ...action.payload } };

    case "OPEN_BANK_LOAN_MODAL":
      return { ...state, modal: { active: "bankLoan", selectedPersonaId: null } };

    case "OPEN_DEAL_PERSONA_SELECT":
      return { ...state, modal: { active: "dealPersonaSelect", selectedPersonaId: null } };

    case "SELECT_DEAL_PERSONA":
      return { ...state, modal: { active: "dealSheet", selectedPersonaId: action.payload.personaId } };

    case "CLOSE_MODAL":
      return { ...state, modal: { active: "none", selectedPersonaId: null } };

    case "LOAN_FINALIZED":
      return {
        ...state,
        trackers: { ...state.trackers, action: state.trackers.action + 1 },
        modal: { active: "none", selectedPersonaId: null },
        notification: {
          visible: true,
          message: `RECEIVED LOAN $${action.payload.amountLabel} FROM THE BANK FOR ${action.payload.assetName}`,
        },
      };

    case "DEAL_FINALIZED":
      return {
        ...state,
        trackers: { ...state.trackers, deal: state.trackers.deal + 1 },
        modal: { active: "none", selectedPersonaId: null },
        notification: {
          visible: true,
          message: `DEAL FINALISED WITH ${action.payload.personaName.toUpperCase()}`,
        },
      };

    case "SHOW_NOTIFICATION":
      return { ...state, notification: { visible: true, message: action.payload } };

    case "HIDE_NOTIFICATION":
      return { ...state, notification: { visible: false, message: "" } };

    default:
      return state;
  }
}

const GameStateContext = createContext(null);
const GameDispatchContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be used within a GameProvider");
  return ctx;
}

export function useGameDispatch() {
  const ctx = useContext(GameDispatchContext);
  if (!ctx) throw new Error("useGameDispatch must be used within a GameProvider");
  return ctx;
}

/** Convenience wrapper so components don't import action-type strings directly. */
export function useGameActions() {
  const dispatch = useGameDispatch();
  return {
    openBankLoanModal: useCallback(() => dispatch({ type: "OPEN_BANK_LOAN_MODAL" }), [dispatch]),
    openDealFlow: useCallback(() => dispatch({ type: "OPEN_DEAL_PERSONA_SELECT" }), [dispatch]),
    selectDealPersona: useCallback(
      (personaId) => dispatch({ type: "SELECT_DEAL_PERSONA", payload: { personaId } }),
      [dispatch]
    ),
    closeModal: useCallback(() => dispatch({ type: "CLOSE_MODAL" }), [dispatch]),
    finalizeLoan: useCallback(
      (payload) => dispatch({ type: "LOAN_FINALIZED", payload }),
      [dispatch]
    ),
    finalizeDeal: useCallback(
      (payload) => dispatch({ type: "DEAL_FINALIZED", payload }),
      [dispatch]
    ),
    hideNotification: useCallback(() => dispatch({ type: "HIDE_NOTIFICATION" }), [dispatch]),
  };
}
