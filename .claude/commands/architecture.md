# Architecture Discovery & Documentation

> **LANGUAGE RULE:** Documentação gerada DEVE ser em Português (PT-BR). Termos técnicos e código em Inglês.

> **DOCUMENTATION STYLE:** Seguir padrões definidos em `.claude/skills/documentation-style/SKILL.md`

Este comando analisa o codebase e gera documentação técnica dos padrões encontrados. Funciona tanto para projetos novos (template) quanto projetos legados.

**Output:** `docs/architecture/technical-spec.md`

---

## Phase 1: Detect Project Type

### Step 1: Check for Existing Spec
```bash
# Verificar se já existe documentação
ls docs/architecture/technical-spec.md 2>/dev/null
```

**Se existir:** Perguntar ao usuário se deseja atualizar ou recriar do zero.

### Step 2: Identify Project Nature
```bash
# Verificar estrutura básica
ls -la
ls package.json 2>/dev/null
ls apps/ libs/ src/ 2>/dev/null
```

**Classificar como:**
- **Monorepo**: Se existir `apps/` e `libs/`
- **Single App**: Se existir apenas `src/`
- **Custom**: Estrutura não convencional

---

## Phase 2: Analyze Project Structure

### 2.1 Package Manager & Build System
```bash
# Identificar package manager
ls package-lock.json yarn.lock pnpm-lock.yaml bun.lockb 2>/dev/null

# Verificar scripts disponíveis
cat package.json | grep -A 50 '"scripts"'

# Verificar se é monorepo
cat package.json | grep -E '"workspaces"|"turbo"'
```

**Documentar:**
- Package manager (npm/yarn/pnpm/bun)
- Build system (turbo/nx/lerna/none)
- Scripts principais

### 2.2 Backend Framework Detection
```bash
# NestJS
grep -r "@nestjs" package.json */package.json 2>/dev/null

# Express
grep -r '"express"' package.json */package.json 2>/dev/null

# Fastify
grep -r '"fastify"' package.json */package.json 2>/dev/null

# Hono
grep -r '"hono"' package.json */package.json 2>/dev/null
```

**Documentar:** Framework, versão, estrutura de módulos

### 2.3 Frontend Framework Detection
```bash
# React
grep -r '"react"' package.json */package.json 2>/dev/null

# Vue
grep -r '"vue"' package.json */package.json 2>/dev/null

# Angular
grep -r '"@angular/core"' package.json */package.json 2>/dev/null

# Next.js
grep -r '"next"' package.json */package.json 2>/dev/null
```

**Documentar:** Framework, versão, bibliotecas de UI

### 2.4 Database & ORM Detection
```bash
# Prisma
ls prisma/schema.prisma 2>/dev/null

# TypeORM
grep -r '"typeorm"' package.json */package.json 2>/dev/null

# Kysely
grep -r '"kysely"' package.json */package.json 2>/dev/null

# Drizzle
grep -r '"drizzle-orm"' package.json */package.json 2>/dev/null

# Knex (migrations)
grep -r '"knex"' package.json */package.json 2>/dev/null

# Mongoose
grep -r '"mongoose"' package.json */package.json 2>/dev/null
```

**Documentar:** Database, ORM/Query builder, migrations

### 2.5 Authentication Detection
```bash
# Supabase Auth
grep -r '"@supabase/supabase-js"' package.json */package.json 2>/dev/null

# Firebase Auth
grep -r '"firebase"' package.json */package.json 2>/dev/null

# Passport
grep -r '"passport"' package.json */package.json 2>/dev/null

# NextAuth
grep -r '"next-auth"' package.json */package.json 2>/dev/null

# Clerk
grep -r '"@clerk"' package.json */package.json 2>/dev/null
```

**Documentar:** Provider de auth, estratégia (JWT, session, etc.)

---

## Phase 3: Analyze Code Patterns

### 3.1 Directory Structure
```bash
# Listar estrutura principal
find . -type d -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' | head -50
```

**Documentar:** Estrutura de pastas, convenções de organização

### 3.2 Architectural Patterns
```bash
# CQRS (Commands/Queries)
find . -type d -name "commands" -o -name "queries" 2>/dev/null | grep -v node_modules

# Repository Pattern
find . -type f -name "*repository*" -o -name "*Repository*" 2>/dev/null | grep -v node_modules | head -10

# Service Layer
find . -type f -name "*.service.ts" -o -name "*.service.js" 2>/dev/null | grep -v node_modules | head -10

# Controllers
find . -type f -name "*.controller.ts" -o -name "*.controller.js" 2>/dev/null | grep -v node_modules | head -10
```

