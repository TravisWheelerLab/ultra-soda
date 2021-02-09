module.exports = {
    mode: "development",
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
        ],
    },
    entry: {
        main: __dirname + '/main.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/build'
    }
};
