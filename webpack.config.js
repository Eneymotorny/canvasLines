'use strict';

const webpack = require('webpack'),
	path = require('path');

const srcPath  = path.join(__dirname, '/src')/*,
	distPath = path.join(__dirname, '/app')*/;

module.exports = {
/*	watch: true,
	watchOptions: {
		aggregateTimeout: 500
	},*/
	cache: true,
	devtool: '#cheap-source-map',
	context: srcPath,
	entry: './index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'app')
	},
	resolve: {
		modules: ["node_modules"],
	},
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: true,
				drop_console: false,
				unsafe: true
			}
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: "babel-loader",
				options: {
					presets: "es2015",
					/*plugins: ["transform-remove-strict-mode"]*/
				}
			},
			{
				test: /\.css$/,
				use: [
					"style-loader",
					{ loader: "css-loader", options: { modules: true } }
				],
			},
			{
				test: /\.(sass|scss)$/,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader",
				]
			}
		]
	},
	devServer: {
		contentBase: __dirname + "/src"
	},
};
