---
name: updating-claude-documentation
description: |
  **SEMPRE usar (NUNCA editar CLAUDE.md diretamente)** quando usuario diz: "atualize o CLAUDE.md", "verifique se o CLAUDE.md esta atualizado"
---

# Atualizacao de Documentacao Claude

> **DOCUMENTATION STYLE:** Seguir padroes definidos em `.claude/skills/documentation-style/SKILL.md`

CLAUDE.md e fonte de verdade arquitetural para onboarding, assistentes IA e alinhamento do time. DEVE ser **self-contained** e refletir estado atual do codebase.

**Principio Central**: CLAUDE.md e o unico arquivo que o modelo precisa ler. Toda informacao em um lugar. Sem arquivos separados.

---

## Estrutura do CLAUDE.md (Self-Contained)

```
CLAUDE.md
├── About (human-readable, ~5 linhas)
├── Quick Start (human-readable, comandos essenciais)
├── ## Technical Spec (token-efficient, JSON minificado)
│   ├── Stack
│   ├── Structure
│   ├── Layers
│   ├── Patterns
│   ├── Domain
│   ├── Config
│   ├── Security
│   ├── Critical Files
│   └── Business Rules
├── Best Practices (human-readable)
├── Features (referencia a /docs/features/)
└── Design Principles (KISS, YAGNI, etc.)
```

### Formato por Secao

| Secao | Formato | Publico Alvo |
|-------|---------|--------------|
| About, Quick Start | Human-readable | Devs humanos |
| Technical Spec | Token-efficient (JSON minificado) | IA + Devs |
| Best Practices | Human-readable | Devs humanos |
| Design Principles | Human-readable | Devs humanos |

**IMPORTANTE**: NAO criar arquivo `technical-spec.md` separado. Tudo fica no CLAUDE.md.

---

## Processo de Atualizacao

### Fase 1: Identificar Tipo de Mudanca

| Tipo de Mudanca | Acao |
|-----------------|------|
| Stack, patterns, domain, entities, enums | Executar `/architecture` |
| Boas praticas, principios | Editar secao manualmente |
| Nova feature | Verificar se afeta Technical Spec → `/architecture` |
| Correcao de typo | Edicao manual direta |

### Fase 2: Auditar Estado Atual

```bash
# Commits recentes com mudancas arquiteturais
git log --oneline -20 --name-status | grep -E "entities|enums|module|service"

# Estrutura atual
ls apps/ libs/

# Features documentadas
ls docs/features/
```

### Fase 3: Atualizar Secao Correta

**Secao Technical Spec** (token-efficient):
- **SEMPRE** usar `/architecture` para atualizar
- NAO editar JSON minificado manualmente
- Formato: `{"key":"value"}` em uma linha

**Outras secoes** (human-readable):
- Editar diretamente
- Manter brevidade (~100 palavras max por paragrafo)
- Sem emojis em headers

### Fase 4: Verificar Consistencia

**Checklist**:
- [ ] Paths mencionados existem no projeto
- [ ] Versoes de dependencias estao corretas
- [ ] JSON minificado esta em uma linha (sem quebras)
- [ ] Technical Spec atualizado via `/architecture`

```bash
# Verificar se paths mencionados existem
grep -oP '`[^`]+\.(ts|js|json)`' CLAUDE.md | sort -u
```

---

## Secao Technical Spec (Token-Efficient)

Esta secao usa formato otimizado para consumo por IA:

```markdown
## Technical Spec

> Secao otimizada para consumo por IA. Formato token-efficient.

**Generated:** YYYY-MM-DD | **Type:** Monorepo

### Stack
{"pkg":"npm","build":"turbo","ts":"5.0+"}
{"backend":{"framework":"NestJS 10","db":"PostgreSQL 15","orm":"Kysely 0.27"}}
{"frontend":{"framework":"React 18.2","bundler":"Vite 4.4","ui":"Shadcn+Tailwind"}}

### Structure
{"paths":{"backend":"apps/backend","frontend":"apps/frontend","domain":"libs/domain"}}

### Layers
domain → interfaces → database → api

### Patterns
{"identified":["CQRS","Repository","DI","CleanArchitecture"]}
{"conventions":{"files":"kebab-case","classes":"PascalCase","interfaces":"I+PascalCase"}}

### Domain
{"entitiesPath":"libs/domain/src/entities","entities":["Account","User","Workspace"]}
{"enumsPath":"libs/domain/src/enums","enums":[{"name":"UserRole","values":"owner|admin|member"}]}

### Config
{"envAccess":"IConfigurationService","configFile":"apps/backend/src/shared/services/configuration.service.ts"}

### Security
{"multiTenancy":{"enabled":true,"strategy":"account_id"}}
{"auth":{"provider":"Supabase","strategy":"JWT"}}

### Critical Files
{"backendCore":["apps/backend/src/main.ts - Dispatcher","apps/backend/src/shared/shared.module.ts - DI"]}

### Business Rules
- SEMPRE filtrar queries por account_id
- Repositories retornam entities, NUNCA DTOs
```

**Regras**:
- JSON em uma linha (minificado)
- Maximo 10 palavras por descricao de arquivo
- Usar `/architecture` para gerar/atualizar

---

## Secoes Human-Readable

### About
```markdown
## About

Template base para [proposito]. Stack: [principais tecnologias].
```

### Quick Start
```markdown
## Quick Start

npm install
npm run dev
```

### Best Practices
```markdown
## Best Practices

### Arquitetura
- Respeitar hierarquia Clean Architecture
- Commands para escrita, Queries direto nos Repositories

### Multi-Tenancy
- SEMPRE filtrar por account_id
- Validar ownership em todos endpoints
```

### Features
```markdown
## Features

Documentacao de features em `/docs/features/`. Cada feature possui: about.md, discovery.md, implementation.md.
```

### Design Principles
```markdown
## Design Principles

- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
```

---

## Quando Usar /architecture vs Edicao Manual

| Situacao | Acao |
|----------|------|
| Novo pacote/lib | `/architecture` |
| Nova entity/enum | `/architecture` |
| Novo pattern | `/architecture` |
| Mudanca de versao | `/architecture` |
| Nova regra de negocio | Editar Business Rules |
| Corrigir typo | Edicao manual |
| Atualizar Best Practices | Edicao manual |

---

## Red Flags

Sinais de violacao:
- ❌ Criar `technical-spec.md` separado
- ❌ JSON formatado com quebras de linha
- ❌ Editar Technical Spec manualmente
- ❌ Duplicar informacao entre secoes
- ❌ Documentar aspiracoes em vez de realidade

---

## Racionalizacoes Comuns

| Desculpa | Realidade |
|----------|-----------|
| "Vou documentar depois" | Depois nunca chega |
| "E so uma pequena mudanca" | Pequenas mudancas acumulam |
| "O codigo e auto-documentado" | Arquitetura nao esta no codigo |
| "Preciso de arquivo separado" | CLAUDE.md self-contained e mais eficiente |

---

## Integracao com Outros Comandos

**Para atualizar Technical Spec:**
→ Usar `/architecture`

**Apos atualizar CLAUDE.md:**
→ `/review` para validar codigo contra padroes

---

## Nota Final

CLAUDE.md deve ser:
1. **Self-contained** - Toda informacao em um arquivo
2. **Atualizado** - Reflete codigo atual
3. **Hibrido** - Secoes human-readable + secao token-efficient
4. **Verificavel** - Paths e versoes validaveis

Sem excecoes. Sem arquivos separados. Sem racionalizacao.
