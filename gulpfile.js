const proxy = "builder";
let webPackSetting = true;
let typeScriptSetting = false;


var fs = require('fs');
const { Transform } = require('stream');
const gulp = require('gulp');
const rename = require('gulp-rename');
const del = require('del');
const notify = require("gulp-notify");
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
// pug
const pug = require('gulp-pug');
// css
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const purgecss = require('gulp-purgecss');
const critical = require('./critical.js');
// webpack
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
//js
const importFile = require('gulp-file-include');
const uglify = require('gulp-uglify-es').default;

//img

var prettyHtml = require('gulp-pretty-html');
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
//svg
const svgSprites = require("gulp-svg-sprites");
// eslint
const eslint = require('gulp-eslint');

// type script
const browserify = require("browserify");
const source = require('vinyl-source-stream');
const tsify = require("tsify");
const buffer = require('vinyl-buffer');
const glob = require("glob")
const merge = require('merge-stream');
const path = require('path');




const paths = {
    root: './dist',
    templateStyles: {
        main: './src/assets/styles/pages',
    },
		templates: {
				pages: './src/pug/pages/*.pug',
				src: './src/pug/**/*.pug',
				dest: './dist'
    },
		styles: {
				main: './src/assets/styles/main.scss',
				importsFiles: 'src/assets/styles/assets/templates.scss',
				stylesPages: 'src/assets/styles/pages',
				src: './src/**/*.scss',
				dest: './dist/assets/styles'
		},
		// каждая страница собирается в отдельный бандл, чтобы не тащить
		// стили всех страниц на каждую страницу
		stylesPages: {
				src: './src/assets/styles/pages/*.scss',
				dest: './dist/assets/styles/pages'
		},
		scripts: {
				src: './src/**/*.js',
				dest: './dist/assets/scripts/'
		},
		ts: {
				src: './src/assets/scripts/gulp-modules/ts/*.ts',
				dest: './dist/assets/scripts/'
		},
		fonts: {
				src: './src/assets/fonts/**/*',
				dest: './dist/assets/fonts'
		},
		images: {
				src: './src/assets/images/**/*',
				dest: './dist/assets/images'
		},
		video: {
				src: './src/assets/video/**/*',
				dest: './dist/assets/video'
		},
		svgSprite: {
				src: './src/assets/svg-sprite/*.svg',
				dest: './src/assets/svg-sprite/sprite/'
		},
		gulpModules: {
				src: './src/assets/scripts/gulp-modules/*.js',
				dest: './dist/assets/scripts/'
		},
		libs: {
				src: './src/assets/scripts/libs/libs.js',
				dest: './src/assets/scripts/gulp-modules/'
		},
		static: {
				src: './src/static/**/*.*',
				dest: './dist/static/'
		},
}

// слежка
function watch() {
    gulp.watch(paths.templateStyles.main, watchScssTemplates);
		gulp.watch(paths.styles.src, gulp.series(gulp.parallel(styles, stylesPages), criticalCss));
    gulp.watch(paths.templates.src, gulp.series(templates, criticalCss));
    if (webPackSetting) {
      gulp.watch(paths.scripts.src, scripts); //for webpack
    }
    gulp.watch(paths.gulpModules.src, gulpModules);
    if (typeScriptSetting) {
      gulp.watch(paths.ts.src, typeScript);
    }

		gulp.watch(paths.ts.src, testJsLint);
		gulp.watch(paths.images.src, images);
		gulp.watch(paths.video.src, video);
		gulp.watch(paths.fonts.src, fonts);
		gulp.watch(paths.libs.src, libs);
		gulp.watch(paths.static.src, static);
		gulp.watch('./src/pug/**/*.html', templates);
		gulp.watch('./src/assets/svg-sprite/*.*', svgSprite);
}

// creater templates scss

function watchScssTemplates() {
    scssTemplateCreater();
    return gulp.src(paths.templates.pages);
        // .pipe(gulp.dest(paths.root));
}

function scssTemplateCreater() {

  fs.readdir(paths.styles.stylesPages, (err, nameFiles) => {
    const filesNameWithoutExt =  nameFiles.map(el => el.replace(/\.scss/g, ''));
    const contentImportsFiles =  filesNameWithoutExt.reduce((acc, el) => acc += `@import './pages/${el}';\n`, ``);
    console.log(paths.styles.importsFiles, contentImportsFiles);
    fs.writeFile(paths.styles.importsFiles, contentImportsFiles, null, ()=>{});
  });

};


