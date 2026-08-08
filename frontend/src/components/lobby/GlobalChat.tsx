"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MOCK_CHAT } from "@/lib/lobby/mock-data";
import type { ChatMessage } from "@/lib/lobby/types";

// ── Send icon ─────────────────────────────────────────────────────────────
function IconSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Individual message bubble ─────────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="px-3 py-2">
      <div className="flex items-baseline justify-between gap-2 mb-0.5">
        <span
          className="text-[10px] font-black uppercase tracking-wider truncate max-w-[120px]"
          style={{ color: msg.userColor }}
        >
          {msg.user}
        </span>
        <span
          className="text-[9px] flex-shrink-0"
          style={{ color: "var(--text-faint)" }}
        >
          {msg.time}
        </span>
      </div>
      <p
        className="text-[11px] leading-relaxed break-words"
        style={{ color: "var(--text-muted)" }}
      >
        {msg.text}
      </p>
    </div>
  );
}

export default function GlobalChat() {
  const [messages, setMessages]   = useState<ChatMessage[]>(MOCK_CHAT);
  const [input,    setInput]      = useState("");
  const bottomRef                 = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const newMsg: ChatMessage = {
      id:        `local-${Date.now()}`,
      user:      "You",
      userColor: "#1de9d6",
      text,
      time:      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  }

  return (
    <motion.aside
      className="flex flex-col flex-shrink-0 relative"
      style={{
        width: 248,
        borderLeft: "1px solid rgba(29,233,214,0.10)",
        background: "rgba(3,9,12,0.70)",
      }}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(29,233,214,0.10)" }}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.35em]"
          style={{ color: "var(--gold)" }}>
          Global Chat
        </span>
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full"
          style={{ background: "#2aff7a", boxShadow: "0 0 4px #2aff7a" }}
        />
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            style={{
              borderBottom: i < messages.length - 1
                ? "1px solid rgba(29,233,214,0.04)"
                : undefined,
            }}
          >
            <ChatBubble msg={msg} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 p-2 flex items-center gap-2"
        style={{ borderTop: "1px solid rgba(29,233,214,0.10)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
          className="flex-1 px-3 py-1.5 text-[11px] rounded focus:outline-none transition-all"
          style={{
            background: "rgba(6,20,26,0.80)",
            border: "1px solid rgba(29,233,214,0.15)",
            color: "var(--text-primary)",
          }}
        />
        <button
          onClick={sendMessage}
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 cursor-pointer transition-all"
          style={{
            background: "rgba(29,233,214,0.12)",
            border: "1px solid rgba(29,233,214,0.35)",
            color: "#1de9d6",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(29,233,214,0.22)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(29,233,214,0.12)";
          }}
        >
          <IconSend />
        </button>
      </div>
    </motion.aside>
  );
}
