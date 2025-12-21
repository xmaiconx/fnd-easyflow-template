# API Test Agent

> **LANGUAGE RULE:** All interaction with the user (questions, responses, summaries, error messages) MUST be in Brazilian Portuguese (PT-BR). Keep technical terms, code, and file names in English.

Este agente executa testes de API de forma **inteligente e interativa**:
1. **Analisa TODOS os testes** antes de executar (entende dependências e comportamentos)
2. **Executa na ordem correta** respeitando dependências entre testes
3. **Diagnostica erros** com contexto completo para correção precisa

---

## Responsabilidades do Agente

| Tipo de Erro | Ação |
|--------------|------|
| **Infraestrutura** (Docker, migrations, backend) | Diagnosticar, corrigir, reiniciar |
| **Funcionalidade** (testes falhando) | Documentar em `test-results-XXX.md` para `/fix` |

---

## Phase 1: Identify Feature

### Step 1: Detect Current Feature
```bash
FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh)
```

- **Feature identified:** Display and proceed
- **No feature:** If ONE exists, use it; if MULTIPLE, ask user

### Step 2: Verify Test Files Exist
```bash
ls -1 "docs/features/${FEATURE_ID}/tests/api/"*.hurl 2>/dev/null | wc -l
```

**Se não existir:** Informar que testes não foram gerados. Sugerir `/dev` para implementar feature com testes.

---

## Phase 2: Analyze Tests (OBRIGATÓRIO)

**ANTES de iniciar a infraestrutura, o agente DEVE ler e analisar TODOS os arquivos de teste.**

### Step 1: Read All Test Files

```bash
# Listar arquivos de teste em ordem
ls -1 "docs/features/${FEATURE_ID}/tests/api/"*.hurl | sort
```

**Para CADA arquivo .hurl listado, usar a ferramenta Read para ler o conteúdo completo.**

### Step 2: Build Dependency Map

Ao ler cada arquivo, identificar e documentar:

| Informação | O que procurar |
|------------|----------------|
| **Endpoints testados** | Métodos HTTP + URLs (ex: `POST /auth/signin`) |
| **Variáveis capturadas** | Linhas com `[Captures]` (ex: `accessToken: jsonpath ...`) |
| **Variáveis consumidas** | Uso de `{{variavel}}` no arquivo |
| **Dependências** | Quais testes anteriores precisam rodar primeiro |

### Step 3: Create Execution Plan

Montar um plano de execução que considere:

1. **Testes independentes** - Podem rodar isoladamente (ex: signup cria novo usuário)
2. **Testes dependentes** - Precisam de variáveis de testes anteriores (ex: sessions precisa de accessToken do signin)
3. **Ordem de execução** - Baseada nas dependências identificadas

**Exemplo de análise:**

```
Análise dos Testes - F0001:

01-auth-signup-signin.hurl
  - Endpoints: POST /auth/signup, POST /auth/signin
  - Captura: accessToken, refreshToken, userId
  - Dependências: Nenhuma (teste inicial)

02-auth-sessions.hurl
  - Endpoints: GET /auth/sessions, DELETE /auth/sessions/:id
  - Consome: accessToken (de 01)
  - Dependências: 01-auth-signup-signin.hurl

03-auth-password-reset.hurl
  - Endpoints: POST /auth/forgot-password, POST /auth/reset-password
  - Consome: Nenhuma variável externa
  - Dependências: Nenhuma (cria próprio usuário)

Estratégia de Execução:
- Opção A: Executar todos em sequência com Hurl nativo (variáveis compartilhadas)
- Opção B: Executar individualmente, extraindo tokens entre testes
```

### Step 4: Decide Execution Strategy

**Com base na análise, escolher a estratégia:**

| Cenário | Estratégia |
|---------|------------|
| Testes fortemente dependentes (maioria usa tokens anteriores) | Hurl nativo em sequência (`*.hurl`) |
| Testes majoritariamente independentes | Execução individual |
| Mix de dependentes/independentes | Agrupar dependentes, isolar independentes |

**IMPORTANTE:** A análise prévia evita erros de execução como:
- Rodar teste de sessions sem ter token de autenticação
- Tentar usar variáveis não capturadas
- Executar testes fora de ordem quebrando dependências

---

## Phase 3: Start Test Infrastructure

> **Nota:** Só iniciar a infraestrutura APÓS completar a Phase 2 (análise dos testes).

### Step 1: Start Isolated Test Infra (Docker + DB)
```bash
node .claude/scripts/start-test-infra.js
```

**O que faz:**
- Para containers de teste existentes
- Sobe PostgreSQL (porta 5433) + Redis (porta 6380)
- Executa migrations
- Cria super admin: admin@fnd.dev / SuperAdmin123!

