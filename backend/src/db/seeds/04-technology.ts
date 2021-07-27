import { transact } from '@cdellacqua/knex-transact';
import { Knex } from 'knex';
import * as user from '../../services/user';
import { create } from '../../services/technology';

export async function seed(trx: Knex.Transaction): Promise<void> {
	return transact([
		async (db) => {
			const user1 = (await user.find({ email: 'user@example.com' }, db))!;
			await create({
				name: 'Svelte',
				userId: user1.id,
			}, db);
			await create({
				name: 'Node.js',
				userId: user1.id,
			}, db);
			await create({
				name: 'php',
				userId: user1.id,
			}, db);
		},
	], trx);
}
