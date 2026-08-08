"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getUser, getToken, clearSession, setStoredProfileImage } from "@/lib/auth";
import { usersApi, API_BASE_URL } from "@/lib/api";
import PersonAvatar from "./PersonAvatar";

// Downscale a picked image to a small JPEG data URL before uploading.
function downscaleImage(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas unavailable")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

interface LobbyNavBarProps {
  title?: string;
}

// ── Profile avatar ────────────────────────────────────────────────────────────
// Figma: ~64px circular photo with teal edit-badge in top-right corner

function ProfileAvatar() {
  const [initials, setInitials] = useState("MM");
  const [image, setImage]       = useState<string | null>(null);
  // Staged (selected but not yet saved) downscaled preview.
  const [pending, setPending]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = getUser();
    if (user?.username) {
      const parts = user.username.trim().split(/\s+/);
      setInitials(
        parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : user.username.slice(0, 2).toUpperCase()
      );
    }
    // Show the persisted profile image (served from the backend) if the user has one.
    if (user?.profile_image_url) {
      setImage(`${API_BASE_URL}${user.profile_image_url}`);
    }
  }, []);

  // Step 1–3: pick → downscale → stage as a preview. Does NOT upload yet.
  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await downscaleImage(file, 256);
      setPending(dataUrl);
    } catch {
      setError("Could not read that image.");
    }
  }

  // Step 5: Save commits the staged image to the backend.
  async function handleSave() {
    if (!pending) return;
    const token = getToken();
    if (!token) { setError("Please sign in again."); return; }

    setUploading(true);
    setError(null);
    try {
      const { profileImageUrl } = await usersApi.updateProfileImage(pending, token);
      setStoredProfileImage(profileImageUrl);
      setImage(`${API_BASE_URL}${profileImageUrl}`); // update navbar immediately
      setPending(null);                              // lobby refreshes on its poll
    } catch {
      setPending(null);                              // restore the previous image
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // Step 6: Cancel discards the staged preview and restores the previous image.
  function handleCancel() {
    setPending(null);
    setError(null);
  }

  return (
    <div className="relative flex-shrink-0 select-none" style={{ width: 76, height: 76 }}>
      {/* Hidden file input driven by the edit badge */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handlePick}
        className="hidden"
      />

      {/* Avatar — shows the staged preview while editing, else the saved image */}
      <PersonAvatar src={pending ?? image} initials={initials} size={76} borderWidth={3} glowPx={22} />

      {/* Edit badge — opens the file picker (hidden while a preview is staged) */}
      {!pending && (
        <button
          type="button"
          title="Change profile photo"
          onClick={() => fileRef.current?.click()}
          className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            background: "#23d3c4",
            border: "2.5px solid #04190d",
            boxShadow: "0 0 8px rgba(35,211,196,0.55)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path
              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="#04190d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Online status dot — bottom-left, matching Figma */}
      <span
        className="absolute bottom-1 left-1.5 w-3.5 h-3.5 rounded-full border-2"
        style={{
          background: "#2bff84",
          borderColor: "#04190d",
          boxShadow: "0 0 8px #2bff84",
        }}
      />

      {/* Save / Cancel — shown only while a preview is staged */}
      {pending && (
        <div className="absolute left-0 top-full mt-2 flex items-center gap-1.5 z-30">
          <button
            type="button"
            onClick={handleSave}
            disabled={uploading}
            className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-150 disabled:opacity-60 disabled:cursor-default"
            style={{
              background: "rgba(34,196,98,0.18)",
              border: "1px solid rgba(43,214,115,0.60)",
              color: "#bff0d2",
              whiteSpace: "nowrap",
            }}
          >
            {uploading ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploading}
            className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-150 disabled:opacity-60 disabled:cursor-default"
            style={{
              background: "rgba(10,40,22,0.70)",
              border: "1px solid rgba(222,186,98,0.45)",
              color: "#f0d89a",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error — shown after a failed upload */}
      {error && !pending && (
        <div
          className="absolute left-0 top-full mt-2 text-[10px] font-semibold z-30"
          style={{ color: "#ef4444", whiteSpace: "nowrap" }}
        >
          ▲ {error}
        </div>
      )}
    </div>
  );
}

// ── Nav icon button ───────────────────────────────────────────────────────────

function NavIconButton({
  title,
  onClick,
  hoverColor = "#7dffb0",
  children,
}: {
  title: string;
  onClick?: () => void;
  hoverColor?: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150"
      style={{
        color: hovered ? hoverColor : "#bff0d2",
        background: hovered ? "rgba(43,214,115,0.22)" : "rgba(10,46,26,0.55)",
        border: "1px solid rgba(43,214,115,0.35)",
        boxShadow: hovered ? "0 0 14px rgba(43,214,115,0.35)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

// ── LobbyNavBar ───────────────────────────────────────────────────────────────

export default function LobbyNavBar({ title: _title }: LobbyNavBarProps) {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <motion.header
      className="flex-shrink-0 relative flex items-center px-7 z-20"
      style={{ height: 112 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Left: profile avatar */}
      <div className="absolute left-7 top-1/2 -translate-y-1/2">
        <ProfileAvatar />
      </div>

      {/* Center: MODERN MINT wordmark — emerald metallic serif, the dominant element */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <h1
          className="uppercase select-none"
          style={{
            fontFamily: "var(--font-cinzel), Georgia, serif",
            fontWeight: 900,
            fontSize: "clamp(34px, 5.2vw, 64px)",
            letterSpacing: "0.10em",
            backgroundImage:
              "linear-gradient(180deg, #fff3c4 0%, #f4d779 22%, #e7b53e 48%, #b8841f 74%, #8a5e16 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            WebkitTextStroke: "0.6px rgba(122,84,18,0.55)",
            filter:
              "drop-shadow(0 2px 1px rgba(40,24,4,0.55)) drop-shadow(0 0 20px rgba(231,181,62,0.55))",
          }}
        >
          MODERN MINT
        </h1>
      </div>

      {/* Right: action icons — Figma order: logout, then settings */}
      <div className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
        {/* Logout / exit */}
        <NavIconButton title="Logout" onClick={handleLogout} hoverColor="#ff8a8a">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
            <polyline
              points="16 17 21 12 16 7"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
            <line
              x1="21" y1="12" x2="9" y2="12"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </NavIconButton>

        {/* Settings */}
        <NavIconButton title="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke="currentColor" strokeWidth="1.8"
            />
          </svg>
        </NavIconButton>
      </div>
    </motion.header>
  );
}
