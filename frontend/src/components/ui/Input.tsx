"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] font-black uppercase tracking-[0.30em]"
            style={{ color: "var(--gold)" }}
          >
            {label}
          </label>
        )}

        {/* Input wrapper with corner notch decoration */}
        <div className="relative">
          {/* Corner notches */}
          <span
            className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l pointer-events-none z-10"
            style={{
              borderColor: error
                ? "rgba(239,68,68,0.6)"
                : "rgba(29,233,214,0.45)",
            }}
          />
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r pointer-events-none z-10"
            style={{
              borderColor: error
                ? "rgba(239,68,68,0.6)"
                : "rgba(29,233,214,0.45)",
            }}
          />

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full px-4 py-3 text-sm transition-all duration-200",
              "bg-[rgba(6,20,26,0.80)] text-[#d8eaec]",
              "placeholder:text-[#2a4a52]",
              "focus:outline-none",
              error
                ? [
                    "border border-red-500/40",
                    "focus:border-red-400/70 focus:shadow-[0_0_16px_rgba(239,68,68,0.18)]",
                  ]
                : [
                    "border border-[rgba(29,233,214,0.18)]",
                    "hover:border-[rgba(29,233,214,0.35)]",
                    "focus:border-[rgba(29,233,214,0.65)]",
                    "focus:shadow-[0_0_20px_rgba(29,233,214,0.15)]",
                  ],
              className
            )}
            style={{ borderRadius: "6px" }}
            {...props}
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-400 flex items-center gap-1.5 pl-1">
            <span>▲</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-[11px] pl-1" style={{ color: "var(--text-muted)" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
