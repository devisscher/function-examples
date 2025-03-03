import { defineConfig } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from '@vitejs/plugin-react';
import path from 'path';
if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
  );
}

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https:\/\//, "")
  : "localhost";

// HMR doesn't work on Firefox using localhost, so you can temporarily get that to work by setting the
// SHOPIFY_VITE_HMR_USE_POLLING env var when running this
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
    port: process.env.FRONTEND_PORT,
    clientPort: 443,
  };
}
const root = new URL('.', import.meta.url).pathname;

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  resolve: {
    alias: {
      assets: path.resolve(root, './assets'),
      components: path.resolve(root, './components'),
      pages: path.resolve(root, './pages'),
      test: path.resolve(root, './test'),
    },
  },
  server: {
    hmr: hmrConfig,
    host: "localhost",
    port: process.env.FRONTEND_PORT,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.js",
    deps: {
      inline: ["@shopify/react-testing"],
    },
  },
});
