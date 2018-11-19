const path = require('path');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const header = require('gulp-header');
const replace = require('gulp-replace');
const rimraf = require('rimraf');
const babel = require('gulp-babel');
const debug = require('gulp-debug');
const getBabelConfig = require('./getBabelConfig');
const postcssConfig = require('./postcssConfig')
const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json'));
const paths = 'src/**/style/index.scss';
const libDir = path.join(cwd, 'lib');
const esDir = path.join(cwd, 'es');
const distDir = path.join(cwd, 'dist');

gulp.task('clean', () => {
  rimraf.sync(distDir);
});

function buildCssJs(modules) {
  gulp
    .src('src/**/style/index.js')
    .pipe(replace(/\/style\/?'/g, "/style/css'"))
    .pipe(replace(/\.scss/g, '.css'))
    .pipe(
      rename({
        basename: 'css',
        extname: '.js',
      })
    )
    .pipe(gulp.dest(modules === false ? esDir : libDir));
}


function copyScss(modules) {
  gulp
    .src('src/**/style/*.scss')
    .pipe(gulp.dest(modules === false ? esDir : libDir))
  gulp
    .src('src/**/style/*.scss')
    .pipe(scss())
    .pipe(gulp.dest(modules === false ? esDir : libDir))
}

function compile(modules) {
  rimraf.sync(modules !== false ? libDir : esDir);
  copyScss(modules);
  buildCssJs(modules);
  const source = ['src/**/*.js', 'src/**/*.jsx'];
  gulp
    .src(source)
    .pipe(debug())
    .pipe(babel(getBabelConfig(false)))
    .on('error', function(err) {
      console.log('Less Error!', err.message);
    })
    .pipe(gulp.dest(modules === false ? esDir : libDir));
}

gulp.task('compile-with-es', () => {
  compile(false);
});

gulp.task('compile', () => {
  compile();
});

gulp.task('dist', () => {
  const banner = [
    '/*!',
    ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)',
    ' * Copyright <%= new Date().getFullYear() %> JDCF2E, Inc.',
    ' * Licensed under the <%= pkg.license %> license',
    ' */',
    '',
  ].join('\n');
  gulp
    .src(paths)
    .pipe(scss())
    //.pipe(gulp.dest('lib'))
    .pipe(postcss(postcssConfig.plugins))
    .pipe(concat(`${pkg.name}.css`))
    .pipe(header(banner, {pkg}))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    //.pipe(cleanCSS())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
  gulp.watch(paths, ['dist']);
});

gulp.task('dev', ['clean'], () => {
  gulp.start(['dist', 'watch']);
});
