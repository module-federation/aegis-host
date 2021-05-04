require("dotenv").config();
const path = require("path");
const ModuleFederationPlugin = require("webpack").container
  .ModuleFederationPlugin;
const fetchRemotes = require("./webpack/fetch-remotes");
const remoteEntries = require("./webpack/remote-entries");
const port = process.env.PORT || 8707;
const sslPort = process.env.SSL_PORT || 8070;
const sslEnabled = /true/i.test(process.env.SSL_ENABLED);
const serverless = /true/i.test(process.env.SERVERLESS);
const publicPort = sslEnabled ? sslPort : port;
const chalk = require("chalk");

module.exports = env => {
  if (/serverless/i.test(env) && serverless) {
    console.info(chalk.yellow("starting serverless build"));
    remoteEntries.forEach(e => (e.path = "webpack"));
  } else {
    console.warn(chalk.red("set SERVERLESS_prop in .env to  "));
    process.exit();
  }
  return new Promise(resolve => {
    fetchRemotes(remoteEntries).then(remotes => {
      console.log(remotes);
      resolve({
        target: "async-node",
        mode: "development",
        devtool: "source-map",
        entry: ["@babel/polyfill", path.resolve(__dirname, "src/server.js")],
        output: {
          publicPath: `http://localhost:${publicPort}`,
          path: path.resolve(__dirname, "dist"),
          libraryTarget: "commonjs2",
        },
        resolve: {
          extensions: [".js"],
        },
        module: {
          rules: [
            {
              test: /\.js?$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"],
                },
              },
            },
          ],
        },
        plugins: [
          new ModuleFederationPlugin({
            name: "microlib",
            filename: "remoteEntry.js",
            library: {
              name: "microlib",
              type: "commonjs-module",
            },
            remoteType: "commonjs-module",
            remotes,
            exposes: {
              "./server": "./src/server",
              "./models": "./src/models",
              "./remoteEntries": "./webpack/remote-entries",
            },
          }),
        ],
      });
    });
  });
};
