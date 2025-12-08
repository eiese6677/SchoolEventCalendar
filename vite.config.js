import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        host: true, // Listen on all addresses
        proxy: {
            "/api": {
                target: "http://127.0.0.1:5000",
                changeOrigin: true,
                secure: false,
            },
        },
        port: 3000,
        allowedHosts: ["laila-centrosymmetric-overtartly.ngrok-free.dev"],
    }
})