import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // 允许 less 文件中使用 js 表达式，antd 需要
      },
    },
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "", // 目标后端地址
  //       changeOrigin: true,
  //       rewrite: (path) => "/api" + path,
  //     },
  //   },
  // },
});
