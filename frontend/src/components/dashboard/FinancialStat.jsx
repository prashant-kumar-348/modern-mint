import React from "react";

const formatCurrency = (value) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toLocaleString()}M`;
  if (value >= 1_000) return `$${(value / 1_000).toLocaleString()}K`;
  return `$${value}`;
};

/**
 * FinancialStat — one label+value block in the dashboard's financial strip
 * (Net Worth, Total Valuation, Cash in Hand, Current Loan + Interest).
 * `icon` is optional (Net Worth shows a small crown glyph in the reference).
 */
export default function FinancialStat({ label, value, icon = null }) {
  return (
    <div className="flex flex-col items-start gap-1 min-w-[120px]">
      <span className="text-[11px] font-body uppercase tracking-wider text-emerald-100/60 leading-tight">
        {label}
      </span>
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-b from-finance to-finance/70 shadow-panel">
        {icon && <span className="text-gold-400 text-sm leading-none">{icon}</span>}
        <span className="font-display font-bold text-white text-sm tracking-wide">
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );
}
