/**
 * Генератор критичного CSS.
 *
 * Ідея: беремо HTML, відрізаємо все від <body> до маркера cut (перший блок,
 * який завідомо нижче згину), збираємо звідти класи й data-атрибути — і лишаємо
 * в CSS тільки ті правила, чиї селектори повністю покриваються цим набором.
 *
 * Геометрії вьюпорта скрипт не знає, тому межа задається маркером вручну.
 * Зате не тягне за собою headless-браузер і працює за секунди.
 *
 * Використання:
 *   gulp critical                                          # усі сторінки з PAGES
 *   node critical.js                                       # усі сторінки з PAGES
 *   node critical.js infrastructure                        # тільки одна сторінка
 *   node critical.js infrastructure https://riverville.com.ua/infrastructure/  # з живої сторінки
 */

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

// Спільне для всіх сторінок.
const SHARED = {
	// Інлайновий CSS резолвить відносні url() від адреси ДОКУМЕНТА, а не від
	// папки стилю. Тому '../' з main.min.css треба переписати в абсолютний
	// шлях від кореня сайту — інакше всі шрифти й картинки ведуть у нікуди.
	urlBase: '/wp-content/themes/3d/assets/',
	// Класи, яких може не бути в статичній збірці, але які є на проді (WP).
	extraClasses: [
		'preloader',
		'lenis', 'lenis-smooth', 'mobile',
		'lazy', 'no-lazyload', // додає W3TC Lazy Load
		'active',
	],
};

// Одна сторінка = один запис. cut — клас блоку, який відкриває другий екран.
const PAGES = {
	home: {
		src: 'dist/index.html',
		cut: 'home-about-screen',
		css: [
			'dist/assets/styles/main.min.css',
			'dist/assets/styles/pages/home.min.css',
		],
		out: 'dist/assets/styles/critical/home.css',
	},
	infrastructure: {
		src: 'dist/infrastructure.html',
		cut: 'infrastructure-block-with-render',
		css: [
			'dist/assets/styles/main.min.css',
			'dist/assets/styles/pages/infrastructure.min.css',
		],
		out: 'dist/assets/styles/critical/infrastructure.css',
	},
};

function aboveTheFold(html, cut) {
	const start = html.indexOf('<body');
	const cutAt = html.indexOf(cut);
	if (start < 0) throw new Error('не знайдено <body>');
	if (cutAt < 0) throw new Error(`не знайдено маркер "${cut}" — перевір PAGES[...].cut`);
	return html.slice(start, cutAt);
}

function collect(html) {
	const classes = new Set(SHARED.extraClasses);
	const attrs = new Set();

	const classRe = /class\s*=\s*("([^"]*)"|'([^']*)')/g;
	let m;
	while ((m = classRe.exec(html))) {
		(m[2] || m[3] || '').split(/\s+/).forEach(c => c && classes.add(c));
	}

	const attrRe = /\s(data-[a-z0-9-]+)/gi;
	while ((m = attrRe.exec(html))) attrs.add(m[1].toLowerCase());

	return { classes, attrs };
}

