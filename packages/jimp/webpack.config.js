const webpack = require("webpack");
const path = require("path");

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProd ? "production" : "development",
  devtool: isProd ? "source-map" : "eval-cheap-module-source-map",
  entry: "./src/index.js",
  target: "web",
  resolve: {
    alias: {
      pngjs: "pngjs/browser",
      mkdirp: require.resolve("./src/empty-module.js"),
    },
    fallback: {
      path: require.resolve("path-browserify"),
      events: require.resolve("events/"),
      fs: false,
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.browser": JSON.stringify("true"),
      "process.env.ENVIRONMENT": JSON.stringify("BROWSER"),
      "process.env.DIRNAME": JSON.stringify(""),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  output: {
    path: path.join(__dirname, "browser/lib"),
    filename: "jimp.js",
  },
};
