require('dotenv').config()
const path = require('path')
const chalk = require('chalk')
const nodeExternals = require('webpack-node-externals')

const StreamingRuntime = require('../dist/node/streaming')
const NodeFederation = require('../dist/node/streaming/NodeRuntime')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

// const server = env => {
//   handleEnv(env)
//   exitAfterBuild()
//   return new Promise(resolve => {
//     fetchRemotes(remoteEntries).then(remotes => {
//       console.info(remotes)
//       resolve({
const serverConfig = {
  target: 'async-node',
  mode: 'development',
  entry: './src/container.js',
  output: {
    publicPath: 'http:/localhost:3000/',
    path: path.join(process.cwd(), 'container', 'exposed'),
    library: 'commonjs',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.mjs']
  },
  module: {
    rules: [
      {
        test: /\.js?$|\.mjs?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new StreamingRuntime({
      name: 'host',
      filename: 'remoteEntry.js',
      library: { type: 'commonjs' },
      exposes: {
        './container': './src/container.js'
      }
    }),
    new NodeFederation({
      name: 'host',
      filename: 'remoteEntry.js',
      library: { type: 'commonjs' },
      exposes: {
        './container': './src/container.js'
      }
    })
  ]
}

module.exports = [serverConfig]
