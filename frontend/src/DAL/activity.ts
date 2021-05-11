import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import axios from 'axios';
import { axiosExtract } from '../helpers/axios';
import type { AsyncDataTableRequest, AsyncDataTableResponse } from '../types/async-data-table';

export function mapper(raw: ActivityRaw): Activity {
	return {
		categoryId: raw.categoryId,
		date: DateOnly.fromString(raw.date),
		description: raw.description,
		id: raw.id,
		projectId: raw.projectId,
		timeSpent: Interval.fromString(raw.timeSpent),
		userId: raw.userId,
	};
}

export function list(dataTableReq: AsyncDataTableRequest, filters: ActivityFilter): Promise<AsyncDataTableResponse<Activity>> {
	return axiosExtract<AsyncDataTableResponse<ActivityRaw>>(axios.get('/auth/activity', { params: { ...dataTableReq, ...filters }}))
		.then((res) => ({ ...res, records: res.records.map((raw) => mapper(raw))}));
}

export function save(activity: SaveActivity, id?: string): Promise<Activity> {
	const axiosCall = id ? axios.put(`/auth/activity/${id}`, activity) : axios.post('/auth/activity', activity);
	return axiosExtract<ActivityRaw>(axiosCall)
		.then((res) => mapper(res));
}

export function del(id: string): Promise<void> {
	return axiosExtract(axios.delete(`/auth/activity/${id}`));
}

export interface Activity {
	id: string,
	description: string,
	date: DateOnly,
	userId: string,
	categoryId: string,
	projectId: string | null,
	timeSpent: Interval,
}

export interface ActivityRaw {
	id: string,
	description: string,
	date: string,
	userId: string,
	categoryId: string,
	projectId: string | null,
	timeSpent: string,
}

export interface ActivityFilter {
	from?: DateOnly | null,
	to?: DateOnly | null,
	categoryId?: string | null,
	projectId?: string | null,
}

export interface SaveActivity {
	description: string,
	date: DateOnly,
	categoryId: string,
	projectId?: string | null,
	timeSpent: Interval,
}
