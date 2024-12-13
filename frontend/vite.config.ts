import path from "node:path"
import { sentryVitePlugin } from "@sentry/vite-plugin"

import { TanStackRouterVite } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  plugins: [
    react(),
    TanStackRouterVite(),
    sentryVitePlugin({
      org: "fastapilabs",
      project: "cloud-frontend",
      authToken: process.env.FRONTEND_SENTRY_AUTH_TOKEN,
    }),
  ],

  build: {
    sourcemap: true,
  },
})
