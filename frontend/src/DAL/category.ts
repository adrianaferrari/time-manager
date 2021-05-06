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
