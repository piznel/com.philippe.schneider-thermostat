module.exports = [
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      ".homeybuild/**",
      "dist/**",
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];
