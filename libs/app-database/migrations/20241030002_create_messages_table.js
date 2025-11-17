/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('messages', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('project_id').notNullable();
      table.uuid('thread_id').notNullable().references('id').inTable('threads').onDelete('CASCADE');
      table.uuid('webhook_event_id').nullable().references('id').inTable('webhook_events').onDelete('SET NULL');

      // Message protocol fields
      table.string('type', 50).notNullable(); // TEXT, AUDIO, VIDEO, IMAGE, etc.
      table.string('direction', 50).notNullable(); // INCOMING, OUTGOING
      table.string('role', 50).nullable(); // CONTACT, AI, ATTENDANT
      table.string('status', 50).nullable(); // PENDING, SENT, DELIVERED, READ, FAILED

      // Sender information
      table.string('sender_id', 255).notNullable();
      table.string('sender_name', 255).nullable();
      table.string('sender_phone', 50).nullable();

      // Receiver information (optional)
      table.string('receiver_id', 255).nullable();
      table.string('receiver_name', 255).nullable();

      // Message content (JSONB for flexibility)
      table.jsonb('content').notNullable();

      // Rich metadata
      table.jsonb('metadata').nullable();

      // External references
      table.string('external_id', 255).nullable();
      table.string('channel', 50).notNullable();
      table.string('provider', 100).notNullable();
      table.string('implementation', 50).nullable();

      // Timestamps
      table.timestamp('message_timestamp', { useTz: true }).notNullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      // Indexes for performance
      table.index('account_id', 'idx_messages_account_id');
      table.index('project_id', 'idx_messages_project_id');
      table.index('thread_id', 'idx_messages_thread_id');
      table.index('webhook_event_id', 'idx_messages_webhook_event_id');
      table.index('type', 'idx_messages_type');
      table.index('direction', 'idx_messages_direction');
      table.index('sender_id', 'idx_messages_sender_id');
      table.index('external_id', 'idx_messages_external_id');
      table.index('message_timestamp', 'idx_messages_timestamp');
      table.index('created_at', 'idx_messages_created_at');
      table.index(['account_id', 'thread_id', 'message_timestamp'], 'idx_messages_thread_timeline');

      table.comment('Stores all messages processed by the system following the internal message protocol.');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('messages');
};
