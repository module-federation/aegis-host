require('dotenv').config()
const path = require('path')
const chalk = require('chalk')
const { ModuleFederationPlugin } = require('webpack').container
const nodeExternals = require('webpack-node-externals')
const fetchRemotes = require('./webpack/fetch-remotes')
let remoteEntries = require('./webpack/remote-entries')

const server = env => {
  processEnv(env)
  return new Promise(resolve => {
    fetchRemotes(remoteEntries).then(remotes => {
      console.info(remotes)
      resolve({
        externals: [nodeExternals(), 'mongodb-client-encryption'],
        target: 'async-node',
        stats: 'verbose',
        mode: 'development',
        devtool: 'hidden-source-map',
        entry: path.resolve(__dirname, 'src/bootstrap.js'),
        output: {
          publicPath: `http://localhost`,
          path: path.resolve(__dirname, 'dist'),
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
          new ModuleFederationPlugin({
            name: 'aegis',
            filename: 'remoteEntry.js',
            library: {
              name: 'aegis',
              type: 'commonjs-module'
            },
            remoteType: 'commonjs-module',
            remotes,
            exposes: {
              './server': './src/server',
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
  if (env.order)
    remoteEntries = remoteEntries.filter(re =>
      ['master', 'wasm', 'cache'].includes(re.branch)
    )
  if (env.customer)
    remoteEntries = remoteEntries.filter(re =>
      ['customer', 'wasm', 'cache'].includes(re.branch)
    )
}

module.exports = [server]
