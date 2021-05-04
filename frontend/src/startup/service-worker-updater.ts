/* eslint-disable import/no-mutable-exports */
import { writable } from 'svelte/store';
import config from '../config';
import { noop } from '../helpers/lambdas';

export const showUpdateModal = writable(false);
export const serviceWorkerUpdateAvailable = writable(false);
export let updateCallback = noop;

window.addEventListener('load', () => {
	const registrationPromise = new Promise<ServiceWorkerRegistration>((res, rej) => {
		if (!('serviceWorker' in navigator)) {
			rej(new Error('serviceWorker not supported'));
		} else {
			navigator.serviceWorker
				.register(`${config.publicPath}/service-worker.js`)
				.then((registration) => {
					res(registration);
				})
				.catch((err) => {
					rej(err);
				});
		}
	});

	registrationPromise.then((registration) => {
		let refreshing = false;
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			if (!refreshing) {
				window.location.reload();
				refreshing = true;
			}
		});

		let alreadyShown = false;
		function prepareModalIfUpdateAvailable(postTarget: ServiceWorker) {
			if (!alreadyShown && navigator.serviceWorker.controller) {
				alreadyShown = true;

				updateCallback = () => postTarget.postMessage('SKIP_WAITING');
				serviceWorkerUpdateAvailable.set(true);
				showUpdateModal.set(true);
			}
		}

		if (registration.waiting) {
			prepareModalIfUpdateAvailable(registration.waiting);
		} else {
			registration.addEventListener('updatefound', () => {
				if (registration.installing) {
					registration.installing.addEventListener('statechange', () => {
						if (registration.waiting) {
							prepareModalIfUpdateAvailable(registration.waiting);
						}
					});
				}
			});
		}
	}).catch((err) => console.error(err));
});
