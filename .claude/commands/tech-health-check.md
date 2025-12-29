# Tech Health Check - Análise Técnica do Projeto

> **LANGUAGE RULE:** Documentação gerada DEVE ser em Português (PT-BR). Termos técnicos e código em Inglês.

> **DOCUMENTATION STYLE:** Seguir padrões definidos em `.claude/skills/documentation-style/SKILL.md`

Este comando executa uma análise técnica completa do projeto, identificando problemas de segurança, arquitetura, dados e documentação. Projetado para empreendedores que usam vibe coding e precisam de um roadmap de ajustes técnicos.

**Output:** `docs/health-checks/YYYY-MM-DD/`

---

## Visão Geral da Arquitetura

```
/tech-health-check
    │
    ├── FASE 1 - DESCOBERTA (paralelo)
    │   ├── context-discovery      → Arquitetura, multi-tenancy, funcionalidades
    │   ├── documentation-analyzer → CLAUDE.md, padrões
    │   └── infrastructure-check   → MCP Supabase, env vars
    │
    ├── FASE 2 - ANÁLISE (paralelo, depende da Fase 1)
    │   ├── security-analyzer      → RLS, secrets, frontend/backend boundary
    │   ├── architecture-analyzer  → Clean arch, imports, acoplamento
    │   └── data-analyzer          → Migrations, índices, queries
    │
    └── FASE 3 - CONSOLIDAÇÃO
        └── Coordenador            → HEALTH-REPORT.md final
```

---

## Phase 1: Setup

### Step 1: Criar Estrutura de Pastas

```bash
# Criar pasta com data atual
HEALTH_DATE=$(date +%Y-%m-%d)
mkdir -p "docs/health-checks/${HEALTH_DATE}"
```

**Pasta de output:** `docs/health-checks/${HEALTH_DATE}/`

### Step 2: Verificar Pré-requisitos

```bash
# Verificar se CLAUDE.md existe
ls CLAUDE.md 2>/dev/null

# Verificar estrutura do projeto
ls -la apps/ libs/ src/ 2>/dev/null
```

---

## Phase 2: Descoberta (Executar em Paralelo)

**IMPORTANTE:** Disparar os 3 subagentes abaixo EM PARALELO usando o Task tool.

### Subagente 1: Context Discovery

**Objetivo:** Entender arquitetura, multi-tenancy e funcionalidades do projeto.

**Usar Task tool com:**
- `subagent_type`: "Explore"
- `prompt`: Conteúdo da skill `.claude/skills/health-check/context-discovery.md`

**Output esperado:** `docs/health-checks/${HEALTH_DATE}/context-discovery.md`

---

### Subagente 2: Documentation Analyzer

**Objetivo:** Verificar se documentação existe e segue padrões.

**Usar Task tool com:**
- `subagent_type`: "Explore"
- `prompt`: Conteúdo da skill `.claude/skills/health-check/documentation-analyzer.md`

**Output esperado:** `docs/health-checks/${HEALTH_DATE}/documentation-report.md`

---

### Subagente 3: Infrastructure Check

**Objetivo:** Verificar se MCP Supabase está habilitado e infraestrutura configurada.

**Usar Task tool com:**
- `subagent_type`: "Explore"
- `prompt`: Conteúdo da skill `.claude/skills/health-check/infrastructure-check.md`

**Output esperado:** `docs/health-checks/${HEALTH_DATE}/infrastructure-report.md`

---

## Phase 3: Aguardar Fase 1

**OBRIGATÓRIO:** Aguardar conclusão de TODOS os subagentes da Fase 1 antes de prosseguir.

Usar `TaskOutput` para verificar status de cada subagente.

**Validar outputs:**
- [ ] `context-discovery.md` existe e contém seções obrigatórias
- [ ] `documentation-report.md` existe
- [ ] `infrastructure-report.md` existe

---

## Phase 4: Análise (Executar em Paralelo)

**IMPORTANTE:** Disparar os 3 subagentes abaixo EM PARALELO usando o Task tool.

Cada subagente DEVE ler `context-discovery.md` para entender:
- Quais tenant identifiers validar
- Quais funcionalidades existem
- Quais padrões são esperados

### Subagente 4: Security Analyzer

**Objetivo:** Analisar segurança por funcionalidade.

