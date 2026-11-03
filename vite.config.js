import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with { type: 'json' };

const resolvePath = (relativePath) => fileURLToPath(new URL(relativePath, import.meta.url));
const rootDir = resolvePath('.');

// Every runtime/peer dependency (and its sub-paths) stays external in the library build.
const externalPackages = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];
const isExternal = (id) => externalPackages.some(
  (name) => id === name || id.startsWith(`${name}/`),
);

const css = {
  preprocessorOptions: {
    scss: {
      // silence deprecation warnings coming from Bulma
      quietDeps: true,
    },
  },
  modules: {
    localsConvention: 'camelCase',
    // e.g. `sv-progress-bar-played-a1B2c`
    generateScopedName: (name, filename) => {
      const file = filename.split('?')[0];
      const component = path.basename(file).replace(/\.module\.s?css$/, '');
      // hash the repo-relative path so class names are stable across machines
      const relativeFile = path.relative(rootDir, file).split(path.sep).join('/');
      const hash = createHash('sha256')
        .update(`${relativeFile}:${name}`)
        .digest('base64url')
        .slice(0, 5);
      return `sv-${component}-${name}-${hash}`;
    },
  },
};

/**
 * - `vite` / `vite build`   → demo site (example/ → gh-pages/)
 * - `vite build --mode lib` → npm package (src/ → dist/)
 */
export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [react()],
      css,
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        lib: {
          entry: resolvePath('./src/index.jsx'),
          formats: ['es', 'cjs'],
          fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
          cssFileName: 'index',
        },
        rolldownOptions: {
          external: isExternal,
        },
      },
    };
  }

  return {
    root: resolvePath('./example'),
    base: './',
    plugins: [react()],
    css,
    resolve: {
      alias: [
        // the demo always consumes the library straight from source
        { find: /^react-sticky-video$/, replacement: resolvePath('./src/index.jsx') },
      ],
    },
    server: {
      host: true,
      fs: {
        // README.md lives outside the demo root
        allow: [resolvePath('.')],
      },
    },
    build: {
      outDir: resolvePath('./gh-pages'),
      emptyOutDir: true,
      // react-dom + react-markdown make up most of the demo bundle
      chunkSizeWarningLimit: 600,
    },
    test: {
      root: resolvePath('.'),
      environment: 'jsdom',
      setupFiles: ['./test/setup.js'],
      include: ['src/**/*.test.{js,jsx}'],
      css: {
        include: /\.scss$/,
        modules: {
          classNameStrategy: 'non-scoped',
        },
      },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/**/*.test.{js,jsx}'],
      },
    },
  };
});
