import { useEffect, useRef, useCallback } from "react";
import { useGameDispatch } from "../context/GameContext";
import { UNITY_EVENTS, REACT_COMMANDS, UNITY_GAME_OBJECT } from "../constants/unityEvents";

/**
 * useUnityBridge
 * ---------------
 * The single chokepoint for all Unity <-> React communication. Mount this
 * once near the root of the app (it's safe to call from multiple components
 * since listener setup is idempotent, but one call in GameScreen.jsx is the
 * intended usage).
 *
 * INBOUND (Unity -> React)
 * Two transport paths are supported simultaneously because "Unity WebGL
 * embedded via react-unity-webgl" and "native Unity loading a webview" use
 * different mechanisms in practice:
 *
 *  1) Direct global function call — the standard react-unity-webgl pattern.
 *     Unity's C# side calls:
 *       Application.ExternalCall("dispatchReactEvent", eventName, jsonPayload);
 *     which react-unity-webgl resolves to `window.dispatchReactEvent(...)`.
 *     We attach that function here.
 *
 *  2) postMessage — used when React is running inside a webview embedded
 *     in a native Unity build (Android/iOS), where the host sends:
 *       window.postMessage({ source: "unity", type, payload }, "*")
 *
 * Both paths funnel into the same `handleUnityEvent` switch, which updates
 * GameContext via dispatch.
 *
 * OUTBOUND (React -> Unity)
 * All outbound calls go through `sendToUnity`, which wraps
 * `window.unityInstance.SendMessage(gameObject, methodName, jsonString)` —
 * the standard Unity WebGL JS-to-C# call. If `window.unityInstance` isn't
 * present yet (still loading, or running in a pure-browser dev/demo mode),
 * calls are queued and flushed once BRIDGE_READY fires, and the hook logs
 * instead of throwing so the React UI keeps working in isolation.
 */
export function useUnityBridge() {
  const dispatch = useGameDispatch();
  const outboundQueue = useRef([]);
  const isReady = useRef(false);

  const handleUnityEvent = useCallback(
    (eventName, rawPayload) => {
      let payload = rawPayload;
      if (typeof rawPayload === "string") {
        try {
          payload = JSON.parse(rawPayload);
        } catch {
          // Some events (e.g. BRIDGE_READY) may send no payload at all.
          payload = {};
        }
      }

      switch (eventName) {
        case UNITY_EVENTS.BRIDGE_READY:
          isReady.current = true;
          dispatch({ type: "UNITY_BRIDGE_READY" });
          // Flush anything React tried to send before Unity finished loading.
          outboundQueue.current.forEach(({ command, data }) => sendToUnity(command, data));
          outboundQueue.current = [];
          break;

        case UNITY_EVENTS.TURN_CHANGED:
          // payload: { year, phase, turn }
          dispatch({ type: "TURN_CHANGED", payload });
          break;

        case UNITY_EVENTS.FINANCIALS_UPDATED:
          // payload: { netWorth, totalValuation, cashInHand, currentLoanAndInterest }
          dispatch({ type: "FINANCIALS_UPDATED", payload });
          break;

        case UNITY_EVENTS.GAME_EVENT_TRIGGERED:
          // payload: { message, severity } — route into the same banner
          // used for loan/deal confirmations.
          dispatch({ type: "SHOW_NOTIFICATION", payload: payload.message });
          break;

        case UNITY_EVENTS.NODE_CLICKED:
        case UNITY_EVENTS.OPPONENT_STATE_UPDATED:
          // Extend here as more node/opponent UI comes online — left as a
          // documented no-op so the switch stays exhaustive and obvious.
          break;

        default:
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[useUnityBridge] Unhandled Unity event: ${eventName}`, payload);
          }
      }
    },
    [dispatch]
  );

  useEffect(() => {
    // Path 1: react-unity-webgl style global function.
    window.dispatchReactEvent = (eventName, rawPayload) => {
      handleUnityEvent(eventName, rawPayload);
    };

    // Path 2: postMessage, for webview-embedded scenarios.
    const onMessage = (e) => {
      if (!e.data || e.data.source !== "unity") return;
      handleUnityEvent(e.data.type, e.data.payload);
    };
    window.addEventListener("message", onMessage);

    return () => {
      delete window.dispatchReactEvent;
      window.removeEventListener("message", onMessage);
    };
  }, [handleUnityEvent]);

  /** Low-level send — queues automatically if Unity isn't ready yet. */
  const sendToUnity = useCallback((command, data) => {
    const payloadString = JSON.stringify(data ?? {});

    if (window.unityInstance && typeof window.unityInstance.SendMessage === "function") {
      window.unityInstance.SendMessage(UNITY_GAME_OBJECT, command, payloadString);
      return;
    }

    if (!isReady.current) {
      outboundQueue.current.push({ command, data });
      return;
    }

    // Webview path: no unityInstance.SendMessage exists, so post back to host.
    if (window.ReactNativeWebView?.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ command, payload: data }));
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[useUnityBridge] No Unity transport available — dropped command: ${command}`, data);
    }
  }, []);

  /** Send a finalized deal struct to Unity for rules processing. */
  const sendDealPayload = useCallback(
    (dealStruct) => sendToUnity(REACT_COMMANDS.SUBMIT_DEAL, dealStruct),
    [sendToUnity]
  );

  /** Send a finalized loan execution command to Unity. */
  const sendLoanExecution = useCallback(
    (loanStruct) => sendToUnity(REACT_COMMANDS.EXECUTE_LOAN, loanStruct),
    [sendToUnity]
  );

  /** Tell Unity the player is done with their turn. */
  const sendEndTurn = useCallback(
    () => sendToUnity(REACT_COMMANDS.END_TURN, {}),
    [sendToUnity]
  );

  /** "LOCK THE DEAL" — distinct from end-turn; Unity may gate this separately. */
  const sendLockDeal = useCallback(
    () => sendToUnity(REACT_COMMANDS.LOCK_DEAL, {}),
    [sendToUnity]
  );

  return { sendDealPayload, sendLoanExecution, sendEndTurn, sendLockDeal, sendToUnity };
}
