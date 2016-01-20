var gulp      = require('gulp'),
    uglify    = require('gulp-uglify'),
    rename    = require('gulp-rename'),
    concat    = require('gulp-concat'),
    minifyCss = require('gulp-minify-css'),
    watch     = require('gulp-watch'),
    sass      = require('gulp-sass');

gulp.task('styles', function () {
  gulp.src(['node_modules/bootstrap/dist/css/**/*.css','src/css/**/*.scss'])
    .pipe(concat('despegarapi.min.css'))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', function () {
  gulp.src(['node_modules/vue/dist/vue.min.js','node_modules/bootstrap/dist/js/bootstrap.js','src/js/**/*.js'])
    .pipe(concat('despegarapi.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
});

gulp.task('copy-html', function () {
  gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-fonts', function () {
  gulp.src('node_modules/bootstrap/dist/fonts/**')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('watch', ['styles', 'scripts', 'copy-html', 'copy-fonts'], function () {
  gulp.watch([
    'src/styles/**/*.scss'
  ], ['styles']);

  gulp.watch([
    'src/scripts/**/*.js'
  ], ['scripts']);

  gulp.watch([
    'src/index.html'
  ], ['copy-html']);
});

gulp.task('default', ['watch']);
