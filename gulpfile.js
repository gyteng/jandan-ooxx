const gulp = require('gulp');
const path = require('path');
const ts = require('gulp-typescript');
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
    plugins: [new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })]
  }))
  .pipe(gulp.dest('libs'));
});

const tsProject = ts.createProject('tsconfig.json');

gulp.task('ts', () => {
    // return gulp.src('server/**/*.ts')
    //     .pipe(ts({
    //         noImplicitAny: true,
    //         out: 'output.js'
    //     }))
    //     .pipe(gulp.dest('built'));

    const tsResult = gulp.src("src/**/*.ts") // or tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest('build'));
});
