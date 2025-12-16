---
name: code-review
description: |
  Expertise especializada em code review baseada em OWASP, Clean Architecture, SOLID e padrões do projeto. Valida implementações contra especificação técnica e identifica violações de segurança, arquitetura e qualidade.
---

# Code Review Skill

Skill de expertise especializada para validação de código implementado, com foco em:
- ✅ **Segurança** (OWASP Top 10)
- ✅ **Arquitetura** (Clean Architecture, SOLID)
- ✅ **Padrões do Projeto** (technical-spec.md ou CLAUDE.md)
- ✅ **Qualidade de Código** (TypeScript, exports, dead code)

---

## Quando Usar

### ✅ USE esta skill quando:
- Validar código implementado de uma feature
- Identificar violações de segurança
- Verificar conformidade com padrões do projeto
- Auto-corrigir issues encontrados (modo autopilot)

### ❌ NÃO use para:
- Implementar código (use subagentes de desenvolvimento)
- Planejamento técnico (use /plan)
- Discovery de features (use /feature)

---

## Input Esperado

```typescript
{
  featureId: string,           // F0001-user-authentication
  mode: 'autopilot' | 'manual', // autopilot = auto-fix, manual = apenas report
  context: {
    aboutMd: string,            // Conteúdo de about.md
    planMd?: string,            // Conteúdo de plan.md (se existir)
    implementationMd: string,   // Conteúdo de implementation.md
    technicalSpec?: string      // technical-spec.md ou CLAUDE.md
  }
}
```

---

## Output Esperado

```typescript
{
  reviewReport: string,        // Markdown do review.md
  score: number,               // 0-10
  issuesFound: number,
  issuesFixed: number,         // Apenas em modo autopilot
  buildPassing: boolean,
  findings: [
    {
      id: string,              // "SEC-001"
      severity: 'critical' | 'high' | 'medium' | 'low',
      category: 'Security' | 'Architecture' | 'Quality',
      file: string,
      line: number,
      description: string,
      fixed: boolean           // true se auto-corrigido
    }
  ]
}
```

---

## Checklist de Validação

### 1. Project-Specific Patterns (CRÍTICO)

**Fonte:** `technical-spec.md` ou `CLAUDE.md`

- [ ] Configuração: Variáveis de ambiente via padrão do projeto
- [ ] DI: Dependency Injection seguindo tokens definidos
- [ ] Repository: Usa domain entities (não DTOs)
- [ ] CQRS: Commands para escrita, queries para leitura
- [ ] Multi-tenancy: Filtro `account_id` em TODAS queries
- [ ] Logs: Usa logger injetado (nunca `console.log`)

### 2. Security (OWASP Top 10)

**Fonte:** `docs/instructions/security.md`

- [ ] Injection: Queries parametrizadas, inputs validados
- [ ] Authentication: Guards aplicados, tokens não expostos
- [ ] Data Exposure: Credenciais criptografadas, logs sem secrets
- [ ] Access Control: `account_id` do JWT (nunca do body)
- [ ] Misconfiguration: CORS restrito, secrets via env vars
- [ ] XSS: Outputs sanitizados, URLs validadas
- [ ] Dependencies: `npm audit` sem critical/high
- [ ] Mass Assignment: DTOs explícitos

### 3. Architecture & SOLID

- [ ] Clean Architecture: Domain nunca depende de outer layers
- [ ] SRP: Classes fazem apenas uma coisa
- [ ] OCP: Extensível sem modificar código existente
- [ ] DIP: Depende de abstrações (interfaces), não concretions

### 4. Code Quality

- [ ] TypeScript: Sem `any`, tipos explícitos
- [ ] Migrations: Nova tabela → migration criada
- [ ] Frontend Types: DTOs espelhados em `apps/frontend/src/types/`
- [ ] Barrel Exports: Novos arquivos exportados em `index.ts`
- [ ] Dead Code: Sem `console.log`, `debugger`, imports não usados
- [ ] Hardcoded: Sem magic numbers, strings repetidas em constantes
- [ ] Error Handling: Exceptions do NestJS, mensagens descritivas

### 5. Environment Variables (OBRIGATÓRIO)

- [ ] Novas variáveis documentadas em `.env.example`
- [ ] Valores de exemplo (não valores reais)
- [ ] Comentários explicativos para vars complexas

---

## Processo de Review