**Usar Task tool com:**
- `subagent_type`: "general-purpose"
- `prompt`: Conteúdo da skill `.claude/skills/health-check/security-analyzer.md`

**Contexto adicional:** Passar conteúdo de `context-discovery.md` e `infrastructure-report.md`

**Output esperado:** `docs/health-checks/${HEALTH_DATE}/security-report.md`

---

### Subagente 5: Architecture Analyzer

**Objetivo:** Verificar violações de arquitetura e padrões.

**Usar Task tool com:**
- `subagent_type`: "general-purpose"
- `prompt`: Conteúdo da skill `.claude/skills/health-check/architecture-analyzer.md`

**Contexto adicional:** Passar conteúdo de `context-discovery.md`

**Output esperado:** `docs/health-checks/${HEALTH_DATE}/architecture-report.md`

---

### Subagente 6: Data Analyzer

**Objetivo:** Analisar migrations, índices e queries.

**Usar Task tool com:**
- `subagent_type`: "general-purpose"
- `prompt`: Conteúdo da skill `.claude/skills/health-check/data-analyzer.md`

**Contexto adicional:** Passar conteúdo de `context-discovery.md` e `infrastructure-report.md`

**Output esperado:** `docs/health-checks/${HEALTH_DATE}/data-report.md`

---

## Phase 5: Aguardar Fase 2

**OBRIGATÓRIO:** Aguardar conclusão de TODOS os subagentes da Fase 2.

Usar `TaskOutput` para verificar status de cada subagente.

**Validar outputs:**
- [ ] `security-report.md` existe
- [ ] `architecture-report.md` existe
- [ ] `data-report.md` existe

---

## Phase 6: Consolidação

### Step 1: Ler Todos os Reports

```bash
# Ler todos os reports gerados
cat docs/health-checks/${HEALTH_DATE}/*.md
```

### Step 2: Calcular Scores

**Scoring por pilar:**
- Contar issues por severidade (Crítico=3, Alto=2, Médio=1, Baixo=0.5)
- Score = max(0, 10 - (soma_ponderada / 5))

### Step 3: Gerar HEALTH-REPORT.md

**Criar:** `docs/health-checks/${HEALTH_DATE}/HEALTH-REPORT.md`

**Template:**

