/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('workspaces', function(table) {
    table.string('onboarding_status', 50).notNullable().defaultTo('pending');
    table.timestamp('archived_at', { useTz: true }).nullable();

    table.index('onboarding_status', 'idx_workspaces_onboarding_status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('workspaces', function(table) {
    table.dropIndex('onboarding_status', 'idx_workspaces_onboarding_status');
    table.dropColumn('archived_at');
    table.dropColumn('onboarding_status');
  });
};
