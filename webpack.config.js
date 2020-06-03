const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {InjectManifest} = require('workbox-webpack-plugin');
const {GenerateSW} = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpackPwaManifest = require('webpack-pwa-manifest');
const manifest = require('./src/manifest.json');
const webpack = require('webpack');

module.exports = function (env){

	let baseUrl
	if(env && env.dev){
		baseUrl = 'localhost:3000'
		console.log('DEV');
	}else{
		baseUrl = 'h-shams.github.io'
		console.log('PROD');
	}

	return {
		mode: 'development',

	  entry: {
	    main: './src/main.js',
			// data: './src/data.json'
		},

	  output: {
	    filename: '[name].bundle.js',
	    path: path.resolve(__dirname, 'dist'),
	  },

		devtool: 'inline-cheap-module-source-map',

		devServer: {
			contentBase: './dist',
			writeToDisk: true,
			compress: true,
		},

		plugins: [
			new CleanWebpackPlugin(),

			new MiniCssExtractPlugin({
				filename: '[name].css',
				chunkFilename: '[id].css',
			}),

			new HtmlWebpackPlugin({
				template: 'src/index.html',
			}),

			new webpackPwaManifest(manifest),

			new InjectManifest({
				swSrc: './src/assets.json',
				compileSrc: false,
				swDest: 'assets.json',
				exclude: ['sw.js']
			}),

			new CopyPlugin({
	      patterns: [
	        { from: './src/sw.js', to: './sw.js' },
	      ],
	    }),

			new webpack.DefinePlugin({
				'env.baseUrl': JSON.stringify(baseUrl)
			})

		],

		module: {
			rules: [

				// sass files
				{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader,
						{loader: 'css-loader',options: {sourceMap: true,importLoaders: 1}},
						'postcss-loader',
						{
							loader: "group-css-media-queries-loader",
							options: { sourceMap: true }
						},
					],
				},

				// html files
				{
					test: /\.html$/,
					use: [
						'html-loader'
					],
				},
			],
		},
	}
}
