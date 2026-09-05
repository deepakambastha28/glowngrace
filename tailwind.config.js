/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "#d6336c",
          dark: "#b02a5b",
          soft: "#f4a6c0",
          blush: "#fff5f7",
        },
        gold: "#c9a35b",
        charcoal: "#2b2330",
        muted: "#8a7f8f",
        cream: "#fffafc",
        emerald: "#2e9e6b",
        line: "#f6e7ee",
        lineSoft: "#f0d5e0",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "28px",
      },
      boxShadow: {
        rose: "0 12px 40px rgba(214, 51, 108, 0.12)",
        "rose-lg": "0 12px 30px rgba(214, 51, 108, 0.45)",
        soft: "0 6px 24px rgba(0, 0, 0, 0.05)",
        gold: "0 8px 20px rgba(214, 51, 108, 0.3)",
      },
      backgroundImage: {
        "rose-gradient": "linear-gradient(135deg, #d6336c, #b02a5b)",
        "dark-gradient": "linear-gradient(120deg, #2b2330, #3d3145)",
        "blush-gradient":
          "linear-gradient(135deg, var(--blush, #fff5f7), #fbe0ea)",
      },
    },
  },
  plugins: [],
};