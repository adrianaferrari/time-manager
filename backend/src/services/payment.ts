import { DateOnly } from '@cdellacqua/date-only';
import { transact } from '@cdellacqua/knex-transact';
import BigNumber from 'bignumber.js';
import { Transaction } from 'knex';
import {
	findAllGenerator, findOneGenerator, fromQueryGenerator, insertGetId,
} from '../db/utils';
import { define } from '../helpers/object';
import { AsyncDataTableRequest, AsyncDataTableResponse } from '../types/async-data-table';
import { Currency, uuid } from '../types/common';
import * as project from './project';

export const table = 'payment';

export const cols = {
	id: 'id',
	currency: 'currency',
	date: 'date',
	amount: 'amount',
	projectId: 'projectId',
};

const columnNames = Object.values(cols).map((cn) => `${table}.${cn}`);

function rowMapper(row: PaymentRaw): Promise<Payment> {
	return Promise.resolve({
		...row,
	});
}

export const find = findOneGenerator(table, columnNames, (row) => rowMapper(row));
export const findAll = findAllGenerator(table, columnNames, (row) => rowMapper(row));
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

export function update(id: uuid, payment: SavePayment, trx?: Transaction): Promise<Payment> {
	return transact([
		(db) => db(table)
			.where({ id })
			.update({
				[cols.amount]: payment.amount.toString(),
				[cols.currency]: payment.currency,
				[cols.date]: payment.date.toString(),
				[cols.projectId]: payment.projectId,
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
	return transact([
		(db) => find({ id }, db),
		(db, payment) => project.find({ userId, id: payment.projectId }, db),
	], trx).then((res) => !!res);
}

export function list(userId: uuid, filter: FilterPaymentRequest, trx?: Transaction): Promise<AsyncDataTableResponse<Payment>> {
	return transact([
		async (db) => {
			const getQuery = (filtered = true) => {
				const base = db(table)
					.join(project.table, `${table}.${cols.projectId}`, `${project.table}.${project.cols.id}`)
					.where(`${project.table}.${project.cols.userId}`, userId)
					.where(define({
						[`${table}.${cols.projectId}`]: filter.filters.projectId,
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
					base.where(`${project.table}.${project.cols.name}`, 'ilike', `%${filter.query || ''}%`);
				}
				return base;
			};
			const total = (await getQuery(false).count(`${table}.id`, { as: 'count ' }))[0].count;
			const filtered = (await getQuery()
				.count(`${table}.id`, { as: 'count ' }))[0].count;
			const records = await fromQuery(getQuery()
				.orderBy(filter.orderBy)
				.offset(filter.pageIndex * filter.recordsPerPage)
				.limit(filter.recordsPerPage), db);
			return {
				records,
				filtered,
				total,
			};
		},
	], trx);
}

export interface PaymentRaw {
	id: uuid,
	date: DateOnly,
	amount: BigNumber,
	currency: Currency,
	projectId: uuid,
}

export interface Payment {
	id: uuid,
	date: DateOnly,
	amount: BigNumber,
	currency: Currency,
	projectId: uuid,
}

export interface SavePayment {
	date: DateOnly,
	amount: BigNumber,
	currency: Currency,
	projectId: uuid,
}

export interface FilterPaymentRequest extends AsyncDataTableRequest {
	filters: {
		from?: DateOnly | null,
		to?: DateOnly | null,
		projectId?: uuid | null,
	}
}
