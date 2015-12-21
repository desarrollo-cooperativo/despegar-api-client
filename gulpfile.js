var gulp = require('gulp'),
   uglify = require('gulp-uglify'),
   rename = require('gulp-rename'),
   concat = require('gulp-concat'),
   minifyCss = require('gulp-minify-css');

gulp.task('minify', function () {
   gulp.src('src/js/app.js')
      .pipe(uglify())
      .pipe(rename({ extname: '.min.js' }))
      .pipe(gulp.dest('src/js'))
});

gulp.task('concat',['minify'],function(){
  gulp.src(['node_modules/vue/dist/vue.min.js','src/js/app.min.js'])
  .pipe(concat('despegarapi.min.js'))
  .pipe(gulp.dest('build'))
});

gulp.task('minify-css', function () {
   gulp.src('src/css/app.css')
      .pipe(minifyCss())
      .pipe(rename('app.min.css'))
      .pipe(gulp.dest('src/css/'))
});


gulp.task('css',['minify-css'], function () {
   gulp.src(['src/css/bootstrap.min.css','src/css/app.min.css'])
    .pipe(concat('despegarapi.min.css'))
  .pipe(gulp.dest('build'))
});

gulp.task('build', ['css', 'concat']);
