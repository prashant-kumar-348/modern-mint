/** @type {import('tailwindcss').Config} */
// Color tokens were sampled directly from the MODERNMINT reference prototype
// (frame-by-frame pixel sampling), not guessed — keep this file as the single
// source of truth for the palette so every component stays on-brand.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#03100A",           // page backdrop, near-black emerald
        panel: {
          900: "#071F15",          // deepest glass panel
          800: "#0E2F20",          // dashboard bar base
          700: "#143C28",          // raised panel / card
          600: "#1B4730",          // tracker badge fill
        },
        glow: {
          teal: "#2DD9C4",         // active/glowing borders, focus rings
          tealDim: "#3A6264",      // resting teal accent (Robotic Strategist row)
        },
        maroon: {
          DEFAULT: "#5A1F28",      // secondary surfaces / Ruthless Negotiator row
          light: "#7A2E37",
          card: "#8C5F6E",         // loan card body (dusty rose-maroon)
        },
        gold: {
          300: "#F3D98B",
          400: "#E8C257",
          500: "#D3AD4C",          // Conservative Guardian / highlighted row
          700: "#B98A2E",
        },
        action: {
          from: "#15301F",
          to: "#2A5740",
        },
        finance: {
          DEFAULT: "#4FA85C",
          to: "#3B7F49",
        },
        parchment: "#FBF4DD",      // Deal Sheet paper background
        ink: "#1A1410",            // Deal Sheet text
      },
      fontFamily: {
        display: ["'Rajdhani'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        paper: ["'Courier Prime'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 12px 1px rgba(45, 217, 196, 0.55)",
        goldGlow: "0 0 18px 2px rgba(232, 194, 87, 0.45)",
        panel: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5)",
      },
      backdropBlur: {
        glass: "14px",
      },
    },
  },
  plugins: [],
};
