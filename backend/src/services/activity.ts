import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import { findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId } from '../db/utils';
import { uuid } from '../types/common';

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

const columnNames = Object.values(cols);

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
