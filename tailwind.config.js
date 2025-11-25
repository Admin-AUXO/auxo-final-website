export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'card': 'var(--bg-card)',
        'surface': 'var(--bg-surface)',
        'elevated': 'var(--bg-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-on-accent': 'var(--text-on-accent)',
        'accent-green': 'var(--accent-green)',
        'border-theme': 'var(--border-color)',
        'border-theme-light': 'var(--border-color-light)',
      },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'theme': 'var(--theme-transition)',
      },
      transitionTimingFunction: {
        'smooth': 'var(--timing-smooth)',
      },
      zIndex: {
        'content': '10',
      },
    },
  },
};

