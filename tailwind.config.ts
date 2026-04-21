import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        addvise: { red: "#DC2626", redDark: "#B91C1C", ink: "#111827" }
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
export default config;
