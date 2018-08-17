const path = require('path');

module.exports = {
  entry: './src/client.js',
  mode: 'development',
  output: {
    filename: 'wams-client.js',
    path: path.resolve(__dirname, 'dist')
  }
};

