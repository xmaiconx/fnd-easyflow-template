# Worker Testing Guide

> Estratégias para testar workers BullMQ através de testes Hurl.

---

## Desafio

Workers processam jobs de forma assíncrona. Não há resposta direta na API.

**Fluxo típico:**
```
API Request → Job Enqueued → Worker Processes → Side Effect
```

---

## Estratégias de Teste

### Estratégia 1: Delay + Verificação de Efeito

**Quando usar:** O worker causa um efeito verificável (DB, email, etc.)

```hurl
# ===========================================
# WORKER TEST: Email notification
# ===========================================

# 1. Trigger action that queues email
POST {{API_URL}}/users/{{user_id}}/invite
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "email": "newuser@test.com",
  "role": "member"
}
HTTP 200
[Asserts]
jsonpath "$.message" contains "invitation"

# 2. Wait for worker to process
# Hurl doesn't have native delay, use retry with interval
[Options]
delay: 3000

# 3. Verify the side effect (invitation created in DB)
GET {{API_URL}}/invitations?email=newuser@test.com
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.data" count >= 1
jsonpath "$.data[0].status" == "sent"
```

---

### Estratégia 2: Queue Stats Endpoint (Recomendado)

**Quando usar:** Se existir endpoint admin para stats da fila.

```hurl
# ===========================================
# WORKER TEST: Via Queue Stats
# ===========================================

# 1. Get initial queue stats
GET {{API_URL}}/admin/queues/email/stats
Authorization: Bearer {{ADMIN_TOKEN}}
HTTP 200
[Captures]
initial_completed: jsonpath "$.completed"

# 2. Trigger action
POST {{API_URL}}/auth/forgot-password
Content-Type: application/json
{
  "email": "{{TEST_EMAIL}}"
}
HTTP 200

# 3. Wait for processing
[Options]
delay: 5000

# 4. Verify job was processed
GET {{API_URL}}/admin/queues/email/stats
Authorization: Bearer {{ADMIN_TOKEN}}
HTTP 200
[Asserts]
jsonpath "$.completed" > {{initial_completed}}
```

---

### Estratégia 3: Webhook/Callback Verification

**Quando usar:** Worker envia webhook ou atualiza status.

```hurl
# ===========================================
# WORKER TEST: Webhook Processing
# ===========================================

# 1. Simulate webhook (Stripe, etc.)
POST {{API_URL}}/webhooks/stripe
Content-Type: application/json
Stripe-Signature: {{STRIPE_TEST_SIGNATURE}}
{
  "type": "invoice.paid",
  "data": {
    "object": {
      "customer": "cus_test123"
    }
  }
}
HTTP 200

# 2. Wait for webhook worker
[Options]
delay: 3000

# 3. Verify webhook was processed
GET {{API_URL}}/admin/webhooks?type=stripe&status=processed
Authorization: Bearer {{ADMIN_TOKEN}}
HTTP 200
[Asserts]
jsonpath "$.data" count >= 1
jsonpath "$.data[0].status" == "processed"
```

---

### Estratégia 4: Polling com Retry

**Quando usar:** Resultado eventual, tempo variável.

```hurl
# ===========================================
# WORKER TEST: Async processing with polling
# ===========================================

# 1. Start async operation
POST {{API_URL}}/reports/generate
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "type": "monthly",
  "month": "2024-01"
}
HTTP 202
[Captures]
report_id: jsonpath "$.data.id"
[Asserts]
jsonpath "$.data.status" == "processing"

# 2. Poll for completion (Hurl retry)
GET {{API_URL}}/reports/{{report_id}}
Authorization: Bearer {{token}}
[Options]
retry: 10
retry-interval: 2000
HTTP 200
[Asserts]
jsonpath "$.data.status" == "completed"
```

---

## Padrões por Tipo de Worker

### Email Worker

```hurl
# Trigger email
POST {{API_URL}}/notifications/send
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "type": "welcome",
  "userId": "{{user_id}}"
}
HTTP 200

[Options]
delay: 3000

# Verify via notification log (if exists)
GET {{API_URL}}/users/{{user_id}}/notifications
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.data[0].type" == "welcome"
jsonpath "$.data[0].status" == "sent"
```

### Audit Worker

```hurl
# Perform action that triggers audit
DELETE {{API_URL}}/resources/{{resource_id}}
Authorization: Bearer {{token}}
HTTP 200

[Options]
delay: 2000

# Verify audit log
GET {{API_URL}}/audit?entity=resource&entityId={{resource_id}}
Authorization: Bearer {{ADMIN_TOKEN}}
HTTP 200
[Asserts]
jsonpath "$.data[0].action" == "DELETE"
jsonpath "$.data[0].entityId" == "{{resource_id}}"
```

### Stripe Webhook Worker

```hurl
# Note: In tests, use Stripe test mode signatures

# Simulate subscription created
POST {{API_URL}}/webhooks/stripe
Content-Type: application/json
Stripe-Signature: {{STRIPE_SIGNATURE}}
{
  "id": "evt_test_123",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_test_123",
      "customer": "cus_test_123",
      "status": "active"
    }
  }
}
HTTP 200

[Options]
delay: 3000

# Verify subscription created
GET {{API_URL}}/subscriptions?stripeId=sub_test_123
Authorization: Bearer {{ADMIN_TOKEN}}
HTTP 200
[Asserts]
jsonpath "$.data" count >= 1
jsonpath "$.data[0].status" == "active"
```

---

## Script Auxiliar: check-worker-result.sh

Para casos complexos, use o script auxiliar:

```bash
# Usage from Hurl (via exec)
# Not directly in Hurl, but as post-test validation

bash .claude/scripts/check-worker-result.sh \
  --queue email \
  --job-id "job_123" \
  --expected-status completed
```

---

## Boas Práticas

1. **Timeouts adequados:** Workers podem levar tempo. Use delays/retries generosos.

2. **Idempotência:** Testes devem ser repetíveis. Use dados únicos por execução.

3. **Cleanup:** Se criar dados, considere cleanup no final (ou use DB de teste).

4. **Ordem de execução:** Teste de workers geralmente vem após testes CRUD.

5. **Ambiente isolado:** Workers de produção não devem processar jobs de teste.

---

## Limitações

- Hurl não tem `delay` nativo (use `[Options] retry-interval`)
- Não é possível executar scripts shell diretamente
- Verificação de logs requer endpoint dedicado ou script externo

---

## Checklist de Worker Testing

- [ ] Identificar qual ação da API enfileira o job
- [ ] Definir tempo máximo de espera (delay/retry)
- [ ] Identificar efeito colateral verificável
- [ ] Criar endpoint de verificação se não existir
- [ ] Documentar dependências (Redis up, worker running)
