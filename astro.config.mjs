import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap()],

  // GitHub Pages deployment configuration
  site: 'https://arcade-cabinet.github.io',
  base: process.env.ASTRO_BASE_PATH || '/Beppo-Laughs',

  // Output configuration for static site generation
  output: 'static',

  // Build optimization
  build: {
    inlineStylesheets: 'auto',
  },

  // Vite configuration passthrough (Tailwind CSS 4 is handled via PostCSS)
  vite: {
    resolve: {
      alias: {
        '@': '/client/src',
        '@shared': '/shared',
        '@assets': '/public/assets',
      },
    },
    css: {
      transformer: 'postcss',
    },
    ssr: {
      // External packages that shouldn't be bundled for SSR
      noExternal: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/postprocessing',
      ],
    },
    optimizeDeps: {
      // Ensure Three.js and React Three Fiber are properly optimized
      include: ['three', '@react-three/fiber', '@react-three/drei'],
    },
  },
});
