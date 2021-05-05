import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import { findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId } from '../db/utils';
import { uuid } from '../types/common';
import BigNumber from 'bignumber.js';

export const table = 'project';

export const technologyTable = 'technologyProject';

export const cols = {
	id: 'id',
	name: 'name',
	startDate: 'startDate',
	endDate: 'endDate',
	userId: 'userId',
	clientId: 'clientId',
	price: 'price',
	estimatedEffort: 'estimatedEffort',
	currency: 'currency',
};

export const technologyCols = {
	id: 'id',
	technologyId: 'technologyId',
	projectId: 'projectId',
};

const columnNames = Object.values(cols);

const technologyColNames = Object.values(technologyCols);

async function rowMapper(row: ProjectRaw): Promise<Project> {
	return Promise.resolve({
		...row,
		technologyIds: await findAllTechnologies({ projectId: row.id }),
		estimatedEffort: row.estimatedEffort ? new Interval(row.estimatedEffort) : null,
	});
}

export const find = findOneGenerator(table, columnNames, (row) => rowMapper(row));

export const findAllTechnologies = findAllGenerator<Record<string, any> | string | number, uuid>(technologyTable, technologyColNames, (row) => row.technologyId);

export const fromQuery = fromQueryGenerator<Project>(columnNames, (row) => rowMapper(row));

export function create(project: SaveProject, trx?: Transaction): Promise<Project> {
	return transact([
		(db) => insertGetId(db(table)
			.insert({
				[cols.name]: project.name,
				[cols.clientId]: project.clientId,
				[cols.endDate]: project.endDate?.toString(),
				[cols.estimatedEffort]: project.estimatedEffort?.totalSeconds,
				[cols.price]: project.price?.toString(),
				[cols.startDate]: project.startDate.toString(),
				[cols.userId]: project.userId,
				[cols.currency]: project.currency,
			})),
		async (db, id) => {
			if (project.technologyIds && project.technologyIds.length) {
				await db(technologyTable).insert(project.technologyIds.map((technologyId) => ({ projectId: id, technologyId })));
			}
			return id;
		},
		(db, id) => find(id, db),
	], trx);
}


export interface ProjectRaw {
	id: uuid,
	name: string,
	startDate: DateOnly,
	endDate: DateOnly | null,
	userId: uuid,
	clientId: uuid | null,
	price: BigNumber | null,
	estimatedEffort: number | null,
	currency: string | null,
	technologyIds: uuid[],
}

export interface Project {
	id: uuid,
	name: string,
	startDate: DateOnly,
	endDate: DateOnly | null,
	userId: uuid,
	clientId: uuid | null,
	price: BigNumber | null,
	estimatedEffort: Interval | null,
	currency: string | null,
	technologyIds: uuid[],
}

export interface SaveProject {
	name: string,
	startDate: DateOnly,
	endDate?: DateOnly | null,
	userId: uuid,
	clientId?: uuid | null,
	price?: BigNumber | null,
	estimatedEffort?: Interval | null,
	currency?: string | null,
	technologyIds?: uuid[],
}
