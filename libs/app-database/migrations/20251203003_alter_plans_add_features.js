/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('plans', function(table) {
    table.jsonb('features').notNullable().defaultTo('{}');
    table.comment('Features contains {limits: {workspaces, usersPerWorkspace}, flags: {}}');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('plans', function(table) {
    table.dropColumn('features');
  });
};
