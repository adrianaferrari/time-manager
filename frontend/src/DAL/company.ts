import axios from 'axios';
import { asyncReadable } from 'svelte-async-readable'
import { axiosExtract } from '../helpers/axios';

export function mapper(raw: CompanyRaw): Company {
	return {
		email: raw.email,
		id: raw.id,
		name: raw.name,
		userId: raw.userId,
		vatNumber: raw.vatNumber,
	}
}

export const companies = asyncReadable({
	initialValue: [],
	storageName: 'companies',
	refresh: false,
	dataProvider: () => axiosExtract<CompanyRaw[]>(axios.get('/auth/company')),
	mapper: (rawList) => rawList.map((raw) => mapper(raw)),
});

export function save(company: SaveCompany, id?: string): Promise<Company> {
	const axiosCall = id ? axios.put(`/auth/company/${id}`, company) : axios.post('/auth/company', company);
	return axiosExtract<CompanyRaw>(axiosCall)
		.then((res) => mapper(res));
}

export function del(id: string): Promise<void> {
	return axiosExtract(axios.delete(`/auth/company/${id}`));
}

export interface CompanyRaw {
	id: string,
	name: string,
	vatNumber: string | null,
	email: string | null,
	userId: string,
}

export interface Company {
	id: string,
	name: string,
	vatNumber: string | null,
	email: string | null,
	userId: string,
}

export interface SaveCompany {
	name: string,
	vatNumber?: string | null,
	email?: string | null,
}
