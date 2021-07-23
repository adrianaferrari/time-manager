/* eslint-disable no-param-reassign */
import { transact } from '@cdellacqua/knex-transact';
import BigNumber from 'bignumber.js';
import { Transaction } from 'knex';
import { Interval } from '@cdellacqua/interval';
import { Currency, uuid } from '../types/common';
import * as payment from './payment';
import * as project from './project';
import * as client from './client';
import * as activity from './activity';

function computeFirstDate() {
	const firstDate = new Date();
	firstDate.setDate(1);
	firstDate.setHours(0);
	firstDate.setFullYear(firstDate.getFullYear() - 1);
	return firstDate;
}

function computeLastDate() {
	const lastDate = new Date();
	lastDate.setDate(1);
	lastDate.setHours(0);
	return lastDate;
}
export function paymentByMonth(
	projectIds: uuid[],
	firstDate?: Date,
	lastDate?: Date,
	trx?: Transaction,
): Promise<{ data: ({ month: number } & { [key in Currency]?: BigNumber })[], currencies: Currency[] }> {
	return transact([async (db) => {
		if (!firstDate) {
			firstDate = computeFirstDate();
		}
		if (!lastDate) {
			lastDate = computeLastDate();
		}
		const rawResults: { currency: Currency, amount: BigNumber, month: number }[] = await db.table(payment.table)
			.select(db.raw(`sum("${payment.cols.amount}") as amount, "${payment.cols.currency}", date_part('month', ${payment.cols.date}) as month`))
			.where(payment.cols.date, '>=', firstDate)
			.where(payment.cols.date, '<', lastDate)
			.whereIn(payment.cols.projectId, projectIds)
			.groupByRaw(`date_part('month', ${payment.cols.date})`)
			.groupBy(payment.cols.currency);
		const allCurrencies: Currency[] = [];
		rawResults.forEach((record) => {
			if (!allCurrencies.includes(record.currency)) {
				allCurrencies.push(record.currency);
			}
		});
		const results = new Array(12);
		for (let i = 0; i < 12; i++) {
			const current: { [key in Currency]?: BigNumber } & { month: number } = { month: i };
			allCurrencies.forEach((currency) => {
				current[currency] = rawResults.find((res) => res.currency === currency && res.month === i)?.amount || new BigNumber(0);
			});
			results[i] = current;
		}
		return { data: results, currencies: allCurrencies };
	}], trx);
}

export function paymentByClient(
	clientIds: uuid[],
	firstDate?: Date,
	lastDate?: Date,
	trx?: Transaction,
): Promise<{ data: ({ clientId: string } & { [key in Currency]?: BigNumber })[], currencies: Currency[], clientIds: uuid[] }> {
	return transact([async (db) => {
		const rawResults: { currency: Currency, amount: BigNumber, clientId: uuid }[] = await db.table(payment.table)
			.innerJoin(project.table, `${project.table}.${project.cols.id}`, `${payment.table}.${payment.cols.projectId}`)
			.select(db.raw(`
				sum("${payment.table}"."${payment.cols.amount}") as amount, 
				"${payment.table}"."${payment.cols.currency}", 
				"${project.table}"."${project.cols.clientId}"
			`))
			.where((subquery) => {
				if (firstDate) {
					subquery.where(`${payment.table}.${payment.cols.date}`, '>=', firstDate);
				}
				if (lastDate) {
					subquery.where(`${payment.table}.${payment.cols.date}`, '<', lastDate);
				}
			})
			.whereIn(`${project.table}.${project.cols.clientId}`, clientIds)
			.groupBy(`${project.table}.${project.cols.clientId}`)
			.groupBy(`${payment.table}.${payment.cols.currency}`);
		const allCurrencies: Currency[] = [];
		const allClientIds: uuid[] = [];
		rawResults.forEach((record) => {
			if (!allCurrencies.includes(record.currency)) {
				allCurrencies.push(record.currency);
			}
			if (!allClientIds.includes(record.clientId)) {
				allClientIds.push(record.clientId);
			}
		});
		const results: ({ clientId: string } & { [key in Currency]?: BigNumber })[] = [];
		allClientIds.forEach((clientId) => {
			const current: { clientId: uuid } & { [key in Currency]?: BigNumber } = { clientId };
			allCurrencies.forEach((currency) => {
				current[currency] = rawResults.find((r) => r.currency === currency && r.clientId === clientId)?.amount ?? new BigNumber(0);
			});
			results.push(current);
		});
		return { data: results, currencies: allCurrencies, clientIds: allClientIds };
	}], trx);
}

