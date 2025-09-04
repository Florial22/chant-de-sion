/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#417956",
        surface: "#e2eee4",
        textmain: "#000000",
      },
    },
  },
  plugins: [],
};
