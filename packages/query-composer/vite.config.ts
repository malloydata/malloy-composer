import {defineConfig} from 'vite';
import {resolve} from 'path';

import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr(), react({jsxRuntime: 'classic'})],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => {
        if (format === 'cjs') return 'cjs/[name].cjs';
        return 'esm/[name].js';
      },
      name: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'styled-components',
        '@malloydata/malloy',
        '@malloydata/malloy-tag',
        '@malloydata/malloy-filter',
        '@malloydata/malloy/connection',
        '@malloydata/render',
        '@malloydata/render/webcomponent',
      ],
      output: {
        manualChunks: _id => {
          return 'index';
        },
      },
      preserveSymlinks: true,
    },
    minify: false,
    sourcemap: true,
  },
  define: {
    'process.env': {},
  },
});
