const path = require('path');
const ContainerReferencePlugin = require('webpack').container.ContainerReferencePlugin;
const nodeExternals = require('webpack-node-externals');
const fetchRemoteEntry = require('./webpack/fetch-remote-entry');
const remoteEntries = require('./webpack/remote-entries');

module.exports = () => {
  return new Promise((resolve, reject) => {
    fetchRemoteEntry(remoteEntries)
      .then(remotes => resolve({
        target: 'async-node',
        mode: 'development',
        devtool: false,
        entry: [path.resolve(__dirname, 'src/index.js')],
        output: {
          publicPath: 'http://localhost:8070',
          path: path.resolve(__dirname, 'dist'),
          libraryTarget: 'commonjs',
        },
        externals: nodeExternals({
          allowlist: [/webpack\/container/],
        }),
        resolve: {
          extensions: ['.js'],
        },
        module: {
          rules: [
            {
              test: /\.js?$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env'],
                }
              }
            },
          ]
        },
        plugins: [
          new ContainerReferencePlugin({
            remoteType: 'commonjs-module',
            remotes: remotes
          }),
        ]
      }));
  });
}
