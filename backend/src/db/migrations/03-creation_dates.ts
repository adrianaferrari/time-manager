import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('activity', (table) => {
		table.timestamp('createdAt', { useTz: false }).notNullable().defaultTo(knex.fn.now());
	});
	await knex.schema.alterTable('payment', (table) => {
		table.timestamp('createdAt', { useTz: false }).notNullable().defaultTo(knex.fn.now());
	});
	await knex.schema.alterTable('project', (table) => {
		table.timestamp('createdAt', { useTz: false }).notNullable().defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('project', (table) => {
		table.dropColumn('createdAt');
	});
	await knex.schema.alterTable('payment', (table) => {
		table.dropColumn('createdAt');
	});
	await knex.schema.alterTable('activity', (table) => {
		table.dropColumn('createdAt');
	});
}
