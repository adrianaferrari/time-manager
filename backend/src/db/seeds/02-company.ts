import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { create } from '../../services/company';
import * as user from '../../services/user';

export async function seed(trx: Transaction): Promise<void> {
	return transact([
		async (db) => {
			const user1 = (await user.find({ email: 'user@example.com' }, db))!;
			await create({
				name: 'Test Company',
				userId: user1.id,
				email: 'test@company.com',
				vatNumber: 'IT0123456789',
			}, db);
			await create({
				name: 'Another Company',
				userId: user1.id,
			}, db);
		}
	], trx);
}
