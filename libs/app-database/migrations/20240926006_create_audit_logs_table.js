/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('audit_logs', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('workspace_id').references('id').inTable('workspaces').onDelete('SET NULL');
      table.uuid('account_id').references('id').inTable('accounts').onDelete('SET NULL');
      table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('event_name', 255).notNullable();
      table.string('event_type', 50).notNullable(); // 'domain' | 'integration'
      table.jsonb('payload').notNullable();
      table.timestamp('occurred_at', { useTz: true }).notNullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('workspace_id', 'idx_audit_logs_workspace_id');
      table.index('account_id', 'idx_audit_logs_account_id');
      table.index('user_id', 'idx_audit_logs_user_id');
      table.index('event_name', 'idx_audit_logs_event_name');
      table.index('occurred_at', 'idx_audit_logs_occurred_at');
      table.index(['workspace_id', 'occurred_at'], 'idx_audit_logs_workspace_occurred');
      table.comment('Audit trail for all system events. Tracks every domain and integration event for compliance and debugging.');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('audit_logs');
};