**Documentar:** Padrões identificados (CQRS, Repository, Service Layer, etc.)

### 3.3 Naming Conventions
```bash
# Verificar convenções de arquivos
ls -la src/ apps/*/src/ libs/*/src/ 2>/dev/null | head -30

# Verificar convenções de classes/interfaces
grep -rh "^export class\|^export interface\|^export type\|^export enum" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -20
```

**Documentar:** Convenções de nomenclatura (camelCase, PascalCase, kebab-case, etc.)

### 3.4 Dependency Injection
```bash
# NestJS DI
grep -r "@Inject\|@Injectable" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -10

# Manual DI (interfaces)
grep -rh "^export interface I[A-Z]" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -10
```

**Documentar:** Padrão de DI, tokens utilizados

### 3.5 Configuration Pattern
```bash
# Como configs são acessadas
grep -r "process\.env\." --include="*.ts" . 2>/dev/null | grep -v node_modules | head -10

# ConfigService ou similar
grep -r "ConfigService\|IConfigurationService\|config\." --include="*.ts" . 2>/dev/null | grep -v node_modules | head -10
```

**Documentar:** Como variáveis de ambiente são acessadas

---

## Phase 4: Analyze Domain Layer

### 4.1 Entities/Models
```bash
# Encontrar entities
find . -type f \( -name "*.entity.ts" -o -path "*/entities/*" -o -path "*/models/*" \) 2>/dev/null | grep -v node_modules | head -20
```

### 4.2 Enums
```bash
# Encontrar enums
find . -type f -path "*/enums/*" 2>/dev/null | grep -v node_modules
grep -rh "^export enum" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -10
```

### 4.3 DTOs
```bash
# Encontrar DTOs
find . -type f \( -name "*.dto.ts" -o -path "*/dtos/*" -o -path "*/dto/*" \) 2>/dev/null | grep -v node_modules | head -20
```

**Documentar:** Onde ficam entities, enums, DTOs

---

## Phase 5: Analyze Infrastructure

### 5.1 Queue/Jobs System
```bash
# BullMQ
grep -r '"bullmq"' package.json */package.json 2>/dev/null

# Workers
find . -type f -name "*.worker.ts" -o -name "*.job.ts" 2>/dev/null | grep -v node_modules
```

### 5.2 Caching
```bash
# Redis
grep -r '"redis"\|"ioredis"' package.json */package.json 2>/dev/null

# In-memory
grep -r "cache\|Cache" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -5
```

### 5.3 Email Service
```bash
# Resend
grep -r '"resend"' package.json */package.json 2>/dev/null

# Nodemailer
grep -r '"nodemailer"' package.json */package.json 2>/dev/null

# SendGrid
grep -r '"@sendgrid"' package.json */package.json 2>/dev/null
```

### 5.4 Payment Integration
```bash
# Stripe
grep -r '"stripe"' package.json */package.json 2>/dev/null

# PagSeguro/PagarMe
grep -r '"pagarme"\|"pagseguro"' package.json */package.json 2>/dev/null
```

**Documentar:** Serviços de infraestrutura identificados

---

## Phase 6: Generate Technical Spec

**Create:** `docs/architecture/technical-spec.md`

### Template do Documento

