import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

export default [
  { ignores: ["node_modules/**", "dist/**", "*.js"] },
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
          selector: "MemberExpression[object.name='vscode'][property.name='postMessage']",
          message: "請使用 src/utils/message_client.ts 中的 invoke() 函數來發送訊息",
        },
        {
          selector: "CallExpression[callee.property.name='onDidReceiveMessage']",
          message: "請使用 src/utils/message_host.ts 中的 onDidReceiveInvoke() 函數來處理訊息",
        },
      ],
    },
  },
  {
    files: ["src/utils/message_client.ts", "src/utils/message_host.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
];
