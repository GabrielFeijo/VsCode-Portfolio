import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@app': path.resolve(__dirname, './src/app'),
            '@components': path.resolve(__dirname, './src/app/components'),
            '@layout': path.resolve(__dirname, './src/app/layout'),
            '@pages': path.resolve(__dirname, './src/app/pages'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@contexts': path.resolve(__dirname, './src/contexts'),
            '@services': path.resolve(__dirname, './src/services'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@domain': path.resolve(__dirname, './src/domain'),
            '@config': path.resolve(__dirname, './src/config'),
        }
    },
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
