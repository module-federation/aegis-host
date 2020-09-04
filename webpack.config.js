var path = require('path');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'async-node',
  mode: 'development',
  devtool: false,
  entry: [path.resolve(__dirname, 'src/index.js')],
  output: {
    publicPath: 'http://localhost:8070',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
  },
  // externals: nodeExternals({
  //   allowlist: [/webpack\/container/],
  // }),
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
        fedmonserv: path.resolve(
          __dirname, '../federated-monolith-services/dist/remoteEntry.js'
        ),
      },
    }),
  ]
}