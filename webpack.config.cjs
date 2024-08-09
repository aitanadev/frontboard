// Generated using webpack-cli https://github.com/webpack/webpack-cli

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader')
const isProduction = process.env.NODE_ENV == 'production';
const ESLintPlugin = require('eslint-webpack-plugin')
const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';

const config = {
    devtool: 'eval-source-map',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
    },
    watchOptions: {
      // ignored: ['**/data/**', '**/node_modules/**']
    },
    devServer: {
      https: false,
      host: 'localhost',
      port: 3036,
      historyApiFallback: true
    },

    plugins: [
      new webpack.DefinePlugin({'process.env': JSON.stringify(process.env)}),

      new webpack.EnvironmentPlugin({
        'ENV': 'development',
        'DEBUG': false
      }),
      new HtmlWebpackPlugin({
        template: 'index.html',
      }),

      new VueLoaderPlugin(),
      new ESLintPlugin({
        extensions: ['js', 'vue'],
        fix: true
      }),

      // Add your plugins here
      // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
      rules: [
        {
          resourceQuery: /raw/,
          type: 'asset/source',
        },
        {
          test: /\.(md|snap|example)$/,
          type: 'asset/source' 
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          resourceQuery: { not: [/raw/] },
        },
        {
          test: /\.(js|jsx)$/i,
          loader: 'babel-loader',
          resourceQuery: { not: [/raw/] },
        },
        {
          test: /\.css$/i,
          use: [stylesHandler,'css-loader'],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [stylesHandler, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
          type: 'asset',
        },
        // Add your rules for custom modules here
        // Learn more about loaders from https://webpack.js.org/loaders/
      ],
    },


  resolve: {
    extensions: [
      '.vue',
      '.js',
      '.scss',
      '.css'
    ],
    modules: [
      'node_modules'
    ],
    alias: {
      'vue': 'vue/dist/vue.esm.js',
    }
  }
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
    config.plugins.push(new MiniCssExtractPlugin()); 
  } else {
    config.mode = 'development';
  }
  return config;
};
