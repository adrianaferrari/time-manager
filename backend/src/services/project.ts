import { transact } from '@cdellacqua/knex-transact';
import { Knex } from 'knex';
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import BigNumber from 'bignumber.js';
import {
	findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId,
} from '../db/utils';
import { uuid } from '../types/common';

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

export const findAllTechnologies = findAllGenerator<Record<string, any> | string | number, uuid>(
	technologyTable, technologyColNames, (row) => row.technologyId,
);

async function rowMapper(row: ProjectRaw, trx?: Knex.Transaction): Promise<Project> {
	return Promise.resolve({
		...row,
		technologyIds: await findAllTechnologies({ projectId: row.id }, undefined, trx),
		estimatedEffort: row.estimatedEffort ? new Interval(row.estimatedEffort) : null,
	});
}

export const find = findOneGenerator(table, columnNames, (row, trx) => rowMapper(row, trx));

export const findAll = findAllGenerator(table, columnNames, (row, trx) => rowMapper(row, trx));

export const fromQuery = fromQueryGenerator<Project>(columnNames, (row, trx) => rowMapper(row, trx));

export function create(project: SaveProject, trx?: Knex.Transaction): Promise<Project> {
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

export function update(id: uuid, project: SaveProject, trx?: Knex.Transaction): Promise<Project> {
	return transact([
		(db) => db(table)
			.where({ id })
			.update({
				[cols.name]: project.name,
				[cols.clientId]: project.clientId,
				[cols.endDate]: project.endDate?.toString(),
				[cols.estimatedEffort]: project.estimatedEffort?.totalSeconds,
				[cols.price]: project.price?.toString(),
				[cols.startDate]: project.startDate.toString(),
				[cols.currency]: project.currency,
			}),
		async (db) => {
			await db(technologyTable).where({ projectId: id }).delete();
			if (project.technologyIds && project.technologyIds.length) {
				await db(technologyTable).insert(project.technologyIds.map((technologyId) => ({ projectId: id, technologyId })));
			}
		},
		(db) => find(id, db),
	], trx);
}

export function del(id: uuid, trx?: Knex.Transaction): Promise<void> {
	return transact([
		(db) => db(table).where({ id }).delete(),
	], trx);
}

export function isOwned(id: uuid, userId: uuid, trx?: Knex.Transaction): Promise<boolean> {
	return find({ id, userId }, trx).then((res) => !!res);
}

export function findIdsByClient(clientId: uuid, trx?: Knex.Transaction): Promise<uuid[]> {
	return transact([(db) => db(table).where({ [cols.clientId]: clientId }).pluck(cols.id)], trx);
}

export function findIdsByClients(clientIds: uuid[], trx?: Knex.Transaction): Promise<uuid[]> {
	return transact([(db) => db(table).whereIn(cols.clientId, clientIds).pluck(cols.id)], trx);
}

export function findIdsByUser(userId: uuid, trx?: Knex.Transaction): Promise<uuid[]> {
	return transact([(db) => db(table).where({ [cols.userId]: userId }).pluck(cols.id)], trx);
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
