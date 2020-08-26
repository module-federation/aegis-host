var path = require('path');
const ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin;

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.js'),
  target: 'node',
  output: {
    publicPath: "dist",
    // path: path.resolve(__dirname, 'dist'),
    // filename: 'fedmon.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        // include: path.resolve(__dirname, 'src'),
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
      library: { type: "commonjs2" },
      // library: { type: "var" },
      //filename: "remoteEntry.js",
      remotes: {
        fedmonserv: path.resolve(
          __dirname,
          "../federated-monolith-services/dist/remoteEntry.js"
        )
        // fedmonserv: 'fedmonserv@http://localhost:8060/remoteEntry.js'
      },
      // shared: ['express']
    }),
  ]
}

// module.exports = [serverConfig]