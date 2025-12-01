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
          selector: "CallExpression[callee.property.name='postMessage']",
          message:
            "如果這發生在前端，請使用 src/utils/message_client.ts 中所提供的訊息處理機制來發送訊息；如果這發生在擴展主機，請使用 src/utils/message_host.ts 中的訊息處理機制來自動接收並回應訊息",
        },
        {
          selector: "CallExpression[callee.property.name='onDidReceiveMessage']",
          message: "請使用 src/utils/message_host.ts 中的所提供的訊息處理機制來處理訊息",
        },
        {
          selector: "CallExpression[callee.property.name='addEventListener'][arguments.0.value='message']",
          message: "請使用 src/utils/message_client.ts 中的所提供的訊息處理機制來接收訊息",
        },
      ],
    },
  },
  {
    files: ["src/utils/message_client.ts", "src/utils/message_host.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
];
