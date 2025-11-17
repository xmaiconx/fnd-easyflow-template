/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('webhook_events', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('project_id').nullable();
      table.string('webhook_type', 50).notNullable();
      table.string('provider', 100).notNullable();
      table.string('channel', 50).nullable();
      table.string('implementation', 50).nullable();
      table.string('event_name', 255).nullable();
      table.string('sender_id', 100).nullable();
      table.string('status', 50).notNullable().defaultTo('PENDING');
      table.jsonb('payload').notNullable();
      table.jsonb('metadata').nullable();
      table.string('queue_name', 255).nullable();
      table.text('error_message').nullable();
      table.timestamp('processed_at', { useTz: true }).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('account_id', 'idx_webhook_events_account_id');
      table.index('project_id', 'idx_webhook_events_project_id');
      table.index('webhook_type', 'idx_webhook_events_webhook_type');
      table.index('provider', 'idx_webhook_events_provider');
      table.index('sender_id', 'idx_webhook_events_sender_id');
      table.index('status', 'idx_webhook_events_status');
      table.index('created_at', 'idx_webhook_events_created_at');

      table.comment('Stores all webhook events received by the system for auditing and async processing.');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('webhook_events');
};
