import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { findOneGenerator, fromQueryGenerator, insertGetId } from '../db/utils';
import { uuid } from '../types/common';

export const table = 'technology';

export const cols = {
	id: 'id',
	name: 'name',
	userId: 'userId',
};

const columnNames = Object.values(cols);

function rowMapper(row: TechnologyRaw): Promise<Technology> {
	return Promise.resolve({
		...row,
	});
}

export const find = findOneGenerator(table, columnNames, (row) => rowMapper(row));

export const fromQuery = fromQueryGenerator<Technology>(columnNames, (row) => rowMapper(row));

export function create(technology: SaveTechnology, trx?: Transaction): Promise<Technology> {
	return transact([
		async (db) => insertGetId(db(table)
			.insert({
				[cols.name]: technology.name,
				[cols.userId]: technology.userId,
			})),
		(db, id) => find(id, db),
	], trx);
}


export interface TechnologyRaw {
	id: uuid,
	name: string,
	userId: uuid,
}

export interface Technology {
	id: uuid,
	name: string,
	userId: uuid,
}

export interface SaveTechnology {
	name: string,
	userId: uuid,
}
