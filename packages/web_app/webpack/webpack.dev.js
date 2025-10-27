module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    hot: true,
    open: {
      app: {
        name: 'google-chrome'
      }
    },
    port: 3000
  }
};
