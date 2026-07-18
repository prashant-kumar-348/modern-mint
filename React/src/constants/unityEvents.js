// Single source of truth for every message name crossing the Unity <-> React
// boundary. Keep this in sync with whatever the Unity-side C# bridge script
// (e.g. ReactBridge.cs) expects — string mismatches here are the #1 cause of
// "the UI just doesn't update" bugs in this kind of hybrid app.

// Events Unity sends INTO React (React listens for these)
export const UNITY_EVENTS = {
  TURN_CHANGED: "TURN_CHANGED",
  FINANCIALS_UPDATED: "FINANCIALS_UPDATED",
  GAME_EVENT_TRIGGERED: "GAME_EVENT_TRIGGERED",
  NODE_CLICKED: "NODE_CLICKED",
  OPPONENT_STATE_UPDATED: "OPPONENT_STATE_UPDATED",
  BRIDGE_READY: "BRIDGE_READY",
};

// Commands React sends OUT to Unity
export const REACT_COMMANDS = {
  SUBMIT_DEAL: "SUBMIT_DEAL",
  EXECUTE_LOAN: "EXECUTE_LOAN",
  END_TURN: "END_TURN",
  LOCK_DEAL: "LOCK_DEAL",
  REQUEST_SYNC: "REQUEST_SYNC",
};

// Name of the GameObject in the Unity scene that owns the receiving
// MonoBehaviour (must expose a public method per REACT_COMMAND, taking a
// single JSON string argument).
export const UNITY_GAME_OBJECT = "ReactBridge";
