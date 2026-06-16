import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import svelte from 'eslint-plugin-svelte'
import ts from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      jsdoc,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      curly: 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
          },
        },
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'error',
    },
  },
  // TypeScript already handles undefined variable checking,
  // so disable ESLint's no-undef to avoid false positives for DOM types
  {
    files: ['**/*.{ts,svelte}'],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    languageOptions: {
      globals: {
        browser: true,
        node: true,
      },
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  {
    ignores: ['build/', 'dist/', 'node_modules/', '.svelte-kit/', '.temp', '.vite'],
  },
]
