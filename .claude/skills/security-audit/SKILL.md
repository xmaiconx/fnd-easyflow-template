---
name: security-audit
description: |
  Expertise especializada em auditoria de segurança baseada em OWASP Top 10. Analisa vulnerabilidades de injeção, autenticação, exposição de dados, controle de acesso, configuração incorreta, XSS, dependências e mass assignment.
---

# Security Audit Skill

Skill de expertise especializada para auditoria de segurança, com foco em:
- ✅ **OWASP Top 10** (2021)
- ✅ **Multi-Tenancy Security**
- ✅ **Frontend/Backend Boundary**
- ✅ **Dependency Vulnerabilities**
- ✅ **Environment Variables**

---

## Quando Usar

### ✅ USE esta skill quando:
- Validar segurança de código implementado
- Auditar codebase completo ou módulo específico
- Identificar vulnerabilidades antes de deploy
- Verificar conformidade OWASP

### ❌ NÃO use para:
- Corrigir vulnerabilidades (apenas reporta)
- Code review geral (use skill `code-review`)
- Planejamento de segurança (use `/plan`)

---

## Input Esperado

```typescript
{
  scope: string | string[],    // Path(s) a auditar ou "." para codebase completo
  context?: {
    featureId?: string,        // Se auditando feature específica
    technicalSpec?: string,    // technical-spec.md ou CLAUDE.md
    accountIdField?: string,   // Campo de tenant (default: "accountId" ou "account_id")
    authProvider?: string      // Supabase, Firebase, Custom, etc.
  }
}
```

---

## Output Esperado

```typescript
{
  securityReport: string,      // Markdown do security-report.md
  score: number,               // 0-10
  findings: [
    {
      id: string,              // "SEC-001"
      category: 'Injection' | 'Authentication' | 'DataExposure' | 'AccessControl' | 'Misconfiguration' | 'XSS' | 'Dependencies' | 'MassAssignment',
      severity: 'critical' | 'high' | 'medium' | 'low',
      owaspId: string,         // "A01:2021"
      file: string,
      line: number,
      description: string,
      impact: string,          // Em linguagem simples
      recommendation: string,
      codeSnippet: string
    }
  ],
  summary: {
    critical: number,
    high: number,
    medium: number,
    low: number,
    total: number
  }
}
```

---

## Checklist OWASP Top 10

### A01:2021 - Broken Access Control

**Multi-Tenancy Critical:**
- [ ] TODAS queries filtram por tenant identifier (`account_id`, `workspace_id`)
- [ ] Tenant ID vem do JWT (NUNCA do request body)
- [ ] Ownership validado antes de UPDATE/DELETE
- [ ] Guards aplicados em endpoints protegidos
- [ ] Sem vazamento cross-tenant

**Buscar padrões suspeitos:**
```bash
# Queries sem filtro de tenant
grep -rn "findAll\|selectFrom" --include="*.ts" | grep -v "accountId\|account_id"

# Tenant ID do body (vulnerável)
grep -rn "@Body()" --include="*.ts" -A 5 | grep "accountId"
```

---

### A02:2021 - Cryptographic Failures

**Sensitive Data Exposure:**
- [ ] Credenciais criptografadas (via `IEncryptionService` ou similar)
- [ ] Senhas NUNCA em logs
- [ ] Tokens não expostos em responses
- [ ] API keys via env vars (não hardcoded)
- [ ] Secrets não commitados (`.env` no `.gitignore`)

**Buscar padrões suspeitos:**
```bash
# Hardcoded secrets
grep -rn "sk_live\|sk_test\|api_key\|apikey\|secret" --include="*.ts" | grep -v "process.env\|config\."

# Dados sensíveis em responses
grep -rn "password\|token\|secret" --include="*.ts" | grep "return\|res.json\|response"

# Logs com dados sensíveis
grep -rn "logger\.\|console\." --include="*.ts" | grep -i "token\|jwt\|password\|secret"
```

---

### A03:2021 - Injection

**SQL/NoSQL Injection:**
- [ ] Queries parametrizadas (sem concatenação de strings)
- [ ] Inputs validados com `class-validator` decorators
- [ ] Sem uso de `.raw()` com user input

**Command Injection:**
- [ ] Evitar `exec`, `spawn`, `execSync` com user input
- [ ] Se necessário, sanitizar inputs

**Buscar padrões suspeitos:**
```bash
# SQL Injection - concatenação em queries
grep -rn "raw\s*\(" --include="*.ts"
grep -rn "\`.*\${.*}\`" --include="*.ts" | grep -i "select\|insert\|update\|delete"

# Command Injection
grep -rn "exec\|spawn\|execSync" --include="*.ts"
```

---

### A04:2021 - Insecure Design

