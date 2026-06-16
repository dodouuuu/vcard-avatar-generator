import fs from 'node:fs'
import path from 'node:path'

import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import svelte from 'eslint-plugin-svelte'
import ts from 'typescript-eslint'

/**
 * Read .gitignore and parse it into glob patterns for ESLint ignores.
 * Filters out blank lines and comments.
 * @returns Glob pattern strings.
 */
function gitignorePatterns() {
  const filePath = path.resolve(import.meta.dirname, '.gitignore')
  const content = fs.readFileSync(filePath, 'utf-8')
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}

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
  { ignores: gitignorePatterns() },
]
