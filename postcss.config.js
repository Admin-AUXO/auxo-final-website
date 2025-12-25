import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    postcssPresetEnv({
      stage: 2,
      features: {
        'custom-properties': true,
        'nesting-rules': false,
      },
      autoprefixer: false,
    }),
    autoprefixer({
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'not op_mini all',
      ],
    }),
    ...(isProduction
      ? [
          cssnano({
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                },
                normalizeWhitespace: true,
                minifyFontValues: true,
                minifySelectors: true,
              },
            ],
          }),
        ]
      : []),
  ],
};
