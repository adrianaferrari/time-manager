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
	return axiosExtract<AsyncDataTableResponse<PaymentRaw>>(axios.get('/auth/project/all/payment', { params: { ...dataTableReq, ...filters } }))
		.then((res) => ({ ...res, records: res.records.map((raw) => mapper(raw)) }));
}

export function save(payment: SavePayment, id?: string): Promise<Payment> {
	const axiosCall = id
		? axios.put(`/auth/project/${payment.projectId}/payment/${id}`, payment)
		: axios.post(`/auth/project/${payment.projectId}/payment`, payment);
	return axiosExtract<PaymentRaw>(axiosCall)
		.then((res) => mapper(res));
}

export function get(id: string, projectId: string): Promise<Payment> {
	return axiosExtract<PaymentRaw>(axios.get(`/auth/project/${projectId}/payment/${id}`))
		.then((res) => mapper(res));
}

export function del(id: string, projectId: string): Promise<void> {
	return axiosExtract(axios.delete(`/auth/project/${projectId}/payment/${id}`));
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
	projectId: string,
}

export interface PaymentFilter {
	from?: DateOnly | null,
	to?: DateOnly | null,
	projectId?: string | null,
}
