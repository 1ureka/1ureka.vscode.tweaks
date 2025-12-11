import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

export default [
  { ignores: ["node_modules/**", "dist/**", "*.js", "vitest.config.ts"] },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "@typescript-eslint": tseslint },
    languageOptions: {
      parser: parser,
      parserOptions: { ecmaVersion: 2020, sourceType: "module", project: "./tsconfig.json" },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='registerCommand'][callee.object.property.name='commands']",
          message: "請使用 @/utils/command.ts 中的輔助函數來確保命令資源會正確釋放。",
        },
        {
          selector: "CallExpression[callee.property.name='getConfiguration'][callee.object.property.name='workspace']",
          message: "請使用 @/utils/command.ts 中的輔助函數來確保統一獲取使用者配置的途徑。",
        },
        {
          selector: "CallExpression[callee.property.name='postMessage']",
          message: "請使用 @/utils/message_client.ts 處理前端發送，或使用 @/utils/message_host.ts 處理延伸主機發送。",
        },
        {
          selector: "CallExpression[callee.property.name='onDidReceiveMessage']",
          message: "請使用 @/utils/message_host.ts 中的所提供的訊息處理機制來處理訊息",
        },
        {
          selector: "CallExpression[callee.property.name='addEventListener'][arguments.0.value='message']",
          message: "請使用 @/utils/message_client.ts 中的所提供的訊息處理機制來接收訊息",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          name: "vscode",
          message: "只能在 src/providers, src/commands, src/utils 相關的檔案中使用 'import \"vscode\"'。",
        },
      ],
    },
  },
  {
    files: ["src/utils/message_client.ts", "src/utils/message_host.ts", "src/utils/command.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["src/providers/**", "src/commands/**", "src/utils/**", "extension.ts"],
    rules: { "no-restricted-imports": "off" },
  },
];
