import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';

export default {
  plugins: [
    postcssPresetEnv({
      stage: 2,
      features: {
        'custom-properties': true,
        'nesting-rules': false,
      },
    }),
    cssnano({
      preset: ['default', {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
        colormin: true,
        reduceIdents: false,
      }],
    }),
  ],
};
