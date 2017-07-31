'use strict';

const webpack = require('webpack'),
	path = require('path');

const srcPath  = path.join(__dirname, '/src'),
	distPath = path.join(__dirname, '/app');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	watch: true,
	watchOptions: {
		aggregateTimeout: 500
	},
	cache: true,
	devtool: 'cheap-module-eval-source-map',
	context: srcPath,
	entry: './js',
	output: {
		filename: 'bundle.js',
		path: distPath
	},
	resolve: {
		modules: [ "node_modules" ],
	},
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		new HtmlWebpackPlugin({ template: './index.html' }),
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: "babel-loader",
				options: { presets: "es2015" }
			},
			{
				test: /\.(sass|scss)$/,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader"
				]
			}
		]
	},
	devServer: {
		contentBase: './app',
		port: 9000
	},
};
