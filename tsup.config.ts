import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  outDir: 'dist',
  external: ['react', 'react-dom', '@types/react'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  injectStyle: true,
});
