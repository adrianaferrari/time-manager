import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { findOneGenerator, fromQueryGenerator, insertGetId } from '../db/utils';
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

export const fromQuery = fromQueryGenerator<Client>(columnNames, (row) => rowMapper(row));

export function create(client: SaveClient, trx?: Transaction): Promise<Client> {
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
