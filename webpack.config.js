var path = require('path');
const ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin;

var serverConfig = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.js'),
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'fedmon.bundle.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules)/,
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
      remotes: {
        fedmonserv: "fedmonserv@http://localhost:3001/remoteEntry.js"
      },
    }),
  ]
}

module.exports = [serverConfig]