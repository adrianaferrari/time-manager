import axios from 'axios';
import { asyncReadable } from 'svelte-async-readable'
import { axiosExtract } from '../helpers/axios';

export function mapper(raw: ClientRaw): Client {
	return {
		companyId: raw.companyId,
		email: raw.email,
		firstName: raw.firstName,
		id: raw.id,
		lastName: raw.lastName,
		userId: raw.userId,
	}
}

export const clients = asyncReadable({
	initialValue: [],
	storageName: 'clients',
	refresh: false,
	dataProvider: () => axiosExtract<ClientRaw[]>(axios.get('/auth/client')),
	mapper: (rawList) => rawList.map((raw) => mapper(raw)),
});

export function save(client: SaveClient, id?: string): Promise<Client> {
	const axiosCall = id ? axios.put(`/auth/client/${id}`, client) : axios.post('/auth/client', client);
	return axiosExtract<ClientRaw>(axiosCall)
		.then((res) => mapper(res));
}

export function del(id: string): Promise<void> {
	return axiosExtract(axios.delete(`/auth/client/${id}`));
}

export interface ClientRaw {
	id: string,
	firstName: string,
	lastName: string,
	email: string | null,
	companyId: string | null,
	userId: string,
}

export interface Client {
	id: string,
	firstName: string,
	lastName: string,
	email: string | null,
	companyId: string | null,
	userId: string,
}

export interface SaveClient {
	firstName: string,
	lastName: string,
	email?: string | null,
	companyId?: string | null,
}
