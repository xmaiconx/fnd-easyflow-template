/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.string('full_name', 255).notNullable();
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('role', 50).notNullable().defaultTo('owner');
      table.boolean('email_verified').notNullable().defaultTo(false);
      table.string('email_verification_token', 255);
      table.timestamp('email_verification_token_expiry', { useTz: true });
      table.string('status', 50).notNullable().defaultTo('active');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.check('role IN (\'super-admin\', \'owner\', \'admin\', \'member\')', [], 'chk_users_role');
      table.index('account_id', 'idx_users_account_id');
      table.comment('Users who can log in and access a specific account.');
    })
    .createTable('workspace_users', function(table) {
      table.uuid('workspace_id').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('role', 50).notNullable().defaultTo('member');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.check('role IN (\'owner\', \'admin\', \'member\')', [], 'chk_workspace_users_role');
      table.primary(['workspace_id', 'user_id']);
      table.index('user_id', 'idx_workspace_users_user_id');
      table.comment('Junction table that defines which users have access to which workspaces and their roles.');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('workspace_users')
    .dropTableIfExists('users');
};