# Bug Fixes: Limpeza do Template + Billing por Workspace com Stripe

Este documento rastreia todos os bugs encontrados e corrigidos durante o desenvolvimento desta feature.

---

## Fix 001 - Migration Seed Falhando por Constraint NOT NULL em stripe_product_id

**Data:** 2025-12-02
**Reportado Por:** xmaiconx (Usuário)
**Corrigido Por:** Claude Code

### Bug Description

A migration `20251203004_seed_default_plans.js` falhava ao tentar inserir os planos padrão (FREE, STARTER, PROFESSIONAL) no banco de dados com erro de violação de constraint NOT NULL.

**Expected Behavior:**
- Migration deveria rodar com sucesso
- Planos FREE, STARTER e PROFESSIONAL deveriam ser inseridos na tabela `plans`
- Preços dos planos STARTER e PROFESSIONAL deveriam ser inseridos na tabela `plan_prices`

**Actual Behavior:**
- Migration falhava com erro:
  ```
  null value in column "stripe_product_id" of relation "plans" violates not-null constraint
  ```

**Steps to Reproduce:**
1. Configurar banco de dados PostgreSQL
2. Rodar migrations anteriores (20251202001, 20251203001, 20251203002, 20251203003)
3. Tentar rodar migration 20251203004_seed_default_plans.js
4. Erro ocorre ao tentar inserir planos com `stripe_product_id: null`

### Root Cause

A coluna `stripe_product_id` na tabela `plans` foi criada com constraint `NOT NULL` na migration original `20251202001_create_billing_tables.js`:

```javascript
// 20251202001_create_billing_tables.js:10
table.string('stripe_product_id', 255).unique().notNullable();
```

Porém, a migration de seed `20251203004_seed_default_plans.js` tentava inserir `null` para todos os 3 planos:

```javascript
// 20251203004_seed_default_plans.js:15, 30, 45
stripe_product_id: null, // FREE plan has no Stripe product
```

**Conflito arquitetural identificado:**

De acordo com o plano técnico (plan.md, seção 10), a coluna deveria permitir `null` porque:
1. O plano **FREE** nunca terá Stripe product (é gratuito, não existe na Stripe)
2. Os planos **STARTER** e **PROFESSIONAL** terão `stripe_product_id` null inicialmente e serão preenchidos quando o produto for criado no Stripe Dashboard pelo usuário

O mesmo problema existia na tabela `plan_prices` com a coluna `stripe_price_id` que também era `NOT NULL` mas o seed inseria `null` (linhas 64 e 72).

### Fix Implementation

**Files Modified:**
- Nenhum arquivo foi modificado - foram criadas novas migrations intermediárias

**Files Created:**
- `libs/app-database/migrations/20251203003_5_alter_plans_stripe_product_id_nullable.js` - Torna a coluna `stripe_product_id` nullable na tabela `plans`
- `libs/app-database/migrations/20251203003_6_alter_plan_prices_stripe_price_id_nullable.js` - Torna a coluna `stripe_price_id` nullable na tabela `plan_prices`

**Changes Summary:**

Criadas duas migrations intermediárias que rodam ANTES do seed (por ordem alfabética/numérica):

**Migration 20251203003_5:**
```javascript
exports.up = function(knex) {
  return knex.schema.alterTable('plans', function(table) {
    table.string('stripe_product_id', 255).nullable().alter();
  });
};
```

**Migration 20251203003_6:**
```javascript
exports.up = function(knex) {
  return knex.schema.alterTable('plan_prices', function(table) {
    table.string('stripe_price_id', 255).nullable().alter();
  });
};
```

Estas migrations alteram as constraints de `NOT NULL` para `NULLABLE`, permitindo que o seed insira planos com valores null nestes campos. Os valores serão preenchidos posteriormente quando o usuário criar os produtos e preços correspondentes no Stripe Dashboard.

### Verification

- [x] Migration 20251203003_5 criada corretamente
- [x] Migration 20251203003_6 criada corretamente
- [x] Ordem de execução correta (003_5 e 003_6 rodam ANTES de 004)
- [x] Lógica de up/down implementada em ambas migrations
- [x] Código compila sem erros

### Side Effects

**Impacto em outras partes do sistema:**

1. **PlanRepository e SubscriptionRepository**: Estes repositórios já tratam `stripe_product_id` e `stripe_price_id` como campos opcionais (nullable) nas entities do domain, portanto nenhuma alteração foi necessária.

2. **StripeService**: O serviço de integração com Stripe já estava preparado para lidar com planos que ainda não possuem produtos/preços na Stripe (retorna placeholder `price_xxx` conforme implementation.md).

3. **Validações**: Nenhuma validação adicional foi necessária porque a lógica de negócio permite planos sem Stripe product (plano FREE) e planos com produto/preço a serem configurados posteriormente.

**Nenhum side effect negativo identificado.**

---