export function effortByMonth(
	userId: uuid,
	firstDate?: Date,
	lastDate?: Date,
	trx?: Transaction,
): Promise<{ month: number, effort: Interval }[]> {
	return transact([async (db) => {
		if (!firstDate) {
			firstDate = computeFirstDate();
		}
		if (!lastDate) {
			lastDate = computeLastDate();
		}
		const rawResults: { month: number, effort: number }[] = await db.table(activity.table)
			.select(db.raw(`sum("${activity.cols.timeSpent}") as effort, date_part('month', ${activity.cols.date}) as month`))
			.where(activity.cols.userId, userId)
			.where(activity.cols.date, '>=', firstDate)
			.where(activity.cols.date, '<', lastDate)
			.groupByRaw(`date_part('month', ${activity.cols.date})`);
		const results = new Array(12);
		for (let i = 0; i < 12; i++) {
			const current: { month: number, effort?: Interval } = { month: i };
			const rawCurrent = rawResults.find((r) => r.month === i);
			current.effort = new Interval(rawCurrent?.effort || 0);
			results[i] = current;
		}
		return results;
	}], trx);
}

export function rateByProject(
	userId: uuid,
	projectIds: uuid[],
	firstDate?: Date,
	lastDate?: Date,
	trx?: Transaction,
): Promise<{
	data: ({ projectId: uuid } & { [key in Currency]?: BigNumber })[],
	dataAvg: { [key in Currency]?: BigNumber},
	projectIds: uuid[],
	currencies: Currency[]
}> {
	return transact([async (db) => {
		if (!firstDate) {
			firstDate = computeFirstDate();
		}
		if (!lastDate) {
			lastDate = computeLastDate();
		}

		const getQuery = (grouped = false) => db
			.from(
				(builder: any) => builder.table(activity.table)
					.select(
						db.raw(`
								sum("${activity.table}"."${activity.cols.timeSpent}") / 3600.0 as "effort"
								${grouped ? `, "${activity.table}"."${activity.cols.projectId}" as "projectId"` : ''}
							`),
					)
					.where(`${activity.table}.${activity.cols.date}`, '>=', firstDate)
					.where(`${activity.table}.${activity.cols.date}`, '<', lastDate)
					.where(`${activity.table}.${activity.cols.userId}`, userId)
					.whereIn(`${activity.table}.${activity.cols.projectId}`, projectIds)
					.groupBy(grouped ? `${activity.table}.${activity.cols.projectId}` : `${activity.table}.${activity.cols.userId}`)
					.as('effort'),
			)
			.innerJoin(payment.table, (join) => {
				if (grouped) {
					join.on(`${payment.table}.${payment.cols.projectId}`, 'effort.projectId');
				} else {
					join.onNotNull('effort.effort');
				}
			})
			.select(
				db.raw(
					`sum("${payment.table}"."${payment.cols.amount}") / "effort"."effort" as "rate", 
						${grouped ? `"${payment.table}"."${payment.cols.projectId}",` : ''} 
						"${payment.table}"."${payment.cols.currency}"`,
				),
			)
			.where(`${payment.table}.${payment.cols.date}`, '>=', firstDate!)
			.where(`${payment.table}.${payment.cols.date}`, '<', lastDate!)
			.whereIn(`${payment.table}.${payment.cols.projectId}`, projectIds);

		const rawResults: { currency: Currency, projectId: uuid, rate: BigNumber }[] = await getQuery(true)
			.groupBy(`${payment.table}.${payment.cols.projectId}`)
			.groupBy(`${payment.table}.${payment.cols.currency}`)
			.groupBy('effort.effort');
		const rawResultsAvg: { currency: Currency, rate: BigNumber }[] = await getQuery()
			.groupBy(`${payment.table}.${payment.cols.currency}`)
			.groupBy('effort.effort');
		const results: ({ projectId: uuid } & { [key in Currency]?: BigNumber })[] = [];
		const allCurrencies: Currency[] = [];
		const allProjectIds: uuid[] = [];
		rawResults.forEach((record) => {
			if (!allCurrencies.includes(record.currency)) {
				allCurrencies.push(record.currency);
			}
			if (!allProjectIds.includes(record.projectId)) {
				allProjectIds.push(record.projectId);
			}
		});
		allProjectIds.forEach((projectId) => {
			const current: { projectId: uuid } & { [key in Currency]?: BigNumber } = { projectId };
			allCurrencies.forEach((currency) => {
				current[currency] = rawResults.find((r) => r.currency === currency && r.projectId === projectId)?.rate ?? new BigNumber(0);
			});
			results.push(current);
		});
		const resultsAvg: { [key in Currency]?: BigNumber } = {};
		allCurrencies.forEach((c) => {
			resultsAvg[c] = rawResultsAvg.find((r) => r.currency === c)?.rate ?? new BigNumber(0);
		});
		return {
			data: results, currencies: allCurrencies, projectIds: allProjectIds, dataAvg: resultsAvg,
		};
	}], trx);
}

