import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app is served as a sub-path of the Hugo site at https://ilham.dev/linux-ops/.
// The build output goes straight into Hugo's `static` tree, so the existing
// GitHub Pages workflow ships it without needing npm during the Hugo build.
export default defineConfig({
  base: '/linux-ops/',
  plugins: [react()],
  build: {
    outDir: '../../static/linux-ops',
    emptyOutDir: true,
  },
});
