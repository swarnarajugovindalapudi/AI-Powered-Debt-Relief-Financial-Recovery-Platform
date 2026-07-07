/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 24px 80px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};