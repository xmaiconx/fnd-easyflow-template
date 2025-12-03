/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('subscriptions', function(table) {
    // Add workspace_id column with FK to workspaces
    table.uuid('workspace_id').nullable().references('id').inTable('workspaces').onDelete('CASCADE');

    // Make account_id nullable (subscription can be per workspace)
    table.uuid('account_id').nullable().alter();

    // Add index for workspace_id lookups
    table.index('workspace_id', 'idx_subscriptions_workspace');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('subscriptions', function(table) {
    table.dropIndex('workspace_id', 'idx_subscriptions_workspace');
    table.dropColumn('workspace_id');

    // Restore account_id as NOT NULL
    table.uuid('account_id').notNullable().alter();
  });
};
