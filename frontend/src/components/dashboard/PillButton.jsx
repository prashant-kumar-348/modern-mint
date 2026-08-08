import React from "react";

/**
 * PillButton
 * variant: 'action' (green, used for Take Bank Loan / Offer a Deal)
 *        | 'primary' (gold, used for LOCK THE DEAL)
 *        | 'icon'    (circular icon button, used for the BANK shortcut)
 */
export default function PillButton({
  children,
  variant = "action",
  onClick,
  disabled = false,
  className = "",
}) {
  if (variant === "icon") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full
                    glass-panel hover:border-glow-teal/50 hover:shadow-glow
                    transition-all duration-150 active:scale-95 ${className}`}
      >
        {children}
      </button>
    );
  }

  const base =
    variant === "primary" ? "btn-pill-primary" : "btn-pill-action";

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${className}`}>
      {children}
    </button>
  );
}
