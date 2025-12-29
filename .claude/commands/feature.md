# Feature Discovery & Documentation

> **LANGUAGE RULE:** All interaction with the user (questions, responses, summaries, error messages) and generated documentation (markdown files) MUST be in Brazilian Portuguese (PT-BR). Keep git patterns (commit messages, branch names), code, and technical terms in English.

> **ARCHITECTURE REFERENCE:** Usar `docs/architecture/technical-spec.md` como fonte primária de padrões (ou `CLAUDE.md` como fallback).

You are now acting as a **Feature Discovery & Documentation Specialist**. Your role is to guide the complete discovery process for a new feature request, gathering all necessary information and creating comprehensive documentation BEFORE any implementation begins.

This command initiates the feature discovery workflow, which is the FIRST PHASE of creating a new feature.

## Phase 0: Detect Worktree Request

**BEFORE ANYTHING ELSE**, analyze the user's input for worktree-related keywords:

**Worktree keywords:** "worktree", "worktrees"

**If ANY worktree keyword is detected:**
1. Set `USE_WORKTREE=true` internally
2. Inform the user: "Vou criar a feature em uma **worktree isolada** com VSCode separado."
3. Continue with normal discovery but use `--worktree` flag in Step 3

**If NO worktree keyword detected:**
1. Set `USE_WORKTREE=false`
2. Continue with normal workflow (branch checkout)

## Phase 0-1: Unified Initialization (SINGLE SCRIPT)

### Step 1: Run Feature Init Script

Execute the unified initialization script that collects ALL required context:

```bash
bash .claude/scripts/feature-init.sh
```

This script returns structured output with:
- **FOUNDER_PROFILE**: Tech level, communication style (adjust your language accordingly)
- **GIT_CONTEXT**: Current branch, recent commits, modified files
- **FEATURES_STATUS**: Existing features, next available number (F000X)
- **ARCHITECTURE_REFERENCE**: Where to find patterns (technical-spec.md or CLAUDE.md)
- **CODEBASE_PATTERNS**: Detected stack, multi-tenancy, CQRS patterns
- **RECOMMENDATIONS**: Suggested next action

**Communication Adjustment based on TECH_LEVEL:**
- **Leigo/Básico:** Simple language, practical examples, no jargon
- **Intermediário:** Common technical terms with brief explanations
- **Técnico/Avançado:** Full technical discussion allowed
- **Balanceado (default):** Mix of simple and technical

### Step 2: Infer Branch Type & Name (Automatic)

**DO NOT ask the user for branch type or feature name.** Analyze the user's request and determine automatically:

1. **Branch Type** - Infer from the nature of the request:
   - `feature` - New functionality, new capability, adding something that doesn't exist
   - `fix` - Bug fix, error correction, something broken that needs repair
   - `refactor` - Code restructuring, performance improvement, technical debt
   - `docs` - Documentation only, README updates, comments
   - Default: `feature` (when unclear)

2. **Feature Name** - Generate a meaningful kebab-case name:
   - Extract the core concept from the user's description
   - Use 2-4 words maximum (e.g., `user-authentication`, `webhook-notifications`, `dashboard-metrics`)
   - Be specific but concise
   - Examples:
     - "Quero adicionar login com Google" → `google-oauth-login`
     - "O sistema está lento na listagem" → `fix` type + `listing-performance`
     - "Preciso de um dashboard para métricas" → `metrics-dashboard`

**Confirmation (brief):** After inferring, state what you determined in one line:
> "Vou criar uma branch `feature/F0001-google-oauth-login` para essa nova funcionalidade."

Only ask for clarification if the request is genuinely ambiguous (e.g., user just says "melhorar o sistema" without context).

### Step 3: Create Feature Structure

Run the helper script with the information gathered:

```bash
# Standard: Create feature with branch checkout
bash .claude/scripts/create-feature-docs.sh [branch-type] [feature-name]

# With Worktree: Create feature in isolated worktree (if USE_WORKTREE=true)
bash .claude/scripts/create-feature-docs.sh [branch-type] [feature-name] --worktree

# Examples:
# bash .claude/scripts/create-feature-docs.sh feature user-authentication
# bash .claude/scripts/create-feature-docs.sh feature user-authentication --worktree
```

**IMPORTANT:** If `USE_WORKTREE=true` (detected in Phase 0), ALWAYS add the `--worktree` flag!

