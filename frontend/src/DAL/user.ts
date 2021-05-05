import {
	derived, get, writable,
	// eslint-disable-next-line import/no-extraneous-dependencies
} from 'svelte/store';
import { writable as persistentWritable } from 'svelte-persistent-store/dist/local';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import type { Writable } from 'svelte/store';
import { axiosExtract } from '../helpers/axios';
import { setTheme, theme } from '../ui-ux/theme';
import config from '../config';
import { HttpStatus } from '../http/status';

export enum Role {
	admin = 'admin',
	user = 'user',
}

const authStorageKey = 'authResponse';

let authRequestInterceptor: number|undefined;

let authResponseInterceptor: number|undefined;

const _authResponse = writable<AuthResponse | null>(null);

export const selectedRole = persistentWritable<Role>('userRole', null);

export const user = derived<Writable<AuthResponse | null>, User | null>(
	_authResponse,
	($authResponse) => ($authResponse?.user ? mapper($authResponse.user) : null),
);

function clearHeaders(): void {
	if (authRequestInterceptor !== undefined) {
		axios.interceptors.request.eject(authRequestInterceptor);
		authRequestInterceptor = undefined;
	}
	if (authResponseInterceptor !== undefined) {
		axios.interceptors.response.eject(authResponseInterceptor);
		authResponseInterceptor = undefined;
	}
}

export function mapper(raw: UserRaw): User {
	return {
		id: raw.id,
		firstName: raw.firstName,
		lastName: raw.lastName,
		email: raw.email,
		enabled: raw.enabled,
		minJwtIat: raw.minJwtIat && new Date(raw.minJwtIat),
		roles: raw.roles,

		createdAt: new Date(raw.createdAt),
	};
}
function setStorageAuthResponse(authResponse?: AuthResponse): void {
	if (authResponse) {
		localStorage.setItem(authStorageKey, JSON.stringify(authResponse));
	} else {
		localStorage.removeItem(authStorageKey);
	}
}

function setAuthResponse(authResponse?: AuthResponse): void {
	setStorageAuthResponse(authResponse);
	if (authResponse) {
		setHeaders(authResponse.jwt);
		_authResponse.set(authResponse);

		const currentRole: Role = get(selectedRole);
		if (!currentRole || !authResponse.user.roles.includes(currentRole)) {
			if (authResponse.user.roles.length === 1) {
				selectedRole.set(authResponse.user.roles[0]);
			} else {
				selectedRole.set(null);
			}
		}
	} else {
		clearHeaders();
		_authResponse.set(authResponse);
	}
}

function setHeaders(jwt: string): void {
	clearHeaders();
	authRequestInterceptor = axios.interceptors.request.use((config) => {
		if (config.url) {
			if (config.url.charAt(0) === '/') {
				// eslint-disable-next-line no-param-reassign
				config.headers = config.headers || {};
				// eslint-disable-next-line no-param-reassign
				config.headers.Authorization = `Bearer ${jwt}`;
			}
		}
		return config;
	});
	authResponseInterceptor = axios.interceptors.response.use(
		undefined,
		(err) => {
			if (err.response?.status === HttpStatus.Unauthorized) {
				logout();
			}
			return Promise.reject(err);
		},
	);
}

export async function save(data: SaveUser): Promise<number> {
	const response = await axios.patch('/auth/user', data);
	const authResponse = response.data;
	setAuthResponse(authResponse);
	return response.status;
}

export function logout(): void {
	setAuthResponse(null);
	const currentTheme = get(theme);
	localStorage.clear();
	setTheme(currentTheme);
}

export function closeAllSessions(): Promise<void> {
	return axios.post('/auth/user/close-all-sessions');
}

export async function login(email: string, password: string): Promise<void> {
	const authResponse = await axiosExtract<AuthResponse>(axios.post('/user/jwt', {
		email,
		password,
	}));
	setAuthResponse(authResponse);
}

export async function del(): Promise<void> {
	await axios.delete('/auth/user');
	logout();
}

export async function refreshAuth(): Promise<void> {
	try {
		const authResponse = await axiosExtract<AuthResponse>(axios.post('/auth/user/jwt'));
		setStorageAuthResponse(authResponse);
	} catch (err) {
		if (config.environment === 'development') {
			console.error(err);
		}
	}
}

export function isAuthenticated(): boolean {
	return !!get(user);
}

const authResponseRaw = localStorage.getItem(authStorageKey);
if (authResponseRaw) {
	try {
		const authResponse: AuthResponse = JSON.parse(authResponseRaw);

		const { exp } = jwtDecode<Jwt>(authResponse.jwt);
		const now = Date.now() / 1000;
		if (now > exp) {
			logout();
			throw new Error('token expired');
		}

		setAuthResponse(authResponse);

		refreshAuth();
	} catch (err) {
		console.warn(err);
		logout();
	}
}

export interface User {
	id: string,
	firstName: string,
	lastName: string,
	email: string,
	enabled: boolean,
	minJwtIat: Date,
	roles: Role[],

	createdAt: Date,
}

export interface UserRaw {
	id: string,
	firstName: string,
	lastName: string,
	email: string,
	enabled: boolean,
	minJwtIat: string,
	roles: Role[],

	createdAt: Date,
}

export interface SaveUser {
	firstName: string,
	lastName: string,
	email: string,
	password?: string,
}

export interface AuthResponse {
	user: UserRaw,
	jwt: string,
}

export interface Jwt {
	exp: number,
	iat: number,
}
