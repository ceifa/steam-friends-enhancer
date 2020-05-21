const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

const env = process.env.NODE_ENV || 'development';

let plugins = [];
switch (env) {
    case "development":
        plugins = [
            new ExtensionReloader({
                reloadPage: true,
                entries: {
                    contentScript: 'content',
                    background: 'background'
                }
            })
        ];
        break;
}

module.exports = {
    mode: env,
    entry: {
        content: './src/content/content.ts',
        background: './src/background/background.ts'
    },
    devtool: env === 'development' && 'source-map',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build' + (env === 'development' ? '-dev' : ''), 'js')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin(
            [
                { from: './manifest.json', to: '../' }
            ],
            {
                copyUnmodified: true
            }),
        ...plugins
    ]
};
