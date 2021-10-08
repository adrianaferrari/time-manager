import { DateOnly } from '@cdellacqua/date-only';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { axiosExtract } from '../helpers/axios';
import type { Currency } from '../helpers/currency';
import type { AsyncDataTableRequest, AsyncDataTableResponse } from '../types/async-data-table';

export function mapper(raw: PaymentRaw): Payment {
	return {
		amount: new BigNumber(raw.amount),
		currency: raw.currency,
		date: DateOnly.fromString(raw.date),
		id: raw.id,
		projectId: raw.projectId,
		createdAt: new Date(raw.createdAt),
	};
}

export function list(dataTableReq: AsyncDataTableRequest, filters: PaymentFilter): Promise<AsyncDataTableResponse<Payment>> {
	return axiosExtract<AsyncDataTableResponse<PaymentRaw>>(axios.get('/auth/payment', { params: { ...dataTableReq, ...filters } }))
		.then((res) => ({ ...res, records: res.records.map((raw) => mapper(raw)) }));
}

export function save(payment: SavePayment, id?: string): Promise<Payment[]> {
	const axiosCall = id
		? axios.put(`/auth/payment/${id}`, payment)
		: axios.post('/auth/payment', payment);
	return axiosExtract<PaymentRaw[]>(axiosCall)
		.then((res) => res.map((el) => mapper(el)));
}

export function get(id: string): Promise<Payment> {
	return axiosExtract<PaymentRaw>(axios.get(`/auth/payment/${id}`))
		.then((res) => mapper(res));
}

export function del(id: string): Promise<void> {
	return axiosExtract(axios.delete(`/auth/payment/${id}`));
}

export interface PaymentRaw {
	id: string,
	date: string,
	amount: string,
	currency: Currency,
	projectId: string,
	createdAt: string,
}

export interface Payment {
	id: string,
	date: DateOnly,
	amount: BigNumber,
	currency: Currency,
	projectId: string,
	createdAt: Date,
}

export interface SavePayment {
	date: DateOnly,
	amount: BigNumber,
	currency: Currency,
	projectIds: string[],
	from?: Date | undefined,
	to?: Date | undefined
}

export interface PaymentFilter {
	from?: DateOnly | null,
	to?: DateOnly | null,
	projectId?: string | null,
}
