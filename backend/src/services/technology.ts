import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId } from '../db/utils';
import { define } from '../helpers/object';
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

export const findAll = findAllGenerator(table, columnNames, (row) => rowMapper(row));

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

export function update(id: uuid, technology: SaveTechnology, trx?: Transaction): Promise<Technology> {
	return transact([
		(db) => db(table)
			.where({ id })
			.update({
				[cols.name]: technology.name,
			}),
		(db) => find(id, db),
	], trx);
}

export function del(id: uuid, trx?: Transaction): Promise<void> {
	return transact([
		(db) => db(table).where({ id }).delete(),
	], trx);
}

export function areOwned(ids: uuid[], userId: uuid, trx?: Transaction): Promise<boolean> {
	return transact([
		(db) => fromQuery(db(table).where({ userId }).whereIn(cols.id, ids))
			.then((found) => found.length === ids.length),
	], trx);
}

export function isOwned(id: uuid, userId: uuid, trx?: Transaction): Promise<boolean> {
	return find({ id, userId }, trx).then((res) => !!res);
}

export function alreadyExists(name: string, userId: uuid, id?: uuid, trx?: Transaction): Promise<boolean> {
	return find(define({ name, userId }), trx).then((res) => res ? res.id !== id : false);
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
