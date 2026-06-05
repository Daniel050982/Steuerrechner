import googleappsscript from 'eslint-plugin-googleappsscript';

/** @type {import("eslint").Linter.FlatConfig[]} */

export default [
  {
    files: ['**/*.js', '**/*.gs'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        Logger: 'readonly',
        SpreadsheetApp: 'readonly',
        Utilities: 'readonly'
      }
    },
    plugins: {
      googleappsscript
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',

      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'spaced-comment': ['error', 'always', { exceptions: ['-'] }],

      'space-before-blocks': ['error', 'always'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-infix-ops': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'lines-between-class-members': ['error', 'always'],
      'newline-before-return': 'error',
      'operator-linebreak': ['error', 'before'],
      'brace-style': ['error', '1tbs'],
      'function-paren-newline': ['error', 'multiline'],
      'comma-spacing': ['error', { before: false, after: true }],
      'curly': ['error', 'all'],
      'max-len': [
        'warn',
        {
          code: 200,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true
        }
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'const', next: 'let' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: 'function' },
        { blankLine: 'always', prev: '*', next: 'if' },
        { blankLine: 'always', prev: '*', next: 'for' }
      ],
      'lines-around-comment': [
        'error',
        {
          'beforeBlockComment': true,
          'afterBlockComment': true,
          'beforeLineComment': true,
          'afterLineComment': true,
          'allowClassStart': true,
          'allowObjectStart': true,
          'allowArrayStart': true
        }
      ]
    }
  }
];
