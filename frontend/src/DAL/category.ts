import { Interval } from '@cdellacqua/interval';
import axios from 'axios';
import { asyncReadable } from 'svelte-async-readable';
import { axiosExtract } from '../helpers/axios';
import type { Activity, ActivityRaw } from './activity';
import { mapper as activityMapper } from './activity';

export const categories = asyncReadable({
	initialValue: [],
	storageName: 'categories',
	refresh: false,
	dataProvider: () => axiosExtract<CategoryRaw[]>(axios.get('/auth/category')),
	mapper: (rawList) => rawList.map((raw) => mapper(raw)),
});

export function mapper(raw: CategoryRaw): Category {
	return {
		id: raw.id,
		userId: raw.userId,
		name: raw.name,
	};
}

export function detailsMapper(raw: CategoryDetailsRaw): CategoryDetails {
	return {
		...mapper(raw),
		activities: raw.activities.map((a) => activityMapper(a)),
		timeSpent: new Interval(raw.timeSpent),
	};
}

export function save(category: SaveCategory, id?: string): Promise<Category> {
	const axiosCall = id ? axios.put(`/auth/category/${id}`, category) : axios.post('/auth/category', category);
	return axiosExtract<CategoryRaw>(axiosCall)
		.then((res) => mapper(res));
}

export function del(id: string): Promise<void> {
	return axiosExtract(axios.delete(`/auth/category/${id}`));
}

export function get(id: string): Promise<CategoryDetails> {
	return axiosExtract<CategoryDetailsRaw>(axios.get(`/auth/category/${id}`))
		.then((raw) => detailsMapper(raw));
}

export interface CategoryRaw {
	id: string,
	name: string,
	userId: string,
}

export interface Category {
	id: string,
	name: string,
	userId: string,
}

export interface CategoryDetailsRaw extends CategoryRaw {
	activities: ActivityRaw[],
	timeSpent: string,
}

export interface CategoryDetails extends Category {
	activities: Activity[],
	timeSpent: Interval,
}

export interface SaveCategory {
	name: string,
}
