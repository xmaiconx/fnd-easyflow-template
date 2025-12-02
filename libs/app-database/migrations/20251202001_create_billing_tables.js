/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Plans (Stripe Products)
    .createTable('plans', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('stripe_product_id', 255).unique().notNullable();
      table.string('code', 50).unique().notNullable();
      table.string('name', 255).notNullable();
      table.text('description');
      table.boolean('is_active').notNullable().defaultTo(true);
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.comment('Stripe Products - represents subscription plans (starter, pro, enterprise)');
    })

    // Plan Prices (Stripe Prices with versioning)
    .createTable('plan_prices', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('plan_id').notNullable().references('id').inTable('plans').onDelete('CASCADE');
      table.string('stripe_price_id', 255).unique().notNullable();
      table.integer('amount').notNullable();
      table.string('currency', 3).notNullable().defaultTo('brl');
      table.string('interval', 20).notNullable().defaultTo('month');
      table.boolean('is_current').notNullable().defaultTo(true);
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index(['plan_id', 'is_current'], 'idx_plan_prices_current');
      table.comment('Stripe Prices - versioned prices for plans (never edit, create new)');
    })

    // Subscriptions
    .createTable('subscriptions', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.uuid('plan_price_id').notNullable().references('id').inTable('plan_prices');
      table.string('stripe_subscription_id', 255).unique().notNullable();
      table.string('stripe_customer_id', 255).notNullable();
      table.string('status', 50).notNullable();
      table.timestamp('current_period_end', { useTz: true });
      table.timestamp('canceled_at', { useTz: true });
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('account_id', 'idx_subscriptions_account');
      table.index('status', 'idx_subscriptions_status');
      table.comment('Active subscriptions linked to accounts');
    })

    // Payment History
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
    .dropTableIfExists('plans');
};
