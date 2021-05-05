import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { create, Role } from '../../services/user';

export async function seed(trx: Transaction): Promise<void> {
	return transact([
		(db) => create({
			email: 'user@example.com',
			enabled: true,
			password: 'password',
			roles: [Role.user],
		}, db),
	], trx);
}
