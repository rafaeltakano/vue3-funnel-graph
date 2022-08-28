import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.js"),
      name: "vue3-funnel-graph",
      fileName: (f) => `vue3-funnel-graph.${f}.js`,
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
  plugins: [vue()],
});