### Phase 1: Load Context
1. Ler `technical-spec.md` (ou `CLAUDE.md` como fallback)
2. Ler `docs/instructions/security.md`
3. Ler arquivos da feature (about.md, plan.md, implementation.md)
4. Identificar arquivos implementados (do implementation.md)

### Phase 2: Validate Against Patterns
1. Verificar CADA arquivo contra technical-spec.md
2. Identificar violações de padrões do projeto
3. Classificar por severidade (critical, high, medium, low)

### Phase 3: Security Analysis
1. Verificar CADA categoria OWASP
2. Validar multi-tenancy (se aplicável)
3. Verificar env vars no `.env.example`

### Phase 4: Architecture & Quality
1. Validar Clean Architecture
2. Verificar SOLID principles
3. TypeScript quality checks
4. Database migrations

### Phase 5: Apply Fixes (se mode = autopilot)
1. Para CADA violação encontrada:
   - Aplicar correção
   - Verificar build
   - Documentar no report
2. Só finalizar quando build passar 100%

### Phase 6: Generate Report
1. Criar `docs/features/${featureId}/review.md`
2. Score baseado em issues ponderados
3. Lista de findings com before/after
4. Build status

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
8-10: ✅ APPROVED
6-7: ⚠️ NEEDS ATTENTION
4-5: ❌ NEEDS FIXES
0-3: 🔴 CRITICAL ISSUES
```

---

## Template de Output (review.md)

```markdown
# Code Review: [Feature Name]

**Date:** [current date]
**Reviewer:** Code Review Skill
**Feature:** ${featureId}
**Mode:** ${mode}
**Status:** ✅ APPROVED / ⚠️ NEEDS ATTENTION / ❌ NEEDS FIXES

---

## Executive Summary

[2-3 sentences: what was found, what was fixed, final state]

---

## 📊 Review Score

| Category | Score | Status |
|----------|-------|--------|
| Project Patterns | X/10 | ✅/⚠️/❌ |
| Security | X/10 | ✅/⚠️/❌ |
| Architecture & SOLID | X/10 | ✅/⚠️/❌ |
| Code Quality | X/10 | ✅/⚠️/❌ |
| **OVERALL** | **X/10** | **✅** |

---

## 🔧 Issues Found & Fixed

### Issue #1: [Title]

**Category:** [Project Patterns | Security | Architecture | Quality]
**File:** `path/to/file.ts:line`
**Severity:** 🔴 Critical | 🟡 High | 🟠 Medium | 🟢 Low

**Problem:**
```typescript
// Code before fix
```

**Why it's a problem:**
[Explanation - reference pattern violated]

**Fix Applied:**
```typescript
// Code after fix
```

**Status:** ✅ FIXED / ⏳ PENDING

---

## ✅ Strengths

- [Positive aspects of implementation]

---

## Build Status

- [x] Backend compiles successfully
- [x] Frontend compiles successfully
- [x] All corrections applied

**Final Status:** ✅ READY FOR MERGE
```

---

## Usage Example

```typescript
// Invoke from Review Subagent
const reviewResult = await invokeSkill('code-review', {
  featureId: 'F0001-user-authentication',
  mode: 'autopilot',
  context: {
    aboutMd: await readFile('docs/features/F0001-user-authentication/about.md'),
    planMd: await readFile('docs/features/F0001-user-authentication/plan.md'),
    implementationMd: await readFile('docs/features/F0001-user-authentication/implementation.md'),
    technicalSpec: await readFile('docs/architecture/technical-spec.md')
  }
});

// Result
console.log(reviewResult.score); // 8.5
console.log(reviewResult.issuesFound); // 5
console.log(reviewResult.issuesFixed); // 5
console.log(reviewResult.buildPassing); // true
```

---

## Critical Rules

**DO:**
- ✅ Ler technical-spec.md ANTES de validar
- ✅ SEMPRE aplicar correções em modo autopilot
- ✅ Verificar build após CADA correção
- ✅ Documentar before/after de cada fix
- ✅ Validar TODAS as categorias do checklist

**DO NOT:**
- ❌ Gerar report sem corrigir (modo autopilot)
- ❌ Ignorar padrões do technical-spec.md
- ❌ Aceitar "funciona" como justificativa
- ❌ Deixar código não compilando
- ❌ Inventar padrões não definidos no projeto

---

## References

- OWASP Top 10: https://owasp.org/Top10/
- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- SOLID Principles: https://en.wikipedia.org/wiki/SOLID
- Project Patterns: `docs/architecture/technical-spec.md` or `CLAUDE.md`
- Security Checklist: `docs/instructions/security.md`