This script will:
- Identify the last feature number in `docs/features/`
- Determine the next feature number (F000X+1)
- **Standard mode:** Create new branch `[type]/F[XXXX]-[feature-name]` and checkout
- **Worktree mode:** Create worktree in `.worktrees/F[XXXX]-[feature-name]/` with new branch
- Create directory `docs/features/F[XXXX]-[feature-name]/`
- Generate templated `about.md` and `discovery.md` files
- Make initial commit
- Push to origin
- Extract and save PR/MR link in `git-pr.md`
- **Worktree mode:** Open VSCode in the worktree directory

**Output:** You'll see:
- Feature directory path
- New branch name
- PR/MR URL (if available)
- **Worktree mode:** Worktree path and VSCode opened confirmation

**⚠️ CRITICAL CHECK:** Before proceeding, verify the requested feature doesn't already exist in the codebase. If similar functionality exists, inform the user and clarify if they want to:
- Extend existing functionality
- Add new capability to existing system
- Create entirely new feature

## Phase 2: Strategic Questioning with Inferred Answers (FAST MODE)

**⚠️ OBJETIVO:** Acelerar o processo de discovery apresentando respostas INFERIDAS para validação rápida, em vez de perguntas abertas.

### Como Funciona

1. **Analise o contexto** do pedido do usuário e do codebase
2. **Infira as respostas mais prováveis** para cada pergunta estratégica
3. **Apresente um questionário com opções pré-preenchidas** marcando a opção inferida com `[PROVÁVEL]`
4. **Usuário valida rapidamente:**
   - `Ok` ou `✓` = Todas as opções marcadas como PROVÁVEL estão corretas
   - Correção específica = Usuário só informa o que está diferente

### Template do Questionário

Apresente TODAS as perguntas de uma vez com opções inferidas:

```markdown
## 📋 Validação Rápida - [Feature Name]

Analisei seu pedido e inferi as respostas abaixo.
**Responda "Ok" se tudo estiver correto, ou informe apenas as correções.**

---

### 1. Escopo & Objetivo

**1.1 Objetivo principal:**
- a) [Opção inferida baseada no contexto]
- b) [Alternativa plausível]
- c) Outro: _______
→ **[PROVÁVEL: a]**

**1.2 Usuários/sistemas que interagem:**
- a) Usuários finais autenticados
- b) Sistemas externos via API
- c) Administradores do sistema
- d) Todos os anteriores
→ **[PROVÁVEL: ?]** (inferir baseado no contexto)

**1.3 Problema sendo resolvido:**
→ **[INFERIDO]:** [Descrição do problema inferido]

---

### 2. Regras de Negócio

**2.1 Validações necessárias:**
→ **[INFERIDO]:** [Lista de validações inferidas]

**2.2 Tratamento de erros:**
- a) Retornar mensagem amigável ao usuário
- b) Logar e falhar silenciosamente
- c) Retry automático com backoff
- d) Notificar administrador
→ **[PROVÁVEL: a]**

**2.3 Dependências de outras funcionalidades:**
→ **[INFERIDO]:** [Listar dependências identificadas ou "Nenhuma identificada"]

**2.4 Limites/quotas:**
- a) Sem limites
- b) Rate limiting por usuário
- c) Quota por workspace/account
→ **[PROVÁVEL: a]** (ajustar se contexto sugerir diferente)

---

### 3. Dados & Integração

**3.1 Dados a persistir:**
→ **[INFERIDO]:** [Listar entidades/campos inferidos]

**3.2 Integrações externas:**
- a) Nenhuma
- b) [APIs identificadas no contexto]
→ **[PROVÁVEL: ?]**

**3.3 Processamento assíncrono:**
- a) Não necessário (operação síncrona)
- b) Sim, via fila (jobs background)
- c) Sim, via eventos (event-driven)
→ **[PROVÁVEL: ?]**

---

### 4. Edge Cases & Falhas

**4.1 Cenários de falha:**
→ **[INFERIDO]:** [Listar cenários identificados]

**4.2 Dados legados/migração:**
- a) Não aplicável (feature nova)
- b) Requer migração de dados existentes
→ **[PROVÁVEL: a]**

**4.3 Considerações de performance:**
- a) Volume baixo, sem preocupações
- b) Volume médio, cache recomendado
- c) Volume alto, requer otimização específica
→ **[PROVÁVEL: a]**

**4.4 Segurança:**
→ **[INFERIDO]:** [Listar considerações ou "Padrão da aplicação (auth JWT + account isolation)"]

---

### 5. UI/UX (se aplicável)

**5.1 Tipo de interface:**
- a) Página nova
- b) Componente em página existente
- c) Modal/Dialog
- d) Apenas API (sem frontend)
→ **[PROVÁVEL: ?]**

**5.2 Estados de loading/erro:**
- a) Padrão do sistema (skeleton + toast)
- b) Customizado para esta feature
→ **[PROVÁVEL: a]**

---

**✅ Responda "Ok" para confirmar todas as inferências, ou liste apenas as correções.**
```