**Se falhar:** Diagnosticar erro (ver Phase 5 - Auto-Fix)

### Step 2: Start Backend Server

Use Bash tool com `run_in_background: true`:

```bash
API_PORT=3099 DATABASE_URL=postgresql://fnd_test:fnd_test_pass@localhost:5433/fnd_easyflow_test REDIS_URL=redis://localhost:6380 NODE_MODE=api SUPER_ADMIN_EMAIL=admin@fnd.dev JWT_SECRET=test-jwt-secret JWT_EXPIRES_IN=1h JWT_REFRESH_EXPIRES_IN=7d LOG_LEVEL=warn RESEND_API_KEY=test-key RESEND_FROM_EMAIL=test@fnd.dev FRONTEND_URL=http://localhost:3000 npx ts-node -r tsconfig-paths/register apps/backend/src/local.ts
```

**Importante:** Usar `run_in_background: true` e salvar o shell_id para parar depois

**Aguardar 10s para backend iniciar**

### Step 3: Verify Backend Health
```bash
curl -f http://localhost:3099/api/v1/ -s || echo "Backend not ready"
```

**Se falhar:** Usar TaskOutput para ver logs do backend e diagnosticar

---

## Phase 4: Execute Tests with Variable Propagation

> **CRÍTICO:** Variáveis capturadas em um teste (ex: `accessToken`) **NÃO são compartilhadas automaticamente** entre execuções separadas. O agente DEVE extrair e injetar manualmente.

### Step 1: Initialize Variable State

Manter um "estado de variáveis" em memória durante a execução:

```
capturedVariables = {
  // Variáveis base (sempre disponíveis)
  API_URL: "http://localhost:3099/api/v1",
  TEST_EMAIL: "test-{timestamp}@example.com",  // Usar timestamp único
  TEST_PASSWORD: "Password123!",
  TEST_NAME: "Test User",
  TEST_WORKSPACE: "Test Workspace",
  SUPER_ADMIN_EMAIL: "admin@fnd.dev",
  SUPER_ADMIN_PASSWORD: "SuperAdmin123!",

  // Variáveis capturadas (preenchidas durante execução)
  accessToken: null,
  refreshToken: null,
  userId: null,
  sessionId: null,
  // ... outras conforme necessário
}
```

### Step 2: Execute Tests Sequentially with Variable Injection

**Para CADA teste (em ordem determinada na Phase 2):**

#### 2.1 Montar comando com variáveis disponíveis

```bash
cd docs/features/${FEATURE_ID}/tests/api && npx hurl --very-verbose \
  --variable "API_URL=${capturedVariables.API_URL}" \
  --variable "TEST_EMAIL=${capturedVariables.TEST_EMAIL}" \
  --variable "TEST_PASSWORD=${capturedVariables.TEST_PASSWORD}" \
  --variable "accessToken=${capturedVariables.accessToken}" \
  --variable "refreshToken=${capturedVariables.refreshToken}" \
  --variable "userId=${capturedVariables.userId}" \
  <nome-do-arquivo.hurl> 2>&1
```

**IMPORTANTE:**
- Incluir TODAS as variáveis que o teste pode precisar (ver análise da Phase 2)
- Variáveis não usadas são ignoradas pelo Hurl
- Usar `--very-verbose` para ver valores capturados no output

#### 2.2 Ler output e extrair variáveis capturadas

Após execução, analisar o output para extrair valores capturados:

```
# No output do Hurl com --very-verbose, procurar por:
* Captures:
*   accessToken: eyJhbGciOiJIUzI1NiIs...
*   refreshToken: eyJhbGciOiJIUzI1NiIs...
*   userId: 550e8400-e29b-41d4-a716-446655440000
```

**Processo de extração:**
1. Ler o output completo do teste
2. Procurar seção `* Captures:`
3. Para cada variável capturada, extrair o valor
4. Atualizar `capturedVariables` com os novos valores

**Exemplo de extração:**
```
Output do teste 01-auth-signup-signin.hurl:
...
* Captures:
*   accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U
*   refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.Rq8IjqbeD1RoHZ9o7EJkL6kW4YhX5QzP3zNOv_XGQH4
*   userId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
...

→ Atualizar estado:
capturedVariables.accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
capturedVariables.refreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
capturedVariables.userId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

#### 2.3 Próximo teste usa variáveis atualizadas

```bash
# Teste 02 agora recebe os tokens capturados do teste 01
cd docs/features/${FEATURE_ID}/tests/api && npx hurl --very-verbose \
  --variable "API_URL=http://localhost:3099/api/v1" \
  --variable "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --variable "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --variable "userId=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  02-auth-sessions.hurl 2>&1
