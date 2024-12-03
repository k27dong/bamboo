// @ts-check

import eslint from "@eslint/js"
import simplesort from "eslint-plugin-simple-import-sort"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    name: "k27dong/ignores",
    ignores: ["dist"],
  },
  {
    name: "k27dong/languages",
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.es2024,
        ...globals.node,
      },
    },
  },
  {
    name: "eslint/recommended",
    ...eslint.configs.recommended,
  },
  {
    name: "k27dong/typescript",
    files: ["**/*.?(c|m)ts?(x)"],
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-namespace": [
        "error",
        {
          allowDeclarations: true,
        },
      ],
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
  {
    name: "simple-import-sort",
    plugins: {
      "simple-import-sort": simplesort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
)
