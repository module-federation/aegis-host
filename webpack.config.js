const path = require("path");
const ModuleFederationPlugin = require("webpack").container
  .ModuleFederationPlugin;
const fetchRemotes = require("./webpack/fetch-remotes");
const remoteEntries = require("./webpack/remote-entries");
// import path from "path";
// import ModuleFederationPlugin from "webpack/lib/container";
// import fetchRemotes from "./webpack/fetch-remotes";
// import remoteEntries from "./webpack/remote-entries";

module.exports = () => {
  return new Promise(resolve => {
    fetchRemotes(remoteEntries).then(remotes =>
      resolve({
        target: "async-node",
        mode: "development",
        devtool: "source-map",
        entry: ["@babel/polyfill", path.resolve(__dirname, "src/server.js")],
        output: {
          publicPath: "http://localhost:8070",
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
              type: "commonjs-module"
            },
            remoteType: "commonjs-module",
            remotes: {
              ...remotes,
              server: "./dist/remoteEntry.sh",
            },
            exposes: {
              "./server": "./src/server",
            },
          }),
        ],
      })
    );
  });
};
