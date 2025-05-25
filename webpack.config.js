const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
console.log(path.resolve(__dirname, 'dist'))
module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        clean: true
    },
    devServer: {
        static: './public/index.html',
        open: true,
        port: 3000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        })
    ],
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif|webp)$/,
                type: 'asset/resource'
            }
        ]
    },
    mode: 'development'
};
