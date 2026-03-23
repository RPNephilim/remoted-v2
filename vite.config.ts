/// <reference types="vite/client" />
import { defineConfig } from 'vite';
// @ts-ignore - Module is installed, tsconfig is optimized for Electron
import react from '@vitejs/plugin-react';
// @ts-ignore - Module is installed, tsconfig is optimized for Electron
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  },
  root: './',
  build: {
    outDir: 'dist',
  },
});
