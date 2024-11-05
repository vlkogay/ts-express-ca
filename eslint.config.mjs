import typeScriptEsLintPlugin from '@typescript-eslint/eslint-plugin';
import esLintConfigPrettier from 'eslint-config-prettier';
import { FlatCompat } from '@eslint/eslintrc';

// Translate ESLintRC-style configs into flat configs.
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: typeScriptEsLintPlugin.configs['recommended'],
});

export default [
  // ESLint recommended flat config.
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...(
        await import('eslint/use-at-your-own-risk').then((mod) => mod.default)
      ).rules,
    },
  },

  // Flat config for parsing TypeScript files. Includes rules for TypeScript.
  ...compat.config({
    env: { node: true },
    extends: ['plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['node_modules/', 'dist/', 'coverage/'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
    },
  }),

  // Flat config for turning off all rules that are unnecessary or might conflict with Prettier.
  esLintConfigPrettier,

  // Flat config for ESLint rules.
  {
    rules: {
      camelcase: ['error', { ignoreDestructuring: true }],
    },
  },
];
