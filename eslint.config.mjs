import { defineConfig } from "eslint/config";
import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

const commonImportRestrictions = {
  patterns: [
    {
      group: ["fs", "fs/*", "fs/promises", "fs/promises/*"],
      message: "請使用 fs-extra 來取代 fs ，以確保更好的相容性與功能。",
    },
    {
      group: ["../*", "./*"],
      message: "請使用絕對路徑導入模組: @/ 代表 src 資料夾, @[feature]/ 代表 src/webview-*/ 資料夾。",
    },
    {
      group: ["@/webview-*/*"],
      message: "請使用 @[feature]/ 代表 src/webview-*/ 資料夾來導入模組。",
    },
  ],
};

const vscodeImportRestriction = {
  paths: [
    {
      name: "vscode",
      message: "只能在執行環境為延伸主機的程式碼中使用 'import \"vscode\"'。",
    },
  ],
  ...commonImportRestrictions,
};

export default defineConfig([
  // 全域 ignore 設定，雖然直覺會以為是對一個空的 rules ignore，但根據官方文件說明：
  // "If ignores is used without any other keys in the configuration object,
  //  then the patterns act as global ignores and it gets applied to every configuration object."
  { ignores: ["node_modules/**", "dist/**", "*.js", "vitest.config.ts"] },

  // 全域規則設定
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "@typescript-eslint": tseslint },
    languageOptions: {
      parser: parser,
      parserOptions: { ecmaVersion: 2020, sourceType: "module", project: "./tsconfig.json" },
    },
    rules: { ...tseslint.configs.recommended.rules },
  },

  // 特殊規則 - 導入相關限制
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: { "no-restricted-imports": ["error", commonImportRestrictions] },
  },
  {
    files: ["src/webview-*/**/*.ts", "src/webview-*/**/*.tsx"],
    rules: { "no-restricted-imports": ["error", vscodeImportRestriction] },
  },

  // 特殊規則 - 禁止直接使用某些 API，必須透過 utils 中的輔助函數來使用
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["src/utils/vscode/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='registerCommand'][callee.object.property.name='commands']",
          message: "請使用 @/utils/vscode 中的輔助函數來確保命令資源會正確釋放。",
        },
        {
          selector: "CallExpression[callee.property.name='getConfiguration'][callee.object.property.name='workspace']",
          message: "請使用 @/utils/vscode 中的輔助函數來確保統一獲取使用者配置的途徑。",
        },
        {
          selector: "CallExpression[callee.property.name='postMessage']",
          message: "請使用 @/utils/vscode 處理與 VSCode API 的訊息傳遞機制",
        },
        {
          selector: "CallExpression[callee.property.name='onDidReceiveMessage']",
          message: "請使用 @/utils/vscode 處理與 VSCode API 的訊息傳遞機制",
        },
        {
          selector: "CallExpression[callee.property.name='addEventListener'][arguments.0.value='message']",
          message: "請使用 @/utils/vscode 處理與 VSCode API 的訊息傳遞機制",
        },
      ],
    },
  },
]);
