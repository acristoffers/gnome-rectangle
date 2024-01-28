import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: './extension.ts',
    output: {
      file: 'dist/extension.js',
      format: 'es',
      sourcemap: false
    },
    external: (id) => /^gi:/.test(id) || /^resource:/.test(id),
    plugins: [
      nodeResolve({
        extensions: ['.js', '.ts']
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },
  {
    input: './prefs.ts',
    output: {
      file: 'dist/prefs.js',
      format: 'es',
      sourcemap: false
    },
    external: (id) => /^gi:/.test(id) || /^resource:/.test(id),
    plugins: [
      nodeResolve({
        extensions: ['.js', '.ts']
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },
];
