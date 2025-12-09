import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
    testTimeout: 10000, // 測試超時時間（檔案系統操作可能較慢）
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
