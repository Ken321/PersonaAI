/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./index.jsx", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Noto Sans JP", "sans-serif"],
      serif: ["Noto Sans JP", "sans-serif"],
      mono: ["Noto Sans JP", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
};
