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
const ts = require('gulp-typescript');
const merge2 = require('merge2');
const getBabelConfig = require('./getBabelConfig');
const postcssConfig = require('./postcssConfig');
const tsConfig = require('./tsconfig');
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
    .src('src/**/style/index.tsx')
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
    .pipe(gulp.dest(modules === false ? esDir : libDir));
  gulp
    .src('src/**/style/*.scss')
    .pipe(scss())
    .pipe(gulp.dest(modules === false ? esDir : libDir));
}

function babelCompile(js,modules) {
  return js.pipe(debug())
    .pipe(babel(getBabelConfig(false)))
    .on('error', function(err) {
      console.log('Less Error!', err.message);
    })
    .pipe(gulp.dest(modules === false ? esDir : libDir));
}

function compile(modules) {
  rimraf.sync(modules !== false ? libDir : esDir);
  copyScss(modules);
  buildCssJs(modules);
  const source = ['src/**/*.tsx'];

  const tsResult = gulp.src(source)
    .pipe(ts(tsConfig()));

  const tsStream = babelCompile(tsResult.js,modules);
  //const tsd = tsResult.dts.pipe(gulp.dest(modules === false ? esDir : libDir))
   return merge2([tsStream,])
}

gulp.task('compile-with-es', () => {
  compile(false);
});

gulp.task('compile-with-common', () => {
  compile();
});

gulp.task('compile',gulp.parallel('compile-with-es','compile-with-common'))

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
  gulp.watch(paths, gulp.series('dist'));
});

gulp.task(
  'dev',
  gulp.series('clean', () => {
    gulp.parallel('dist', 'watch');
  })
);
