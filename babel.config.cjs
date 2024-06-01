// const path = require('path')
module.exports = function(api) {
  api.cache(true)
  return {
    // plugins: ["@babel/syntax-dynamic-import"],
    // exclude: path.resolve(__dirname, "node_modules"),
    presets: [
      [
        '@babel/preset-env',
        {
          // modules: 'commonjs',
          // targets: {node: 'current'}
          // modules: false,
          useBuiltIns: 'entry',
          corejs: '3.22'
        }
      ]
    ]
  }
}
