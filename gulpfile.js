var gulp        = require('gulp'),
    watch       = require('gulp-watch'),
    compass     = require('gulp-compass'),
    path        = require('path'),
    concat      = require('gulp-concat'),
    minifyCSS   = require('gulp-minify-css'),
    plumber     = require('gulp-plumber'),
    util        = require('gulp-util'),
    browserSync = require('browser-sync').create();

var onError = function (err) {
  util.beep();
  console.log(err);
};

gulp.task('default', ['browser-sync', 'watch']);

gulp.task('watch', ['styles', 'scripts', 'copy-fonts', 'bootstrap-css', 'bootstrap-js', 'vue-js', 'vue-resource', 'jquery', 'bootstrap-select'], function () {
  gulp.watch([
    'app/styles/**/*.scss'
  ], ['styles']);

  gulp.watch([
    'app/scripts/**/*.js'
  ], ['scripts']);

  gulp.watch([
    'app/index.html'
  ]).on('change', browserSync.reload);
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./app/"
    }
  });
});

gulp.task('styles', function() {
  gulp.src(['./app/styles/**/*.scss'])
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat('app.scss'))
    .pipe(gulp.dest('./temp/styles'))
    .pipe(compass({
      css: './app/css',
      sass: './temp/styles'
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./app/css'))
    .pipe(browserSync.stream())
});

/*** Static files ***/

gulp.task('bootstrap-css', function() {
  gulp.src(['node_modules/bootstrap/dist/css/**/*.css'])
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat('bootstrap.css'))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./app/css'))
});

gulp.task('bootstrap-js', function() {
  gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js'])
    .pipe(gulp.dest('./app/js'))
});

gulp.task('bootstrap-select', function() {
  gulp.src(['node_modules/bootstrap-select/dist/css/bootstrap-select.min.css'])
    .pipe(gulp.dest('./app/css'))
  gulp.src(['node_modules/bootstrap-select/dist/js/bootstrap-select.min.js'])
    .pipe(gulp.dest('./app/js'))
});

gulp.task('vue-js', function() {
  gulp.src(['node_modules/vue/dist/vue.min.js'])
    .pipe(gulp.dest('./app/js'))
});

gulp.task('vue-resource', function() {
  gulp.src(['node_modules/vue-resource/dist/vue-resource.min.js'])
    .pipe(gulp.dest('./app/js'))
});

gulp.task('jquery', function() {
  gulp.src(['node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('./app/js'))
});

gulp.task('copy-fonts', function () {
  gulp.src('node_modules/bootstrap/dist/fonts/**')
    .pipe(gulp.dest('./app/fonts'));
});

/*** Static files ***/

gulp.task('scripts', function () {
  gulp.src(['./app/scripts/**/*.js'])
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat('app.js'))
    // .pipe(plumber.stop())
    .pipe(gulp.dest('./app/js'))
    .pipe(browserSync.stream())
});