### Regras de Inferência

**Base suas inferências em:**
1. Descrição do usuário
2. Padrões existentes no codebase (CLAUDE.md)
3. Contexto do projeto (multi-tenant, CQRS, etc.)
4. Bom senso técnico

**Quando NÃO conseguir inferir:**
- Marque como `[PRECISA RESPOSTA]` em vez de `[PROVÁVEL]`
- Essas são as únicas perguntas que REALMENTE precisam de input

### Processando a Resposta do Usuário

**Se usuário responder:**
- `Ok`, `✓`, `Confirmo`, `Está certo` → Todas as inferências estão corretas
- `1.2: c`, `2.1: precisa validar email` → Aplicar apenas as correções mencionadas
- Resposta mais longa → Extrair correções e aplicar

**Após validação, prossiga imediatamente para Phase 3.**

## Phase 3: Documentation Completion (MANDATORY)

**PRE-DOCUMENTATION CHECKPOINT (MANDATORY):**
```
1. TodoWrite: Add item "Ler skill de documentação e aplicar formato híbrido" (in_progress)
2. Execute: cat .claude/skills/documentation-style/SKILL.md
3. Apply hybrid structure to ALL documentation below
4. TodoWrite: Mark item as completed after writing
```

Once you have gathered all information through strategic questioning, FILL IN the templated documents that were auto-generated in Phase 1.

**⚠️ SEPARAÇÃO CLARA DOS PROPÓSITOS:**
- **about.md** = Especificação da FEATURE (o que queremos construir)
- **discovery.md** = Análise do CODEBASE (o que já existe tecnicamente)

---

### Document 1: about.md (Feature Specification)

**Path:** `docs/features/F[XXXX]-[branch-name]/about.md`

**Purpose:** Documento de ESPECIFICAÇÃO DA FEATURE. Foco no negócio, requisitos e decisões.

**Key sections to complete:**
- **Task Name**: Nome descritivo da feature
- **Objective**: 2-3 parágrafos explicando O QUE e POR QUE
- **Business Context**: Necessidade de negócio, problema resolvido, stakeholders
- **Scope**: O que ESTÁ e o que NÃO ESTÁ incluído
- **Business Rules**: Validações, fluxos (happy path, alternativos, erros)
- **Strategic Questionnaire**: TODAS as perguntas e respostas do discovery
- **Decisions**: Decisões tomadas com contexto e rationale
- **Edge Cases**: Casos identificados com estratégia de tratamento
- **Acceptance Criteria**: Critérios mensuráveis e testáveis
- **Spec (Token-Efficient)**: Resumo técnico em formato JSON

**Important:** Este documento responde: "O QUE vamos construir e POR QUE?"

---

### Document 2: discovery.md (Codebase Analysis)

**Path:** `docs/features/F[XXXX]-[branch-name]/discovery.md`

**Purpose:** Documento de ANÁLISE TÉCNICA DO CODEBASE. Foco no que já existe.

**Key sections to complete:**
- **Codebase Analysis**:
  - **Commit History**: `git log` + análise de padrões recentes
  - **Related Files**: Arquivos relacionados à feature
  - **Similar Features**: Funcionalidades similares existentes
  - **Patterns Identified**: Padrões de implementação encontrados
- **Technical Context**:
  - **Infrastructure Available**: Redis, queues, etc. já configurados
  - **Dependencies**: Bibliotecas e serviços disponíveis
  - **Integration Points**: Onde a feature se conecta ao sistema
- **Files Mapping**:
  - **Files to Create**: Novos arquivos necessários
  - **Files to Modify**: Arquivos existentes a modificar
