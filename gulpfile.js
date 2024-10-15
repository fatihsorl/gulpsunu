const { src, dest, watch, series, parallel } = require("gulp");  // Gulp'ın temel fonksiyonlarıdır.

const postcss = require('gulp-postcss'); // PostCSS kullanarak CSS dosyalarını işlemek için kullanılır.

const browserSync = require('browser-sync').create();  // Tarayıcıda canlı ön izleme ve otomatik yenileme işlemi sağlar.

const options = require("./config");  // `config.js` dosyasından yapılandırma seçeneklerini alır.

const clean = require("gulp-clean");  // Klasörleri ve dosyaları temizlemek için kullanılır.

const concat = require("gulp-concat");  // Birden fazla dosyayı tek bir dosyada birleştirmek için kullanılır.

const uglify = require('gulp-uglify');  // JavaScript dosyalarını minify etmek için kullanılır.

const includePartials = require("gulp-file-include");  // HTML'leri birleştirmek için kullanılır.


function livePreview(done) {
  browserSync.init({
    server: {
      baseDir: options.paths.dist.base,
    },
    port: options.config.port || 5000,
  });
  done();
}

// Triggers Browser reload
function previewReload(done) {
  console.log("\n\t" + logSymbols.info, "Reloading Browser Preview.\n");
  browserSync.reload();
  done();
}


function devStyles() {
    const tailwindcss = require("tailwindcss");
    const autoprefixer = require("autoprefixer");
    return src(`${options.paths.src.css}/**/*.{css}`)
      .pipe(postcss([tailwindcss(options.config.tailwindjs), autoprefixer()]))
      .pipe(concat({ path: "style.css" }))
      .pipe(dest(options.paths.dist.css));
  }
  
  function devHTML() {
    return src(`${options.paths.src.base}/**/*.html`)
      .pipe(includePartials({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(dest(options.paths.dist.base));
  }

  function devScripts() {
    return src([
      `./node_modules/jquery/dist/jquery.min.js`,
      `${options.paths.src.js}/**/*.js`,
      `!${options.paths.src.js}/**/external/*`,
    ])
      .pipe(concat({ path: "scripts.js" }))
      .pipe(dest(options.paths.dist.js));
  }

  function devClean() {
    console.log(
      "Cleaning dist folder for fresh start.\n"
    );
    return src(options.paths.dist.base, { read: false, allowEmpty: true }).pipe(
      clean()
    );
  }

  function devThirdParty() {
    return src(`${options.paths.src.thirdParty}/**/*`).pipe(
      dest(options.paths.dist.thirdParty)
    );
  }


// CSS görevi
function prodHTML() {
    return src(`${options.paths.src.base}/**/*.{html}`)
      .pipe(includePartials())
      .pipe(dest(options.paths.build.base));
  }
  
  function prodStyles() {
    const tailwindcss = require("tailwindcss");
    const autoprefixer = require("autoprefixer");
    const cssnano = require("cssnano");
    return src(`${options.paths.src.css}/**/*.css`)
      .pipe(
        postcss([
          tailwindcss(options.config.tailwindjs),
          autoprefixer(),
          cssnano(),
        ])
      )
      .pipe(dest(options.paths.build.css));
  }

  function prodScripts() {
    return src([
      `${options.paths.src.js}/*.js`,
      `${options.paths.src.js}/**/*.js`,
    ])
      .pipe(concat({ path: "scripts.js" }))
      .pipe(uglify())
      .pipe(dest(options.paths.build.js));
  }

  function prodClean() {
    console.log(
      "Cleaning build folder for fresh start.\n"
    );
    return src(options.paths.build.base, { read: false, allowEmpty: true }).pipe(
      clean()
    );
  }

// Gözlem görevini tanımla
function watchFiles() {
    watch(
      `${options.paths.src.base}/**/*.{html}`,
      series(devHTML, devStyles, previewReload)
    );
    watch(
      [options.config.tailwindjs, `${options.paths.src.css}/**/*.{css}`],
      series(devStyles, previewReload)
    );
    watch(`${options.paths.src.js}/*.js`, series(devScripts, previewReload));

    watch(
      `${options.paths.src.thirdParty}/**/*`,
      series(devThirdParty, previewReload)
    );
    console.log("\n\t", "Watching for Changes..\n");
  }

  function buildFinish(done) {
    console.log(
      `Production build is complete. Files are located at ${options.paths.build.base}\n`
    );
    done();
  }


exports.default = series(
    devClean, // Clean Dist Folder
    parallel(devStyles, devScripts, devHTML), //Run All tasks in parallel
    livePreview, // Live Preview Build
    watchFiles // Watch for Live Changes
  );

exports.prod = series(
    prodClean, // Clean Build Folder
    parallel(
      prodStyles,
      prodScripts,
      prodHTML,
    ), //Run All tasks in parallel
    buildFinish
  );