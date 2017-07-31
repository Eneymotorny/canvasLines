'use strict';

const webpack = require('webpack'),
	path = require('path');

const srcPath  = path.join(__dirname, '/src'),
	distPath = path.join(__dirname, '/app');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractSass = new ExtractTextPlugin({ filename: "[name].css" });

module.exports = {
	watch: false,
	cache: true,
	devtool: 'source-map',
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
		}),
		new ExtractTextPlugin( "[name].css" ),
		extractSass,
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			debug: false
		}),
		new webpack.optimize.UglifyJsPlugin({
			beautify: false,
			mangle: {
				screw_ie8: true,
				keep_fnames: true
			},
			compress: {
				screw_ie8: true
			},
			comments: false
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
				}
			},
			{
				test: /\.(sass|scss)$/,
				use: extractSass.extract({
					use: [
						"css-loader",
						"sass-loader"
					],
					fallback: [ "style-loader" ]
				})
			}
		]
	},
};
