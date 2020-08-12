var path = require('path')
const ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin;

var serverConfig = {
  entry: [path.resolve(__dirname, 'src/index.js')],
  target: 'node',
  output: {
    publicPath: 'http://localhost:3000/',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000
  },
  mode: 'production',
  module: {
    rules: [
      {
        // test: /bootstrap\.js$/,
        // loader: "bundle-loader",
        // options: {
        //   lazy: true,
        // },
        test: /bootstrap.js?$/,
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
        fedmonserv: "http://localhost:3001/remoteEntry.js"
      },
    }),
  ]
}

module.exports = [serverConfig]