import { transact } from '@cdellacqua/knex-transact';
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import { Transaction } from 'knex';
import * as project from '../../services/project';
import * as category from '../../services/category';
import * as user from '../../services/user';
import { create } from '../../services/activity';

export async function seed(trx: Transaction): Promise<void> {
	return transact<void>([
		async (db) => {
			const user1 = (await user.find({ email: 'user@example.com' }, db))!;
			const project1 = (await project.find({ name: 'Time Manager' }, db))!;
			const project2 = (await project.find({ name: 'E-Commerce' }, db))!;
			const project3 = (await project.find({ name: 'Company Website' }, db))!;
			const meeting = (await category.find({ name: 'Meeting' }, db))!;
			const development = (await category.find({ name: 'Development' }, db))!;
			const testing = (await category.find({ name: 'Testing' }, db))!;
			await create({
				categoryId: meeting.id,
				userId: user1.id,
				description: 'Videocall about UX',
				projectId: project3.id,
				date: new DateOnly().subDays(4),
				timeSpent: new Interval(1, 0, 2),
			}, db);
			await create({
				categoryId: meeting.id,
				userId: user1.id,
				description: 'Meetup with potential new client',
				date: new DateOnly().subDays(2),
				timeSpent: new Interval(1, 0, 1),
			}, db);
			await create({
				categoryId: development.id,
				userId: user1.id,
				description: 'Homepage',
				projectId: project3.id,
				date: new DateOnly().subDays(3),
				timeSpent: new Interval(1, 0, 1, 50),
			}, db);
			await create({
				categoryId: development.id,
				userId: user1.id,
				description: 'Seeds',
				projectId: project1.id,
				date: new DateOnly(),
				timeSpent: new Interval(1, 0, 3),
			}, db);
			await create({
				categoryId: testing.id,
				userId: user1.id,
				description: 'Test checkout flow',
				projectId: project2.id,
				date: new DateOnly().subDays(10),
				timeSpent: new Interval(1, 0, 1, 15),
			}, db);
		}
	], trx);
}
