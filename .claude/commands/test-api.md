# API Test Execution

> **LANGUAGE RULE:** All interaction with the user (questions, responses, summaries, error messages) MUST be in Brazilian Portuguese (PT-BR). Keep technical terms, code, and file names in English.

Este comando executa testes de API usando httpyac para a feature atual.

---

## Pre-requisitos

- httpyac instalado (`npm ls httpyac`)
- Serviços rodando (API, DB, Redis)
- Testes gerados em `docs/features/FXXXX/tests/api/`

---

## Phase 1: Environment Check

### Step 1: Check/Install httpyac

```bash
# Verificar se httpyac está instalado
npm ls httpyac 2>/dev/null || npm install httpyac --save-dev
```

**Se não instalado, instalar automaticamente:**
```bash
npm install httpyac --save-dev
```

### Step 2: Add npm script (if missing)

Verificar se script `test:api` existe em `package.json`. Se não existir, informar ao usuário que precisa adicionar:

```json
{
  "scripts": {
    "test:api": "httpyac send docs/features/*/tests/api/*.http --all -e local"
  }
}
```

### Step 3: Identify Feature

```bash
FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh)
```

### Step 4: Check Test Files

```bash
ls -la "docs/features/${FEATURE_ID}/tests/api/" 2>/dev/null
```

**Se não existir:**
```markdown
**Testes não encontrados!**

Os testes httpyac ainda não foram gerados para esta feature.

Execute `/dev` novamente ou use a skill `api-testing` para gerar os testes em:
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

---

## Phase 3: Environment Setup

### Step 1: Check Environment File

```bash
cat "docs/features/${FEATURE_ID}/tests/api/http-client.env.json"
```

### Step 2: Validate Environment

Verificar se as variáveis necessárias estão configuradas:
- `API_URL` - URL da API
- `TEST_EMAIL` - Email de teste
- `TEST_PASSWORD` - Senha de teste

**Se faltar variáveis:**
```markdown
**Configuração incompleta:**

Edite `docs/features/${FEATURE_ID}/tests/api/http-client.env.json` e configure:
- TEST_EMAIL: email de um usuário de teste existente
- TEST_PASSWORD: senha desse usuário

**Deseja continuar com valores padrão?** (S/N)
```

---

## Phase 4: Test Execution

### Step 1: Execute Tests

```bash
npx httpyac send "docs/features/${FEATURE_ID}/tests/api/*.http" --all -e local
```

**Opções adicionais:**
- `--bail` - Para no primeiro erro
- `-v` - Verbose (mostra request/response)
- `--junit` - Output JUnit XML

### Step 2: Display Results

Mostrar output em tempo real:
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
- **File:** XX-module.http
- **Expected:** status == 200
- **Actual:** status == 500
- **Response:**
```json
{ "error": "..." }
```

## Passed Tests

- [x] 00-setup.http - Authentication (Xms)
- [x] 01-crud.http - Create resource (Xms)
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
1. `01-crud.http` - POST /api/v1/resources → status 500 (expected 201)
2. `02-validation.http` - Missing field validation not working

**Report completo:** `docs/features/${FEATURE_ID}/tests/test-report.md`

**Ação recomendada:** Corrija os endpoints e execute `/test-api` novamente.
```

---

## Options

### Run Specific Test File

```bash
# Executar arquivo específico
npx httpyac send "docs/features/${FEATURE_ID}/tests/api/01-crud.http" --all -e local
```

### Verbose Mode

```bash
# Com detalhes de request/response
npx httpyac send "docs/features/${FEATURE_ID}/tests/api/*.http" --all -e local -v
```

### Bail on First Failure

```bash
# Parar no primeiro erro
npx httpyac send "docs/features/${FEATURE_ID}/tests/api/*.http" --all -e local --bail
```

### JUnit Output (CI)

```bash
# Output para CI/CD
npx httpyac send "docs/features/${FEATURE_ID}/tests/api/*.http" --all -e local --junit > test-results.xml
```

---

## Troubleshooting

### "Connection refused"
- Verifique se a API está rodando em `localhost:3001`
- Execute `npm run dev:api` em outro terminal

### "401 Unauthorized"
- Verifique credenciais em `http-client.env.json`
- Certifique-se que o usuário de teste existe no banco
- Verifique se `00-setup.http` está sendo executado primeiro

### "httpyac not found"
- Execute: `npm install httpyac --save-dev`

### "No test files"
- Execute a skill `api-testing` para gerar testes
- Ou crie arquivos `.http` manualmente

### "Environment not found"
- Crie `http-client.env.json` com ambiente `local`
- Ou use: `npx httpyac send ... -e local --var API_URL=http://localhost:3001/api/v1`

---

## Critical Rules

**DO:**
- Verificar/instalar httpyac antes de executar
- Verificar serviços antes de executar
- Mostrar progresso em tempo real
- Gerar relatório mesmo se falhar
- Sugerir próximos passos

**DO NOT:**
- Executar sem verificar se API está rodando
- Ignorar falhas silenciosamente
- Modificar código baseado em falhas (apenas reportar)
- Commitar sem todos os testes passando
