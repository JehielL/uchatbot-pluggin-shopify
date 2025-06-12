import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path'; // ¡Añadimos la importación del módulo 'path'!

installGlobals({ nativeFetch: true });

if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost")
  .hostname;
let hmrConfig;

if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env.FRONTEND_PORT) || 8002,
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    allowedHosts: [host],
    cors: {
      preflightContinue: true,
    },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
      // Configuramos las carpetas que Vite tiene permitido servir en desarrollo
      allow: [
        path.resolve(__dirname, 'app'),
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'src'), // <--- Permitimos la carpeta 'src'
        path.resolve(__dirname, 'extensions'), // <--- Permitimos la carpeta 'extensions'
      ],
    },
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: false,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    outDir: 'extensions/chatbot-embed/assets',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: path.resolve(__dirname, 'app/entry.client.jsx'),
      output: {
        entryFileNames: 'entry.client.js',
        assetFileNames: 'chatbot.css',
        chunkFileNames: '[name].js'
      }
    }

  },

  optimizeDeps: {
    include: ["@shopify/app-bridge-react", "@shopify/polaris"],
  },
});