import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/LiveChatClient.js',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      exports: 'named'
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'src/LiveChatClient.js',
    output: {
      file: 'dist/esm/index.js',
      format: 'esm'
    },
    plugins: [resolve(), commonjs(), terser()]
  }
];