```markdown
# Technical Health Report

**Projeto:** [Nome do projeto]
**Data:** [YYYY-MM-DD]
**Versão:** 1.0

---

## Resumo Executivo

[2-3 parágrafos em linguagem simples sobre o estado geral do projeto, principais riscos identificados e recomendações prioritárias. Linguagem acessível para não-técnicos.]

---

## Scorecard

| Pilar | Score | Status | Issues |
|-------|-------|--------|--------|
| Documentação | X/10 | 🔴/🟠/🟡/🟢 | X críticos, Y altos |
| Segurança | X/10 | 🔴/🟠/🟡/🟢 | X críticos, Y altos |
| Arquitetura | X/10 | 🔴/🟠/🟡/🟢 | X críticos, Y altos |
| Dados | X/10 | 🔴/🟠/🟡/🟢 | X críticos, Y altos |
| Infraestrutura | X/10 | 🔴/🟠/🟡/🟢 | X críticos, Y altos |
| **GERAL** | **X/10** | **🔴/🟠/🟡/🟢** | **X total** |

**Legenda:** 🟢 8-10 (Saudável) | 🟡 6-7 (Atenção) | 🟠 4-5 (Risco) | 🔴 0-3 (Crítico)

---

## Issues Consolidados por Prioridade

### 🔴 CRÍTICO (Resolver IMEDIATAMENTE)

Estes issues podem causar vazamento de dados, falhas de segurança ou impedir o funcionamento do sistema.

| ID | Pilar | Issue | Impacto | Arquivo |
|----|-------|-------|---------|---------|
| C01 | [Pilar] | [Descrição breve] | [Impacto em linguagem simples] | [path:linha] |

---

### 🟠 ALTO (Resolver em até 1 semana)

Estes issues podem causar problemas de performance, bugs difíceis de debugar ou dívida técnica significativa.

| ID | Pilar | Issue | Impacto | Arquivo |
|----|-------|-------|---------|---------|
| A01 | [Pilar] | [Descrição breve] | [Impacto em linguagem simples] | [path:linha] |

---

### 🟡 MÉDIO (Resolver em até 1 mês)

Estes issues são melhorias importantes mas não urgentes.

| ID | Pilar | Issue | Impacto | Arquivo |
|----|-------|-------|---------|---------|
| M01 | [Pilar] | [Descrição breve] | [Impacto em linguagem simples] | [path:linha] |

---

### 🟢 BAIXO (Backlog técnico)

Melhorias desejáveis para qualidade de código.

| ID | Pilar | Issue | Impacto | Arquivo |
|----|-------|-------|---------|---------|
| B01 | [Pilar] | [Descrição breve] | [Impacto em linguagem simples] | [path:linha] |

---

## Roadmap Sugerido

### Sprint 1 (Imediato)
- [ ] [C01] - [Descrição resumida]
- [ ] [C02] - [Descrição resumida]

### Sprint 2 (1 semana)
- [ ] [A01] - [Descrição resumida]
- [ ] [A02] - [Descrição resumida]

### Sprint 3 (2 semanas)
- [ ] [M01] - [Descrição resumida]

### Backlog
- [ ] [B01] - [Descrição resumida]

---

## Como Usar Este Relatório

1. **Criar features para correção:**
   ```bash
   # Para cada issue crítico, criar uma feature
   git checkout -b feature/FXXXX-fix-[issue-id]
   ```

2. **Usar o comando /feature com contexto:**
   ```
   /feature Corrigir [C01]: [descrição do issue]
   ```

3. **Executar health check novamente após correções:**
   ```
   /tech-health-check
   ```

---

## Reports Detalhados

Para detalhes técnicos completos, consulte:
- [Context Discovery](./context-discovery.md)
- [Documentation Report](./documentation-report.md)
- [Infrastructure Report](./infrastructure-report.md)
- [Security Report](./security-report.md)
- [Architecture Report](./architecture-report.md)
- [Data Report](./data-report.md)

---

## Glossário

| Termo | Significado |
|-------|-------------|
| RLS | Row Level Security - proteção de dados por usuário no banco |
| Multi-tenancy | Isolamento de dados entre diferentes clientes/contas |
| Clean Architecture | Padrão de organização de código em camadas |
| Migration | Script que altera estrutura do banco de dados |
| N+1 Query | Problema de performance com múltiplas queries desnecessárias |

---

*Relatório gerado automaticamente pelo comando `/tech-health-check`*
```

---

## Phase 7: Completion

**Informar ao usuário:**

```
✅ Tech Health Check Completo!

📊 Scorecard Geral: [X/10] [emoji status]

📁 Reports gerados em: docs/health-checks/YYYY-MM-DD/

📋 Resumo:
- 🔴 Críticos: X issues
- 🟠 Altos: Y issues
- 🟡 Médios: Z issues
- 🟢 Baixos: W issues

🎯 Top 3 Prioridades:
1. [Issue mais crítico]
2. [Segundo mais crítico]
3. [Terceiro mais crítico]

📖 Relatório completo: docs/health-checks/YYYY-MM-DD/HEALTH-REPORT.md

💡 Próximos passos:
1. Revise o HEALTH-REPORT.md
2. Crie features para os issues críticos usando /feature
3. Execute /tech-health-check novamente após correções
```

---

## Critical Rules

**DO:**
- ✅ Executar subagentes em paralelo quando possível
- ✅ Aguardar conclusão de cada fase antes de prosseguir
- ✅ Ler context-discovery.md antes de análises da Fase 2
- ✅ Usar linguagem acessível para não-técnicos no HEALTH-REPORT
- ✅ Priorizar issues por impacto real no negócio
- ✅ Incluir paths e linhas específicas dos problemas

**DO NOT:**
- ❌ Corrigir código automaticamente
- ❌ Fazer commit de alterações
- ❌ Pular a fase de descoberta
- ❌ Executar análises sem contexto do projeto
- ❌ Usar jargões técnicos sem explicação no relatório final
- ❌ Gerar falsos positivos sem verificar contexto

---

## Dependências

Este comando requer as seguintes skills em `.claude/skills/health-check/`:
- `context-discovery.md`
- `documentation-analyzer.md`
- `infrastructure-check.md`
- `security-analyzer.md`
- `architecture-analyzer.md`
- `data-analyzer.md`
