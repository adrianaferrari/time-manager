import axios from 'axios';
import qs from 'qs';
import { Time } from '@cdellacqua/time';
import { DateOnly } from '@cdellacqua/date-only';
import { config } from '../helpers/axios';
import appConfig from '../config';
import { apiErrorHandler } from '../helpers/error';

axios.interceptors.request.use((axiosConfig) => {
	// eslint-disable-next-line no-param-reassign
	axiosConfig.baseURL = appConfig.apiUrl;

	return axiosConfig;
});

function customSerializer(obj: any): string|null {
	if (obj instanceof Time || obj instanceof DateOnly) {
		return obj.toString();
	}
	return null;
}

axios.interceptors.request.use((axiosConfig) => {
	// eslint-disable-next-line no-param-reassign
	axiosConfig.paramsSerializer = (immutableParams) => {
		let params = { ...immutableParams };
		function convertRecursively(obj: any) {
			if (obj) {
				const serialized = customSerializer(obj);
				if (serialized !== null) {
					return serialized;
				}
				if (Array.isArray(obj)) {
					return obj.map((item) => convertRecursively(item));
				}
				if (typeof obj === 'object') {
					const clone = { ...obj };
					Object.keys(clone).forEach((key) => {
						clone[key] = convertRecursively(clone[key]);
					});
					return clone;
				}
			}
			return obj;
		}
		// eslint-disable-next-line no-param-reassign
		params = convertRecursively(params);
		return qs.stringify(params, { skipNulls: true });
	};

	return axiosConfig;
});

config.defaultErrorHandler = apiErrorHandler;
