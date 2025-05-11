export default {
  preset: 'ts-jest/presets/js-with-ts',
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
