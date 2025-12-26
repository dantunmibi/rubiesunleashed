/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // CHANGE THIS LINE:
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};

export default config;