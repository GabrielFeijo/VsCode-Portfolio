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
                    'markdown-vendor': ['react-markdown', 'rehype-raw', 'remark-breaks', 'remark-gfm', 'react-syntax-highlighter'],
                }
            }
        }
    },
    server: {
        host: "localhost",
        port: 3000,
    },
});