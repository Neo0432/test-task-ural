import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const apiKey = loadEnv(mode, process.cwd(), '').FAVORIT_API_KEY;

  const toApiPath = (path) => {
    const apiPath = path.replace(/^\/api\/?/, '/');
    if (!apiKey) {
      return apiPath;
    }
    const separator = apiPath.includes('?') ? '&' : '?';
    return `${apiPath}${separator}key=${encodeURIComponent(apiKey)}`;
  };

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://api.favorit-parts.ru/hs/hsprice/',
          changeOrigin: true,
          rewrite: toApiPath,
        },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['__tests__/**/*.test.{js,jsx}'],
      setupFiles: ['__tests__/support/setup.js'],
    },
  };
});
