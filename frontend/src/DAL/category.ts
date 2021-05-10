import axios from 'axios';
import { asyncReadable } from 'svelte-async-readable';
import { axiosExtract } from '../helpers/axios';

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

export function save(category: SaveCategory, id?: string): Promise<Category> {
	const axiosCall = id ? axios.put(`/auth/category/${id}`, category) : axios.post('/auth/category', category);
	return axiosExtract<CategoryRaw>(axiosCall)
		.then((res) => mapper(res));
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

export interface SaveCategory {
	name: string,
}
