import type { AxiosError, AxiosResponse } from 'axios';
import { noop } from './lambdas';

export const config = {
	defaultErrorHandler: noop as (err: Error) => void,
};

export function statusMatch(error: AxiosError, matches?: {[key: number]: Function|undefined}, noMatch?: Function): void {
	if (error?.response?.status && matches?.[error.response.status]) {
		(matches[error.response.status] || noop)(error.response.data);
	} else {
		(noMatch || config.defaultErrorHandler)(error);
	}
}

export function axiosExtract<T>(axiosRequest: Promise<AxiosResponse<T>>): Promise<T> {
	return axiosRequest.then((response) => response.data);
}
