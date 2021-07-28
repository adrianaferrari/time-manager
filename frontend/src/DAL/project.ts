import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { asyncReadable } from 'svelte-async-readable';
import { axiosExtract } from '../helpers/axios';
import type { Currency } from '../helpers/currency';
import { Activity, ActivityRaw, mapper as activityMapper } from './activity';
import { Payment, PaymentRaw, mapper as paymentMapper } from './payment';

export const projects = asyncReadable({
	initialValue: [],
	storageName: 'projects',
	refresh: false,
	dataProvider: () => axiosExtract<ProjectRaw[]>(axios.get('/auth/project')),
	mapper: (rawList) => rawList.map((raw) => mapper(raw)),
});

export function mapper(raw: ProjectRaw): Project {
	return {
		clientId: raw.clientId,
		currency: raw.currency,
		endDate: raw.endDate ? DateOnly.fromString(raw.endDate) : null,
		estimatedEffort: raw.estimatedEffort ? Interval.fromString(raw.estimatedEffort) : null,
		id: raw.id,
		name: raw.name,
		price: raw.price ? new BigNumber(raw.price) : null,
		startDate: DateOnly.fromString(raw.startDate),
		technologyIds: raw.technologyIds,
		userId: raw.userId,
		createdAt: new Date(raw.createdAt),
	};
}

export function detailsMapper(raw: ProjectDetailsRaw): ProjectDetails {
	return {
		...mapper(raw),
		timeSpent: raw.timeSpent ? new Interval(raw.timeSpent) : null,
		payments: raw.payments.map((p) => paymentMapper(p)),
		activities: raw.activities.map((a) => activityMapper(a)),
		timeSpentByCategory: raw.timeSpentByCategory.map((tsbc) => ({ categoryId: tsbc.group, timeSpent: new Interval(tsbc.timeSpent) })),
	};
}

export function save(project: SaveProject, id?: string): Promise<Project> {
	const axiosCall = id ? axios.put(`/auth/project/${id}`, project) : axios.post('/auth/project', project);
	return axiosExtract<ProjectRaw>(axiosCall)
		.then((res) => mapper(res));
}

export function del(id: string): Promise<void> {
	return axiosExtract(axios.delete(`/auth/project/${id}`));
}

export function get(id: string): Promise<ProjectDetails> {
	return axiosExtract<ProjectDetailsRaw>(axios.get(`/auth/project/${id}`))
		.then((res) => detailsMapper(res));
}
export interface Project {
	id: string,
	name: string,
	startDate: DateOnly,
	endDate: DateOnly | null,
	userId: string,
	clientId: string | null,
	price: BigNumber | null,
	estimatedEffort: Interval | null,
	currency: Currency | null,
	technologyIds: string[],
	createdAt: Date,
}

export interface ProjectDetails extends Project {
	timeSpent: Interval | null,
	payments: Payment[],
	activities: Activity[],
	timeSpentByCategory: { categoryId: string, timeSpent: Interval }[],
}
export interface ProjectRaw {
	id: string,
	name: string,
	startDate: string,
	endDate: string | null,
	userId: string,
	clientId: string | null,
	price: string | null,
	estimatedEffort: string | null,
	currency: Currency | null,
	technologyIds: string[],
	createdAt: string,
}

export interface ProjectDetailsRaw extends ProjectRaw {
	timeSpent: string | null,
	payments: PaymentRaw[],
	activities: ActivityRaw[],
	timeSpentByCategory: { group: string, timeSpent: string }[],
}
export interface SaveProject {
	name: string,
	startDate: DateOnly,
	endDate?: DateOnly | null,
	clientId?: string | null,
	price?: BigNumber | null,
	estimatedEffort?: Interval | null,
	currency?: string | null,
	technologyIds?: string[],
}
