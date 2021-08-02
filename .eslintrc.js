module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    'no-self-compare': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
      },
    ],
    'import/no-unresolved': 'off', // Because the import-plugin's resolution logic isn't great; @see https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md#when-not-to-use-it
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '^_', // Don't mark any variables that start with an `_` as unused.
      },
    ],
  },
  overrides: [
    {
      files: ['main.ts'],
      rules: {
        '@typescript-eslint/no-floating-promises': [
          'error',
          {
            ignoreIIFE: true, // Exception only for the main `run()` invocation.
          },
        ],
      },
    },
    {
      files: ['tests/**/*.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: false, // `tape` takes care of async tests. 
          },
        ],
      },
    },
  ],
}
