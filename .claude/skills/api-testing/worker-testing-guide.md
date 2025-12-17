# Worker Testing Guide

> Estratégias para testar workers BullMQ através de testes httpyac.

---

## Desafio

Workers processam jobs de forma assíncrona. Não há resposta direta na API.

**Fluxo típico:**
```
API Request → Job Enqueued → Worker Processes → Side Effect
```

---

## Estratégias de Teste

### Estratégia 1: Sleep + Verificação de Efeito

**Quando usar:** O worker causa um efeito verificável (DB, email, etc.)

```http
### WORKER TEST: Email notification

# 1. Trigger action that queues email
# @name triggerEmail
POST {{API_URL}}/users/{{userId}}/invite
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "email": "newuser@test.com",
  "role": "member"
}

?? status == 200
?? body.message includes "invitation"

### 2. Wait for worker to process
# httpyac sleep (3 seconds)
{{$sleep 3000}}

### 3. Verify the side effect
GET {{API_URL}}/invitations?email=newuser@test.com
Authorization: Bearer {{token}}

?? status == 200
?? body.data length >= 1
?? body.data[0].status == "sent"
```

---

### Estratégia 2: Queue Stats Endpoint (Recomendado)

**Quando usar:** Se existir endpoint admin para stats da fila.

```http
### WORKER TEST: Via Queue Stats

# 1. Get initial queue stats
# @name initialStats
GET {{API_URL}}/admin/queues/email/stats
Authorization: Bearer {{ADMIN_TOKEN}}

?? status == 200

###
@initialCompleted = {{initialStats.completed}}

### 2. Trigger action
POST {{API_URL}}/auth/forgot-password
Content-Type: application/json

{
  "email": "{{TEST_EMAIL}}"
}

?? status == 200

### 3. Wait for processing
{{$sleep 5000}}

### 4. Verify job was processed
GET {{API_URL}}/admin/queues/email/stats
Authorization: Bearer {{ADMIN_TOKEN}}

?? status == 200

{{
  const { test, expect } = require('httpyac');

  test('should have processed new job', () => {
    const initial = parseInt('{{initialCompleted}}');
    expect(response.body.completed).toBeGreaterThan(initial);
  });
}}
```

---

### Estratégia 3: Webhook/Callback Verification

**Quando usar:** Worker envia webhook ou atualiza status.

```http
### WORKER TEST: Webhook Processing

# 1. Simulate webhook (Stripe, etc.)
POST {{API_URL}}/webhooks/stripe
Content-Type: application/json
Stripe-Signature: {{STRIPE_TEST_SIGNATURE}}

{
  "id": "evt_test_{{$timestamp}}",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_test_{{$timestamp}}",
      "customer": "cus_test_123",
      "status": "active"
    }
  }
}

?? status == 200

### 2. Wait for webhook worker
{{$sleep 3000}}

### 3. Verify webhook was processed
GET {{API_URL}}/admin/webhooks?type=stripe&status=processed
Authorization: Bearer {{ADMIN_TOKEN}}

?? status == 200
?? body.data length >= 1
```

---

### Estratégia 4: Polling com Retry

**Quando usar:** Resultado eventual, tempo variável.

```http
### WORKER TEST: Async processing with polling

# 1. Start async operation
# @name startReport
POST {{API_URL}}/reports/generate
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "type": "monthly",
  "month": "2024-01"
}

?? status == 202
?? body.data.status == "processing"

###
@reportId = {{startReport.data.id}}

### 2. Wait and poll (attempt 1)
{{$sleep 2000}}

### Poll for status
# @name pollReport
GET {{API_URL}}/reports/{{reportId}}
Authorization: Bearer {{token}}

{{
  const { test } = require('httpyac');

  // Store status for conditional next request
  exports.reportStatus = response.body.data.status;

  test('should be processing or completed', () => {
    const validStatuses = ['processing', 'completed'];
    expect(validStatuses).toContain(response.body.data.status);
  });
}}

### 3. If still processing, wait more
{{$sleep 3000}}

### Final check
GET {{API_URL}}/reports/{{reportId}}
Authorization: Bearer {{token}}

?? status == 200
?? body.data.status == "completed"
```

---

## Padrões por Tipo de Worker

### Email Worker

```http
### EMAIL WORKER: Trigger notification
POST {{API_URL}}/notifications/send
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "type": "welcome",
  "userId": "{{userId}}"
}

?? status == 200

### Wait for processing
{{$sleep 3000}}

### Verify via notification log
GET {{API_URL}}/users/{{userId}}/notifications
Authorization: Bearer {{token}}

?? status == 200
?? body.data[0].type == "welcome"
?? body.data[0].status == "sent"
```

### Audit Worker

```http
### AUDIT WORKER: Perform action that triggers audit
DELETE {{API_URL}}/resources/{{resourceId}}
Authorization: Bearer {{token}}

?? status == 200

### Wait for audit log processing
{{$sleep 2000}}

### Verify audit log
GET {{API_URL}}/audit?entity=resource&entityId={{resourceId}}
Authorization: Bearer {{ADMIN_TOKEN}}

?? status == 200
?? body.data[0].action == "DELETE"
```

### Stripe Webhook Worker

```http
### STRIPE WORKER: Simulate subscription webhook
# Note: Use Stripe test mode signatures in local env
POST {{API_URL}}/webhooks/stripe
Content-Type: application/json
Stripe-Signature: {{STRIPE_SIGNATURE}}

{
  "id": "evt_test_{{$uuid}}",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_test_{{$uuid}}",
      "customer": "cus_test_123",
      "status": "active"
    }
  }
}

?? status == 200

### Wait for worker
{{$sleep 3000}}

### Verify subscription created in DB
GET {{API_URL}}/admin/subscriptions?stripeCustomerId=cus_test_123
Authorization: Bearer {{ADMIN_TOKEN}}

?? status == 200
?? body.data length >= 1
```

---

## Script Auxiliar

Para casos complexos, use o script auxiliar via terminal:

```bash
# Verificar resultado do worker
bash .claude/scripts/check-worker-result.sh \
  --queue email \
  --wait 10 \
  --expected completed
```

---

## Boas Práticas

1. **Timeouts adequados:** Use `{{$sleep}}` com valores realistas (3-10s).

2. **Idempotência:** Use `{{$uuid}}` ou `{{$timestamp}}` para dados únicos.

3. **Cleanup:** Considere deletar dados de teste no final.

4. **Ordem:** Testes de workers devem vir após testes CRUD básicos.

5. **Ambiente:** Configure `ADMIN_TOKEN` no env para acessar stats.

---

## Variáveis de Ambiente para Workers

Adicione ao `http-client.env.json`:

```json
{
  "local": {
    "API_URL": "http://localhost:3001/api/v1",
    "TEST_EMAIL": "test@example.com",
    "TEST_PASSWORD": "Test123!",
    "ADMIN_TOKEN": "admin-token-here",
    "STRIPE_SIGNATURE": "test-signature"
  }
}
```

---

## Checklist de Worker Testing

- [ ] Identificar qual ação da API enfileira o job
- [ ] Definir tempo de espera adequado ({{$sleep}})
- [ ] Identificar efeito colateral verificável
- [ ] Criar endpoint de verificação se não existir
- [ ] Adicionar variáveis de admin no env
- [ ] Documentar dependências (Redis up, worker running)
