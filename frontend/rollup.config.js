const dotenv = require('dotenv').config().parsed;

/** .env check */
require('ts-node').register({
	files: './src'
});
require('./src/config.ts');

/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import scss from 'rollup-plugin-scss';
import postcss from 'postcss';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import babel from '@rollup/plugin-babel';
import css from 'rollup-plugin-css-only';
import { preprocess } from './svelte.config.mjs';

const production = process.env.NODE_ENV !== 'development';

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true,
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		},
	};
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js',
	},
	plugins: [
		replace({
			preventAssignment: true,
			values: {
				'process.env': JSON.stringify({
					...dotenv,
					BUILD_VERSION: new Date().toISOString(),
				}),
			},
		}),
		svelte({
			compilerOptions: {
				dev: !production,
			},
			preprocess,
		}),
		css({ output: 'bundle.css' }),
		

		scss({
			outFile: 'public/build/main.css',
			output: 'public/build/main.css',
			outputStyle: production ? 'compressed' : undefined,
			failOnError: true,
			sourceMap: !production ? true : undefined,
			sourceMapEmbed: !production ? true : undefined,
			sourceMapRoot: !production ? `file://${process.cwd()}/public/build` : undefined,
			sass: require('sass'),
			processor: (css) => postcss([require('autoprefixer')])
				.process(css, { from: undefined })
				.then((result) => result.css),
			watch: 'src/style',
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte'],
			preferBuiltins: false,
		}),
		commonjs({
			include: 'node_modules/**',
		}),
		typescript({
			sourceMap: !production,
			inlineSources: !production,
		}),
		babel({
			extensions: ['.js', '.mjs', '.html', '.svelte'],
			babelHelpers: 'runtime',
			exclude: ['node_modules/@babel/**', 'node_modules/core-js/**', 'node_modules/core-js-compat/**'],
			presets: [['@babel/preset-env', {
				useBuiltIns: 'usage',
				corejs: { version: 3 }
			}]],
			plugins: [
				'@babel/plugin-syntax-dynamic-import',
				['@babel/plugin-transform-runtime', {
					useESModules: true,
				}],
			],
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),
	],
	watch: {
		clearScreen: false,
	},
};
