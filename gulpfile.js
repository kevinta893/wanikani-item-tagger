var { gulp, src, dest, watch, series, parallel } = require('gulp');
var concat = require('gulp-concat');
var footer = require('gulp-footer');
var del = require('del');
var fs = require('fs');

// Configuration
const outputFileName = 'Wanikani Item Tagger.user.js';
const developBuildFolder = 'output/';
const releaseFolder = 'dist/';

function clean() {
  return del(`${developBuildFolder}/*`);
}

function build() {
  var userscriptFooter = fs.readFileSync('src/footer.js');
  
  return src([
    'src/**/*.js',
    '!src/footer.js'
  ])
    .pipe(concat(outputFileName, { newLine: '\r\n\r\n' }))
    .pipe(footer(userscriptFooter))
    .pipe(dest(developBuildFolder));
}

exports.build = series(clean, build);
exports.clean = clean;

exports.default = exports.build;
