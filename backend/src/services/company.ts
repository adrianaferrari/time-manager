import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import {
	findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId,
} from '../db/utils';
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

export const findAll = findAllGenerator(table, columnNames, (row) => rowMapper(row));

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

export function update(id: uuid, company: SaveCompany, trx?: Transaction): Promise<Company> {
	return transact([
		(db) => db(table)
			.where({ id })
			.update({
				[cols.email]: company.email,
				[cols.name]: company.name,
				[cols.vatNumber]: company.vatNumber,
			}),
		(db) => find(id, db),
	], trx);
}

export function del(id: uuid, trx?: Transaction): Promise<void> {
	return transact([
		(db) => db(table).where({ id }).delete(),
	], trx);
}

export function isOwned(id: uuid, userId: uuid, trx?: Transaction): Promise<boolean> {
	return find({ id, userId }, trx).then((res) => !!res);
}

export function vatNumberAlreadyExists(vatNumber: string, userId: uuid, id?: uuid, trx?: Transaction): Promise<boolean> {
	return find(({ vatNumber, userId }), trx).then((res) => (res ? res.id !== id : false));
}

export function emailAlreadyExists(email: string, userId: uuid, id?: uuid, trx?: Transaction): Promise<boolean> {
	return find(({ email, userId }), trx).then((res) => (res ? res.id !== id : false));
}

export function findIdsByUser(userId: string, trx?: Transaction): Promise<uuid[]> {
	return transact((db) => db(table).where({ [cols.userId]: userId }).pluck(cols.id), trx);
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
