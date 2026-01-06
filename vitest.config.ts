import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const stubMp4 = {
  name: 'stub-mp4',
  transform(_code: string, id: string) {
    if (id.endsWith('.mp4')) {
      return 'export default "mock-video-url"';
    }
    return null;
  },
};

export default defineConfig({
  plugins: [react(), stubMp4],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./client/src/test-setup.tsx'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/test-setup.tsx',
        'server/',
        'script/',
        '*.config.*',
      ],
    },
  },
  resolve: {
    // Note: Keep these aliases in sync with vite.config.ts
    alias: {
      // Specific mock for the video that fails to load in tests - MUST BE BEFORE @assets
      '@assets/generated_videos/beppo_clown_emerging_laughing_game_over.mp4': path.resolve(
        __dirname,
        './client/src/mocks/videoMock.ts',
      ),
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
});
