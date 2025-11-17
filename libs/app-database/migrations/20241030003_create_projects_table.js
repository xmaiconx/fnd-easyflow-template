/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('projects', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('workspace_id').nullable();

      // Project identification
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.string('status', 50).notNullable().defaultTo('ACTIVE');

      // Pipeline configuration
      table.string('project_type', 100).nullable();
      table.string('pipeline_name', 100).nullable();

      // Project settings (JSONB for flexibility)
      table.jsonb('settings').nullable();

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('last_used_at', { useTz: true }).nullable();

      // Indexes
      table.index('account_id', 'idx_projects_account_id');
      table.index('workspace_id', 'idx_projects_workspace_id');
      table.index('status', 'idx_projects_status');
      table.index('project_type', 'idx_projects_project_type');
      table.index('last_used_at', 'idx_projects_last_used_at');
      table.index(['account_id', 'status'], 'idx_projects_account_status');

      table.comment('Stores bot/agent project configurations with pipeline settings.');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('projects');
};
