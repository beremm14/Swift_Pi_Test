// Node.js modules
const path = require('path');

// External modules,
// npm install --save-dev gulp gulp-changed gulp-typescript gulp-sourcemapsgulp-using 
// npm install --save-dev typescript del run-sequence merge-stream
const gulp       = require('gulp'),
      changed    = require('gulp-changed'),
      ts         = require('gulp-typescript'),
      sourcemaps = require('gulp-sourcemaps'),
      using      = require('gulp-using'),
      typescript = require('typescript'),
      del        = require('del'),
      sequence   = require('run-sequence'),
      merge      = require('merge-stream');

const tsProject = ts.createProject("tsconfig.json");

let hasError = false;
let finalMessage = '';
const sep = '----------------------------------------------------------------------------';

gulp.task('default', ['run']);

gulp.task('run', ['build']);

gulp.task('cleanAndBuild', function (done) {
    sequence('clean', 'build', done);
});

gulp.task('build', function (done) {
    console.log("Task build gestartet");
    sequence('transpile', 'copyFiles', () => {
        console.log(finalMessage);
    });
});

gulp.task('clean', function (done) {
    console.log("Task clean gestartet");
    const toDelete = ['dist/*'];
    for (let s of toDelete) {
        console.log(' --> deleting ' + s);
    }
    return del(toDelete);
});

gulp.task('transpile', function (done) {
    const tsResult = gulp.src('src/**/*.ts', { follow: true, followSymlinks: true })
        .pipe(changed('dist', { extension: '.js' }))
        .pipe(using({ prefix: '  --> Transpiling file', path: 'cwd', color: 'green', filesize: false }))
        .pipe(sourcemaps.init())
        .pipe(tsProject({ error: myReporter, finish: myFinishHandler }))
        .js.pipe(sourcemaps.mapSources(
            function (sourcePath, file) {
                return sourcePath.substr(0);
            })
        )
        .pipe(sourcemaps.write('./', { sourceRoot: __dirname + '/src'}))
        .pipe(gulp.dest('dist'));
    return tsResult;
});

gulp.task('copyFiles', function (done) {

    const copyPugViews =
        gulp
            .src('src/views/**/*.pug')
            .pipe(changed('dist/views', { extension: '.pug' }))
            .pipe(using({ prefix: '  --> Copying file', path: 'cwd', color: 'blue', filesize: false }))
            .pipe(gulp.dest('dist/views/'));


    const copyPublic =
        gulp
            .src('src/public/**/*')
            .pipe(changed('dist/public', {}))
            .pipe(using({ prefix: '  --> Copying file', path: 'cwd', color: 'blue', filesize: false }))
            .pipe(gulp.dest('dist/public/'));

    return merge(copyPugViews, copyPublic);
});

const cache = {};

function myReporter(error) {
    if (cache[error.message]) {
        return;
    }
    cache[error.message] = true;
    console.log(error.message);
}


function myFinishHandler(results) {
    let msg = sep;

    const showErrorCount = (count, errorTyp) => {
        if (count === 0) {
            return;
        }
        hasError = true;
        msg += '\nTypescript: ' + count.toString() + ' ' + errorTyp + ' errors.';
    }

    showErrorCount(results.transpileErrors, '');
    showErrorCount(results.optionsErrors, 'options');
    showErrorCount(results.syntaxErrors, 'syntax');
    showErrorCount(results.globalErrors, 'global');
    showErrorCount(results.semanticErrors, 'semantic');
    showErrorCount(results.declarationErrors, 'declaration');
    showErrorCount(results.emitErrors, 'emit');

    if (hasError) {
        msg += '\n' + sep;
    }

    if (results.emitSkipped) {
        msg += '\nTypeScript: emit failed';
    } else if (hasError) {
        msg += '\nTypeScript: emit succeeded (with errors)';
    } else {
        msg += '\nTypeScript: emit succeeded (no errors)';
    }

    finalMessage = msg;
}
