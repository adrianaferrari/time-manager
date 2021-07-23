import axios from 'axios';
import { asyncReadable } from 'svelte-async-readable';
import { axiosExtract } from '../helpers/axios';

export function mapper(raw: CompanyRaw): Company {
	return {
		email: raw.email,
		id: raw.id,
		name: raw.name,
		userId: raw.userId,
		vatNumber: raw.vatNumber,
	};
}

export function detailsMapper(raw: CompanyDetailsRaw): CompanyDetails {
	return {
		...mapper(raw),
		clientIds: raw.clientIds,
		projectIds: raw.projectIds,
	};
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

export function get(id: string): Promise<CompanyDetails> {
	return axiosExtract<CompanyDetailsRaw>(axios.get(`/auth/company/${id}`))
		.then((res) => detailsMapper(res));
}

export interface CompanyRaw {
	id: string,
	name: string,
	vatNumber: string | null,
	email: string | null,
	userId: string,
}

export interface CompanyDetailsRaw extends CompanyRaw {
	projectIds: string[],
	clientIds: string[],
}
export interface Company {
	id: string,
	name: string,
	vatNumber: string | null,
	email: string | null,
	userId: string,
}

export interface CompanyDetails extends Company {
	projectIds: string[],
	clientIds: string[],
}

export interface SaveCompany {
	name: string,
	vatNumber?: string | null,
	email?: string | null,
}
