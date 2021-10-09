const path = require('path');

module.exports = {
    mode: 'production',
    entry: './index.ts',
    output: {
        filename: 'card_game.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_module/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    }
}