**Authentication & Session Management:**
- [ ] Guards aplicados em TODAS rotas protegidas
- [ ] JWT com expiração adequada
- [ ] Refresh tokens gerenciados corretamente
- [ ] Logout invalida sessão/token

**Buscar padrões suspeitos:**
```bash
# Endpoints sem guards
grep -rn "@Get\|@Post\|@Put\|@Delete\|@Patch" --include="*.ts" -A 3 | grep -v "UseGuards"
```

---

### A05:2021 - Security Misconfiguration

**Configuration Issues:**
- [ ] CORS restrito (não `origin: '*'` em produção)
- [ ] Secrets via environment variables
- [ ] Debug desabilitado em produção
- [ ] Error stack traces não expostos
- [ ] Dependências atualizadas (`npm audit`)

**Buscar padrões suspeitos:**
```bash
# CORS aberto
grep -rn "origin:\s*['\"]?\*['\"]?" --include="*.ts"

# process.env direto (sem service)
grep -rn "process\.env\." --include="*.ts" | grep -v "NODE_ENV"
```

---

### A06:2021 - Vulnerable Components

**Dependency Vulnerabilities:**
- [ ] `npm audit` sem vulnerabilidades critical/high
- [ ] Dependências atualizadas regularmente
- [ ] Usar `npm audit fix` quando possível

**Executar:**
```bash
npm audit --json | grep -E "critical|high"
```

---

### A07:2021 - Authentication Failures

**Auth Implementation:**
- [ ] Password hashing adequado (bcrypt, argon2)
- [ ] Rate limiting em endpoints de autenticação
- [ ] MFA disponível (se aplicável)
- [ ] Password recovery seguro

---

### A08:2021 - Software and Data Integrity

**Code Integrity:**
- [ ] Dependências de fontes confiáveis
- [ ] Lock files commitados (`package-lock.json`)
- [ ] CI/CD com validações de segurança

---

### A09:2021 - Logging Failures

**Logging Security:**
- [ ] Logs não contêm dados sensíveis (passwords, tokens, PII)
- [ ] Logs têm contexto suficiente para debugging
- [ ] Logs de tentativas de acesso não autorizado

**Buscar padrões suspeitos:**
```bash
# Logs com dados sensíveis
grep -rn "logger\.\|console\." --include="*.ts" | grep -i "password\|token\|creditcard\|ssn"
```

---

### A10:2021 - Server-Side Request Forgery (SSRF)

**SSRF Prevention:**
- [ ] URLs externas validadas/whitelist
- [ ] Não aceitar URLs arbitrárias de usuários
- [ ] Validar hostnames antes de fetch

---

### Extra: XSS (Cross-Site Scripting)

**Frontend Security:**
- [ ] Outputs sanitizados
- [ ] `dangerouslySetInnerHTML` evitado (ou com sanitização)
- [ ] URLs validadas antes de usar em `href` ou `src`

**Buscar padrões suspeitos:**
```bash
# dangerouslySetInnerHTML sem sanitização
grep -rn "dangerouslySetInnerHTML" --include="*.tsx"

# URLs não validadas
grep -rn "href=\|src=" --include="*.tsx" | grep "\${.*}"
```

---

### Extra: Mass Assignment

**DTO Protection:**
- [ ] DTOs explícitos (não spread de body direto)
- [ ] Usar `@Expose()` e `@Exclude()` do `class-transformer`
- [ ] Evitar `PartialType` sem validação

**Buscar padrões suspeitos:**
```bash
# Spread direto de body
grep -rn "\.\.\.body\|\.\.\.dto\|\.\.\.req\.body" --include="*.ts"
```

---

## Processo de Auditoria

### Phase 1: Setup
1. Ler `docs/instructions/security.md` (checklist completo)
2. Ler `technical-spec.md` ou `CLAUDE.md` (entender padrões)
3. Identificar arquivos no scope

### Phase 2: Análise por Categoria
Para CADA categoria OWASP:
1. Executar buscas de padrões suspeitos
2. Ler arquivos identificados
3. Validar se é vulnerabilidade real (não falso positivo)
4. Classificar severidade
5. Documentar finding com:
   - Código vulnerável
   - Impacto em linguagem simples
   - Recomendação específica

### Phase 3: Multi-Tenancy Validation
Se o projeto tem multi-tenancy:
1. Identificar tenant identifier (`account_id`, `workspace_id`)
2. Verificar TODAS queries
3. Verificar TODOS endpoints
4. Validar que ID vem do JWT

### Phase 4: Generate Report
1. Calcular score baseado em severidade
2. Agrupar findings por severidade
3. Criar security-report.md
4. Incluir top 3 issues mais críticos

---

## Scoring System

```typescript
// Severidade → Peso
critical: 3 pontos
high: 2 pontos
medium: 1 ponto
low: 0.5 pontos

// Score final
score = max(0, 10 - (soma_ponderada / 5))

// Status
8-10: ✅ Seguro
6-7: ⚠️ Atenção necessária
4-5: 🟠 Risco
0-3: 🔴 Vulnerável
```

