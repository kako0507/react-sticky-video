const path = require('path');
const webpack = require('webpack');
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
    ...(
      argv.example
        ? {}
        : {
          library: 'StickyVideo',
          libraryTarget: 'umd',
        }
    ),
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
    ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          'babel-loader',
          ...(argv.mode === 'production'
            ? []
            : ['webpack-strip-block']
          ),
        ],
      },
      {
        test: /\.md$/,
        use: 'raw-loader',
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              localsConvention: 'camelCase',
              modules: {
                mode: 'local',
                localIdentName: 'sv-[name]-[local]-[hash:base64:5]',
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'expanded',
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    ...(argv.example
      ? [
        new HtmlWebpackPlugin({
          template: path.join(__dirname, 'example/index.template.html'),
          minify: {
            removeComments: true,
          },
        }),
      ]
      : []
    ),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'index.css',
    }),
    new webpack.NormalModuleReplacementPlugin(/(.*)STICKY_VIDEO(\.*)/, ((resource) => {
      // eslint-disable-next-line no-param-reassign
      resource.request = resource.request.replace(
        /STICKY_VIDEO/,
        argv.mode === 'production'
          ? 'dist'
          : 'src',
      );
    })),
  ],
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
