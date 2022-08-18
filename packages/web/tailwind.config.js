/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-blue": "rgba(0,148,255)",
        "yellow": "#FADB14",
        "border-gray": "#2F3336",
        "comment-red": "#F5222D",
        "comment-yellow": "#FADB14",
        "comment-blue": "rgba(29,155,240)",
      }
    },
  },
  plugins: [],
}
