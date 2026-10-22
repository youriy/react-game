const path = require("path");

module.exports = {
    // Полифилы не нужны: MUI v5 работает только в современных браузерах (Chrome 90+, Safari 14+, Firefox 78+),
    // где всё, что использует наш код, есть встроенным
    entry: "./src/app.jsx",
    output: {
        path: path.resolve(__dirname, "public"),
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