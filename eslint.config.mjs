import js from "@eslint/js";

export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      ".git/**",
      ".husky/**",
      "node_modules/**",
      "coverage/**",
      ".devcontainer/**",
      "dist/**",
      ".turbo/**",
      "public/**",
      "docs/**",
      "**/*.md",
      "**/*.json",
      "**/.env*",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      ...js.configs.recommended.rules,
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