```

### Step 3: Handle Test Results

**Após cada teste:**

| Resultado | Ação |
|-----------|------|
| **Passou** | Extrair variáveis capturadas → Atualizar estado → Próximo teste |
| **Falhou (funcionalidade)** | Documentar erro → Continuar com próximos testes (se independentes) |
| **Falhou (infraestrutura)** | Aplicar auto-fix (Phase 5) → Retry |
| **Falhou (dependência)** | Se teste dependente falhou, pular testes que dependem dele |

### Step 4: Track Results and Variables

Manter registro completo:

```
testResults = {
  "01-auth-signup-signin.hurl": {
    status: "passed",
    duration: 342,
    captured: { accessToken: "...", refreshToken: "...", userId: "..." }
  },
  "02-auth-sessions.hurl": {
    status: "passed",
    duration: 156,
    captured: { sessionId: "..." },
    injected: { accessToken: "...", userId: "..." }  // Variáveis que foram injetadas
  },
  "03-auth-password-reset.hurl": {
    status: "failed",
    duration: 89,
    error: "500 Internal Server Error",
    resultFile: "03-auth-password-reset-result.txt"
  }
}
```

---

## Phase 5: Infrastructure Error Handling (Auto-Fix)

**Se o erro for de INFRAESTRUTURA, o agente DEVE tentar corrigir automaticamente.**

### 5.1 Identificar Tipo de Erro

Analisar o output (`-result.txt` ou logs) para classificar:

| Padrão no Output | Tipo | Ação |
|------------------|------|------|
| `ECONNREFUSED` + `3099` | Backend não subiu | Verificar logs do backend (TaskOutput) |
| `ECONNREFUSED` + `5433` | PostgreSQL não subiu | Verificar `docker ps`, reiniciar infra |
| `relation "X" does not exist` | Migration faltando | Verificar migrations |
| `column "X" does not exist` | Schema desatualizado | Verificar migrations vs Database.ts |
| `401 Unauthorized` | Token inválido/expirado | Executar teste de signin primeiro |
| `500 Internal Server Error` | **Funcionalidade** | Documentar para `/fix` |
| `404 Not Found` | Rota não existe | Verificar controller |

### 5.2 Coletar Informações de Diagnóstico

**OBRIGATÓRIO antes de corrigir:**

```bash
# Estado dos containers
docker ps -a --filter "name=fnd-*-test"

# Logs do postgres (últimas 30 linhas)
docker logs fnd-postgres-test --tail 30

# Schema atual do banco
docker exec fnd-postgres-test psql -U fnd_test -d fnd_easyflow_test -c "\dt"

# Verificar migrations aplicadas
docker exec fnd-postgres-test psql -U fnd_test -d fnd_easyflow_test -c "SELECT * FROM knex_migrations ORDER BY id DESC LIMIT 5"

