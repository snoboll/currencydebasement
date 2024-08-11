module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"], // Ensure 'sans' is the default font family used in your Tailwind project
      },
    },
  },
  plugins: [],
};