export function rateByCompany(
	userId: uuid,
	companyIds: uuid[],
	firstDate?: Date,
	lastDate?: Date,
	trx?: Transaction,
): Promise<{
	data: ({ companyId: uuid } & { [key in Currency]?: BigNumber })[],
	dataAvg: { [key in Currency]?: BigNumber},
	companyIds: uuid[],
	currencies: Currency[]
}> {
	return transact([async (db) => {
		const getQuery = (grouped = false) => db
			.from(
				(builder: any) => builder.table(activity.table)
					.select(
						db.raw(`
								sum("${activity.table}"."${activity.cols.timeSpent}") / 3600.0 as "effort"
								${grouped ? `, "${client.table}"."${client.cols.companyId}" as "companyId"` : ''}
							`),
					)
					.innerJoin(project.table, `${project.table}.${project.cols.id}`, `${activity.table}.${activity.cols.projectId}`)
					.innerJoin(client.table, `${project.table}.${project.cols.clientId}`, `${client.table}.${client.cols.id}`)
					.where((subquery: any) => {
						if (firstDate) {
							subquery.where(`${activity.table}.${activity.cols.date}`, '>=', firstDate);
						}
						if (lastDate) {
							subquery.where(`${activity.table}.${activity.cols.date}`, '<', lastDate);
						}
					})
					.where(`${activity.table}.${activity.cols.userId}`, userId)
					.whereIn(`${client.table}.${client.cols.companyId}`, companyIds)
					.groupBy(grouped ? `${client.table}.${client.cols.companyId}` : `${activity.table}.${activity.cols.userId}`)
					.as('effort'),
			)
			.innerJoin(client.table, (join) => {
				if (grouped) {
					join.on(`${client.table}.${client.cols.companyId}`, 'effort.companyId');
				} else {
					join.onNotNull('effort.effort');
				}
			})
			.innerJoin(project.table, `${client.table}.${client.cols.id}`, `${project.table}.${project.cols.clientId}`)
			.innerJoin(payment.table, `${payment.table}.${payment.cols.projectId}`, `${project.table}.${project.cols.id}`)
			.select(
				db.raw(
					`sum("${payment.table}"."${payment.cols.amount}") / "effort"."effort" as "rate", 
						${grouped ? `"${client.table}"."${client.cols.companyId}",` : ''} 
						"${payment.table}"."${payment.cols.currency}"`,
				),
			)
			.where((subquery: any) => {
				if (firstDate) {
					subquery.where(`${payment.table}.${payment.cols.date}`, '>=', firstDate);
				}
				if (lastDate) {
					subquery.where(`${payment.table}.${payment.cols.date}`, '<', lastDate);
				}
			})
			.whereIn(`${client.table}.${client.cols.companyId}`, companyIds);

		const rawResults: { currency: Currency, companyId: uuid, rate: BigNumber }[] = await getQuery(true)
			.groupBy(`${client.table}.${client.cols.companyId}`)
			.groupBy(`${payment.table}.${payment.cols.currency}`)
			.groupBy('effort.effort');
		const rawResultsAvg: { currency: Currency, rate: BigNumber }[] = await getQuery()
			.groupBy(`${payment.table}.${payment.cols.currency}`)
			.groupBy('effort.effort');
		const results: ({ companyId: uuid } & { [key in Currency]?: BigNumber })[] = [];
		const allCurrencies: Currency[] = [];
		const allCompanyIds: uuid[] = [];
		rawResults.forEach((record) => {
			if (!allCurrencies.includes(record.currency)) {
				allCurrencies.push(record.currency);
			}
			if (!allCompanyIds.includes(record.companyId)) {
				allCompanyIds.push(record.companyId);
			}
		});
		allCompanyIds.forEach((companyId) => {
			const current: { companyId: uuid } & { [key in Currency]?: BigNumber } = { companyId };
			allCurrencies.forEach((currency) => {
				current[currency] = rawResults.find((r) => r.currency === currency && r.companyId === companyId)?.rate ?? new BigNumber(0);
			});
			results.push(current);
		});
		const resultsAvg: { [key in Currency]?: BigNumber } = {};
		allCurrencies.forEach((c) => {
			resultsAvg[c] = rawResultsAvg.find((r) => r.currency === c)?.rate ?? new BigNumber(0);
		});
		return {
			data: results, currencies: allCurrencies, companyIds: allCompanyIds, dataAvg: resultsAvg,
		};
	}], trx);
}