// следим за build и релоадим браузер
function server() {
	browserSync.init({
	  server: {
		baseDir: './dist',
		serveStaticOptions: {
            extensions: ['html']
        },
		routes: {},
		middleware: function (req, res, next) {
			if (/\.json|\.txt|\.html/.test(req.url) && req.method.toUpperCase() == 'POST') {
				console.log('[POST => GET] : ' + req.url);
				req.method = 'GET';
			}
			next();
		}
	  },
	  // server: paths.root,
	  // notify: false,
	  // proxy,
	});
	browserSync.watch([`${paths.root}/**/*.{html,pug,js,json,png,jpg,gif}`], browserSync.reload);
	browserSync.watch(`${paths.root}/**/*.css`,  () => {
	  browserSync.reload('*.css')
	});
  }



// очистка
function clean() {
		return del(paths.root);
}

// webpack-чанки мають хеш у імені (form.<hash>.bundle.js тощо) і при кожній
// збірці отримують новий хеш — старі версії webpack сам не видаляє, тож без
// цього вони назавжди лишаються в dist/assets/scripts/ поряд із новими.
function cleanScripts() {
		return del(paths.scripts.dest);
}

// pug
function templates() {
	return gulp.src(paths.templates.pages)
	.pipe(pug({ pretty: true }))
	.pipe(prettyHtml({
		unformatted: ['fieldset'],
	}))
	.pipe(gulp.dest(paths.root));
}

// eslint
function testJsLint() {
	return gulp.src(paths.ts.src).
	pipe(eslint()).
	pipe(eslint.format())
	// .pipe(eslint.failAfterError());
}

// scss
function styles() {
		return gulp.src(paths.styles.main)
		.pipe(sourcemaps.init()) // инциализация sourcemap'ов
		.pipe(sass({
				outputStyle: 'compressed' // минифицированный CSS
		}))
		.on('error', notify.onError({
				title: 'SCSS',
				message: '<%= error.message %>' // вывод сообщения об ошибке
		}))
		.pipe(autoprefixer({
				cascade: false
		}))
		.pipe(rename({ suffix: '.min' })) // main.scss -> main.min.css, critical.scss -> critical.min.css
		.pipe(sourcemaps.write('.')) // отдельный .map, а не inline внутри CSS
		.pipe(gulp.dest(paths.styles.dest))
}

// общие импорты, которые нужны каждому page-бандлу:
// переменные и миксины, без них страницы не скомпилируются
const SHARED_SCSS = [
		"@import 'assets/vars';",
		"@import 'assets/smart-grid';",
		"@import 'assets/mixins';",
		''
].join('\n');

// дописывает SHARED_SCSS в начало файла перед компиляцией.
// gulp-sass берёт исходник из file.contents, а относительные @import
// внутри страницы резолвятся от file.path, поэтому подмена безопасна
function prependShared() {
		return new Transform({
				objectMode: true,
				transform(file, enc, callback) {
						if (file.isBuffer()) {
								file.contents = Buffer.concat([Buffer.from(SHARED_SCSS), file.contents]);
						}
						callback(null, file);
				}
		});
}

// scss страниц
function stylesPages() {
		return gulp.src(paths.stylesPages.src)
		.pipe(prependShared())
		.pipe(sourcemaps.init())
		.pipe(sass({
				outputStyle: 'compressed',
				includePaths: ['./src/assets/styles']
		}))
		.on('error', notify.onError({
				title: 'SCSS pages',
				message: '<%= error.message %>'
		}))
		.pipe(autoprefixer({
				cascade: false
		}))
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.stylesPages.dest))
}

// критичний CSS першого екрана головної.
// Читає готові dist/index.html + dist/**/*.css, тому має йти після styles,
// stylesPages і templates. Логіка — в ./critical.js
function criticalCss() {
		return critical();
}

// fonts
function fonts() {
		return gulp.src(paths.fonts.src)
				.pipe(gulp.dest(paths.fonts.dest))
}

// php
function static() {
		return gulp.src(paths.static.src)
				.pipe(gulp.dest(paths.static.dest))
}

