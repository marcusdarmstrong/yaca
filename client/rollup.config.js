import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { eslint } from "rollup-plugin-eslint";

import react from 'react';
import reactDom from 'react-dom';

export default {
  input: './client/index.tsx',
  output: {
    file: './client/dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    eslint({ fix: true, throwOnError: true }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    resolve({ extensions: [".js", ".ts", ".tsx"] }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        react: Object.keys(react),
        'react-dom': Object.keys(reactDom),
      },
    }),
    babel({
      babelrc: false,
      extensions: [".js", ".ts", ".tsx"],
      exclude: 'node_modules/**', // only transpile our source code
      presets: [
        ["@babel/preset-env", {"modules": false}],
        "@babel/preset-react",
        "@babel/preset-typescript"
      ],
      plugins: [
        "@babel/plugin-proposal-optional-chaining",
      ]
    }),

    process.env.NODE_ENV === 'production' ? terser() : null,
  ]
};