---
name: health-check
description: |
  Skills de análise técnica para o comando /tech-health-check. Inclui subagentes especializados em descoberta de contexto, documentação, infraestrutura, segurança, arquitetura e dados.
---

# Health Check Skills

Suite de skills para análise técnica completa do projeto, projetada para empreendedores que usam vibe coding.

---

## Arquitetura

```
/tech-health-check (comando coordenador)
    │
    ├── FASE 1 - DESCOBERTA (paralelo)
    │   ├── context-discovery.md      🔍 Arquitetura, multi-tenancy, módulos
    │   ├── documentation-analyzer.md 📋 CLAUDE.md, technical-spec, padrões
    │   └── infrastructure-check.md   🔌 MCP Supabase, env vars, deps
    │
    ├── FASE 2 - ANÁLISE (paralelo, depende da Fase 1)
    │   ├── security-analyzer.md      🔴 RLS, secrets, frontend/backend boundary
    │   ├── architecture-analyzer.md  🟠 Clean arch, imports, CQRS
    │   └── data-analyzer.md          🟡 Migrations, índices, N+1
    │
    └── FASE 3 - CONSOLIDAÇÃO
        └── HEALTH-REPORT.md           📊 Scorecard + roadmap
```

---

## Criticidade dos Pilares

| Pilar | Criticidade | Justificativa |
|-------|-------------|---------------|
| Documentation | 🔴 Crítico | Impacta qualidade do desenvolvimento com IA |
| Security | 🔴 Crítico | Vazamento de dados, violação de privacidade |
| Architecture | 🟠 Alto | Dívida técnica acumulativa |
| Data | 🟡 Médio | Performance e consistência |
| Infrastructure | 🔵 Info | Pré-requisito para análise completa |

---

## Skills Disponíveis

### context-discovery.md
**Fase:** 1 - Descoberta
**Objetivo:** Entender arquitetura e fornecer contexto para demais análises
**Output:** context-discovery.md

### documentation-analyzer.md
**Fase:** 1 - Descoberta
**Objetivo:** Verificar documentação do projeto
**Output:** documentation-report.md

### infrastructure-check.md
**Fase:** 1 - Descoberta
**Objetivo:** Verificar ferramentas e infraestrutura
**Output:** infrastructure-report.md

### security-analyzer.md
**Fase:** 2 - Análise
**Dependência:** context-discovery.md, infrastructure-report.md
**Objetivo:** Analisar segurança por funcionalidade
**Output:** security-report.md

### architecture-analyzer.md
**Fase:** 2 - Análise
**Dependência:** context-discovery.md
**Objetivo:** Verificar conformidade arquitetural
**Output:** architecture-report.md

### data-analyzer.md
**Fase:** 2 - Análise
**Dependência:** context-discovery.md, infrastructure-report.md
**Objetivo:** Analisar banco de dados e queries
**Output:** data-report.md

---

## Output Final

**Pasta:** `docs/health-checks/YYYY-MM-DD/`

**Arquivos gerados:**
- context-discovery.md
- documentation-report.md
- infrastructure-report.md
- security-report.md
- architecture-report.md
- data-report.md
- HEALTH-REPORT.md (consolidado)

---

## Uso

```bash
/tech-health-check
```

O comando coordenador:
1. Cria pasta com data atual
2. Dispara subagentes Fase 1 em paralelo
3. Aguarda conclusão
4. Dispara subagentes Fase 2 em paralelo (com contexto da Fase 1)
5. Aguarda conclusão
6. Consolida no HEALTH-REPORT.md

---

## Público-Alvo

Empreendedores que:
- Usam vibe coding para desenvolver
- Não entendem detalhes técnicos
- Precisam de um roadmap claro de ajustes
- Querem priorização de crítico para desejável

---

## Linguagem

- Reports em **Português (PT-BR)**
- Termos técnicos em **Inglês**
- Linguagem acessível para não-técnicos
- Glossário incluso no HEALTH-REPORT.md
