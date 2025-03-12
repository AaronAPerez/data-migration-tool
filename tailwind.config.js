// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
      './**/*.{ts,tsx}',
    ],
    theme: {
      // theme configuration
    },
    plugins: [require("tailwindcss-animate")],
  }