```markdown
# Especificação Técnica do Projeto

**Gerado em:** [data]
**Última análise:** [data]

---

## Stack Tecnológica

### Build & Package
- **Package Manager:** [npm/yarn/pnpm] [versão]
- **Build System:** [turbo/nx/none]
- **Monorepo:** [sim/não]

### Backend
- **Framework:** [NestJS/Express/Fastify] [versão]
- **Database:** [PostgreSQL/MySQL/MongoDB] [versão se conhecida]
- **ORM/Query Builder:** [Prisma/Kysely/TypeORM] [versão]
- **Migrations:** [Prisma/Knex/TypeORM migrations]

### Frontend
- **Framework:** [React/Vue/Angular/Next.js] [versão]
- **UI Library:** [Shadcn/MUI/Tailwind]
- **State Management:** [Zustand/Redux/Pinia]

### Autenticação
- **Provider:** [Supabase/Firebase/Passport/Custom]
- **Estratégia:** [JWT/Session/OAuth]

### Infraestrutura
- **Queue:** [BullMQ/none]
- **Cache:** [Redis/in-memory/none]
- **Email:** [Resend/Nodemailer/none]
- **Payments:** [Stripe/none]

---

## Estrutura do Projeto

### Organização de Pastas
```
[estrutura identificada]
```

### Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Arquivos | [kebab-case/camelCase] | [exemplo] |
| Classes | [PascalCase] | [exemplo] |
| Interfaces | [I + PascalCase / sem prefixo] | [exemplo] |
| Variáveis | [camelCase] | [exemplo] |
| Banco de dados | [snake_case] | [exemplo] |

---

## Padrões Arquiteturais

### [Padrão 1 - ex: Repository Pattern]
**Onde:** [paths dos arquivos]
**Convenção:** [descrição breve]

### [Padrão 2 - ex: CQRS]
**Onde:** [paths dos arquivos]
**Convenção:** [descrição breve]

---

## Domain Layer

### Entities
**Path:** [caminho base]
- [Entity1.ts] - [descrição ~10 palavras]
- [Entity2.ts] - [descrição ~10 palavras]

### Enums
**Path:** [caminho base]
- [Enum1.ts] - [descrição ~10 palavras]

### DTOs
**Path:** [caminho base]
**Convenção:** [como DTOs são nomeados/organizados]

---

## Configuração & Ambiente

### Acesso a Variáveis de Ambiente
**Padrão:** [process.env direto / ConfigService / IConfigurationService]
**Arquivo de config:** [path se existir]

### Variáveis Obrigatórias
Referência: `.env.example`

---

## Regras de Segurança

### Multi-Tenancy
**Implementado:** [sim/não]
**Estratégia:** [account_id em queries / schema separation / none]

### Autenticação
**Guards:** [paths dos guards]
**Validação:** [como é feita]

---

## Arquivos Importantes

### Backend - Core
- [path/arquivo.ts] - [descrição ~10 palavras]

### Backend - Services
- [path/arquivo.ts] - [descrição ~10 palavras]

### Frontend - Core
- [path/arquivo.ts] - [descrição ~10 palavras]

---

## Regras Específicas do Projeto

[Seção para regras de negócio específicas identificadas ou informadas pelo usuário]

---

*Este documento foi gerado automaticamente pelo comando `/architecture` e deve ser atualizado quando houver mudanças significativas na arquitetura.*
```

---

## Phase 7: Update CLAUDE.md Reference

Após gerar o `technical-spec.md`, verificar se CLAUDE.md referencia o documento:

```markdown
## Especificação Técnica

Detalhes completos da arquitetura e padrões do projeto em: `docs/architecture/technical-spec.md`
```

---

## Phase 8: Completion

```markdown
✅ **Análise de Arquitetura Completa!**

**Documento gerado:** `docs/architecture/technical-spec.md`

**Stack identificada:**
- Backend: [framework]
- Frontend: [framework]
- Database: [db + orm]
- Auth: [provider]

**Padrões identificados:**
- [lista de padrões]

**Próximos passos:**
1. Revise o documento gerado
2. Complete seções marcadas com [?] ou [a definir]
3. Adicione regras específicas do seu projeto
4. Execute `/review` para validar código contra estes padrões

**Nota:** Os comandos `/review`, `/dev`, `/plan` e `/fix` agora usarão este documento como referência de padrões.
```

---

## Critical Rules

**DO:**
- ✅ Analisar TODO o codebase antes de gerar documentação
- ✅ Seguir padrões de `.claude/skills/documentation-style/SKILL.md`
- ✅ Ser específico com paths e versões
- ✅ Criar pasta `docs/architecture/` se não existir
- ✅ Perguntar ao usuário sobre padrões não identificáveis automaticamente

**DO NOT:**
- ❌ Assumir padrões sem verificar no código
- ❌ Gerar documentação aspiracional (o que "deveria" ser)
- ❌ Incluir blocos de código extensos
- ❌ Sobrescrever spec existente sem confirmação
- ❌ Inventar padrões que não existem no projeto

---

## For Legacy Projects

Quando o projeto não segue convenções claras:

1. **Documentar o que existe**, não o que "deveria" existir
2. **Marcar inconsistências** encontradas (ex: "Alguns services usam DI, outros não")
3. **Sugerir melhorias** em seção separada "Oportunidades de Melhoria"
4. **Perguntar ao usuário** quando houver ambiguidade

```markdown
### Inconsistências Identificadas

- **[Área]:** [descrição da inconsistência]
  - Arquivos que seguem padrão A: [lista]
  - Arquivos que seguem padrão B: [lista]
  - **Recomendação:** [sugestão]
```
