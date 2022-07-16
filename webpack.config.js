require('dotenv').config()
const path = require('path')
const chalk = require('chalk')
const { ModuleFederationPlugin } = require('webpack').container
const nodeExternals = require('webpack-node-externals')
const fetchRemotes = require('./webpack/fetch-remotes')
let remoteEntries = require('./webpack/remote-entries')

const server = env => {
  handleEnv(env)
  exitAfterBuild()
  return new Promise(resolve => {
    fetchRemotes(remoteEntries).then(remotes => {
      console.info(remotes)
      resolve({
        externals: [nodeExternals(), 'mongodb-client-encryption'],
        target: 'async-node',
        //stats: 'verbose',
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
              test: /\.js?$/,
              loader: 'babel-loader',
              exclude: /node_modules/
            }
          ]
        },
        // module: {
        //   rules: [
        //     {
        //       test: /\.js?$|\.mjs?$/,
        //       exclude: /node_modules/,
        //       use: {
        //         loader: 'babel-loader',
        //         options: {
        //           presets: ['@babel/preset-env']
        //         }
        //       }
        //     }
        //   ]
        // },
        plugins: [
          new ModuleFederationPlugin({
            name: 'hostContainer',
            filename: 'remoteEntry.js',
            library: { type: 'commonjs' },
            remotes,
            exposes: {
              './hostContainer': './src/host-container.js',
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

function exitAfterBuild () {
  setTimeout(() => process.exit(0), 10000)
}

module.exports = [server]
