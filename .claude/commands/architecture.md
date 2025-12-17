# Architecture Discovery & Documentation

> **LANGUAGE:** Documentação em PT-BR. Termos técnicos e código em EN.
> **OUTPUT:** Seção `## Technical Spec` dentro do `CLAUDE.md`

Este comando analisa o codebase e atualiza a seção Technical Spec do CLAUDE.md com dados estruturados em formato token-efficient.

---

## Princípio Central

**Descobrir, não impor.** Documentar o que EXISTE no código, não o que "deveria" existir. CLAUDE.md é self-contained - toda informação em um único arquivo.

---

## Phase 0: Automated Discovery (INITIAL SCAN)

### Step 1: Run Discovery Script

Execute o script de descoberta automática que varre o codebase:

```bash
bash .claude/scripts/architecture-discover.sh
```

**O script faz:**
1. Varre recursivamente respeitando .gitignore (ignora node_modules, dist, etc)
2. Coleta `package.json`, `turbo.json`, `tsconfig*.json`, `.env.example`
3. Lista estrutura de diretórios com profundidade 3
4. Mapeia controllers (*.controller.ts)
5. Mapeia endpoints e rotas
6. Cria documento temporário: `.claude/temp/architecture-discovery.md`
7. Retorna paths para próximas fases

**Output:** Arquivo temporário com estrutura completa do projeto.

### Step 2: PRE-DISCOVERY CHECKPOINT

```
1. TodoWrite: Add item "Ler skill de documentação e aplicar formato híbrido" (in_progress)
2. Execute: cat .claude/skills/documentation-style/SKILL.md
3. Read discovery document: cat .claude/temp/architecture-discovery.md
4. Proceed with Phase 1+ using discovery data as foundation
5. TodoWrite: Mark item as completed after CLAUDE.md is generated
```

---

## Phase 1: Verificação Inicial

### Step 1: Check CLAUDE.md
```bash
ls CLAUDE.md 2>/dev/null
grep "## Technical Spec" CLAUDE.md 2>/dev/null
```

**Se CLAUDE.md não existir:** Criar arquivo completo.
**Se seção Technical Spec não existir:** Adicionar seção.
**Se existir:** Atualizar com dados novos.

---

## Phase 2: Review Stack Detection Results

**O script já coletou tudo. Revise a seção 2.5 do documento temporário:**
```
.claude/temp/architecture-discovery.md → Section 2.5: Stack Detection
```

**O que procurar:**
- Backend frameworks encontrados
- Frontend frameworks encontrados
- Database & ORM
- Infrastructure services (Redis, Kafka, etc)

**Documento no CLAUDE.md:**
```json
{"pkg":"[detected]","build":"[detected]","lang":"[detected]"}
{"backend":{"framework":"[detected]","version":"[detected]"}}
{"frontend":{"framework":"[detected]","version":"[detected]"}}
{"database":{"engine":"[detected]","orm":"[detected]"}}
```

---

## Phase 3: Review Architectural Patterns

**O script já encontrou tudo. Revise a seção 3 do documento temporário:**
```
.claude/temp/architecture-discovery.md → Section 3: Architectural Patterns
```

**O que procurar:**
- CQRS directories (commands, queries)
- Repository/DAO files
- Services found
- DI decorators/patterns

**Documento no CLAUDE.md:**
```json
{"identified":["pattern1","pattern2","pattern3"]}
{"conventions":{"files":"[detected]","classes":"[detected]"}}
```

---

## Phase 4: Review Domain Models

**O script já listou tudo. Revise a seção 4 do documento temporário:**
```
.claude/temp/architecture-discovery.md → Section 4: Domain Models & Entities
```

**O que procurar:**
- Entity/Model files (top 5-10 importantes)
- Enums encontrados
- DTOs/Schemas
- Padrão de naming usado

**Documento no CLAUDE.md:**
```json
{"models":["entity1","entity2","entity3"],"location":"[path]"}
{"enums":["enum1","enum2"],"location":"[path]"}
```

---

## Phase 5: Review Infrastructure & Routes

**O script já mapeou tudo. Revise seções 5 e 5.5 do documento temporário:**
```
.claude/temp/architecture-discovery.md → Section 5: Infrastructure & Configuration
.claude/temp/architecture-discovery.md → Section 5.5: Routes & Endpoints
```

**O que procurar:**
- Entry points (main.ts, app.py, etc)
- Configuration files location
- Controllers/Routes encontrados
- Global API prefix (if any)
- Versioning strategy
- Inconsistencies (if any)

**Documento no CLAUDE.md:**
```json
{"globalPrefix":"[detected]","prefixLocation":"[path]"}
{"routes":[{"module":"[name]","prefix":"[prefix]","endpoints":["endpoints"]}]}
{"consistency":"[all-relative|all-absolute|mixed-note]"}
{"entryPoints":["path - description"]}
```

---

## Phase 6: Update CLAUDE.md

**PRE-DOCUMENTATION CHECKPOINT (MANDATORY):**
```
1. TodoWrite: Add item "Ler skill de documentação e aplicar formato híbrido" (in_progress)
2. Execute: cat .claude/skills/documentation-style/SKILL.md
3. Apply token-efficient format to Technical Spec section
4. TodoWrite: Mark item as completed after writing
```

### Localizar seção Technical Spec

