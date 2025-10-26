// eslint-disable-next-line @typescript-eslint/no-var-requires
import { resolve as _resolve } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import HtmlWebpackPlugin from 'html-webpack-plugin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { EnvironmentPlugin } from 'webpack';

export default (envVars) => {
  const { BUILD_TYPE, ENV } = envVars;

  return {
    entry: _resolve(__dirname, '..', 'src/index.tsx'),
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@compx/common': _resolve(__dirname, '../../../packages/common/src')
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
      path: _resolve(__dirname, '..', './dist'),
      filename: '[name].js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: _resolve(__dirname, '..', 'index.html')
      }),
      new EnvironmentPlugin({
        ENV_TYPE: ENV,
        BUILD_TYPE: BUILD_TYPE
      })
    ],
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          konva: {
            test: /[\\/]node_modules[\\/](konva|react-konva)[\\/]/,
            name: 'konva',
            chunks: 'all',
            priority: 20,
            enforce: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          }
        }
      }
    },
    stats: 'errors-only'
  };
};
