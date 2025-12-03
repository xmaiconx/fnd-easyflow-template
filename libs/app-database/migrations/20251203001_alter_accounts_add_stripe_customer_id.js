/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('accounts', function(table) {
    table.string('stripe_customer_id', 255).nullable().unique();
    table.comment('Stripe Customer ID for billing - created on first checkout');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('accounts', function(table) {
    table.dropColumn('stripe_customer_id');
  });
};
