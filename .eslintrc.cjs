module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.strictNullChecks.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'strict-null-checks'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'no-empty-function': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'strict-null-checks/all': 'warn',
    'dot-notation': 'off',
    'no-useless-constructor': 'off',
    'no-new': 'off',
  },
};
