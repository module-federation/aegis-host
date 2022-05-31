require('dotenv').config()
const path = require('path')
const chalk = require('chalk')
const { ModuleFederationPlugin } = require('webpack').container
const nodeExternals = require('webpack-node-externals')
const fetchRemotes = require('./webpack/fetch-remotes')
let remoteEntries = require('./webpack/remote-entries')

const server = env => {
  handleEnv(env)
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
          extensions: ['.js', '.mjs', '.cjs', '.jsx']
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

function handleEnv (env) {
  console.log(env)
  if (env.serverless) {
    remoteEntries.forEach(e => (e.path = 'webpack'))
    console.log(chalk.yellow('serverless build'))
  }
}

module.exports = [server]
