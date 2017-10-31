var path = require('path');
var fs = require('fs');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

var srcDir = path.resolve(__dirname, 'src');
var assetDir = path.resolve(__dirname, 'src/assets');

var images = {
	images: fs.readdirSync(assetDir).map(function(file) {
			return path.join(assetDir, file);
		})
};

var appEntries = fs.readdirSync(path.join(srcDir, 'pages')).reduce(function(memo, filename) {
	memo[filename.split('.')[0]] = path.join(srcDir, 'pages/' + filename);
	return memo;
}, {});


var entry = Object.assign(appEntries, images)

module.exports = {
	entry: entry,
	output: {
		path: path.resolve(__dirname, 'build/'),
		filename: '[name].js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: [{
					loader: 'babel-loader',
				}]
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: 'css-loader',
				})
			},
			{
				test:/\.(png|jpg|svg)/,
				use: {
					loader: 'file-loader', 
					options: {
						name: '[name].[ext]',
					}
				},
			},
		]
	},
	plugins: [
		new ExtractTextPlugin('[name].css'),
	],
};
