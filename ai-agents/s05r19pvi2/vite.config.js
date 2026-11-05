import { defineConfig } from "vite";

export default defineConfig({
  server: {
    hmr: false,
    watch: {
      ignored: ["**/*"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
      },
    },
  },
});
