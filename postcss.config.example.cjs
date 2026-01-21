// To enable: rename to postcss.config.cjs and install @fullhuman/postcss-purgecss

const purgecss = require('@fullhuman/postcss-purgecss');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [

    ...(isProduction
      ? [
          purgecss({

            content: [
              './src/**/*.astro',
              './src/**/*.tsx',
              './src/**/*.ts',
              './src/**/*.jsx',
              './src/**/*.js',
              './src/**/*.vue',
              './src/**/*.svelte',
            ],


            safelist: {

              standard: [
                /^data-/,
                /^aria-/,
                /^theme-/,
                /dark/,
                /light/,
                /keyboard-nav/,
              ],


              deep: [

                /nav/,
                /menu/,
                /dropdown/,


                /modal/,
                /overlay/,
                /backdrop/,


                /accordion/,
                /carousel/,
                /tooltip/,
                /toast/,
                /notification/,


                /form/,
                /input/,
                /select/,
                /checkbox/,
                /radio/,


                /active/,
                /disabled/,
                /loading/,
                /error/,
                /success/,


                /scroll/,
                /sticky/,


                /skeleton/,


                /swiper/,
                /embla/,
              ],


              greedy: [
                /fade/,
                /slide/,
                /scale/,
                /rotate/,
                /pulse/,
                /bounce/,
                /spin/,
                /ping/,
                /animate/,
                /transition/,
              ],


              keyframes: true,
              fontFace: true,
            },


            defaultExtractor: (content) => {

              const broadMatches = content.match(/[^<>"'`\\s]*[^<>"'`\\s:]/g) || [];


              const innerMatches = content.match(/[^<>"'`\\s.()]*[^<>"'`\\s.():]/g) || [];


              const dynamicMatches = content.match(/\${[^}]*}/g) || [];

              return [...new Set([...broadMatches, ...innerMatches, ...dynamicMatches])];
            },


            rejected: true,
            rejectedCss: false,
          }),
        ]
      : []),




  ],
};
