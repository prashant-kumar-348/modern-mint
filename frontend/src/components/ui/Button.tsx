"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Game-style buttons that match the Figma PLAY / LEARN aesthetic:
 * dark glass base, teal or gold glow outline, heavy uppercase tracking.
 */
const variants = {
  primary: [
    /* Teal-glow primary — main CTA */
    "relative bg-[rgba(29,233,214,0.10)] text-[#1de9d6]",
    "border border-[rgba(29,233,214,0.50)]",
    "hover:bg-[rgba(29,233,214,0.18)] hover:border-[rgba(29,233,214,0.85)]",
    "shadow-[0_0_28px_rgba(29,233,214,0.18),inset_0_1px_0_rgba(29,233,214,0.12)]",
    "hover:shadow-[0_0_44px_rgba(29,233,214,0.38),inset_0_1px_0_rgba(29,233,214,0.2)]",
    "font-black uppercase tracking-[0.18em]",
  ].join(" "),

  secondary: [
    /* Gold outline — secondary actions */
    "relative bg-[rgba(212,168,67,0.07)] text-[#d4a843]",
    "border border-[rgba(212,168,67,0.38)]",
    "hover:bg-[rgba(212,168,67,0.14)] hover:border-[rgba(212,168,67,0.7)]",
    "shadow-[0_0_20px_rgba(212,168,67,0.10)]",
    "hover:shadow-[0_0_32px_rgba(212,168,67,0.28)]",
    "font-bold uppercase tracking-[0.15em]",
  ].join(" "),

  ghost: [
    "relative bg-transparent text-[#4a7a82]",
    "border border-[rgba(29,233,214,0.12)]",
    "hover:text-[#1de9d6] hover:border-[rgba(29,233,214,0.30)] hover:bg-[rgba(29,233,214,0.05)]",
    "font-semibold uppercase tracking-[0.12em]",
  ].join(" "),

  danger: [
    "relative bg-transparent text-red-400",
    "border border-[rgba(239,68,68,0.30)]",
    "hover:bg-[rgba(239,68,68,0.08)] hover:border-red-400/60",
    "font-semibold uppercase tracking-[0.10em]",
  ].join(" "),
};

const sizes = {
  sm: "h-9  px-5  text-xs  rounded-md",
  md: "h-11 px-7  text-xs  rounded-lg",
  lg: "h-13 px-10 text-sm  rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileTap={!isDisabled ? { scale: 0.96 } : {}}
        whileHover={!isDisabled ? { scale: 1.015 } : {}}
        transition={{ duration: 0.12 }}
        className={clsx(
          "inline-flex items-center justify-center gap-2",
          "transition-all duration-200 cursor-pointer select-none",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          isDisabled && "opacity-40 cursor-not-allowed pointer-events-none",
          className
        )}
        disabled={isDisabled}
        {...(props as object)}
      >
        {/* Corner notch accents — like the Figma card corners */}
        {(variant === "primary" || variant === "secondary") && (
          <>
            <span
              className="absolute top-0 left-0 w-2 h-2 border-t border-l pointer-events-none"
              style={{
                borderColor:
                  variant === "primary"
                    ? "rgba(29,233,214,0.7)"
                    : "rgba(212,168,67,0.6)",
              }}
            />
            <span
              className="absolute bottom-0 right-0 w-2 h-2 border-b border-r pointer-events-none"
              style={{
                borderColor:
                  variant === "primary"
                    ? "rgba(29,233,214,0.7)"
                    : "rgba(212,168,67,0.6)",
              }}
            />
          </>
        )}

        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading…</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
