import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// Wayfinder desactive temporairement pour eviter erreurs
// import { wayfinder } from "@laravel/vite-plugin-wayfinder";
import path from "path";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.tsx"],
            ssr: "resources/js/ssr.tsx",
            refresh: true,
        }),
        react(),
        tailwindcss(),
        // Wayfinder desactive - reactive si necessaire:
        // wayfinder({ formVariants: true }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "resources/js"),
            "@custom": path.resolve(__dirname, "resources/js/custom"),
        },
    },
    esbuild: {
        jsx: "automatic",
    },
    server: {
        host: '0.0.0.0',
        port: 5175,
        strictPort: true,
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        },
        hmr: {
            host: '192.168.1.5',
            protocol: 'ws',
            port: 5175,
            clientPort: 5175
        },
    },
});
