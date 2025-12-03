/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('plans', function(table) {
    table.string('stripe_product_id', 255).nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('plans', function(table) {
    table.string('stripe_product_id', 255).notNullable().alter();
  });
};
