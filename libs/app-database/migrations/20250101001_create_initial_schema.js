/**
 * CONSOLIDATED MIGRATION - Initial Schema
 * Creates all core tables with final structure
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Enable UUID extension
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    // Accounts (tenant root)
    .createTable('accounts', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name', 255).notNullable();
      table.jsonb('settings');
      table.string('status', 50).notNullable().defaultTo('active');
      table.string('stripe_customer_id', 255).nullable().unique();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.comment('Tenant root - represents a company/organization account with Stripe billing integration');
    })

    // Workspaces (multi-workspace per account)
    .createTable('workspaces', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.jsonb('settings');
      table.string('status', 50).notNullable().defaultTo('active');
      table.string('onboarding_status', 50).notNullable().defaultTo('pending');
      table.timestamp('archived_at', { useTz: true }).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('account_id', 'idx_workspaces_account_id');
      table.index('onboarding_status', 'idx_workspaces_onboarding_status');
      table.comment('Workspaces isolate operational data within an account');
    })

    // Users (authentication + roles)
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
      table.comment('Users with authentication and account-level roles');
    })

    // Workspace Users (bridge table)
    .createTable('workspace_users', function(table) {
      table.uuid('workspace_id').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('role', 50).notNullable().defaultTo('member');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.check('role IN (\'owner\', \'admin\', \'member\')', [], 'chk_workspace_users_role');
      table.primary(['workspace_id', 'user_id']);
      table.index('user_id', 'idx_workspace_users_user_id');
      table.comment('User-workspace relationships with workspace-level roles');
    })

    // Audit Logs (event tracking)
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
      table.comment('Complete audit trail for domain and integration events');
    })

    // Projects (bot/agent configurations)
    .createTable('projects', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('workspace_id').nullable();
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.string('status', 50).notNullable().defaultTo('ACTIVE');
      table.string('project_type', 100).nullable();
      table.string('pipeline_name', 100).nullable();
      table.jsonb('settings').nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('last_used_at', { useTz: true }).nullable();

      table.index('account_id', 'idx_projects_account_id');
      table.index('workspace_id', 'idx_projects_workspace_id');
      table.index('status', 'idx_projects_status');
      table.index('project_type', 'idx_projects_project_type');
      table.index('last_used_at', 'idx_projects_last_used_at');
      table.index(['account_id', 'status'], 'idx_projects_account_status');
      table.comment('Bot/agent project configurations with pipeline settings');
    })

    // Webhook Events (incoming webhooks)
    .createTable('webhook_events', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('project_id').nullable();
      table.string('webhook_type', 50).notNullable();
      table.string('provider', 100).notNullable();
      table.string('channel', 50).nullable();
      table.string('implementation', 50).nullable();
      table.string('event_name', 255).nullable();
      table.string('sender_id', 100).nullable();
      table.string('status', 50).notNullable().defaultTo('PENDING');
      table.jsonb('payload').notNullable();
      table.jsonb('metadata').nullable();
      table.jsonb('normalized_message').nullable();
      table.string('queue_name', 255).nullable();
      table.text('error_message').nullable();
      table.timestamp('processed_at', { useTz: true }).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('account_id', 'idx_webhook_events_account_id');
      table.index('project_id', 'idx_webhook_events_project_id');
      table.index('webhook_type', 'idx_webhook_events_webhook_type');
      table.index('provider', 'idx_webhook_events_provider');
      table.index('sender_id', 'idx_webhook_events_sender_id');
      table.index('status', 'idx_webhook_events_status');
      table.index('created_at', 'idx_webhook_events_created_at');
      table.comment('Incoming webhook events with normalized message protocol');
    })

    // Threads (conversation grouping)
    .createTable('threads', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('project_id').notNullable();
      table.string('sender_id', 255).notNullable();
      table.string('sender_name', 255).nullable();
      table.string('sender_phone', 50).nullable();
      table.string('channel', 50).notNullable();
      table.string('provider', 100).notNullable();
      table.string('implementation', 50).nullable();
      table.string('external_id', 255).nullable();
      table.string('status', 50).notNullable().defaultTo('ACTIVE');
      table.jsonb('metadata').nullable();
      table.timestamp('last_message_at', { useTz: true }).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('account_id', 'idx_threads_account_id');
      table.index('project_id', 'idx_threads_project_id');
      table.index('sender_id', 'idx_threads_sender_id');
      table.index('channel', 'idx_threads_channel');
      table.index('provider', 'idx_threads_provider');
      table.index('status', 'idx_threads_status');
      table.index('last_message_at', 'idx_threads_last_message_at');
      table.index(['account_id', 'project_id', 'sender_id'], 'idx_threads_lookup');
      table.index(['account_id', 'external_id'], 'idx_threads_external_id');
      table.comment('Conversation threads grouping messages by sender and project');
    })

    // Messages (message protocol)
    .createTable('messages', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('project_id').notNullable();
      table.uuid('thread_id').notNullable().references('id').inTable('threads').onDelete('CASCADE');
      table.uuid('webhook_event_id').nullable().references('id').inTable('webhook_events').onDelete('SET NULL');

      // Message protocol fields
      table.string('type', 50).notNullable();
      table.string('direction', 50).notNullable();
      table.string('role', 50).nullable();
      table.string('status', 50).nullable();

      // Sender/receiver
      table.string('sender_id', 255).notNullable();
      table.string('sender_name', 255).nullable();
      table.string('sender_phone', 50).nullable();
      table.string('receiver_id', 255).nullable();
      table.string('receiver_name', 255).nullable();

      // Content
      table.jsonb('content').notNullable();
      table.jsonb('metadata').nullable();

      // External references
      table.string('external_id', 255).nullable();
      table.string('channel', 50).notNullable();
      table.string('provider', 100).notNullable();
      table.string('implementation', 50).nullable();

      // Timestamps
      table.timestamp('message_timestamp', { useTz: true }).notNullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      // Indexes
      table.index('account_id', 'idx_messages_account_id');
      table.index('project_id', 'idx_messages_project_id');
      table.index('thread_id', 'idx_messages_thread_id');
      table.index('webhook_event_id', 'idx_messages_webhook_event_id');
      table.index('type', 'idx_messages_type');
      table.index('direction', 'idx_messages_direction');
      table.index('sender_id', 'idx_messages_sender_id');
      table.index('external_id', 'idx_messages_external_id');
      table.index('message_timestamp', 'idx_messages_timestamp');
      table.index('created_at', 'idx_messages_created_at');
      table.index(['account_id', 'thread_id', 'message_timestamp'], 'idx_messages_thread_timeline');
      table.comment('Messages following internal message protocol');
    })

    // Billing: Plans (Stripe Products)
    .createTable('plans', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('stripe_product_id', 255).unique().nullable();
      table.string('code', 50).unique().notNullable();
      table.string('name', 255).notNullable();
      table.text('description');
      table.jsonb('features').notNullable().defaultTo('{}');
      table.boolean('is_active').notNullable().defaultTo(true);
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.comment('Subscription plans (Stripe Products) with feature limits and flags');
    })

    // Billing: Plan Prices (Stripe Prices with versioning)
    .createTable('plan_prices', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('plan_id').notNullable().references('id').inTable('plans').onDelete('CASCADE');
      table.string('stripe_price_id', 255).unique().nullable();
      table.integer('amount').notNullable();
      table.string('currency', 3).notNullable().defaultTo('brl');
      table.string('interval', 20).notNullable().defaultTo('month');
      table.boolean('is_current').notNullable().defaultTo(true);
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index(['plan_id', 'is_current'], 'idx_plan_prices_current');
      table.comment('Versioned prices for plans - never edit, create new versions for grandfathering');
    })

    // Billing: Subscriptions
    .createTable('subscriptions', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').nullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('workspace_id').nullable().references('id').inTable('workspaces').onDelete('CASCADE');
      table.uuid('plan_price_id').notNullable().references('id').inTable('plan_prices');
      table.string('stripe_subscription_id', 255).unique().notNullable();
      table.string('stripe_customer_id', 255).notNullable();
      table.string('status', 50).notNullable();
      table.timestamp('current_period_end', { useTz: true });
      table.timestamp('canceled_at', { useTz: true });
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('account_id', 'idx_subscriptions_account');
      table.index('workspace_id', 'idx_subscriptions_workspace');
      table.index('status', 'idx_subscriptions_status');
      table.comment('Active subscriptions (account or workspace level)');
    })

    // Billing: Payment History
    .createTable('payment_history', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('subscription_id').references('id').inTable('subscriptions').onDelete('SET NULL');
      table.string('stripe_invoice_id', 255).unique().notNullable();
      table.integer('amount').notNullable();
      table.string('currency', 3).notNullable().defaultTo('brl');
      table.string('status', 50).notNullable();
      table.timestamp('paid_at', { useTz: true });
      table.text('invoice_url');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('account_id', 'idx_payment_history_account');
      table.comment('Payment history from Stripe invoices');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('payment_history')
    .dropTableIfExists('subscriptions')
    .dropTableIfExists('plan_prices')
    .dropTableIfExists('plans')
    .dropTableIfExists('messages')
    .dropTableIfExists('threads')
    .dropTableIfExists('webhook_events')
    .dropTableIfExists('projects')
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('workspace_users')
    .dropTableIfExists('users')
    .dropTableIfExists('workspaces')
    .dropTableIfExists('accounts')
    .raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