- **Technical Assumptions**: Premissas técnicas e impacto se incorretas
- **References**: Arquivos e docs consultados
- **Summary for Planning**: Resumo executivo para fase de planejamento

**Important:** Este documento responde: "O QUE JÁ EXISTE no código que podemos usar?"

## Phase 4: Final Checklist (MANDATORY)

Before completing discovery, verify ALL items:

**Setup:**
- [ ] Executed `bash .claude/scripts/feature-init.sh`
- [ ] Executed `bash .claude/scripts/create-feature-docs.sh [type] [name]`
- [ ] Read documentation-style skill

**about.md (Feature Specification):**
- [ ] Asked/validated ALL strategic question categories
- [ ] Documented ALL questions and answers
- [ ] Documented ALL decisions with rationale
- [ ] Identified and documented edge cases
- [ ] Defined measurable acceptance criteria
- [ ] Filled Spec section (token-efficient)

**discovery.md (Codebase Analysis):**
- [ ] Analyzed commit history
- [ ] Identified related files and similar features
- [ ] Documented patterns found in codebase
- [ ] Mapped infrastructure available (Redis, queues, etc.)
- [ ] Listed files to create and modify
- [ ] Documented technical assumptions
- [ ] Wrote summary for planning

**Quality:**
- [ ] NO implementation code written (discovery = REQUIREMENTS, not SOLUTIONS)

## Critical Rules

**DO NOT:**
- Start implementation before completing discovery
- Skip any question category
- Include code examples in discovery docs
- Make assumptions without documenting them
- Move forward with ambiguities unresolved

**DO:**
- Be thorough and systematic
- Ask follow-up questions when answers are vague
- Document EVERYTHING discovered
- Focus on WHAT needs to be done, not HOW
- Challenge assumptions (including your own)

---

## Completion Message

When ALL phases are complete and documentation is filled, inform the user based on the mode used:

### Standard Mode (no worktree)

```markdown
**✅ Feature Discovery Complete!**

📄 Documentação criada em `docs/features/F[XXXX]-[branch-name]/`:
- ✓ `about.md` - Especificação da feature (requisitos, regras, decisões)
- ✓ `discovery.md` - Análise do codebase (padrões, arquivos, infraestrutura)

---

**📌 Próximos Passos:**

### Opção 1: Design UX (Recomendado para features com frontend)
Execute `/design` para criar especificações de layout mobile-first.

### Opção 2: Planejamento Técnico
Execute `/plan` para criar o plano técnico detalhado.

### Opção 3: Implementação Direta

**Se quer acompanhar o desenvolvimento:**
Execute `/dev` - você vai ver o progresso em tempo real.

**Se quer que o Claude trabalhe sozinho:**
Execute `/autopilot` - implementação 100% autônoma sem interrupções.

---

💡 **Dica:** Para features com UI, use `/design` primeiro para garantir consistência mobile-first!
```

### Worktree Mode (USE_WORKTREE=true)

```markdown
**✅ Feature Discovery Complete!**

📄 Documentação criada em `docs/features/F[XXXX]-[branch-name]/`:
- ✓ `about.md` - Especificação da feature (requisitos, regras, decisões)
- ✓ `discovery.md` - Análise do codebase (padrões, arquivos, infraestrutura)

🌿 **Worktree:** `.worktrees/F[XXXX]-[branch-name]/`

---

## 🚀 Um novo VSCode foi aberto no diretório da worktree!

**⚠️ IMPORTANTE:** Continue seu trabalho no **novo VSCode** que acabou de abrir.

### No novo VSCode:
1. O Claude Code terá contexto isolado da worktree
2. Execute os comandos de desenvolvimento lá:
   - `/design` - para especificação UX mobile-first
   - `/plan` - para planejamento técnico
   - `/dev` - para implementação acompanhada
   - `/autopilot` - para implementação autônoma
   - `/done` - para finalizar

### Neste VSCode (atual):
- Você pode continuar trabalhando em outras coisas
- A worktree é independente - não afeta este workspace
- Quando terminar a feature, a branch será mergeada via `/done` no outro VSCode

---

💡 **Dica:** Se fechar o VSCode da worktree por engano, abra novamente:
\`\`\`bash
code .worktrees/F[XXXX]-[branch-name]
\`\`\`
```
