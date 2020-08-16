var { gulp, src, dest, watch, series, parallel } = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');
var del = require('del');
var fs = require('fs');
var path = require('path');

// Configuration
const outputFileName = 'Wanikani Item Tagger.user.js';
const outputCSSFile = 'userscript.build.css';
const developBuildFolder = 'output/';
const releaseFolder = 'dist/';

function clean() {
  return del(`${developBuildFolder}/*`);
}

var build = series(buildCss, buildUserscript);

function buildUserscript() {
  var userscriptHeader = fs.readFileSync('src/index.js');
  var userscriptFooter = fs.readFileSync('src/footer.js');
  var userscriptCssRaw = fs.readFileSync(`output/${outputCSSFile}`);
  var userscruptCssJsFooter = `var userscriptCss = \`\n${userscriptCssRaw}\n\`;`;

  var headerText = [
    userscriptHeader,
    '',
    ''
  ].join('\n');

  var footerText = [
    '',
    '',
    userscruptCssJsFooter,
    userscriptFooter
  ].join('\n');

  return src([
    'src/**/*.js',
    '!src/footer.js',
    '!src/index.js'
  ])
    .pipe(concat(outputFileName, { newLine: '\r\n\r\n' }))
    .pipe(header(headerText))
    .pipe(footer(footerText))
    .pipe(dest(developBuildFolder));
}

function buildCss() {
  var autogeneratedHeaderComment = fs.readFileSync('gulp/css-autogen-header.css');

  // If production, no need to add this header
  autogeneratedHeaderComment = false ? '' : autogeneratedHeaderComment;

  return src([
    'src/css/*.css'
  ])
    .pipe(concat(outputCSSFile, { newLine: '\r\n\r\n' }))
    .pipe(header(autogeneratedHeaderComment))
    .pipe(dest(developBuildFolder));
}

exports.build = series(clean, build);
exports.clean = clean;

exports.default = exports.build;
