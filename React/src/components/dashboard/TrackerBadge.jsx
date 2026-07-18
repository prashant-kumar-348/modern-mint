import React from "react";

/** TrackerBadge — the small dark-glass pills showing Deal Tracker / Action Tracker counts. */
export default function TrackerBadge({ label, value }) {
  return (
    <div className="tracker-badge">
      <span className="font-body text-xs uppercase tracking-wider text-emerald-100/70">
        {label}
      </span>
      <span className="font-display font-bold text-xl text-gold-400">{value}</span>
    </div>
  );
}
