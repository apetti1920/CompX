// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HtmlWebpackPlugin = require('html-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');

module.exports = (envVars) => {
  const { BUILD_TYPE, ENV } = envVars;

  return {
    entry: path.resolve(__dirname, '..', 'src/index.tsx'),
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@compx/common': path.resolve(__dirname, '../../../packages/common/src')
      }
    },
    module: {
      rules: [
        {
          test: /\.(js)x?$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.(ts)x?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
          type: 'asset/inline'
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, '..', './dist'),
      filename: 'bundle.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '..', 'index.html')
      }),
      new webpack.EnvironmentPlugin({
        ENV_TYPE: ENV,
        BUILD_TYPE: BUILD_TYPE
      })
    ],
    stats: 'errors-only'
  };
};