// svg-sprite
function svgSprite() {
		return gulp.src(paths.svgSprite.src)
				.pipe(svgSprites({
					mode: "symbols",
					preview: false,
					selector: "icon-%f",
					svg: {
						symbols: 'symbol_sprite.php'
					}
				}))
				.pipe(gulp.dest(paths.svgSprite.dest))
}

// images
function images() {
		return gulp.src(paths.images.src)
				.pipe(gulp.dest(paths.images.dest));
}

// video
function video() {
		return gulp.src(paths.video.src)
				.pipe(gulp.dest(paths.video.dest));
}

gulp.task('clear', function () {
	return cache.clearAll();
})

// webpack
function scripts() {
		return gulp.src(paths.scripts.src)
				.pipe(gulpWebpack(webpackConfig, webpack))
				.pipe(gulp.dest(paths.scripts.dest));
}

//gulp-scripts
function gulpModules() {
		return gulp.src(paths.gulpModules.src)
				.pipe(plumber({
						errorHandler: notify.onError({
						title: 'JavaScript',
						message: '<%= error.message %>' // выводим сообщение об ошибке
						})
				}))
		.pipe(importFile({ //
			prefix: '@@', // импортим все файлы, описанные в результируещем js
			basepath: '@file' //
		}))
		.pipe(gulp.dest(paths.gulpModules.dest))
}



//ts-scripts
function typeScript() {
	var files = glob.sync(paths.ts.src);
	return merge(files.map(function (file) {
		return browserify({
				entries: file,
				debug: true
			})
			.plugin(tsify)
			.bundle()
			.pipe(source(path.basename(file, '.ts') + ".js"))
			.pipe(buffer())
			.pipe(sourcemaps.init({
				loadMaps: true
			}))
			.pipe(uglify())
			.pipe(sourcemaps.write("./"))
			.pipe(gulp.dest(paths.ts.dest))
	}));
}




//libs-scripts
function libs() {
	return gulp.src(paths.libs.src)
		.pipe(importFile({ //
			prefix: '@@', // импортим все файлы, описанные в результируещем js
			basepath: '@file' //
		}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.libs.dest))
}



exports.templates = templates;
exports.styles = styles;
exports.stylesPages = stylesPages;
exports.critical = criticalCss;

let additionalTask = [];


if (webPackSetting) {
  // `gulp scripts` викликається напряму для прод-збірки (npm run prod) — там
  // немає загального `clean` перед ним, тож чистимо тільки dist/assets/scripts/.
  // У watch-потоці (`default`) лишається сирий `scripts` без очистки: там
  // повний `clean` уже стоїть на старті серії, і чистити щоразу при watch-ребілді
  // було б повільно.
  exports.scripts = gulp.series(cleanScripts, scripts);
  additionalTask.push(scripts)
}
if (typeScriptSetting) {
  exports.typeScript = typeScript;
  additionalTask.push(typeScript)
}



exports.gulpModules = gulpModules;
exports.testJsLint = testJsLint;
exports.images = images;
exports.video = video;
exports.clean = clean;
exports.fonts = fonts;
exports.svgSprite = svgSprite;
exports.libs = libs;
exports.static = static;
exports.watchScssTemplates = watchScssTemplates;


gulp.task('default', gulp.series(
    watchScssTemplates,
		svgSprite,
		clean,
    libs,
    ...additionalTask,
		gulp.parallel(styles, stylesPages, templates, fonts, gulpModules, testJsLint, images, video, static),
		criticalCss,
		gulp.parallel(watch, server)
));


