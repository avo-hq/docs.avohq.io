module.exports = {
  plugins: {
    // VitePress 2.x ships theme CSS that uses native CSS nesting (e.g. `&:lang(ja)`).
    // Flatten it before Tailwind runs, otherwise PostCSS warns that nesting isn't
    // configured. https://tailwindcss.com/docs/using-with-preprocessors#nesting
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
