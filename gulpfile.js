var { gulp, src, dest, watch, series, parallel } = require('gulp');
var concat = require('gulp-concat');
var footer = require('gulp-footer');
var del = require('del');
var fs = require('fs');

const outputFileName = 'Wanikani Item Tagger.user.js';

function clean() {
  return del('dist/*');
}

function build() {
  var userscriptFooter = fs.readFileSync('src/footer.js');
  
  return src([
    'src/**/*.js',
    '!src/footer.js'
  ])
    .pipe(concat(outputFileName, { newLine: '\r\n\r\n' }))
    .pipe(footer(userscriptFooter))
    .pipe(dest('dist/'));
}

exports.build = series(clean, build);
exports.clean = clean;

exports.default = exports.build;
