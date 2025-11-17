/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('accounts', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name', 255).notNullable();
      table.jsonb('settings');
      table.string('status', 50).notNullable().defaultTo('active');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.comment('Represents a tenant in the multi-tenant architecture.');
    })
    .createTable('workspaces', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.jsonb('settings');
      table.string('status', 50).notNullable().defaultTo('active');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('account_id', 'idx_workspaces_account_id');
      table.comment('Workspaces belong to an account. Each workspace isolates operational data.');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('workspaces')
    .dropTableIfExists('accounts')
    .raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};