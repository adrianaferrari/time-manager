import { transact } from '@cdellacqua/knex-transact';
import { Knex } from 'knex';
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import BigNumber from 'bignumber.js';
import {
	findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId,
} from '../db/utils';
import { uuid } from '../types/common';
import { AsyncDataTableRequest, AsyncDataTableResponse } from '../types/async-data-table';
import { define } from '../helpers/object';
import * as category from './category';
import * as project from './project';

export const table = 'activity';

export const cols = {
	id: 'id',
	description: 'description',
	date: 'date',
	userId: 'userId',
	categoryId: 'categoryId',
	projectId: 'projectId',
	timeSpent: 'timeSpent',
};

const columnNames = Object.values(cols).map((col) => `${table}.${col}`);

async function rowMapper(row: ActivityRaw): Promise<Activity> {
	return Promise.resolve({
		...row,
		timeSpent: new Interval(row.timeSpent),
	});
}

export const find = findOneGenerator(table, columnNames, (row) => rowMapper(row));
export const findAll = findAllGenerator(table, columnNames, (row) => rowMapper(row));
export const fromQuery = fromQueryGenerator<Activity>(columnNames, (row) => rowMapper(row));

export function create(activity: SaveActivity, trx?: Knex.Transaction): Promise<Activity> {
	return transact([
		(db) => insertGetId(db(table)
			.insert({
				[cols.categoryId]: activity.categoryId,
				[cols.date]: activity.date.toString(),
				[cols.description]: activity.description,
				[cols.projectId]: activity.projectId,
				[cols.timeSpent]: activity.timeSpent.totalSeconds,
				[cols.userId]: activity.userId,
			})),
		(db, id) => find(id, db),
	], trx);
}

export function update(id: uuid, activity: SaveActivity, trx?: Knex.Transaction): Promise<Activity> {
	return transact([
		(db) => db(table)
			.where({ id })
			.update({
				[cols.categoryId]: activity.categoryId,
				[cols.date]: activity.date.toString(),
				[cols.description]: activity.description,
				[cols.projectId]: activity.projectId,
				[cols.timeSpent]: activity.timeSpent.totalSeconds,
			}),
		(db) => find(id, db),
	], trx);
}

export function list(userId: uuid, filter: FilterActivityRequest, trx?: Knex.Transaction): Promise<AsyncDataTableResponse<Activity>> {
	return transact([
		async (db) => {
			const getQuery = (filtered = true) => {
				const base = db(table)
					.leftJoin(project.table, `${table}.${cols.projectId}`, `${project.table}.${project.cols.id}`)
					.join(category.table, `${table}.${cols.categoryId}`, `${category.table}.${category.cols.id}`)
					.where(`${table}.${cols.userId}`, userId)
					.where(define({
						[`${table}.${cols.projectId}`]: filter.filters.projectId,
						[`${table}.${cols.categoryId}`]: filter.filters.categoryId,
					}))
					.where((qb) => {
						if (filter.filters.from) {
							qb.where(`${table}.${cols.date}`, '>=', filter.filters.from.toString());
						}
						if (filter.filters.to) {
							qb.where(`${table}.${cols.date}`, '<=', filter.filters.to.toString());
						}
						return qb;
					});
				if (filtered) {
					base.where(`${table}.${cols.description}`, 'like', `%${filter.query || ''}%`);
				}
				return base;
			};
			const total = (await getQuery(false).count(`${table}.id`, { as: 'count' }))[0].count;
			const filtered = (await getQuery()
				.count(`${table}.id`, { as: 'count' }))[0].count;
			const records = await fromQuery(getQuery()
				.orderBy(filter.orderBy)
				.offset(filter.pageIndex * filter.recordsPerPage)
				.limit(filter.recordsPerPage), db);
			return {
				records,
				filtered,
				total,
			};
		},
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

export function timeSpentByFilter(
	userId: uuid, filter?: Record<string, any> | string | number, filterIn?: { col: string, values: any[] }, trx?: Knex.Transaction,
): Promise<Interval> {
	return transact([
		(db) => db(table)
			.where(
				(builder) => {
					if (filter) {
						builder.where(typeof filter === 'object' ? filter : { id: filter });
					}
					if (filterIn) {
						builder.whereIn(filterIn.col, filterIn.values);
					}
				},
			)
			.where({ userId })
			.sum(cols.timeSpent),
		(_db, timeSpent) => Promise.resolve(new Interval(Number(timeSpent?.[0].sum || 0))),
	], trx);
}

export function timeSpentByFilterGrouped(
	userId: uuid, filter?: Record<string, any> | string | number, filterIn?: { col: string, values: any[] }, groupBy?: string, trx?: Knex.Transaction,
): Promise<Interval> {
	return transact([
		(db) => db(table)
			.where(
				(builder) => {
					if (filter) {
						builder.where(typeof filter === 'object' ? filter : { id: filter });
					}
					if (filterIn) {
						builder.whereIn(filterIn.col, filterIn.values);
					}
				},
			)
			.where({ userId })
			.groupBy(groupBy || cols.id)
			.orderByRaw(`sum("${cols.timeSpent}") desc`)
			.select(db.raw(`sum("${cols.timeSpent}") as "timeSpent", "${groupBy || cols.id}" as group`)),
		(_db, res: { group: any, timeSpent: BigNumber }[]) => Promise.resolve(
			res.map(({ group, timeSpent }) => ({ group, timeSpent: new Interval(Number(timeSpent || 0)) })),
		),
	], trx);
}

export interface ActivityRaw {
	id: uuid,
	description: string,
	date: DateOnly,
	userId: uuid,
	categoryId: uuid,
	projectId: uuid | null,
	timeSpent: number,
}

export interface Activity {
	id: uuid,
	description: string,
	date: DateOnly,
	userId: uuid,
	categoryId: uuid,
	projectId: uuid | null,
	timeSpent: Interval,
}

export interface SaveActivity {
	description: string,
	date: DateOnly,
	userId: uuid,
	categoryId: uuid,
	projectId?: uuid | null,
	timeSpent: Interval,
}

export interface FilterActivityRequest extends AsyncDataTableRequest {
	filters: {
		from?: DateOnly | null,
		to?: DateOnly | null,
		categoryId?: uuid | null,
		projectId?: uuid | null,
	}
}
