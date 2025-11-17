/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .alterTable('webhook_events', function(table) {
      table.jsonb('normalized_message').nullable().comment('Normalized TypedMessage after parsing (for chat webhooks)');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('webhook_events', function(table) {
      table.dropColumn('normalized_message');
    });
};
