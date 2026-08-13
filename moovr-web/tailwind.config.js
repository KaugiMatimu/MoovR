/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // 👈 Add this line
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryPurple: "#A75AF2",
        darkPurple: "#572083",
        lightPurple: "#D8B6FC",
        babyPurple: "#F3E9FE",
        primaryGray: "#161616",
        bgGray: "#F3E9FE",
      },
    },
  },
  plugins: [],
};
