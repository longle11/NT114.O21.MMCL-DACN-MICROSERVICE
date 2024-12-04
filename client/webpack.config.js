const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.join(__dirname, "/build"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    devServer: {
        historyApiFallback: true,
        hot: true
        // host: '0.0.0.0',
        // hot: true,
        // proxy: [
        //     {
        //         context: ['/api/users'],
        //         target: 'http://localhost:4000',
        //         changeOrigin: true,
        //         secure: false,
        //     },
        // ]
    },
    // Chứa các plugins sẽ cài đặt sau
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        })
    ]
};