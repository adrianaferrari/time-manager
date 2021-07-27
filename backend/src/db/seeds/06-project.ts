import { transact } from '@cdellacqua/knex-transact';
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import { Knex } from 'knex';
import BigNumber from 'bignumber.js';
import * as client from '../../services/client';
import { create } from '../../services/project';
import * as user from '../../services/user';
import * as technology from '../../services/technology';

export async function seed(trx: Knex.Transaction): Promise<void> {
	return transact<void>([
		async (db) => {
			const user1 = (await user.find({ email: 'user@example.com' }, db))!;
			const client1 = (await client.find({ email: 'hannahblack@example.com' }, db))!;
			const client2 = (await client.find({ email: 'tom@anothercompany.com' }, db))!;
			const svelte = (await technology.find({ name: 'Svelte' }, db))!;
			const nodejs = (await technology.find({ name: 'Node.js' }, db))!;
			const php = (await technology.find({ name: 'php' }, db))!;
			await create({
				name: 'Time Manager',
				startDate: new DateOnly(),
				userId: user1.id,
				estimatedEffort: new Interval(1, 5, 3),
				technologyIds: [svelte.id, nodejs.id],
			}, db);
			await create({
				name: 'E-Commerce',
				startDate: new DateOnly().subMonths(2),
				clientId: client1.id,
				endDate: new DateOnly().subDays(4),
				estimatedEffort: new Interval(1, 15),
				price: new BigNumber(3000),
				currency: 'EUR',
				userId: user1.id,
				technologyIds: [php.id],
			}, db);
			await create({
				clientId: client2.id,
				startDate: new DateOnly().subDays(5),
				currency: 'USD',
				price: new BigNumber(1500),
				name: 'Company Website',
				userId: user1.id,
			}, db);
		},
	], trx);
}
