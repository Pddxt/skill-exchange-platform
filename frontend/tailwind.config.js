/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF2EA",      // soft sage-white background
        ink: "#13201A",        // near-black forest ink, primary text
        clay: "#E0653A",       // signature accent - terracotta/coral, used for CTAs
        moss: "#3F6B52",       // secondary accent - exchange/credits
        gold: "#C99A3E",       // ledger / credit-stamp accent
        mute: "#6B7268",       // muted text
        line: "#D9DED2",       // hairline borders
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        ticket: "4px",
      },
    },
  },
  plugins: [],
};
