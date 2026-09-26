/** @type {import('tailwindcss').Config} */
// The app is embedded inside a Hugo tool page. Tailwind's preflight is off and
// every utility is scoped under `.lo-app`, so the app can neither restyle the
// site nor be restyled by the site's `.card`, `.grid` or `.container` rules.
// Scoping beats prefixing here: nothing in the markup has to remember a prefix.
export default {
  // Only TSX can hold class names; scanning the prose in src/data would make
  // Tailwind emit utilities for ordinary words like "container" or "table".
  content: ['./index.html', './src/**/*.tsx'],
  corePlugins: { preflight: false, container: false },
  important: '.lo-app',
  theme: {
    extend: {
      colors: {
        // The site's flat-white palette, so the app reads as part of ilham.dev.
        base: '#ffffff',
        panel: '#ffffff',
        panel2: '#f7f8fa',
        edge: '#e6e8ec',
        edge2: '#cfd4dc',
        fg: '#14161a',
        muted: '#6b7280',
        accent: '#2563eb',
        safe: '#16a34a',
        change: '#b45309',
        danger: '#dc2626',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
