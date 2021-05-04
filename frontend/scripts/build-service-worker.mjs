import fs from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

function parseServiceWorkerCache() {
	const cacheFileContent = fs.readFileSync('.service-worker-cache').toString();
	const cacheFiles = cacheFileContent
		.replace(/\r/g, '')
		.split('\n')
		.filter((s) => !s.startsWith('#') && s.length > 0);

	return cacheFiles;
}

try {
	const assets = parseServiceWorkerCache()
		.map((file) => process.env.PUBLIC_PATH + file);

	const output = `
var cacheName = "build-${new Date().toISOString()}";

var assets = [
${
	assets
		.map((f) => `\t'${f.replace(/'/g, "\\'")}'`)
		.join(',\n')
	}
];

self.addEventListener("install", function (e) {
	e.waitUntil(
		caches
			.open(cacheName)
			.then(function (cache) {
				cache.addAll(assets);
			})
	);
});

self.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(
				keys.map(function (key) {
					if (cacheName !== key) {
						return caches.delete(key);
					}
				})
			)
		})
	);
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (res) {
      return res || fetch(e.request);
    })
  )
});

self.addEventListener("message", function (e) {
	if (e.data === "SKIP_WAITING") {
		self.skipWaiting();
	}
});
`;
	fs.writeFileSync(join('public', 'service-worker.js'), output);
} catch (err) {
	console.error(err);
	throw err;
}
