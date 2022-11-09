// eslint-disable-next-line @typescript-eslint/no-var-requires
const { merge } = require('webpack-merge');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const commonConfig = require('./webpack.common');

module.exports = (envVars) => {
  const { ENV } = envVars;

  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires,import/no-dynamic-require
  const envConfig = require(`./webpack.${ENV}.js`);
  return merge(commonConfig(envVars), envConfig);
};
