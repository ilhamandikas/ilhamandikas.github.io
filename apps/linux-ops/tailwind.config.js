/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0b0f17',
        panel: '#111827',
        panel2: '#151d2b',
        edge: '#1f2a3a',
        edge2: '#2c3a4f',
        fg: '#e5e9f0',
        muted: '#8b98ab',
        accent: '#38bdf8',
        safe: '#34d399',
        change: '#fbbf24',
        danger: '#f87171',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 12px 40px -24px rgba(0, 0, 0, 0.9)',
      },
    },
  },
  plugins: [],
};
