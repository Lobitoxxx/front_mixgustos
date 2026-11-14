/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#fff4ed", 500: "#f0603a", 600: "#e04a22", 700: "#c03c18" },
        ink: {
          900: "#0f1420", 800: "#171e2e", 700: "#1d2537",
          line: "#253049", txt: "#e8ecf6", mut: "#8fa0c0",
        },
      },
    },
  },
  plugins: [],
};
