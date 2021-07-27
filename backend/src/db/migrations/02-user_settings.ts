import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('userSettings', (table) => {
		table.uuid('userId').primary().references('id').inTable('user')
			.onUpdate('cascade')
			.onDelete('cascade');
		table.decimal('dayLength', 19, 2).nullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('userSettings');
}
