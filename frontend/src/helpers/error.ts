import type { AxiosError } from 'axios';
import { __ } from '../i18n';
import { notifyErr } from './notification';
import { statusMatch } from './axios';
import { HttpStatus } from '../http/status';

export function dataProviderErrorHandler(err: Error): void {
	console.error(err);
	statusMatch(err as AxiosError);
}

export function apiErrorHandler(err: Error): void {
	console.error(err);
	if ((err as any)?.response?.status) {
		switch ((err as any)?.response?.status) {
			case HttpStatus.ServiceUnavailable:
				notifyErr(__('Service unavailable, please try again later'));
				break;
			default:
				notifyErr(__('Error communicating with the server'));
				break;
		}
	} else {
		notifyErr(__('Cannot communicate with the server'));
	}
}
