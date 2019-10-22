/* eslint-disable global-require */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => ({
  entry: path.join(
    __dirname,
    argv.example
      ? 'example/index.jsx'
      : 'src/index.jsx',
  ),
  output: {
    path: path.join(__dirname, argv.example ? 'build' : 'dist'),
    filename: 'index.js',
  },
  externals: argv.example
    ? []
    : [
      {
        react: {
          root: 'React',
          commonjs2: 'react',
          commonjs: 'react',
          amd: 'react',
        },
      },
      {
        'react-dom': {
          root: 'ReactDOM',
          commonjs2: 'react-dom',
          commonjs: 'react-dom',
          amd: 'react-dom',
        },
      },
    ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
      },
      {
        test: /\.md$/,
        use: 'raw-loader',
      },
      {
        test: /\.css$/,
        use: [
          ...(argv.example
            ? [
              MiniCssExtractPlugin.loader,
            ]
            : []
          ),
          { loader: 'css-loader' },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          ...(argv.example
            ? [
              MiniCssExtractPlugin.loader,
            ]
            : []
          ),
          {
            loader: 'css-loader',
            options: {
              localsConvention: 'camelCase',
              modules: {
                mode: 'local',
                localIdentName: 'sticky-video--[local]--[hash:base64:5]',
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'expanded',
                url: false,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: argv.example
    ? [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'example/index.template.html'),
        minify: {
          removeComments: true,
        },
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'css/[name].css',
        chunkFilename: 'css/[id].css',
      }),
    ]
    : [],
  stats: {
    colors: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }),
      new TerserPlugin(),
    ],
  },
  devServer: {
    publicPath: '/build/',
  },
});
