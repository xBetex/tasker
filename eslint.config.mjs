import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Prevent console statements in production
      "no-console": "warn",
      // Encourage consistent return statements
      "consistent-return": "warn",
      // Warn about unused variables
      "no-unused-vars": "off", // Turn off base rule
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      // Prefer const over let when possible
      "prefer-const": "warn",
      // Warn about empty functions
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": "warn"
    }
  }
];

export default eslintConfig;
