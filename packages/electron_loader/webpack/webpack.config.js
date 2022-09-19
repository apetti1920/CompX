import { merge } from 'webpack-merge';
import commonConfig from './webpack.common.js';

module.exports = (envVars) => {
    const { env } = envVars;
    const envConfig = require(`./webpack.${env}.js`) // eslint-disable-line @typescript-eslint/no-var-requires
    return merge(commonConfig, envConfig);
}