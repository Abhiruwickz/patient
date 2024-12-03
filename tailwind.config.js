/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",          // Scans all files in src
    "./src/components/**/*.{js,jsx,ts,tsx}" // Includes all files in components and subfolders
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
