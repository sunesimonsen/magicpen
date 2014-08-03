var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var del = require('del');
var using = require('gulp-using');

var paths = {
    scripts: [
        'lib/magicpen-license.js',
        'lib/magicpen-namespace.js',
        'lib/magicpen-es4-compatible.js',
        'lib/magicpen-es5-compatible.js',
        'lib/magicpen-utils.js',
        'lib/magicpen-default-format.js',
        'lib/magicpen-core.js',
        'lib/magicpen-text-serializer.js',
        'lib/magicpen-ansi-serializer.js',
        'lib/magicpen-html-serializer.js',
        'lib/magicpen-module.js'
    ]
};

gulp.task('test', function (cb) {
    process.env["ISCOVERAGE"] = true;
    gulp.src(['magicpen.js'])
        .pipe(istanbul())
        .on('finish', function () {
            gulp.src(['test/*.spec.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports())
                .on('end', cb);
        });
});

gulp.task('scripts', ['clean'], function () {
    return gulp.src(paths.scripts)
        .pipe(concat('magicpen.js'))
        .pipe(insert.transform(function (contents) {
            var indentedContents = contents
                .replace(/^/gm, '    ')
                .replace(/\/\*(global|exported).*/g, '');
            return "(function () {\n" +
                indentedContents + "\n" +
                "}());";
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('clean', function (cb) {
    del(['magicpen.js'], cb);
});

gulp.task('default', ['scripts']);
