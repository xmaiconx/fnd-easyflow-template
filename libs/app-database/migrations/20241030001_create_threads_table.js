/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('threads', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('project_id').notNullable();
      table.string('sender_id', 255).notNullable();
      table.string('sender_name', 255).nullable();
      table.string('sender_phone', 50).nullable();
      table.string('channel', 50).notNullable();
      table.string('provider', 100).notNullable();
      table.string('implementation', 50).nullable();
      table.string('external_id', 255).nullable();
      table.string('status', 50).notNullable().defaultTo('ACTIVE');
      table.jsonb('metadata').nullable();
      table.timestamp('last_message_at', { useTz: true }).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('account_id', 'idx_threads_account_id');
      table.index('project_id', 'idx_threads_project_id');
      table.index('sender_id', 'idx_threads_sender_id');
      table.index('channel', 'idx_threads_channel');
      table.index('provider', 'idx_threads_provider');
      table.index('status', 'idx_threads_status');
      table.index('last_message_at', 'idx_threads_last_message_at');
      table.index(['account_id', 'project_id', 'sender_id'], 'idx_threads_lookup');
      table.index(['account_id', 'external_id'], 'idx_threads_external_id');

      table.comment('Stores conversation threads grouping messages by sender and project.');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('threads');
};
