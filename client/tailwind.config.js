/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#eef2ff",
        coral: "#f97316",
        teal: "#0f766e",
        sand: "#fff7ed"
      }
    }
  },
  plugins: []
};

