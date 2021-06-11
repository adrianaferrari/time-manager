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
	};
}

export function list(dataTableReq: AsyncDataTableRequest, filters: PaymentFilter): Promise<AsyncDataTableResponse<Payment>> {
	return axiosExtract<AsyncDataTableResponse<PaymentRaw>>(axios.get('/auth/project/all/payment', { params: { ...dataTableReq, ...filters }}))
		.then((res) => ({ ...res, records: res.records.map((raw) => mapper(raw))}));
}

export function save(payment: SavePayment, id?: string): Promise<Payment> {
	const axiosCall = id ? axios.put(`/auth/project/${payment.projectId}/payment/${id}`, payment) : axios.post(`/auth/project/${payment.projectId}/payment`, payment);
	return axiosExtract<PaymentRaw>(axiosCall)
		.then((res) => mapper(res));
}

export interface PaymentRaw {
	id: string,
	date: string,
	amount: string,
	currency: Currency,
	projectId: string,
}

export interface Payment {
	id: string,
	date: DateOnly,
	amount: BigNumber,
	currency: Currency,
	projectId: string,
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
