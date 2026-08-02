import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://aaronorelup.com',
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