---

## Template de Output (security-report.md)

```markdown
# Security Audit Report

**Data:** [current date]
**Auditor:** Security Audit Skill
**Escopo:** [path auditado ou "Codebase Completo"]

---

## Executive Summary

[2-3 parágrafos: visão geral do estado de segurança, principais riscos, recomendações prioritárias]

---

## 📊 Security Score

| Categoria | Status | Findings |
|-----------|--------|----------|
| Injection | ✅/⚠️/❌ | X issues |
| Authentication | ✅/⚠️/❌ | X issues |
| Data Exposure | ✅/⚠️/❌ | X issues |
| Access Control | ✅/⚠️/❌ | X issues |
| Misconfiguration | ✅/⚠️/❌ | X issues |
| XSS | ✅/⚠️/❌ | X issues |
| Dependencies | ✅/⚠️/❌ | X issues |
| Mass Assignment | ✅/⚠️/❌ | X issues |
| **OVERALL** | **⚠️** | **X total** |

**Legenda:** ✅ Seguro | ⚠️ Atenção | ❌ Vulnerável

---

## 🔴 Critical Findings

### Finding #1: [Title]

**Categoria:** [OWASP Category]
**Severidade:** 🔴 Critical
**Arquivo:** `path/to/file.ts:line`
**OWASP:** [A01:2021 - Broken Access Control]

**Descrição:**
[O que foi encontrado e por que é crítico]

**Código Vulnerável:**
```typescript
// Código problemático
```

**Impacto:**
[O que um atacante poderia fazer explorando esta vulnerabilidade - linguagem simples]

**Recomendação:**
```typescript
// Como corrigir
```

---

## 🟡 High Findings

[Mesmo formato dos Critical]

---

## 🟠 Medium Findings

[Mesmo formato]

---

## 🟢 Low Findings

[Mesmo formato]

---

## ✅ Pontos Positivos

- [Boas práticas já implementadas]
- [Padrões de segurança seguidos corretamente]

---

## 📋 Recomendações Prioritárias

1. **[Ação mais urgente]** - Corrigir [finding crítico]
2. **[Segunda prioridade]** - Implementar [melhoria]
3. **[Terceira prioridade]** - Revisar [área]

---

## Arquivos Analisados

- `path/to/file1.ts`
- `path/to/file2.ts`
- [lista completa]

---

## Metodologia

Auditoria baseada em:
- OWASP Top 10 (2021)
- Checklist interno: `docs/instructions/security.md`
- Padrões do projeto: `technical-spec.md` ou `CLAUDE.md`
```

---

## Usage Example

```typescript
// Invoke from Code Review Skill
const securityResult = await invokeSkill('security-audit', {
  scope: ['apps/backend/src/api/modules/auth/', 'apps/frontend/src/pages/login.tsx'],
  context: {
    featureId: 'F0001-user-authentication',
    technicalSpec: await readFile('docs/architecture/technical-spec.md'),
    accountIdField: 'accountId',
    authProvider: 'Supabase'
  }
});

// Result
console.log(securityResult.score); // 7.5
console.log(securityResult.summary.critical); // 1
console.log(securityResult.summary.high); // 3
console.log(securityResult.findings[0].owaspId); // "A01:2021"
```

---

## Critical Rules

**DO:**
- ✅ Analisar TODOS os arquivos no scope
- ✅ Verificar TODAS as categorias OWASP
- ✅ Validar contexto antes de reportar (evitar falsos positivos)
- ✅ Incluir linha exata do problema
- ✅ Explicar impacto em linguagem simples
- ✅ Dar recomendação específica (não genérica)

**DO NOT:**
- ❌ Corrigir código automaticamente (apenas reporta)
- ❌ Gerar falsos positivos sem verificar contexto
- ❌ Ignorar findings "menores"
- ❌ Usar jargões técnicos sem explicação

---

## False Positive Prevention

Antes de reportar como vulnerabilidade, verificar:

1. **Context Matters:**
   - `process.env.NODE_ENV` é OK (não é secret)
   - Queries internas (não user input) podem usar `.raw()`
   - DTOs com validação podem usar `PartialType`

2. **Framework Protections:**
   - NestJS já sanitiza alguns inputs
   - TypeORM/Kysely já parametrizam queries
   - React já escapa outputs por padrão

3. **Project Patterns:**
   - Verificar se o projeto tem padrão específico (ex: IConfigurationService)
   - Não reportar como violação se seguir padrão documentado

---

## References

- OWASP Top 10: https://owasp.org/Top10/
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org/
- Project Security Checklist: `docs/instructions/security.md`
- Project Patterns: `docs/architecture/technical-spec.md` or `CLAUDE.md`
