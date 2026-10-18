import { defineConfig } from 'vite';

// GitHub Pages serves the site at /portfolio/, so built asset paths need that prefix.
export default defineConfig({
  base: '/portfolio/',
});
