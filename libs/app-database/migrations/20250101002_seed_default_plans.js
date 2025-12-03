/**
 * SEED DATA - Default Plans
 * Seeds initial FREE, STARTER, and PROFESSIONAL plans with prices
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Fixed UUIDs for predictable plan references
  const FREE_PLAN_ID = '00000000-0000-0000-0000-000000000001';
  const STARTER_PLAN_ID = '00000000-0000-0000-0000-000000000002';
  const PROFESSIONAL_PLAN_ID = '00000000-0000-0000-0000-000000000003';

  // Insert plans
  await knex('plans').insert([
    {
      id: FREE_PLAN_ID,
      stripe_product_id: null, // FREE plan has no Stripe product
      code: 'FREE',
      name: 'Gratuito',
      description: 'Plano gratuito com recursos básicos',
      is_active: true,
      features: JSON.stringify({
        limits: {
          workspaces: 1,
          usersPerWorkspace: 1
        },
        flags: {}
      })
    },
    {
      id: STARTER_PLAN_ID,
      stripe_product_id: null, // Will be updated when Stripe product is created
      code: 'STARTER',
      name: 'Starter',
      description: 'Para pequenos times e projetos iniciais',
      is_active: true,
      features: JSON.stringify({
        limits: {
          workspaces: 3,
          usersPerWorkspace: 5
        },
        flags: {}
      })
    },
    {
      id: PROFESSIONAL_PLAN_ID,
      stripe_product_id: null, // Will be updated when Stripe product is created
      code: 'PROFESSIONAL',
      name: 'Professional',
      description: 'Para times em crescimento',
      is_active: true,
      features: JSON.stringify({
        limits: {
          workspaces: 10,
          usersPerWorkspace: 20
        },
        flags: {}
      })
    }
  ]);

  // Insert plan prices (only for paid plans)
  await knex('plan_prices').insert([
    {
      plan_id: STARTER_PLAN_ID,
      stripe_price_id: null, // Will be updated when Stripe price is created
      amount: 4900, // R$ 49,00 in cents
      currency: 'brl',
      interval: 'month',
      is_current: true
    },
    {
      plan_id: PROFESSIONAL_PLAN_ID,
      stripe_price_id: null, // Will be updated when Stripe price is created
      amount: 9900, // R$ 99,00 in cents
      currency: 'brl',
      interval: 'month',
      is_current: true
    }
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Delete plan prices first (FK constraint)
  await knex('plan_prices').whereIn('plan_id', [
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
  ]).del();

  // Delete plans
  await knex('plans').whereIn('id', [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
  ]).del();
};
