require("dotenv").config();
const path = require("path");
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;
const fetchRemotes = require("./webpack/fetch-remotes");
const remoteEntries = require("./webpack/remote-entries");
const port = process.env.PORT || 8070;
const sslPort = process.env.SSL_PORT || 8071;
const sslEnabled = /true/i.test(process.env.SSL_ENABLED);
const publicPort = sslEnabled ? sslPort : port;
const chalk = require("chalk");

module.exports = env => {
  console.log(env);
  if (env.serverless) {
    remoteEntries.forEach(e => (e.path = "webpack"));
    console.log(chalk.yellow("serverless build"));
  }
  return new Promise(resolve => {
    fetchRemotes(remoteEntries).then(remotes => {
      console.info(remotes);
      resolve({
        target: "async-node",
        mode: "development",
        devtool: "source-map",
        entry: ["@babel/polyfill", path.resolve(__dirname, "src/server.js")],
        output: {
          publicPath: `http://localhost:${publicPort}`,
          path: path.resolve(__dirname, "dist"),
          libraryTarget: "commonjs",
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
