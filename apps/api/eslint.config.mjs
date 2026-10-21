import { config } from "@repo/eslint-config/base";

export default [
  ...config,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        babelOptions: {
          plugins: [["@babel/plugin-syntax-decorators", { version: "legacy" }]],
        },
      },
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];
