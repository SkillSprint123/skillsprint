import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import stylistic from '@stylistic/eslint-plugin'
import prettier from 'eslint-config-prettier/flat'

export default [
  {
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  {
    ignores: ['**/dist/**'],
  },
  {
    files: [
      'bro.config.js',
      'server/**/*.js',
      'scripts/**/*.{mjs,cjs}',
      'config/**/*.js',
      'tests/**/*.mjs',
    ],
    languageOptions: { globals: globals.node },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: [
      'bro.config.js',
      'server/**/*.js',
      'config/**/*.js',
      'scripts/**/*.cjs',
    ],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn', // or "error"
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: true,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true,
        },
      ],
      semi: ['error', 'never'],
      '@stylistic/indent': ['error', 2],
    },
  },
  prettier,
]
