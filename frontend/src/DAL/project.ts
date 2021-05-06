import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { asyncReadable } from 'svelte-async-readable';
import { axiosExtract } from '../helpers/axios';
import type { Currency } from '../helpers/currency';

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
	}
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
}
