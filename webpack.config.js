const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = {
  mode: process.argv.includes('--production') ? 'production' : 'development',
  entry: {
    'immediate-loading': './src/assets/scripts/immediate-loading.js',
    'single-news': './src/assets/scripts/single-news.js',
    construction: './src/assets/scripts/construction.js',
    'single-construction': './src/assets/scripts/single-construction.js',
    'vr-tours': './src/assets/scripts/vr-tours.js',
    home: './src/assets/scripts/home.js',
    news: './src/assets/scripts/news.js',
    developer: './src/assets/scripts/developer.js',
    index: './src/assets/scripts/index-app.js',
    gallery: './src/assets/scripts/gallery.js',
    about: './src/assets/scripts/about.js',
    infrastructure: './src/assets/scripts/infrastructure.js',
    commercial: './src/assets/scripts/commercial.js',
    apartments: './src/assets/scripts/apartments.js',
    restaurant: './src/assets/scripts/restaurant.js',
    'shopping-mall': './src/assets/scripts/shopping-mall.js',
  },
  output: {
    filename: '[name].bundle.js',
    // Асинхронні чанки (import()). Хеш тут обов'язковий: цей файл запитує сам
    // webpack, а не wp_enqueue_script, тому `?ver=filemtime()` до нього не
    // додається — а .htaccess віддає весь /assets/scripts/ з
    // `max-age=31536000, immutable`. Зі стабільним іменем оновлення чанка не
    // дійшло б до постійних відвідувачів до року. Ім'я підставляється в
    // index.bundle.js, який версіонується темою, тож нове ім'я підхопиться одразу.
    chunkFilename: '[name].[contenthash:8].bundle.js',
  },
  module: {
    rules: [
      // Правило `{ include: /node_modules[\\/]swiper[\\/]/, sideEffects: false }`
      // тут пробували 2026-08-13 і прибрали: у цій збірці воно нічого не
      // відрізає (невживані модулі Swiper і без нього відсутні в output —
      // перевірено маркерами cubeShadow / swiper-pagination-bullet /
      // notificationClass), зате розриває конкатенацію модулів і додає
      // +1667 B до vendors.bundle.js.
      {
        test: /\.m?js$/,
        include: /node_modules[\\/]@studio-freight[\\/]lenis/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        // Вбудована група webpack працює по async-чанках і винесла б залежності
        // form.bundle.js в окремий vendors~form.bundle.js. Він так само лінивий,
        // але це другий файл до деплою без користі — тримаємо чанк цілим.
        vendors: false,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          // vendors — теж не entry-чанк, тому без цього рядка на нього
          // поширився б chunkFilename із хешем, а тема підключає його за
          // фіксованим шляхом .../scripts/vendors.bundle.js → 404 всюди.
          // Хеш тут не потрібен: цей файл enqueue'їться з ?ver=filemtime().
          filename: '[name].bundle.js',
          chunks(chunk) {
            // Тільки initial-чанки. Без canBeInitial() бібліотеки, які потрібні
            // лише асинхронному чанку (yup, lodash, i18next, cleave.js,
            // intl-tel-input у form.bundle.js), знову осіли б у спільному
            // vendors.bundle.js — а він вантажиться на кожній сторінці, тобто
            // ліниве завантаження не дало б нічого.
            // exclude `my-excluded-chunk`
            return chunk.canBeInitial() && chunk.name !== 'immediate-loading';
          },
        },
      },
    },
  },
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true,
      uglifyOptions: {
        compress: {
          drop_console: process.argv.includes('--production'),
        },
      },
    }),
  ],
};

module.exports = config;
