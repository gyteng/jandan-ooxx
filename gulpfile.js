const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

gulp.task('default', () => {
  return gulp.src([
    'public/**',
  ])
  .pipe(webpackStream({
    entry: './public/app.js',
    output: {
      path: path.resolve(__dirname, 'libs'),
      filename: 'bundle.js'
    },
    module: {
      loaders: [{
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }]
    },
    // plugins: [new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // })]
  }))
  .pipe(gulp.dest('libs'));
});