export function rateByClient(
	userId: uuid,
	clientIds: uuid[],
	firstDate?: Date,
	lastDate?: Date,
	trx?: Transaction,
): Promise<{
	data: ({ clientId: uuid } & { [key in Currency]?: BigNumber })[],
	dataAvg: { [key in Currency]?: BigNumber},
	clientIds: uuid[],
	currencies: Currency[]
}> {
	return transact([async (db) => {
		const getQuery = (grouped = false) => db
			.from(
				(builder: any) => builder.table(activity.table)
					.select(
						db.raw(`
								sum("${activity.table}"."${activity.cols.timeSpent}") / 3600.0 as "effort"
								${grouped ? `, "${project.table}"."${project.cols.clientId}" as "clientId"` : ''}
							`),
					)
					.innerJoin(project.table, `${project.table}.${project.cols.id}`, `${activity.table}.${activity.cols.projectId}`)
					.where((subquery: any) => {
						if (firstDate) {
							subquery.where(`${activity.table}.${activity.cols.date}`, '>=', firstDate);
						}
						if (lastDate) {
							subquery.where(`${activity.table}.${activity.cols.date}`, '<', lastDate);
						}
					})
					.where(`${activity.table}.${activity.cols.userId}`, userId)
					.whereIn(`${project.table}.${project.cols.clientId}`, clientIds)
					.groupBy(grouped ? `${project.table}.${project.cols.clientId}` : `${activity.table}.${activity.cols.userId}`)
					.as('effort'),
			)
			.innerJoin(project.table, (join) => {
				if (grouped) {
					join.on(`${project.table}.${project.cols.clientId}`, 'effort.clientId');
				} else {
					join.onNotNull('effort.effort');
				}
			})
			.innerJoin(payment.table, `${payment.table}.${payment.cols.projectId}`, `${project.table}.${project.cols.id}`)
			.select(
				db.raw(
					`sum("${payment.table}"."${payment.cols.amount}") / "effort"."effort" as "rate", 
						${grouped ? `"${project.table}"."${project.cols.clientId}",` : ''} 
						"${payment.table}"."${payment.cols.currency}"`,
				),
			)
			.where((subquery: any) => {
				if (firstDate) {
					subquery.where(`${payment.table}.${payment.cols.date}`, '>=', firstDate);
				}
				if (lastDate) {
					subquery.where(`${payment.table}.${payment.cols.date}`, '<', lastDate);
				}
			})
			.whereIn(`${project.table}.${project.cols.clientId}`, clientIds);

		const rawResults: { currency: Currency, clientId: uuid, rate: BigNumber }[] = await getQuery(true)
			.groupBy(`${project.table}.${project.cols.clientId}`)
			.groupBy(`${payment.table}.${payment.cols.currency}`)
			.groupBy('effort.effort');
		const rawResultsAvg: { currency: Currency, rate: BigNumber }[] = await getQuery()
			.groupBy(`${payment.table}.${payment.cols.currency}`)
			.groupBy('effort.effort');
		const results: ({ clientId: uuid } & { [key in Currency]?: BigNumber })[] = [];
		const allCurrencies: Currency[] = [];
		const allClientIds: uuid[] = [];
		rawResults.forEach((record) => {
			if (!allCurrencies.includes(record.currency)) {
				allCurrencies.push(record.currency);
			}
			if (!allClientIds.includes(record.clientId)) {
				allClientIds.push(record.clientId);
			}
		});
		allClientIds.forEach((clientId) => {
			const current: { clientId: uuid } & { [key in Currency]?: BigNumber } = { clientId };
			allCurrencies.forEach((currency) => {
				current[currency] = rawResults.find((r) => r.currency === currency && r.clientId === clientId)?.rate ?? new BigNumber(0);
			});
			results.push(current);
		});
		const resultsAvg: { [key in Currency]?: BigNumber } = {};
		allCurrencies.forEach((c) => {
			resultsAvg[c] = rawResultsAvg.find((r) => r.currency === c)?.rate ?? new BigNumber(0);
		});
		return {
			data: results, currencies: allCurrencies, clientIds: allClientIds, dataAvg: resultsAvg,
		};
	}], trx);
}
