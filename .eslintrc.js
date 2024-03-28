module.exports = {
  plugins: ['import'],
  extends: ['next/core-web-vitals', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': ['error', require('./.prettierrc.js')],
    'import/no-duplicates': 'error',
    'import/no-unused-modules': 'error',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: false
        },
        'newlines-between': 'always',
        groups: ['external', 'builtin', 'internal', ['parent', 'sibling', 'index']],
        pathGroupsExcludedImportTypes: []
      }
    ]
  }
};
