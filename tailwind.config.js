/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#fff4ed", 500: "#f0603a", 600: "#e04a22", 700: "#c03c18" },
        // Warm restaurant base for the public site (landing / carta).
        sand: {
          950: "#1c1610", 900: "#2c221c", 800: "#3a2e25", 700: "#4a3a2e",
          line: "#57463a", txt: "#f6f1ea", mut: "#c4b3a4",
        },
        // Shared warm canvas — the internal app uses the same palette as the
        // public site (§ landing) so both feel like one product.
        ink: {
          900: "#1c1610", 800: "#2c221c", 700: "#3a2e25",
          line: "#4a3a2e", txt: "#f6f1ea", mut: "#c4b3a4",
        },
      },
      fontFamily: {
        sans: ["'Helvetica Now Text'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
