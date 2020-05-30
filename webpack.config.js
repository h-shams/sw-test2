const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {InjectManifest} = require('workbox-webpack-plugin');
const {GenerateSW} = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpackPwaManifest = require('webpack-pwa-manifest');
const manifest = require('./src/manifest.json');

module.exports = {
	mode: 'development',

  entry: {
    main: './src/main.js',
	},

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

	devtool: 'inline-cheap-module-source-map',

	devServer: {
		contentBase: './dist',
		compress: true,
	},

	plugins: [
		new CleanWebpackPlugin(),

		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css',
		}),

		new HtmlWebpackPlugin({
			template: 'src/index.html'
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

	],

	module: {
		rules: [

			// sass files
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
            options: {
              sourceMap: true,
            },
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
