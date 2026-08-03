import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi Vite standar. Build ini menghasilkan folder statis (dist/)
// yang bisa langsung di-deploy ke Cloudflare Pages tanpa server tambahan.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