// -- BUILD PRODUCTION
const pathsProd = {
	root: './prod',
	templates: {
		src: './dist/*.html',
		dest: './prod'
	},
	style: {
		// ** — чтобы забрать и pages/*.min.css, base сохраняет вложенность
		src: './dist/assets/styles/**/*.css',
		base: './dist/assets/styles',
		dest: './prod/assets/styles',
	},
	js: {
		src: './dist/assets/scripts/*.js',
		dest: './prod/assets/scripts',
	},
	fonts: {
		src: './dist/assets/fonts/**/*',
		dest: './prod/assets/fonts'
	},
	static: {
		src: './dist/static/**/*.*',
		dest: './prod/static/'
	},
	images: {
		src: './dist/assets/images/**/*',
		dest: './prod/assets/images'
	},
}
// CLEAN PROD FOLDER
function _clean() {
	return del(pathsProd.root);
}
// HTML
function _templates() {
	return gulp.src(pathsProd.templates.src)
		.pipe(gulp.dest(pathsProd.root));
}
// CSS
//
// PurgeCSS. Перша спроба 2026-08-04 зламала прод, бо сканувала `dist/*.html` —
// pug-збірку цього репозиторію, яка НЕ еквівалентна живій WP-розмітці. Тому
// тепер джерело — знімок реальних сторінок сайту в `.purgecss-content/`, який
// наповнює окрема задача `purgeContent` (див. нижче).
//
// Ріжеться тільки `main.min.css`: у сторінкових бандлах зайвого ~2%, а ризик
// той самий, тож вони проходять повз.
//
// Якщо знімка немає — крок мовчки пропускається (віддаємо повний CSS). Краще
// залити незрізаний файл, ніж зрізаний за порожнім корпусом.
const PURGE_CONTENT_DIR = './.purgecss-content';

// Класи, яких немає в розмітці на момент сканування, бо їх додає JS або
// бібліотека вже в браузері. Саме ця категорія й зламала прод минулого разу.
const PURGE_SAFELIST = {
	standard: [
		/^iti/, /^intl-tel-input/,   // прапорці країн, генерується intl-tel-input
		/^swiper/,                   // рантайм-модифікатори Swiper
		/^headroom/,                 // стани хедера
		/^toast/,                    // тости створює form-view.js через addToast()
		/^field--/,                  // стани полів форми (data-status -> клас)
		/^form-/,                    // родина форми цілком
		/^js-/,                      // класи-стани з префіксом js-
		/^mobile-callback-popup/,    // плаваюча кнопка дзвінка
		/^text-style-/, /^color-/,   // типографіка й кольори: ними верстає редактор
		// стани, які вішає JS проєкту (зібрано з classList.add/toggle по src/)
		'active', 'selected', 'closed', 'hidden-for-video', 'is-active', 'is-open',
		'is-switching', 'left-side', 'safari', 'popup-open', 'accordion_open',
		'menu__active', 'select-arrow-active', 'select-hide', 'flats-nav__tab--active',
		'tablet', 'mobile', 'desktop',
	],
	// deep/greedy — для віджетів, чию внутрішню розмітку цілком будує бібліотека
	deep: [/^iti/, /^toast/, /^swiper/],
	// `^data-` — принципове правило, а не латка: у цьому проєкті всі data-*
	// атрибути є хуками для JS і виставляються в рантаймі, тож у статичній
	// розмітці їх немає й PurgeCSS вважає такі правила мертвими. Без цього
	// рядка зрізаються стани полів форми
	// ([data-status=field--error] .input-message і подібні) — форма виглядає
	// цілою й ламається лише коли користувач помилиться у полі.
	// Увага: patterns тут матчаться проти частин селектора БЕЗ квадратних
	// дужок, тому /\[data-/ мовчки не працює — перевірено.
	greedy: [/^iti/, /^toast/, /^data-/],
};

// Крім знімка розмітки, скануємо ще й вихідний JS. Частину класів верстка не
// містить взагалі — вони існують лише в рядкових шаблонах (`insertAdjacentHTML`
// у modules/form.js вставляє `.button-30--success-popup`, form-view.js будує
// тости) та в `classList.add(...)`. Без цього такі правила зрізаються, і
// зламане видно тільки після відправки форми.
// libs/ виключено: там мініфіковані вендорні файли, з яких екстрактор витягує
// сміттєві токени і безпідставно рятує зайве.
const PURGE_JS_SOURCES = [
	'./src/assets/scripts/**/*.js',
	'!./src/assets/scripts/libs/**/*.js',
	'!./src/assets/scripts/gulp-modules/**/*.js',
	'./src/pug/components/**/*.js',
];

function purgeContentFiles() {
	if (!fs.existsSync(PURGE_CONTENT_DIR)) return null;
	const files = fs.readdirSync(PURGE_CONTENT_DIR).filter(f => f.endsWith('.html'));
	return files.length ? [`${PURGE_CONTENT_DIR}/*.html`, ...PURGE_JS_SOURCES] : null;
}

function passthrough() {
	return new Transform({ objectMode: true, transform(file, enc, cb) { cb(null, file); } });
}

