// eslint-disable-next-line @typescript-eslint/no-var-requires
const { merge } = require('webpack-merge');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const commonConfig = require('./webpack.common');

module.exports = (envVars) => {
  const { env } = envVars;

  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const envConfig = require(`./webpack.${env}.js`);
  return merge(commonConfig, envConfig);
};
