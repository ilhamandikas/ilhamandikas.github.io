import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app is embedded in the Hugo page at https://ilham.dev/tools/linux-ops/.
// The build output goes into Hugo's `assets` tree with stable file names, so
// Hugo can fingerprint it at build time and GitHub Pages ships it without
// needing npm during the Hugo build.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: '../../assets/linux-ops',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'app-[name].js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
});
