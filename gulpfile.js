var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task('test', function (cb) {
    gulp.src(['magicpen.js'])
        .pipe(istanbul())
        .on('finish', function () {
            gulp.src(['test/*.spec.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports())
                .on('end', cb);
        });
});
