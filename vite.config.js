import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path matches GitHub Pages URL: https://USER.github.io/nfl-sim/
export default defineConfig({
  plugins: [react()],
  base: '/nfl-sim/',
});
