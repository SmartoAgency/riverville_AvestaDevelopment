const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = {
  mode: process.argv.includes('--production') ? 'production' : 'development',
  entry: {
    'immediate-loading': './src/assets/scripts/immediate-loading.js',
    'single-news': './src/assets/scripts/single-news.js',
    'single-construction': './src/assets/scripts/single-construction.js',
    'vr-tours': './src/assets/scripts/vr-tours.js',
    home: './src/assets/scripts/home.js',
    news: './src/assets/scripts/news.js',
    developer: './src/assets/scripts/developer.js',
    index: './src/assets/scripts/index-app.js',
    gallery: './src/assets/scripts/gallery.js',
    about: './src/assets/scripts/about.js',
    infrastructure: './src/assets/scripts/infrastructure.js',
    commercial: './src/assets/scripts/commercial.js',
    apartments: './src/assets/scripts/apartments.js',
  },
  output: {
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: /node_modules[\\/]@studio-freight[\\/]lenis/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks(chunk) {
            // exclude `my-excluded-chunk`
            return chunk.name !== 'immediate-loading';
          },
        },
      },
    },
  },
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true,
      uglifyOptions: {
        compress: {
          drop_console: process.argv.includes('--production'),
        },
      },
    }),
  ],
};

module.exports = config;
