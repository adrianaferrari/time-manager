import { transact } from '@cdellacqua/knex-transact';
import { DateOnly } from '@cdellacqua/date-only';
import { Transaction } from 'knex';
import * as project from '../../services/project';
import { create } from '../../services/payment';
import BigNumber from 'bignumber.js';
import { Currency } from '../../types/common';

export async function seed(trx: Transaction): Promise<void> {
	return transact([
		async (db) => {
			const project2 = (await project.find({ name: 'E-Commerce' }, db))!;
			const project3 = (await project.find({ name: 'Company Website' }, db))!;
			await create({
				projectId: project2.id,
				amount: new BigNumber(500),
				currency: Currency.EUR,
				date: new DateOnly().subMonths(1).subDays(20),
			}, db);
			await create({
				projectId: project2.id,
				amount: new BigNumber(2000),
				currency: Currency.EUR,
				date: new DateOnly().subDays(20),
			}, db);
			await create({
				projectId: project3.id,
				amount: new BigNumber(250),
				currency: Currency.USD,
				date: new DateOnly(),
			}, db);
		}
	], trx);
}
