import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Top-level route prefixes exposed by the mixgustos-api Axum binary.
const API_PREFIXES = [
  "/auth", "/cash", "/costing", "/dining", "/dispatch", "/employee-shifts",
  "/finance", "/inventory", "/menu-items", "/menus", "/notifications",
  "/orders", "/payment-methods", "/production", "/products", "/purchasing",
  "/recipes", "/reports", "/sales", "/schedules", "/settings", "/shifts",
  "/staff", "/suppliers", "/health",
];

const proxy = Object.fromEntries(
  API_PREFIXES.map((p) => [p, { target: "http://localhost:8080", changeOrigin: true }]),
);

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
});
