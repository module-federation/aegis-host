var path = require('path');
const ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin;
const nodeExternals = require('webpack-node-externals');

var serverConfig = {
  mode: 'development',
  entry: [
    path.resolve(__dirname, "src/index.js")
  ],
  target: 'node',
  output: {
    libraryTarget: 'commonjs',
  },
  externals: nodeExternals({
    allowlist: [/webpack\/container/],
  }),
  resolve: {
    extensions: [".js"],
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
      name: "fedmon",
      library: { type: "commonjs-module" },
      filename: "remoteEntry.js",
      remotes: {
        fedmonserv: path.resolve(
          __dirname, "../federated-monolith-services/dist/remoteEntry.js"
        )
        // fedmonserv: 'fedmonserv@http://localhost:8060/remoteEntry.js'
      },
      shared: ['express']
    }),
  ]
}

module.exports = [serverConfig]