import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'build',
        rollupOptions: {
            output: {
                manualChunks: {
                    'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    'framer-motion-vendor': ['framer-motion'],
                }
            }
        }
    },
    server: {
        host: "localhost",
        port: 3000,
    },
});