Se existir `## Technical Spec`, substituir conteúdo até próximo `## `.
Se não existir, adicionar antes de `## Design Principles` ou no final.

### Formato da Seção Technical Spec (Template Genérico)

```markdown
## Technical Spec

> Seção otimizada para consumo por IA. Formato token-efficient.

**Generated:** YYYY-MM-DD | **Type:** [Monorepo|SingleApp|Custom]

### Stack
{"pkg":"[npm|yarn|pnpm|bun|other]","build":"[turbo|nx|gradle|make|other]","lang":"[typescript|python|java|rust|mixed]"}
{"backend":{"framework":"[NestJS|Express|Django|FastAPI|Rails|Spring|other]","version":"X.Y.Z"}}
{"frontend":{"framework":"[React|Vue|Angular|Next|other]","version":"X.Y.Z"}}
{"database":{"engine":"[PostgreSQL|MySQL|MongoDB|SQLite|other]","orm":"[Kysely|Prisma|TypeORM|SQLAlchemy|other]"}}

### Structure
{"paths":{"backend":"path/to/backend","frontend":"path/to/frontend","domain":"path/to/domain","database":"path/to/db","etc":"other/key/paths"}}

### Layers (if using layered architecture)
- Describe: domain → infrastructure → application → api (or actual structure found)
- List responsibilities of each layer

### Patterns
{"identified":["CQRS","Repository","DI","EventDriven","Layered","Other patterns found..."]}
{"conventions":{"files":"[kebab-case|PascalCase|snake_case]","classes":"[PascalCase|snake_case]","functions":"[camelCase|snake_case]"}}

### Domain
{"models":"[list main entities, 5-10 names]","location":"path/where/models/live"}
{"enums":"[list main enums if applicable]","location":"path/to/enums"}

### API Routes
{"globalPrefix":"[/api|/api/v1|none|other]","prefixLocation":"path/to/where/prefix/is/defined"}
{"routes":[{"module":"module-name","prefix":"/prefix","endpoints":["GET /","POST /","etc"]}]}
{"consistency":"[all-relative|all-absolute|mixed-note-inconsistencies]"}

### Critical Files
{"entryPoints":["path/to/main/file - brief description"]}
{"config":["path/to/config - brief description"]}
{"core":["path/to/core/file - brief description"]}

### Business Rules (if any)
- [Rule 1 - brief]
- [Rule 2 - brief]
```

**Guidelines for filling this template:**
- Use JSON format (minified, one line per object)
- Maximum 10 words per description
- Document what EXISTS, not what "should" exist
- If a section doesn't apply, skip it
- Be specific about paths and versions

---

## Phase 7: Cleanup & Completion

### Step 1: Remove Temporary Discovery Document

```bash
# Cleanup discovery document
rm -f .claude/temp/architecture-discovery.md
```

**Verification:**
```bash
ls -la .claude/temp/ 2>/dev/null || echo "✅ Cleanup complete"
```

### Step 2: Final Report

```markdown
✅ Architecture analysis complete!

**Updated:** CLAUDE.md → Section "Technical Spec"
**Format:** Token-efficient (AI consumption)

**Discovered:**
- Type: [Monorepo|SingleApp]
- Backend: [framework]
- Frontend: [framework]
- Patterns: [list]
- Controllers: [N] mapped
- API Prefix: [prefix]

**Temporary Files:** Cleaned up ✅

**Next Steps:**
1. Review CLAUDE.md Technical Spec section
2. Run `/review` to validate code against these patterns
3. Run `/feature` to create new features using detected architecture
```

---

## Critical Rules

**DO:**
- ✅ Executar Phase 0 script PRIMEIRO (automated discovery)
- ✅ Ler documento temporário em PRE-DISCOVERY CHECKPOINT
- ✅ Ser agnóstico a framework/linguagem (buscar padrões, não paths fixos)
- ✅ Adaptar as buscas ao que você encontrar (Django? Python? Express? Rust?)
- ✅ Mapear TODOS os endpoints/routes (seja qual for o padrão usado)
- ✅ Validar CONSISTÊNCIA de rotas (se misturadas, documentar)
- ✅ Atualizar seção dentro do CLAUDE.md (não criar arquivo separado)
- ✅ JSON minificado em uma linha (format token-efficient)
- ✅ Máximo 10 palavras por descrição
- ✅ Documentar o que EXISTE (não o que "deveria" existir)
- ✅ Cleanup documento temporário ao final
- ✅ Skip sections that don't apply (not all apps have workers, etc)

**DO NOT:**
- ❌ Criar technical-spec.md ou arquivos separados
- ❌ JSON formatado/indentado (minified only)
- ❌ Blocos de código > 3 linhas
- ❌ Inventar padrões não encontrados no código
- ❌ Deixar documento temporário após execução
- ❌ Assumir arquitetura específica (NestJS/Django/Rails/etc)
- ❌ Fixar paths/padrões para um framework único
- ❌ Ignorar projetos ou partes do codebase (Phase 0 varre TUDO)
- ❌ Incluir paths hardcoded em instruções (sempre use alternativas genéricas)

---

## Legacy Projects

Quando padrões são inconsistentes:

1. Documentar o que existe
2. Adicionar ao final da seção:
```markdown
### Inconsistencies
[{"area":"[area]","patternA":"[found]","patternB":"[found]","files":"[count]"}]
```
