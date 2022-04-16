const path = require("path");

module.exports = {
    entry: ['babel-polyfill', "./src/app.jsx"],
    output: {
        path: __dirname + "/public",
        filename: "bundle.js",
    },
    devServer: {
        historyApiFallback: true,
        port: 301,
        open: true,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env", "@babel/preset-react"],
                },
            },
            {
                test: /\.s[ac]ss$/i,
                exclude: /(node_modules)/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader",
                ],
            },
        ],
    },
};