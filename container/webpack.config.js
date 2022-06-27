require('dotenv').config()
const path = require('path')
const chalk = require('chalk')
const nodeExternals = require('webpack-node-externals')

const StreamingRuntime = require('../node/streaming/')
const NodeFederation = require('../node/streaming/NodeRuntime')

// const server = env => {
//   handleEnv(env)
//   exitAfterBuild()
//   return new Promise(resolve => {
//     fetchRemotes(remoteEntries).then(remotes => {
//       console.info(remotes)
//       resolve({
const serverConfig = {
  externals: [nodeExternals(), 'mongodb-client-encryption'],
  target: false,
  stats: 'verbose',
  mode: 'development',
  devtool: 'hidden-source-map',
  entry: path.resolve(__dirname, 'src/container.js'),
  output: {
    publicPath: `http://localhost`,
    path: path.resolve(__dirname, 'exposed'),
    libraryTarget: 'commonjs',
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
      exposes: {
        './container': './src/container.js'
      }
    }),
    new NodeFederation({
      name: 'host',
      filename: 'remoteEntry.js',
      exposes: {
        './container': './src/container.js'
      }
    })
  ]
}

function handleEnv (env) {
  console.log(env)
  if (env.serverless) {
    remoteEntries.forEach(e => (e.path = 'webpack'))
    console.log(chalk.yellow('serverless build'))
  }
}

function exitAfterBuild () {
  setTimeout(() => process.exit(0), 10000)
}

module.exports = [serverConfig]