# Ver logs do backend (usar TaskOutput do shell em background)
```

### 5.3 Aplicar Correção

1. **Identificar arquivo a corrigir:**
   - `.claude/scripts/start-test-infra.js` - Infra
   - `infra/docker-compose.test.yml` - Containers
   - `libs/app-database/migrations/*` - Migrations

2. **Aplicar correção** seguindo padrões de CLAUDE.md

3. **Reiniciar infra:**
```bash
# Parar backend (usar KillShell com shell_id salvo)
# Parar infra
node .claude/scripts/stop-test-infra.js

# Reiniciar do zero (Phase 3)
```

4. **Se falhar novamente:** Documentar erro e informar usuário que precisa intervenção manual

---

## Phase 6: Cleanup & Documentation

### Step 1: Stop Infrastructure

```bash
# Parar backend (usar KillShell com shell_id do background)
# Parar e remover containers
node .claude/scripts/stop-test-infra.js
```

### Step 2: Create Test Results Document

**SEMPRE executar, mesmo se todos passarem.**

**Arquivo:** `docs/features/${FEATURE_ID}/tests/test-results-[YYYYMMDD-HHMMSS].md`

**Formato Híbrido OBRIGATÓRIO:**

```markdown
# Test Results - [Feature Name]

Execução de testes de API para a feature ${FEATURE_ID}.

**Executado:** YYYY-MM-DD HH:MM:SS
**Resultado:** X/Y testes passaram
**Status:** PASSED | FAILED

---

## Spec (Token-Efficient)

{"execution":{"timestamp":"ISO8601","duration_ms":N,"feature":"FXXXX"}}
{"summary":{"total":N,"passed":N,"failed":N}}
{"passed":["01-auth.hurl","02-sessions.hurl"]}
{"failed":[{"test":"03-password-reset.hurl","expected":"status==200","actual":"status==500","response":{"error":"msg"},"result_file":"03-password-reset-result.txt"}]}

---

## Detalhes das Falhas

### 03-password-reset.hurl

**Esperado:** HTTP 200
**Recebido:** HTTP 500

**Output completo:** `03-password-reset-result.txt`

**Response:**
```json
{ "error": "Internal server error" }
```

**Contexto para /fix:**
- Endpoint: POST /api/v1/auth/forgot-password
- Handler provável: AuthController.forgotPassword
- Arquivo: apps/backend/src/api/modules/auth/auth.controller.ts

---

## Testes Passando

- [x] 01-auth-signup-signin.hurl - Authentication (342ms)
- [x] 02-auth-sessions.hurl - Session management (156ms)
```

### Step 3: Completion Report

**Se TODOS passaram:**

```markdown
**✅ Testes Concluídos com Sucesso!**

**Feature:** ${FEATURE_ID}
**Resultado:** X/X testes passaram

**Relatório:** `docs/features/${FEATURE_ID}/tests/test-results-[timestamp].md`

**Próximos passos:**
1. Revisar código com `/review`
2. Commitar mudanças quando aprovado
```

**Se ALGUNS falharam:**

```markdown
**⚠️ Testes Concluídos com Falhas**

**Feature:** ${FEATURE_ID}
**Resultado:** X/Y testes passaram, Z falharam

**Falhas encontradas:**
1. `03-password-reset.hurl` - POST /auth/forgot-password → 500 (expected 200)
2. `04-email-verification.hurl` - POST /auth/verify-email → 401 (expected 200)

**Relatório completo:** `docs/features/${FEATURE_ID}/tests/test-results-[timestamp].md`

**Para corrigir:** Execute `/fix` e referencie o relatório ou arquivo `-result.txt` específico.
```

**Se INFRA falhou (irrecuperável):**

```markdown
**❌ Erro de Infraestrutura - Intervenção Necessária**

**Feature:** ${FEATURE_ID}
**Erro:** [descrição do erro]

**Diagnóstico realizado:**
- [info coletada]

**Correções tentadas:**
- [correção 1] → [resultado]

**Ação necessária:**
[instrução específica para o usuário]
```

---

## Critical Rules

**ANÁLISE PRÉVIA (Phase 2):**
- OBRIGATÓRIO ler TODOS os arquivos .hurl ANTES de iniciar infraestrutura
- Identificar dependências entre testes (variáveis capturadas/consumidas)
- Documentar mapa de dependências antes de executar
- NUNCA executar testes sem entender o que cada um faz e suas dependências

**PROPAGAÇÃO DE VARIÁVEIS (Phase 4):**
- Variáveis NÃO são compartilhadas automaticamente entre execuções
- O agente DEVE extrair valores capturados do output de cada teste
- O agente DEVE injetar variáveis via `--variable` no próximo teste
- Usar `--very-verbose` para ver `* Captures:` no output
- Manter estado de variáveis em memória durante toda a execução
- Se um teste falhar, pular testes que dependem das variáveis dele

**AUTO-FIX (Infraestrutura):**
- SEMPRE tentar corrigir erros de infraestrutura automaticamente
- Coletar diagnóstico ANTES de corrigir
- Máximo 2 tentativas de correção, depois reportar

**DOCUMENTAÇÃO (Funcionalidade):**
- SEMPRE gerar `test-results-XXX.md`, mesmo se todos passarem
- Usar formato híbrido (human-readable + token-efficient)
- Incluir contexto suficiente para `/fix` atuar
- Mencionar arquivos `-result.txt` para detalhes completos

**EXECUÇÃO:**
- Backend em background via Bash tool (run_in_background: true)
- Salvar shell_id para parar depois (KillShell)
- Executar testes UM POR VEZ para output completo
- Aguardar 10s entre start backend e primeiro teste

**PROIBIDO:**
- Modificar código de produção (apenas scripts de teste)
- Ignorar falhas silenciosamente
- Gerar documento sem formato híbrido
- Executar git add/commit
- Executar teste dependente sem injetar variáveis necessárias
- Assumir que variáveis são compartilhadas automaticamente entre testes
- Executar testes sem ler e analisar seu conteúdo primeiro

**OBRIGATÓRIO:**
- Ambiente isolado (porta 5433/6380) - não conflita com dev
- Limpar containers após execução (sempre)
- Documentar TODA execução
- Parar backend background ao final (KillShell)
