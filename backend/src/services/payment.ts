import { DateOnly } from '@cdellacqua/date-only';
import { transact } from '@cdellacqua/knex-transact';
import BigNumber from 'bignumber.js';
import { Transaction } from 'knex';
import { findOneGenerator, fromQueryGenerator, insertGetId } from '../db/utils';
import { uuid } from '../types/common';

export const table = 'payment';

export const cols = {
	id: 'id',
	currency: 'currency',
	date: 'date',
	amount: 'amount',
	projectId: 'projectId',
};

const columnNames = Object.values(cols);

function rowMapper(row: PaymentRaw): Promise<Payment> {
	return Promise.resolve({
		...row,
	});
}

export const find = findOneGenerator(table, columnNames, (row) => rowMapper(row));

export const fromQuery = fromQueryGenerator<Payment>(columnNames, (row) => rowMapper(row));

export function create(payment: SavePayment, trx?: Transaction): Promise<Payment> {
	return transact([
		async (db) => insertGetId(db(table)
			.insert({
				[cols.amount]: payment.amount.toString(),
				[cols.currency]: payment.currency,
				[cols.date]: payment.date.toString(),
				[cols.projectId]: payment.projectId,
			})),
		(db, id) => find(id, db),
	], trx);
}


export interface PaymentRaw {
	id: uuid,
	date: DateOnly,
	amount: BigNumber,
	currency: string,
	projectId: uuid,
}

export interface Payment {
	id: uuid,
	date: DateOnly,
	amount: BigNumber,
	currency: string,
	projectId: uuid,
}

export interface SavePayment {
	date: DateOnly,
	amount: BigNumber,
	currency: string,
	projectId: uuid,
}
