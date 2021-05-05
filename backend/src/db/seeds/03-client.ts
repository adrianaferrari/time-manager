import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { create } from '../../services/client';
import * as company from '../../services/company';
import * as user from '../../services/user';

export async function seed(trx: Transaction): Promise<void> {
	return transact([
		async (db) => {
			const user1 = (await user.find({ email: 'user@example.com' }, db))!;
			const company1 = (await company.find({ email: 'test@company.com' }, db))!;
			const company2 = (await company.find({ name: 'Another Company' }, db))!;
			await create({
				firstName: 'John',
				lastName: 'Smith',
				userId: user1.id,
				companyId: company1.id,
			}, db);
			await create({
				firstName: 'Hannah',
				lastName: 'Black',
				email: 'hannahblack@example.com',
				userId: user1.id,
			}, db);
			await create({
				firstName: 'Tom',
				lastName: 'MacDonald',
				companyId: company2.id,
				email: 'tom@anothercompany.com',
				userId: user1.id,
			}, db);
		}
	], trx);
}
