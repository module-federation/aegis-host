require('dotenv').config()
const path = require('path')
const { ModuleFederationPlugin } = require('webpack').container
const nodeExternals = require('webpack-node-externals')
const fetchRemotes = require('./webpack/fetch-remotes')
let remoteEntries = require('./webpack/remote-entries')
const port = process.env.PORT || 80
const sslPort = process.env.SSL_PORT || 443
const sslEnabled = /true/i.test(process.env.SSL_ENABLED)
const publicPort = sslEnabled ? sslPort : port
const chalk = require('chalk')

const server = env => {
  processEnv(env)
  return new Promise(resolve => {
    fetchRemotes(remoteEntries).then(remotes => {
      console.info(remotes)
      resolve({
        externals: [nodeExternals(), 'mongodb-client-encryption'],
        target: 'async-node',
        mode: 'development',
        devtool: 'source-map',
        entry: path.resolve(__dirname, 'src/container.js'),
        output: {
          publicPath: `http://localhost:${publicPort}`,
          path: path.resolve(__dirname, 'dist'),
          libraryTarget: 'commonjs'
        },
        resolve: {
          extensions: ['.js']
        },
        module: {
          rules: [
            {
              test: /\.js?$/,
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
          new ModuleFederationPlugin({
            name: 'microlib',
            filename: 'remoteEntry.js',
            library: {
              name: 'microlib',
              type: 'commonjs-module'
            },
            remoteType: 'commonjs-module',
            remotes,
            exposes: {
              './server': './src/container',
              './domain': '@module-federation/aegis/lib/domain',
              './adapters': '@module-federation/aegis/lib/adapters',
              './services': '@module-federation/aegis/lib/services',
              './remoteEntries': './webpack/remote-entries'
            }
          })
        ]
      })
    })
  })
}

function processEnv (env) {
  console.log(env)
  if (env.serverless) {
    remoteEntries.forEach(e => (e.path = 'webpack'))
    console.log(chalk.yellow('serverless build'))
  }
  if (env.order) remoteEntries = require('./webpack/remote-entries-order-test')
  if (env.customer)
    remoteEntries = require('./webpack/remote-entries-customer-test')
}

module.exports = [server]
