var path = require('path');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const nodeExternals = require('webpack-node-externals');
const fetchRemoteEntry = require('./webpack/fetch-remote-entry');


module.exports = () => {
  return new Promise((resolve, reject) => {
    fetchRemoteEntry({
      url: 'http://localhost:8060/remoteEntry.js',
      path: path.resolve(__dirname, 'webpack')
    }).then(([remoteEntry]) => resolve({
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
        new ModuleFederationPlugin({
          name: 'fedmon',
          library: { type: 'commonjs-module' },
          filename: 'remoteEntry.js',
          remotes: {
            fedmonserv: remoteEntry
          }
        }),
      ]
    }))
  })
}
