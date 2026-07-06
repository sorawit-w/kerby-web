// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project page (L2/L4): all internal URLs must be base-aware —
// use imports or import.meta.env.BASE_URL, never root-absolute paths.
export default defineConfig({
  site: 'https://sorawit-w.github.io',
  base: '/kerby-web',
});
