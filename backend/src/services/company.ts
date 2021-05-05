import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { findOneGenerator, fromQueryGenerator, insertGetId } from '../db/utils';
import { uuid } from '../types/common';

export const table = 'company';

export const cols = {
	id: 'id',
	name: 'name',
	vatNumber: 'vatNumber',
	email: 'email',
	userId: 'userId',
};

const columnNames = Object.values(cols);

function rowMapper(row: CompanyRaw): Promise<Company> {
	return Promise.resolve({
		...row,
	});
}

export const find = findOneGenerator(table, columnNames, (row) => rowMapper(row));

export const fromQuery = fromQueryGenerator<Company>(columnNames, (row) => rowMapper(row));

export function create(company: SaveCompany, trx?: Transaction): Promise<Company> {
	return transact([
		async (db) => insertGetId(db(table)
			.insert({
				[cols.email]: company.email,
				[cols.name]: company.name,
				[cols.vatNumber]: company.vatNumber,
				[cols.userId]: company.userId,
			})),
		(db, id) => find(id, db),
	], trx);
}


export interface CompanyRaw {
	id: uuid,
	name: string,
	vatNumber: string | null,
	email: string | null,
	userId: uuid,
}

export interface Company {
	id: uuid,
	name: string,
	vatNumber: string | null,
	email: string | null,
	userId: uuid,
}

export interface SaveCompany {
	name: string,
	vatNumber?: string | null,
	email?: string | null,
	userId: uuid,
}
