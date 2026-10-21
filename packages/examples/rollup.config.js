import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { swc } from 'rollup-plugin-swc3';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [resolve(), commonjs(), swc({ sourceMaps: true })],
  external: ['rxjs', 'rxjs/operators', '@reactables/core'],
};
