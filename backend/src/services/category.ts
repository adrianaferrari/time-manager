import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId } from '../db/utils';
import { uuid } from '../types/common';

export const table = 'category';

export const cols = {
	id: 'id',
	name: 'name',
	userId: 'userId',
};

const columnNames = Object.values(cols);

function rowMapper(row: CategoryRaw): Promise<Category> {
	return Promise.resolve({
		...row,
	});
}

export const find = findOneGenerator(table, columnNames, (row) => rowMapper(row));

export const findAll = findAllGenerator(table, columnNames, (row) => rowMapper(row));

export const fromQuery = fromQueryGenerator<Category>(columnNames, (row) => rowMapper(row));

export function create(category: SaveCategory, trx?: Transaction): Promise<Category> {
	return transact([
		async (db) => insertGetId(db(table)
			.insert({
				[cols.name]: category.name,
				[cols.userId]: category.userId,
			})),
		(db, id) => find(id, db),
	], trx);
}


export interface CategoryRaw {
	id: uuid,
	name: string,
	userId: uuid,
}

export interface Category {
	id: uuid,
	name: string,
	userId: uuid,
}

export interface SaveCategory {
	name: string,
	userId: uuid,
}