function _styles() {
	const content = purgeContentFiles();
	if (!content) {
		console.log('\x1b[33m%s\x1b[0m', `PurgeCSS пропущено: немає ${PURGE_CONTENT_DIR}. Спочатку: npx gulp purgeContent`);
	}

	const main = gulp.src('./dist/assets/styles/main.min.css', { base: pathsProd.style.base })
		.pipe(autoprefixer({ cascade: false }))
		.pipe(content ? purgecss({ content, safelist: PURGE_SAFELIST }) : passthrough())
		.pipe(cleanCSS())
		.pipe(gulp.dest(pathsProd.style.dest));

	const rest = gulp.src([pathsProd.style.src, '!./dist/assets/styles/main.min.css'], { base: pathsProd.style.base })
		.pipe(autoprefixer({ cascade: false }))
		.pipe(cleanCSS())
		.pipe(gulp.dest(pathsProd.style.dest));

	return merge(main, rest);
}

// Знімок живої розмітки для PurgeCSS.
// Sitemap самого по собі НЕ досить: у ньому немає /3d/ і сторінки 404, а вони
// мають власну розмітку — перевірено, без них зрізалось на 2 KB більше, ніж можна.
const PURGE_SITE = 'https://riverville.com.ua';
const PURGE_EXTRA_URLS = [`${PURGE_SITE}/3d/`, `${PURGE_SITE}/neisnuyucha-storinka-404/`];

function fetchUrl(url) {
	return new Promise((resolve, reject) => {
		require('https').get(url, res => {
			if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
				resolve(fetchUrl(res.headers.location));
				return;
			}
			const chunks = [];
			res.on('data', c => chunks.push(c));
			res.on('end', () => resolve(Buffer.concat(chunks).toString()));
		}).on('error', reject);
	});
}

const locsOf = xml => [...xml.matchAll(/<loc>(?:<!\[CDATA\[)?([^\]<]+)/g)].map(m => m[1].trim());

async function purgeContent() {
	const index = await fetchUrl(`${PURGE_SITE}/sitemap.xml`);
	const urls = new Set(PURGE_EXTRA_URLS);

	for (const sub of locsOf(index)) {
		locsOf(await fetchUrl(sub)).forEach(u => urls.add(u));
	}

	del.sync([`${PURGE_CONTENT_DIR}/**`], { force: true });
	fs.mkdirSync(PURGE_CONTENT_DIR, { recursive: true });

	let i = 0;
	for (const url of urls) {
		i += 1;
		try {
			fs.writeFileSync(`${PURGE_CONTENT_DIR}/p${i}.html`, await fetchUrl(url));
		} catch (e) {
			console.log(`  пропущено ${url}: ${e.message}`);
		}
	}
	console.log(`Знімок оновлено: ${i} сторінок у ${PURGE_CONTENT_DIR}`);
}

// FONTS
function _fonts() {
	return gulp.src(pathsProd.fonts.src)
		.pipe(gulp.dest(pathsProd.fonts.dest))
}

// PHP
function _static() {
	return gulp.src(pathsProd.static.src)
		.pipe(gulp.dest(pathsProd.static.dest))
}
// JS
function _scripts() {
	return gulp.src(pathsProd.js.src)
		.pipe(gulp.dest(pathsProd.js.dest))
}
// IMG
function _images() {
	return gulp.src(pathsProd.images.src)
					.pipe(cache(imagemin([
						imagemin.gifsicle({
							interlaced: true
						}),
						imagemin.jpegtran({
							progressive: true
						}),
						imageminJpegRecompress({
							loops: 5,
							min: 85,
							max: 95,
							quality: 'high'
						}),
						imagemin.svgo(),
						imagemin.optipng()
					], {
						verbose: true
					})))
		.pipe(gulp.dest(pathsProd.images.dest))
}

exports._templates = _templates;
exports._fonts = _fonts;
exports._static = _static;
exports._clean = _clean;
exports._scripts = _scripts;
exports._styles = _styles;
exports._images = _images;
exports.purgeContent = purgeContent;

gulp.task('prod', gulp.series(
	_clean,
	criticalCss, // до _styles: той забирає dist/assets/styles/**/*.css разом із critical/
	gulp.parallel(_templates, _fonts, _static, _scripts, _styles, _images)
));
