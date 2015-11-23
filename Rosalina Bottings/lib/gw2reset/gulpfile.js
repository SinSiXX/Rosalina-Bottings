var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')({
    rename: {
      'gulp-6to5': 'to5'
    }
  }),
  package_json = require('./package.json'),
  bower_json = require('./bower.json'),
  version,
  build_date,
  year,
  paths = {
    jsSrc: {
      core: 'src/core.js',
      all: ['src/intro.js', 'src/core.js', 'src/outro.js']
    },
    baseDest: 'dist/',
    test: {
      dir: 'test/',
      es5: 'tests.es5.js',
      es6: 'tests.es6.js'
    }
  };

(function () {
  var d = new Date();

  year = d.getFullYear();
  build_date = year + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}());

if (package_json.version !== bower_json.version) {
  throw('package.json and bower.json version numbers do not match!');
}

version = package_json.version;

gulp.task('clean-dist', function() {
  return gulp.src(paths.baseDest, {read: false})
    .pipe(plugins.clean());
});

gulp.task('lint', function() {
  var eslintRules = {
    quotes: [1, 'single', 'avoid-escape'],
    'strict': 2,
    'global-strict': [1, 'always'], // build wraps it and makes it non-global
    'consistent-this': [0, 'self'],
    'brace-style': ['2', '1tbs'],
    'space-infix-ops': 1,
    'space-after-keywords': 1,
    'func-style': [2, 'expression'],
    'guard-for-in': 1,
    'no-else-return': 1,
    'no-with': 2,
    'radix': 2,
    'wrap-iife': [1, 'outside'],
    'no-nested-ternary': 2,
    'space-in-brackets': [1, 'never'],
    'space-unary-word-ops': 1,
    'no-plusplus': 1,
    'no-native-reassign': 0
  };

  return gulp.src(paths.jsSrc.core)
    .pipe(plugins.cached('lint'))
    .pipe(plugins.eslint(
      {
        rules: eslintRules,
        env: {
          browser: true
        }
      }
    ))
    .pipe(plugins.eslint.format());
});

var minify = function (src) {
  return src
    .pipe(plugins.cached('minify'))
    .pipe(plugins.concat('gw2resets.js'))
    .pipe(plugins.replace('%version%', version))
    .pipe(plugins.replace('%build_date%', build_date))
    .pipe(plugins.replace('%year%', year))
    .pipe(plugins.uglify({preserveComments: 'some'}))
    .pipe(plugins.rename('gw2reset_' + version + '.min.js'))
    .pipe(gulp.dest(paths.baseDest));
};

gulp.task('minify', ['clean-dist', 'lint'], function() {
  return minify(gulp.src(paths.jsSrc.all));
});

// tests are written with some ES6 code, compile down to
// ES5 so all modern browsers can run them.
gulp.task('buildtest', function() {
  return gulp.src(paths.test.dir + paths.test.es6)
    .pipe(plugins.cached('buildtest'))
    .pipe(plugins.to5())
    .pipe(plugins.rename(paths.test.es5))
    .pipe(gulp.dest(paths.test.dir));
});

gulp.task('gz', ['clean-dist', 'lint'], function() {
  return minify(gulp.src(paths.jsSrc.all))
    .pipe(plugins.cached('gz'))
    .pipe(plugins.gzip())
    .pipe(gulp.dest(paths.baseDest));
});

gulp.task('watch', function() {
  var watcher = gulp.watch([paths.jsSrc.core], ['lint']);
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

gulp.task('default', ['minify']);
