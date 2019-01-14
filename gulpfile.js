var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    upmodul = require("gulp-update-modul"),
    browserSync = require('browser-sync'),
    jsMinify = require('gulp-minify'),
    gulpif = require('gulp-if'),
    clean = require('gulp-clean')
    sourcemaps = require('gulp-sourcemaps');

var isProd = 'production' === process.env.NODE_ENV;
var isDev = !isProd;

gulp.task('sass', function() {
    return gulp.src(['app/sass/**/*.sass', 'app/sass/**/*.scss'])
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(sass({
            outputStyle: 'extended'
        }).on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
            cascade: true
        }))
        .pipe(gulpif(isProd, cssnano()))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulpif(isDev, sourcemaps.write('./')))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('scripts', function() {
    return gulp.src([
            'app/libs/jquery/dist/jquery.min.js',
            'app/libs/slick/slick.min.js'
        ])
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(concat('libs.min.js'))
        .pipe(gulpif(isProd, uglify()))
        .pipe(gulpif(isDev, sourcemaps.write('./')))
        .pipe(gulp.dest('app/js/'));
});

gulp.task('scriptsCommon', function() {
    return gulp.src('app/js/common.js')
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(gulpif(isProd, jsMinify({
            ext: {
                src: '',
            },
            noSource: true
        })))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulpif(isDev, sourcemaps.write('./')))
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('css-libs', ['sass'], function() {
    return gulp.src('app/css/libs.css')
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(gulpif(isProd, cssnano()))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulpif(isDev, sourcemaps.write('./')))
        .pipe(gulp.dest('app/css'));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false,
        logLevel: 'silent',
        open: false
    });
});

gulp.task('clean', function() {
     return gulp.src(['dist/*'], {read: false}) .pipe(clean());
});

gulp.task('clear', function() {
    return cache.clearAll();
});

gulp.task('img', function() {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            une: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('fonts', function() {
    return gulp.src(['app/fonts/**/*'])
        .pipe(gulp.dest('app/fonts'))
});

gulp.task('watch', function() {
    gulp.start('update-modul');
    gulp.watch(['app/sass/**/*.sass', 'app/sass/**/*.scss'], ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/*.js').on("change", browserSync.reload)
});

//update-modul
gulp.task('update-modul', function() {
    gulp.src('package.json')
        .pipe(upmodul('latest', 'true'));
});

gulp.task('build', ['clean', 'img', 'css-libs', 'scripts', 'scriptsCommon', 'fonts'], function() {

    var buildCss = gulp.src([
            'app/css/libs.min.css',
            'app/css/main.min.css',
        ])
        .pipe(gulp.dest('dist/css'));


    var buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));

    var buildLibsJs =
        gulp.src([
            'app/js/libs.min.js',
            'app/js/common.min.js'
        ])
        .pipe(gulp.dest('dist/js'));

    var buildTemplates = gulp.src('app/templates/*.html')
        .pipe(gulp.dest('dist/templates'));

    var buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));

});

gulp.task('default', ['build', 'browser-sync', 'watch']);
