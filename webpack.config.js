const path = require('path')

module.exports = {
  mode: 'production',
  context: path.join(__dirname, './'),
  entry: './app/index.jsx',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: 'since 2018'
                }
              ],
              '@babel/preset-react'
            ],
            cacheDirectory: true
          }
        }
      }
    ]
  }
}
