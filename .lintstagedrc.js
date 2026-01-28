module.exports = {
  "*.{js,jsx,ts,tsx,mjs}": [
    "eslint --fix",
    "prettier --write",
  ],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  "*.{ts,tsx}": () => "tsc --noEmit",
};
