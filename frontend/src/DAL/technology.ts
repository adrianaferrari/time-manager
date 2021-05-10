import axios from 'axios';
import { asyncReadable } from 'svelte-async-readable';
import { axiosExtract } from '../helpers/axios';

export const technologies = asyncReadable({
	initialValue: [],
	storageName: 'technologies',
	refresh: false,
	dataProvider: () => axiosExtract<TechnologyRaw[]>(axios.get('/auth/technology')),
	mapper: (rawList) => rawList.map((raw) => mapper(raw)),
});

export function mapper(raw: TechnologyRaw): Technology {
	return {
		id: raw.id,
		userId: raw.userId,
		name: raw.name,
	};
}

export function save(technology: SaveTechnology, id?: string): Promise<Technology> {
	const axiosCall = id ? axios.put(`/auth/technology/${id}`, technology) : axios.post('/auth/technology', technology);
	return axiosExtract<TechnologyRaw>(axiosCall)
		.then((res) => mapper(res));
}
export interface TechnologyRaw {
	id: string,
	name: string,
	userId: string,
}

export interface Technology {
	id: string,
	name: string,
	userId: string,
}

export interface SaveTechnology {
	name: string,
}
