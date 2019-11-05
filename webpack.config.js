const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

module.exports = (env, argv) => {
  let entryFolder;
  let output;
  let css;
  let externals;
  let plugins;
  if (argv.example) {
    entryFolder = 'example';
    output = {
      path: path.join(__dirname, 'gh-pages'),
      filename: 'index-[git-revision-hash].js',
    };
    css = 'css/index-[git-revision-hash].css';
    externals = [];
    plugins = [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'example/index.template.html'),
        minify: {
          removeComments: true,
        },
      }),
      new GitRevisionPlugin(),
    ];
  } else {
    entryFolder = 'src';
    output = {
      path: path.join(__dirname, 'dist'),
      filename: 'index.js',
      library: 'StickyVideo',
      libraryTarget: 'umd',
    };
    css = 'index.css';
    externals = [
      {
        react: {
          root: 'React',
          commonjs2: 'react',
          commonjs: 'react',
          amd: 'react',
        },
      },
    ];
    plugins = [];
  }
  return {
    entry: path.join(
      __dirname,
      `${entryFolder}/index.jsx`,
    ),
    output,
    externals,
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
      ...plugins,
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: css,
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
      publicPath: '/gh-pages/',
    },
  };
};
