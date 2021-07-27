import { transact } from '@cdellacqua/knex-transact';
import { Knex } from 'knex';
import {
	findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId,
} from '../db/utils';
import { uuid } from '../types/common';

export const table = 'client';

export const cols = {
	id: 'id',
	firstName: 'firstName',
	lastName: 'lastName',
	email: 'email',
	userId: 'userId',
	companyId: 'companyId',
};

const columnNames = Object.values(cols);

function rowMapper(row: ClientRaw): Promise<Client> {
	return Promise.resolve({
		...row,
	});
}

export const find = findOneGenerator(table, columnNames, (row) => rowMapper(row));

export const findAll = findAllGenerator(table, columnNames, (row) => rowMapper(row));

export const fromQuery = fromQueryGenerator<Client>(columnNames, (row) => rowMapper(row));

export function create(client: SaveClient, trx?: Knex.Transaction): Promise<Client> {
	return transact([
		async (db) => insertGetId(db(table)
			.insert({
				[cols.email]: client.email,
				[cols.firstName]: client.firstName,
				[cols.lastName]: client.lastName,
				[cols.userId]: client.userId,
				[cols.companyId]: client.companyId,
			})),
		(db, id) => find(id, db),
	], trx);
}

export function update(id: uuid, client: SaveClient, trx?: Knex.Transaction): Promise<Client> {
	return transact([
		(db) => db(table)
			.where({ id })
			.update({
				[cols.email]: client.email,
				[cols.firstName]: client.firstName,
				[cols.lastName]: client.lastName,
				[cols.companyId]: client.companyId,
			}),
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

export function alreadyExists(email: string, userId: uuid, id?: uuid, trx?: Knex.Transaction): Promise<boolean> {
	return find(({ email, userId }), trx).then((res) => (res ? res.id !== id : false));
}

export function findIdsByCompany(companyId: uuid, trx?: Knex.Transaction): Promise<uuid[]> {
	return transact([(db) => db(table).where({ [cols.companyId]: companyId }).pluck(cols.id)], trx);
}

export function findIdsByUser(userId: uuid, trx?: Knex.Transaction): Promise<uuid[]> {
	return transact([(db) => db(table).where({ [cols.userId]: userId }).pluck(cols.id)], trx);
}

export interface ClientRaw {
	id: uuid,
	firstName: string,
	lastName: string,
	email: string | null,
	companyId: uuid | null,
	userId: uuid,
}

export interface Client {
	id: uuid,
	firstName: string,
	lastName: string,
	email: string | null,
	companyId: uuid | null,
	userId: uuid,
}

export interface SaveClient {
	firstName: string,
	lastName: string,
	email?: string | null,
	companyId?: uuid | null,
	userId: uuid,
}
