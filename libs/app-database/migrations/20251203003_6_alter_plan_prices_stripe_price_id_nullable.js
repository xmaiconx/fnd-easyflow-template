/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('plan_prices', function(table) {
    table.string('stripe_price_id', 255).nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('plan_prices', function(table) {
    table.string('stripe_price_id', 255).notNullable().alter();
  });
};