function partIsCritical(part, classes, attrs) {
	const classTokens = part.match(/\.(-?[_a-zA-Z][\w-]*)/g) || [];
	const attrTokens = part.match(/\[\s*(data-[\w-]+)/gi) || [];

	// Селектор без класів і data-атрибутів — тег, :root, псевдоелемент.
	// Такі лишаємо: це база, вона потрібна завжди і важить мало.
	if (!classTokens.length && !attrTokens.length) return true;

	const okClasses = classTokens.every(t => classes.has(t.slice(1)));
	const okAttrs = attrTokens.every(t => attrs.has(t.replace(/^\[\s*/, '').toLowerCase()));
	return okClasses && okAttrs;
}

function filterSelector(selector, classes, attrs) {
	return selector
		.split(',')
		.map(s => s.trim())
		.filter(s => partIsCritical(s, classes, attrs))
		.join(', ');
}

function build(cssText, classes, attrs) {
	const root = postcss.parse(cssText);
	const animations = new Set();

	root.walkRules(rule => {
		// Всередині @keyframes селектори — це 0%/from/to, їх не фільтруємо.
		if (rule.parent && rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;

		const kept = filterSelector(rule.selector, classes, attrs);
		if (!kept) {
			rule.remove();
			return;
		}
		rule.selector = kept;

		rule.walkDecls(/^animation(-name)?$/, decl => {
			decl.value.split(',').forEach(v => {
				const name = v.trim().split(/\s+/).find(t => /^[_a-zA-Z][\w-]*$/.test(t));
				if (name) animations.add(name);
			});
		});
	});

	// @keyframes лишаємо лише ті, на які реально хтось посилається.
	root.walkAtRules(/keyframes/, at => {
		if (!animations.has(at.params.trim())) at.remove();
	});

	// Порожні @media після фільтрації прибираємо.
	root.walkAtRules(at => {
		if (/font-face|keyframes/.test(at.name)) return;
		if (at.nodes && at.nodes.length === 0) at.remove();
	});

	return absolutizeUrls(root.toString());
}

// url("../fonts/x.woff2") -> url("/wp-content/themes/3d/assets/fonts/x.woff2")
// data: і вже абсолютні адреси не чіпаємо.
function absolutizeUrls(css) {
	return css.replace(/url\(\s*(['"]?)((?:\.\.\/)+)([^'")]+)\1\s*\)/g,
		(_all, quote, _dots, rest) => `url(${quote}${SHARED.urlBase}${rest}${quote})`);
}

/**
 * Прибирає повторні однакові блоки.
 *
 * prependShared() у збірці додає спільні партіали в кожен сторінковий CSS, тому
 * після склейки main + home все спільне (@font-face, :root, база) лежить двічі.
 * Видаляємо пізніший дубль: вміст ідентичний, отже на каскад це не впливає.
 */
function dedupe(css) {
	const root = postcss.parse(css);
	const seen = new Set();

	root.each(node => {
		if (node.type !== 'rule' && node.type !== 'atrule') return;
		const key = node.toString();
		if (seen.has(key)) {
			node.remove();
			return;
		}
		seen.add(key);
	});

	return root.toString();
}

async function readSource(src) {
	if (/^https?:\/\//.test(src)) {
		const res = await fetch(src);
		if (!res.ok) throw new Error(`${src} -> HTTP ${res.status}`);
		return res.text();
	}
	return fs.readFileSync(src, 'utf8');
}

async function generateOne(page, { src } = {}) {
	src = src || page.src;
	const html = await readSource(src);
	const { classes, attrs } = collect(aboveTheFold(html, page.cut));

	let out = '';
	for (const file of page.css) {
		if (!fs.existsSync(file)) {
			console.warn(`  пропущено (немає): ${file}`);
			continue;
		}
		out += build(fs.readFileSync(file, 'utf8'), classes, attrs);
	}

	out = dedupe(out);

	fs.mkdirSync(path.dirname(page.out), { recursive: true });
	fs.writeFileSync(page.out, out);

	const before = page.css
		.filter(f => fs.existsSync(f))
		.reduce((n, f) => n + fs.statSync(f).size, 0);

	console.log(`critical: джерело розмітки ${src}`);
	console.log(`critical: класів у першому екрані ${classes.size}`);
	console.log(`critical: ${before} -> ${out.length} байт (${Math.round((out.length / before) * 100)}%)`);
	console.log(`critical: записано ${page.out}`);
}

async function generateAll() {
	for (const page of Object.values(PAGES)) {
		await generateOne(page);
	}
}

module.exports = generateAll;
module.exports.generateOne = generateOne;
module.exports.PAGES = PAGES;

// Запуск напряму: node critical.js [сторінка з PAGES] [html-або-url]
if (require.main === module) {
	const [pageName, src] = process.argv.slice(2);

	const run = pageName
		? (() => {
			const page = PAGES[pageName];
			if (!page) throw new Error(`невідома сторінка "${pageName}", є: ${Object.keys(PAGES).join(', ')}`);
			return generateOne(page, { src });
		})()
		: generateAll();

	run.catch((e) => {
		console.error('critical:', e.message);
		process.exit(1);
	});
}
