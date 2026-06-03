import * as esbuild from 'esbuild';
const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/card.js'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/htd-zone-card.js',
  minify: false,
});

if (watch) {
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Build complete: dist/htd-zone-card.js');
}
