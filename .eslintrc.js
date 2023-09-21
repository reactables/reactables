module.exports = {
  extends: [
    'plugin:jsx-a11y/recommended',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['jsx-a11y', '@typescript-eslint'],
  rules: {
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        required: {
          some: ['nesting', 'id'],
        },
        controlComponents: ['Field'],
        assert: 'either',
      },
    ],
    'import/prefer-default-export': ['off'],
    'import/no-anonymous-default-export': ['off'],
  },
};
