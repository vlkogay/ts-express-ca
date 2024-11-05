import { Configuration } from 'webpack';
import { resolve } from 'path';
import * as webpack from 'webpack';

const config: Configuration = {
  mode: 'production', // Sets bundling mode to 'none' (no optimizations).
  entry: {
    bundle: './src/index.ts', // Entry point of the application.
  },
  plugins: [new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ })],
  target: 'node', // Bundles code for Node.js environment.
  module: {
    rules: [
      {
        exclude: [/node_modules/, /dist/, /coverage/], // Excludes node_modules from processing.
        use: {
          loader: 'ts-loader', // Processes TypeScript files.
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolves these file extensions.
  },
  output: {
    filename: 'index.js',
    path: resolve(__dirname, 'dist'),
  },
};
export default config;
