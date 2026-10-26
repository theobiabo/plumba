import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
