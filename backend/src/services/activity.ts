import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import { findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId } from '../db/utils';
import { uuid } from '../types/common';
import { AsyncDataTableRequest, AsyncDataTableResponse } from '../types/async-data-table';
import knex from '../db';
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

export const fromQuery = fromQueryGenerator<Activity>(columnNames, (row) => rowMapper(row));

export function create(activity: SaveActivity, trx?: Transaction): Promise<Activity> {
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

export function list(userId: uuid, filter: FilterActivityRequest, trx?: Transaction): Promise<AsyncDataTableResponse<Activity>> {
	return transact([ 
		async (db) => {
			const getQuery = (filtered = true) => {
				let base = db(table)
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
			}
			const total = (await getQuery(false).count(`${table}.id`, { as: 'count '}))[0].count;
			const filtered = (await getQuery()
				.count(`${table}.id`, { as: 'count '}))[0].count;
			const records = await fromQuery(getQuery()
				.orderBy(filter.orderBy)
				.offset(filter.pageIndex * filter.recordsPerPage)
				.limit(filter.recordsPerPage), db);
			return {
				records,
				filtered,
				total,
			};
		}
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