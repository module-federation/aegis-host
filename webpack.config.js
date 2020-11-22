const path = require('path');
const ContainerReferencePlugin = require('webpack').container.ContainerReferencePlugin;
const fetchRemotes = require('./webpack/fetch-remotes');
const remoteEntries = require('./webpack/remote-entries');

module.exports = () => {
  return new Promise((resolve, reject) => {
    fetchRemotes(remoteEntries)
      .then(remotes => resolve({
        target: 'async-node',
        mode: 'development',
        devtool: 'source-map',
        entry: ['@babel/polyfill', path.resolve(__dirname, 'src/index.js')],
        output: {
          publicPath: 'http://localhost:8070',
          path: path.resolve(__dirname, 'dist'),
          libraryTarget: 'commonjs2',
        },
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
