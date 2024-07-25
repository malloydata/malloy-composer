import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [svgr(), react({ jsxRuntime: "classic" })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => {
        if (format === "cjs") return "cjs/[name].cjs";
        return "esm/[name].js";
      },
      name: "index",
    },
    rollupOptions: {
      // TODO: should malloydata/render be external? or bundled in? when bundled, potential for the webcomponent already defined problem
      external: ["react", "react/jsx-runtime"], // "@malloydata/render"
      output: {
        manualChunks: (id) => {
          return "index";
        },
      },
    },

    minify: false,
  },
  define: {
    "process.env": {},
  },
});
