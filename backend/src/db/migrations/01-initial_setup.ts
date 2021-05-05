import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {

	await knex.schema.createTable('userRole', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.string('role', 100).notNullable();
		table.uuid('userId').references('id').inTable('user').notNullable().onDelete('cascade');
	});

	await knex.schema.createTable('company', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.string('name', 150).notNullable();
		table.string('vatNumber', 100).nullable().unique();
		table.string('email', 150).nullable().unique();
		table.uuid('userId').references('id').inTable('user').notNullable().onDelete('cascade');;
	});

	await knex.schema.createTable('client', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.string('firstName', 100).notNullable();
		table.string('lastName', 100).notNullable();
		table.string('email', 150).nullable().unique();
		table.uuid('userId').references('id').inTable('user').notNullable().onDelete('cascade');;
		table.uuid('companyId').nullable().references('id').inTable('company').onDelete('cascade');;
	});

	await knex.schema.createTable('project', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.string('name', 100).notNullable();
		table.date('startDate').notNullable();
		table.date('endDate').nullable();
		table.uuid('userId').references('id').inTable('user').notNullable().onDelete('cascade');;
		table.uuid('clientId').nullable().references('id').inTable('client').onDelete('set null');;
		table.string('currency', 10).nullable();
		table.decimal('price', 19, 4).nullable();
		table.integer('estimatedEffort').nullable();
	});
	
	await knex.schema.createTable('category', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.string('name', 100).notNullable();
		table.uuid('userId').references('id').inTable('user').notNullable().onDelete('cascade');;
		table.unique(['name', 'userId']);
	});

	await knex.schema.createTable('technology', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.string('name', 100).notNullable();
		table.uuid('userId').references('id').inTable('user').notNullable().onDelete('cascade');;
		table.unique(['name', 'userId']);
	});

	await knex.schema.createTable('technologyProject', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.uuid('technologyId').references('id').inTable('technology').notNullable().onDelete('cascade');;
		table.uuid('projectId').references('id').inTable('project').notNullable().onDelete('cascade');;
		table.unique(['projectId', 'technologyId']);
	});

	await knex.schema.createTable('activity', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.string('description', 1000).notNullable();
		table.dateTime('date').notNullable();
		table.uuid('userId').references('id').inTable('user').notNullable().onDelete('cascade');;
		table.uuid('categoryId').references('id').inTable('category').notNullable();
		table.uuid('projectId').nullable().references('id').inTable('project').onDelete('cascade');;
		table.integer('timeSpent').notNullable();
	});

	await knex.schema.createTable('payment', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.date('date').notNullable();
		table.decimal('amount', 19, 4);
		table.string('currency', 10).nullable();
		table.uuid('projectId').references('id').inTable('project').notNullable().onDelete('cascade');;
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('payment');
	await knex.schema.dropTable('activity');
	await knex.schema.dropTable('technologyProject');
	await knex.schema.dropTable('technology');
	await knex.schema.dropTable('category');
	await knex.schema.dropTable('project');
	await knex.schema.dropTable('client');
	await knex.schema.dropTable('company');
	await knex.schema.dropTable('userRole');
}
