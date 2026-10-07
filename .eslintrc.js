module.exports = {
  extends: [
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-typescript'],
    },
  },
  plugins: ['jsx-a11y'],
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
