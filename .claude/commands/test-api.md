# API Test Execution

> **LANGUAGE RULE:** All interaction with the user (questions, responses, summaries, error messages) MUST be in Brazilian Portuguese (PT-BR). Keep technical terms, code, and file names in English.

Este comando executa testes de API usando Hurl para a feature atual.

---

## Pre-requisitos

- [Hurl](https://hurl.dev/) instalado (`hurl --version`)
- Serviços rodando (API, DB, Redis)
- Testes gerados em `docs/features/FXXXX/tests/api/`

---

## Phase 1: Environment Check

### Step 1: Check Hurl Installation

```bash
hurl --version 2>/dev/null || echo "HURL_NOT_INSTALLED"
```

**Se Hurl não instalado:**
```markdown
**Hurl não encontrado!**

Instale via:
- **Windows:** `winget install Orange.Hurl` ou `scoop install hurl`
- **macOS:** `brew install hurl`
- **Linux:** `snap install hurl` ou baixe de https://hurl.dev/

Após instalar, execute `/test-api` novamente.
```

### Step 2: Identify Feature

```bash
FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh)
```

### Step 3: Check Test Files

```bash
ls -la "docs/features/${FEATURE_ID}/tests/api/" 2>/dev/null
```

**Se não existir:**
```markdown
**Testes não encontrados!**

Os testes Hurl ainda não foram gerados para esta feature.

Execute a skill `api-testing` para gerar os testes, ou crie manualmente em:
`docs/features/${FEATURE_ID}/tests/api/`
```

---

## Phase 2: Services Check

### Step 1: Run Services Check Script

```bash
bash .claude/scripts/test-services-check.sh
```

**Analisar output:**
- `POSTGRES: UP` - PostgreSQL rodando
- `REDIS: UP` - Redis rodando
- `API: UP` - Backend API respondendo
- `WORKERS: UP` - Workers processando (opcional)

### Step 2: Handle Missing Services

**Se serviços não estiverem rodando:**

```markdown
**Serviços não detectados!**

Deseja que eu inicie os serviços? (S/N)

Comandos que serão executados:
1. `docker-compose -f infra/docker-compose.yml up -d` (DB + Redis)
2. `npm run dev:api` (API em background)
3. `npm run dev:workers` (Workers em background) - se necessário
```

**Se usuário confirmar**, executar:
```bash
docker-compose -f infra/docker-compose.yml up -d
# Aguardar containers healthy
sleep 10
```

**Para API/Workers**, informar que precisa ser iniciado manualmente em outro terminal ou usar o script de background.

---

## Phase 3: Variables Setup

### Step 1: Check Variables File

```bash
cat "docs/features/${FEATURE_ID}/tests/api/variables.env"
```

### Step 2: Check Local Override

```bash
ls "docs/features/${FEATURE_ID}/tests/api/variables.local.env" 2>/dev/null
```

**Se `variables.local.env` não existir:**
```markdown
**Configuração de variáveis:**

O arquivo `variables.env` contém valores padrão.
Para usar valores customizados, crie `variables.local.env`:

```bash
cp docs/features/${FEATURE_ID}/tests/api/variables.env \
   docs/features/${FEATURE_ID}/tests/api/variables.local.env
```

Edite `variables.local.env` com seus valores de teste.

**Deseja continuar com valores padrão?** (S/N)
```

---

## Phase 4: Test Execution

### Step 1: Execute Tests

```bash
bash .claude/scripts/run-hurl-tests.sh "${FEATURE_ID}"
```

**O script executa:**
1. Todos os arquivos `.hurl` em ordem alfabética (00-, 01-, 02-, etc.)
2. Gera relatório em `tests/test-report.md`
3. Retorna exit code (0 = sucesso, 1+ = falhas)

### Step 2: Display Results

Mostrar output do Hurl em tempo real:
- Testes passando em verde
- Testes falhando em vermelho com detalhes

---

## Phase 5: Report Generation

### Step 1: Parse Results

Analisar output e criar/atualizar `tests/test-report.md`:

```markdown
# Test Report - [Feature Name]

**Executed:** YYYY-MM-DD HH:MM
**Duration:** X.XXs
**Result:** PASSED / FAILED

## Summary

| Status | Count |
|--------|-------|
| Passed | XX |
| Failed | XX |
| Skipped | XX |

## Failed Tests

### [Test Name]
- **File:** XX-module.hurl:XX
- **Expected:** HTTP 200
- **Actual:** HTTP 500
- **Response:**
```json
{ "error": "..." }
```

## Passed Tests

- [x] 00-setup.hurl - Authentication (Xms)
- [x] 01-crud.hurl - Create resource (Xms)
...
```

---

## Phase 6: Completion

### Success Output

```markdown
**API Tests Completed**

**Feature:** ${FEATURE_ID}
**Result:** XX/XX testes passaram

**Report:** `docs/features/${FEATURE_ID}/tests/test-report.md`

**Próximos passos:**
- Se todos passaram: Prossiga com `/review` ou commit
- Se houve falhas: Corrija os endpoints e execute `/test-api` novamente
```

### Failure Output

```markdown
**API Tests Failed**

**Feature:** ${FEATURE_ID}
**Result:** XX/XX testes passaram, YY falharam

**Falhas encontradas:**
1. `01-crud.hurl:15` - POST /api/v1/resources → HTTP 500 (expected 201)
2. `02-validation.hurl:8` - Missing field validation not working

**Report completo:** `docs/features/${FEATURE_ID}/tests/test-report.md`

**Ação recomendada:** Corrija os endpoints e execute `/test-api` novamente.
```

---

## Options

### Run Specific Test File

```bash
# Sintaxe: /test-api [filename]
# Exemplo: /test-api 01-crud.hurl
```

### Verbose Mode

```bash
# Sintaxe: /test-api --verbose
# Mostra request/response completos
```

### Generate Only (No Execute)

```bash
# Sintaxe: /test-api --generate
# Apenas gera testes, não executa
```

---

## Troubleshooting

### "Connection refused"
- Verifique se a API está rodando em `localhost:3001`
- Execute `npm run dev:api` em outro terminal

### "401 Unauthorized"
- Verifique credenciais em `variables.env`
- Certifique-se que o usuário de teste existe no banco

### "Hurl not found"
- Instale Hurl: https://hurl.dev/docs/installation.html

### "No test files"
- Execute a skill `api-testing` para gerar testes
- Ou crie arquivos `.hurl` manualmente

---

## Critical Rules

**DO:**
- Verificar serviços antes de executar
- Mostrar progresso em tempo real
- Gerar relatório mesmo se falhar
- Sugerir próximos passos

**DO NOT:**
- Executar sem verificar Hurl instalado
- Ignorar falhas silenciosamente
- Modificar código baseado em falhas (apenas reportar)
- Commitar sem todos os testes passando
