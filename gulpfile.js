var gulp        = require('gulp'),
    compass     = require('gulp-compass'),
    plumber     = require('gulp-plumber'),
    concat      = require('gulp-concat'),
    config      = {
                    // bootstrap_dir:   './npm_modules/bootstrap',
                    public_dir:     './dist',
                  };

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('compass', [], function() {
  return gulp.src(['app/views/**/*.scss'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('app.scss'))
    .pipe(gulp.dest(config.public_dir + '/scss'))
    .pipe(compass({
      // import_path: [config.bootstrap_dir + '/assets/stylesheets'],
      css: config.public_dir + '/css',
      sass: config.public_dir + '/scss'
    }))
    .pipe(gulp.dest(config.public_dir + '/css'));
});
