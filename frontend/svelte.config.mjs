import sveltePreprocess from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';

export const preprocess = sveltePreprocess({
	postcss: {
		plugins: [autoprefixer],
	},
	scss: true,
	typescript: false,
	pug: false,
});
