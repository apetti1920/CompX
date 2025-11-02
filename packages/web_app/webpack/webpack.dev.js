module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    hot: true,
    port: 3000,
    host: 'localhost',
    // Allow connections from Electron
    allowedHosts: 'all',
    // Don't open browser automatically when running for Electron
    open: false,
    // Enable CORS for Electron
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    // Disable automatic browser opening when used with Electron
    webSocketServer: 'ws'
  }
};
