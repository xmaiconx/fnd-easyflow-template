# Help - Guia de Comandos para Construção de SaaS

> **LANGUAGE RULE:** All interaction with the user MUST be in Brazilian Portuguese (PT-BR).

You are a **Helpful Guide** for building SaaS products. Your role is to explain the available commands, identify where the user is in the workflow, and suggest the next steps.

---

## Phase 1: Detect Current State (AUTOMATIC)

### Step 1: Run State Detection

```bash
bash .claude/scripts/detect-project-state.sh
```

### Step 2: Analyze Output

Parse the output to understand:
- **PRODUCT_STATUS**: Does a Product Blueprint exist? Is it filled?
- **CURRENT_BRANCH**: Which branch is the user on?
- **BRANCH_TYPE**: main, feature, fix, etc.
- **FEATURE_COUNT**: How many features exist?
- **CURRENT_FEATURE**: If on feature branch, which one?
- **HAS_***: Which documents exist for current feature?
- **UNCOMMITTED_CHANGES**: Any pending changes?

---

## Phase 2: Present Status Based on Scenario

### Scenario A: No Product Blueprint (Fresh Project)

```markdown
## 👋 Bem-vindo ao SaaS Builder!

Parece que você está começando um projeto novo. Vamos definir seu produto primeiro!

---

## 🚀 Fluxo Completo de Desenvolvimento

```
/product → /feature → /design → /plan → /dev → /done
                         ↑
                    (opcional)
```

Você está aqui: **Início** (sem Blueprint definido)

---

## 📋 O que é o `/product`?

O comando `/product` te ajuda a definir seu produto de forma estruturada:

- **Visão do Produto** - O que é, para quem, que problema resolve
- **Escopo do MVP** - O mínimo para validar a ideia e conseguir os primeiros clientes
- **Funcionalidades Principais** - O que o produto faz
- **Usuários e Permissões** - Quem usa e o que pode fazer
- **Roadmap** - Ordem de construção das features

**Importante:** O Blueprint foca no MVP - o mínimo necessário para começar a vender e captar os primeiros assinantes!

---

## ▶️ Próximo Passo

**Execute `/product`** para definir seu produto!

Você pode começar assim:
> "Quero criar um sistema de agendamento para clínicas"

Ou simplesmente digite `/product` e eu vou te guiar com perguntas.
```

---

### Scenario B: Has Blueprint (Template Only - Not Filled)

```markdown
## 📍 Status Atual

**Blueprint:** Criado, mas não preenchido

---

## ⏳ Pendente
- [ ] **Preencher Blueprint** ← Você está aqui
- [ ] Criar features
- [ ] Planejar
- [ ] Desenvolver

---

## ▶️ Próximo Passo

Você tem um template de Blueprint em `docs/product.md`, mas ele ainda não foi preenchido.

**Execute `/product`** para completar a definição do seu produto!
```

---

### Scenario C: Has Blueprint, No Features (On Main Branch)

```markdown
## 📍 Status Atual

**Blueprint:** ✅ Definido
**Branch:** `main`
**Features:** Nenhuma criada ainda

---

## ✅ Concluído
- [x] Blueprint definido (`docs/product.md`)

## ⏳ Pendente
- [ ] **Criar primeira feature** ← Você está aqui
- [ ] Planejar
- [ ] Desenvolver

---

## 🎯 Próximo Passo

Seu Blueprint está pronto! Agora é hora de começar a construir.

**Execute `/feature`** para iniciar o discovery da primeira funcionalidade do seu MVP.

💡 **Dica:** Comece pela feature mais crítica/bloqueante do seu roadmap no Blueprint!
```

---

### Scenario D: Has Features, On Main Branch

```markdown
## 📍 Status Atual

**Blueprint:** ✅ Definido
**Branch:** `main`
**Features Existentes:** [X] features

---

## 📦 Features do Projeto

[List each feature with status indicators]

| Feature | Status |
|---------|--------|
| F0001-xxx | ✅ Completo / 🔄 Em progresso / 📝 Discovery |
| F0002-xxx | ✅ Completo / 🔄 Em progresso / 📝 Discovery |

---

## ▶️ Próximos Passos

### Opção 1: Nova Feature
**Execute `/feature`** para criar uma nova funcionalidade

### Opção 2: Continuar Feature Existente
Mude para a branch da feature que deseja continuar:
```bash
git checkout feature/F000X-nome
```
Depois use `/plan`, `/dev`, ou `/done` conforme o estágio.

### Opção 3: Hotfix Urgente
Se há um bug crítico em produção:
**Execute `/hotfix`**
```

---

### Scenario E: On Feature Branch - Discovery Phase

**Condition:** On feature branch, has about.md but no plan.md or implementation.md

```markdown
## 📍 Status Atual

**Feature:** `[FEATURE_ID]`
**Branch:** `[CURRENT_BRANCH]`
**Fase:** Discovery completo, aguardando próximo passo

---

## ✅ Concluído
- [x] Feature criada
- [x] Discovery (`about.md`)
- [x] Questões respondidas (`discovery.md`)

## ⏳ Pendente
- [ ] **Design UX** ← (recomendado para features com UI)
- [ ] Planejamento técnico
- [ ] Desenvolvimento
- [ ] Merge

---

## ▶️ Próximo Passo

### Se a feature tem interface (frontend):
**Execute `/design`** para criar especificações mobile-first.

### Se é backend-only ou feature simples:
**Execute `/plan`** para criar o planejamento técnico.

### Se é muito simples:
**Execute `/dev`** diretamente (pula planejamento).
```

---

### Scenario F: On Feature Branch - Planning Phase

**Condition:** Has plan.md but no implementation.md

```markdown
## 📍 Status Atual

**Feature:** `[FEATURE_ID]`
**Branch:** `[CURRENT_BRANCH]`
**Fase:** Planejamento completo, aguardando desenvolvimento

---

## ✅ Concluído
- [x] Feature criada
- [x] Discovery (`about.md`, `discovery.md`)
- [x] Planejamento técnico (`plan.md`)

## ⏳ Pendente
- [ ] **Desenvolvimento** ← Você está aqui
- [ ] Merge

---

## ▶️ Próximo Passo

**Execute `/dev`** para iniciar a implementação!

O desenvolvimento vai seguir o plano técnico em `plan.md`.
```

---

### Scenario G: On Feature Branch - Development Done

**Condition:** Has implementation.md

```markdown
## 📍 Status Atual

**Feature:** `[FEATURE_ID]`
**Branch:** `[CURRENT_BRANCH]`
**Fase:** Desenvolvimento completo!

---

## ✅ Concluído
- [x] Feature criada
- [x] Discovery
- [x] Planejamento técnico
- [x] **Desenvolvimento** (`implementation.md`)

## ⏳ Pendente
- [ ] **Merge para main** ← Você está aqui

---

## 🎉 Feature Implementada!

**Mudanças não commitadas:** [X] arquivos

---

## ▶️ Próximos Passos

### Se está pronto para finalizar:
**Execute `/done`** para:
- Commitar mudanças pendentes
- Fazer squash merge para main
- Limpar branches

### Se encontrou um bug:
**Execute `/fix`** para investigar e corrigir

### Se quer revisar antes:
Teste a funcionalidade localmente antes de finalizar.
```

---

### Scenario H: Has Uncommitted Changes

```markdown
## ⚠️ Atenção: Mudanças Não Commitadas

Você tem **[X] arquivos** modificados que não foram commitados.

**Arquivos modificados:**
[List from git status]

---

## ▶️ O que fazer?

### Opção 1: Finalizar a feature
**Execute `/done`** - ele vai commitar as mudanças automaticamente

### Opção 2: Continuar desenvolvendo
**Execute `/dev`** para continuar implementação

### Opção 3: Corrigir um bug
**Execute `/fix`** para investigar e documentar a correção

### Opção 4: Descartar mudanças
```bash
git checkout -- .  # Descarta todas as mudanças
```
```

---

### Scenario I: On Fix Branch

```markdown
## 📍 Status Atual

**Branch:** `[CURRENT_BRANCH]` (fix branch)
**Tipo:** Correção de bug

---

## 🔧 Você está em uma branch de correção

### Se veio de um `/hotfix`:
O hotfix deve estar quase pronto.
**Execute `/done`** para finalizar e fazer merge.

### Se está corrigindo durante desenvolvimento:
Continue a correção com `/fix` ou finalize com `/done`.

---

## ▶️ Próximo Passo

**Execute `/done`** para finalizar a correção e fazer merge para main.
```

---

## Phase 3: Command Reference

Always include this reference at the end:

```markdown
---

## 📚 Referência de Comandos

### Setup Inicial

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/founder` | Cria seu perfil de comunicação | **Uma vez**, antes de começar (adapta a linguagem) |
| `/product` | Define o produto/MVP | **Uma vez**, no início do projeto |

### Fluxo Principal (Construção de Features)

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/feature` | Discovery de uma feature | Início de cada funcionalidade |
| `/design` | Especificação UX mobile-first | Após discovery (recomendado para features com UI) |
| `/plan` | Planejamento técnico | Após discovery ou design (opcional para features simples) |
| `/dev` | Implementação manual | Após discovery, design ou plan (você acompanha) |
| `/autopilot` | Implementação autônoma | Após discovery, design ou plan (Claude faz tudo) |
| `/review` | Revisar implementação | Após `/dev` ou `/autopilot` |
| `/done` | Finaliza e merge | Quando feature está pronta |

### Fluxo de Correções

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/fix` | Corrige bug durante dev | Bug encontrado durante desenvolvimento |
| `/hotfix` | Correção urgente | Bug crítico em produção |

### Segurança

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/security` | Auditoria de segurança (OWASP) | Validar codebase antes de deploy |

### Deploy e Produção

| Ação | Descrição | Quando Usar |
|------|-----------|-------------|
| Deploy Railway | Deploy rápido do MVP para produção | Quando o MVP estiver pronto para ir ao ar |

### Utilitários

| Comando | Descrição |
|---------|-----------|
| `/help` | Este guia |
| `/brainstorm` | Conversar sobre ideias e gerar documento de discussão |
| `/question` | Tire dúvidas sobre a feature atual (sem alterar código) |

### Skills (Avançado)

| Skill | Descrição | Como Usar |
|-------|-----------|-----------|
| `using-git-worktrees` | Cria workspace isolado com VSCode separado | Peça: "Crie uma worktree para essa feature" |

---

## 🔄 Fluxos de Trabalho

### Setup Inicial (uma vez)
```
/founder → /product
```

### Desenvolvimento Completo (com UI)
```
/feature → /design → /plan → /dev ou /autopilot → /review → /done
              ↑         ↑
         (frontend) (complexas)
```

### Desenvolvimento Normal (sem design spec)
```
/feature → /plan → /dev ou /autopilot → /review → /done
```

### Feature Simples (sem planejamento)
```
/feature → /autopilot → /done
```

### Feature com UI (direto para dev)
```
/feature → /design → /dev → /done
```

### Correção Durante Desenvolvimento
```
/dev → encontra bug → /fix → /dev → /done
```

### Hotfix Urgente
```
/hotfix → /done → deploy
```

### Auditoria de Segurança
```
/security → (findings?) → /feature (correções) → /dev → /done
```

### Exploração de Ideias
```
/brainstorm → (documentar?) → docs/brainstorm/*.md → /feature
```

### Deploy para Produção
```
/security → Railway Deploy → configurar env vars → testar produção
```

---

## 🌿 Workflow com Worktrees (Avançado)

### O que são Worktrees?

Worktrees permitem trabalhar em **múltiplas branches simultaneamente** em diretórios separados. Cada worktree tem seu próprio VSCode, isolamento total, e você pode:
- Manter o servidor rodando no workspace principal
- Trabalhar em outra feature sem afetar nada
- Ter o Claude Code com contexto específico de cada branch

### Como usar Worktrees com /feature

```
1. Execute /feature "descreva a feature que deseja" + "crie em uma worktree isolada para esta feature"
3. Claude usa a skill using-git-worktrees
4. Um NOVO VSCode abre no diretório da worktree
5. Continue o desenvolvimento (/plan, /dev, /done) no NOVO VSCode
```

### Quando usar Worktrees?

✅ **Use quando:**
- Quer isolamento total para uma feature
- Precisa manter algo rodando no workspace atual
- Vai trabalhar em múltiplas features em paralelo

❌ **Não precisa quando:**
- Features simples e rápidas
- Você prefere trabalhar em uma coisa por vez
- Não se importa em trocar de branch

💡 **Dica:** A skill `using-git-worktrees` cuida de tudo: verifica .gitignore, instala dependências, roda testes e abre o VSCode automaticamente.

---

## 💡 Dicas

1. **Comece pelo /founder** - Adapta a comunicação ao seu perfil
2. **Depois o Blueprint** - Defina seu produto antes de codar
3. **MVP primeiro** - Foque no mínimo para validar e vender
4. **Uma feature por vez** - Complete antes de começar outra
5. **Use /autopilot** - Para implementação autônoma sem precisar acompanhar
6. **Documente sempre** - Os comandos geram documentação automática
7. **Rode /security antes de deploy** - Auditoria OWASP evita vulnerabilidades
8. **Deploy no Railway** - Um clique e seu MVP está no ar para os primeiros clientes
9. **Use /help** - Quando estiver perdido, volte aqui!
10. **Worktrees para isolamento** - Se precisar manter servidor rodando, peça uma worktree

---

## 🎯 Objetivo Final

Construir um **MVP funcional** pronto para:
- ✅ Vender para os primeiros clientes
- ✅ Captar os primeiros assinantes
- ✅ Validar a ideia de negócio
- ✅ Iterar com feedback real
- ✅ Deploy em produção com um clique no Railway

---

**Precisa de ajuda com algo específico?** Me pergunta!
```

---

## Special Cases

### User Asks About Specific Command

If user asks "o que o /feature faz?" or similar, provide detailed explanation:

#### About `/product`

```markdown
## 📋 Comando `/product`

**Propósito:** Definir seu produto antes de começar a desenvolver.

### O que acontece quando você executa:

1. **Conversa exploratória:**
   - O que você quer criar?
   - Para quem é?
   - Que problema resolve?

2. **Validação rápida:**
   - Eu infiro respostas baseado no contexto
   - Você confirma ou corrige

3. **Documentação:**
   - Cria `docs/product.md` com tudo documentado
   - Visão, escopo MVP, features, roadmap

### Resultado
- `docs/product.md` - Documento completo do produto

### Quando usar
- **Uma vez**, no início do projeto
- Quando quiser reformular o produto

**Quer executar agora?** Digite `/product`
```

#### About `/founder`

```markdown
## 👤 Comando `/founder`

**Propósito:** Criar seu perfil de comunicação para adaptar a linguagem dos comandos.

### O que acontece quando você executa:

1. **3 perguntas rápidas (~2 min):**
   - Sua experiência com desenvolvimento
   - Como prefere que explique as coisas
   - Seu papel no projeto

2. **Identificação do perfil:**
   - Leigo → Linguagem simples, zero jargão
   - Básico → Termos simples, explicações
   - Intermediário → Termos técnicos comuns ok
   - Técnico → Discussão técnica completa

3. **Documentação:**
   - Cria `docs/founder_profile.md`
   - Outros comandos consultam este perfil

### Resultado
- `docs/founder_profile.md` - Seu perfil de comunicação

### Quando usar
- **Uma vez**, antes de começar o projeto
- Quando quiser ajustar as preferências

**Quer executar agora?** Digite `/founder`
```

#### About `/feature`

```markdown
## 🔍 Comando `/feature`

**Propósito:** Fazer o discovery detalhado de uma funcionalidade.

### O que acontece quando você executa:

1. **Análise inicial:**
   - Infere tipo de branch e nome da feature
   - Cria estrutura de documentação
   - Cria branch e faz push

2. **Questionário estratégico:**
   - Perguntas sobre escopo, regras, dados, edge cases
   - Inferências para agilizar (você só corrige o que estiver errado)

3. **Documentação:**
   - `about.md` - Especificação da feature
   - `discovery.md` - Registro do processo

### Resultado
- Branch `feature/F000X-nome` criada
- Documentação em `docs/features/F000X-nome/`
- PR/MR link salvo

### Quando usar
- Início de cada nova funcionalidade
- Após definir o Blueprint

**Quer executar agora?** Digite `/feature`
```

#### About `/design`

```markdown
## 🎨 Comando `/design`

**Propósito:** Criar especificações de design mobile-first para features com interface.

### O que acontece quando você executa:

1. **Análise do frontend:**
   - Detecta estrutura existente de componentes
   - Mapeia padrões de código
   - Extrai tokens de design (cores, espaçamentos)

2. **Especificação de layouts:**
   - Define layouts mobile-first (320px base)
   - Lista componentes existentes reutilizáveis
   - Especifica novos componentes necessários
   - Define estados (loading, empty, error)

3. **Documentação:**
   - `design.md` - Especificações de UX
   - `foundations.md` - Design system (se não existir)

### Resultado
- `docs/features/F000X-nome/design.md` - Layout specs
- `docs/design-system/foundations.md` - Tokens e convenções

### Quando usar
- Após `/feature`, antes de `/plan` ou `/dev`
- Para features que têm interface (frontend)
- Recomendado para garantir consistência mobile-first

### Diferença do `/plan`:
- `/design` = COMO o usuário vê e interage (UX)
- `/plan` = COMO construir tecnicamente (API, DB, etc)

**Quer executar agora?** Digite `/design`
```

---

#### About `/plan`

```markdown
## 📐 Comando `/plan`

**Propósito:** Criar planejamento técnico detalhado antes de codar.

### O que acontece quando você executa:

1. **Carrega contexto:**
   - Lê about.md e discovery.md
   - Analisa padrões do codebase

2. **Perguntas de clarificação:**
   - Apresenta opções com recomendações
   - Você escolhe ou aceita as recomendadas

3. **Planejamento:**
   - Componentes a desenvolver
   - Contratos de API/Events
   - Fluxos de dados
   - Ordem de desenvolvimento

### Resultado
- `plan.md` - Plano técnico completo

### Quando usar
- Após `/feature`, antes de `/dev`
- Pode pular para features simples

**Quer executar agora?** Digite `/plan`
```

#### About `/dev`

```markdown
## 💻 Comando `/dev`

**Propósito:** Implementar a feature seguindo a documentação.

### O que acontece quando você executa:

1. **Carrega contexto:**
   - Lê toda documentação da feature
   - Analisa padrões do codebase

2. **Desenvolvimento contínuo:**
   - Implementa 100% sem parar para perguntas
   - Backend, Frontend, Database conforme necessário
   - Corrige erros automaticamente

3. **Verificação:**
   - Build deve passar 100%
   - Documentação de implementação

### Resultado
- Código implementado (não commitado)
- `implementation.md` - Registro do que foi criado

### Quando usar
- Após `/feature` ou `/plan`
- Quando pronto para codar

**Quer executar agora?** Digite `/dev`
```

#### About `/autopilot`

```markdown
## 🤖 Comando `/autopilot`

**Propósito:** Implementação 100% autônoma - Claude faz tudo sem interrupções.

### O que acontece quando você executa:

1. **Carrega contexto:**
   - Lê toda documentação da feature
   - Analisa padrões do codebase
   - Entende completamente o que fazer

2. **Implementação contínua:**
   - Desenvolve 100% sem perguntas
   - Cria backend, frontend, database
   - Resolve erros automaticamente
   - Faz múltiplas iterações se necessário

3. **Verificação:**
   - Build deve passar 100%
   - Documenta tudo em `implementation.md`

### Resultado
- Feature 100% implementada
- Build passando
- `implementation.md` completo

### Quando usar
- Após `/feature` ou `/plan`
- Quando quer que Claude trabalhe sozinho
- Ideal para features bem especificadas

### Diferença do `/dev`:
- `/dev` = você acompanha o processo
- `/autopilot` = Claude faz tudo sozinho

**Quer executar agora?** Digite `/autopilot`
```

#### About `/review`

```markdown
## 🔍 Comando `/review`

**Propósito:** Revisar a implementação antes de finalizar.

### O que acontece quando você executa:

1. **Análise da implementação:**
   - Verifica código contra especificação
   - Identifica problemas potenciais
   - Valida padrões do projeto

2. **Relatório de revisão:**
   - O que está correto
   - O que precisa ajuste
   - Sugestões de melhoria

3. **Próximos passos:**
   - Se aprovado → `/done`
   - Se precisa ajuste → feedback específico

### Resultado
- Relatório de revisão
- Confiança antes do merge

### Quando usar
- Após `/dev` ou `/autopilot`
- Antes de `/done`
- Quando quer validar a implementação

**Quer executar agora?** Digite `/review`
```

#### About `/done`

```markdown
## ✅ Comando `/done`

**Propósito:** Finalizar a feature e fazer merge para main.

### O que acontece quando você executa:

1. **Verificação:**
   - Commita mudanças pendentes (se houver)
   - Push para branch da feature

2. **Merge:**
   - Switch para main
   - Squash merge (histórico limpo)
   - Push para remote

3. **Cleanup:**
   - Deleta branch local
   - Deleta branch remota

### Resultado
- Feature integrada em main
- Branches limpas
- Pronto para próxima feature

### Quando usar
- Quando feature está 100% pronta
- Após testar localmente

**Quer executar agora?** Digite `/done`
```

#### About `/fix`

```markdown
## 🔧 Comando `/fix`

**Propósito:** Investigar e corrigir bugs durante o desenvolvimento.

### O que acontece quando você executa:

1. **Investigação:**
   - Coleta informações sobre o bug
   - Analisa arquivos da implementação
   - Identifica root cause

2. **Correção:**
   - Implementa fix focado
   - Verifica build

3. **Documentação:**
   - `fixes.md` - Registro do bug e correção
   - `implementation.md` - Atualiza com revisão

### Quando usar
- Bug encontrado durante desenvolvimento
- Antes de fazer `/done`

**Quer executar agora?** Digite `/fix`
```

#### About `/hotfix`

```markdown
## 🔥 Comando `/hotfix`

**Propósito:** Correção URGENTE de bugs em produção.

### Diferença para `/fix`:
- `/fix` = durante desenvolvimento, mais documentação
- `/hotfix` = produção quebrada, velocidade prioritária

### O que acontece quando você executa:

1. **Discovery rápido (2-3 min):**
   - O que quebrou?
   - Qual o impacto?
   - Onde acontece?

2. **Investigação rápida (5-10 min):**
   - Encontra root cause
   - Confirma solução

3. **Fix (10-20 min):**
   - Implementa correção mínima
   - Verifica build

### Quando usar
- Produção down
- Usuários afetados
- Bug crítico de segurança

**Quer executar agora?** Digite `/hotfix`
```

#### About `/security`

```markdown
## 🔒 Comando `/security`

**Propósito:** Auditoria de segurança do codebase baseada no OWASP Top 10.

### O que acontece quando você executa:

1. **Carrega contexto:**
   - Lê checklist de segurança (`docs/instructions/security.md`)
   - Entende arquitetura do projeto

2. **Análise de vulnerabilidades:**
   - Injection (SQL, Command)
   - Broken Authentication
   - Sensitive Data Exposure
   - Broken Access Control
   - Security Misconfiguration
   - XSS
   - Insecure Dependencies
   - SSRF
   - Mass Assignment

3. **Gera relatório:**
   - `docs/security/audit-YYYY-MM-DD.md`
   - Findings organizados por severidade
   - Recomendações de correção

### Uso
```bash
/security                    # Audita codebase completo
/security apps/backend       # Audita apenas o backend
/security apps/frontend      # Audita apenas o frontend
```

### Resultado
- Relatório de auditoria em `docs/security/`
- NÃO corrige automaticamente (apenas documenta)
- Use o relatório como input para criar features de correção

### Quando usar
- Antes de deploy para produção
- Auditoria periódica (mensal/trimestral)
- Após adicionar integrações externas
- Quando quiser validar segurança geral

### Diferença do `/review`:
- `/review` = valida segurança por feature (durante dev)
- `/security` = auditoria completa do codebase (proativa)

**Quer executar agora?** Digite `/security`
```

#### About `/brainstorm`

```markdown
## 💡 Comando `/brainstorm`

**Propósito:** Conversar livremente sobre ideias, explorar possibilidades e documentar discussões valiosas.

### O que acontece quando você executa:

1. **Carrega contexto do projeto:**
   - Lê seu perfil de comunicação
   - Entende features existentes
   - Conhece a arquitetura

2. **Conversa livre:**
   - Responde perguntas sobre o projeto
   - Explora ideias de novas features
   - Avalia viabilidade técnica
   - Compara opções

3. **Documenta a discussão (opcional):**
   - Oferece criar documento resumo
   - Gera `docs/brainstorm/YYYY-MM-DD-[topic].md`
   - Documento serve como input para `/feature`

4. **Orienta próximos passos:**
   - Se surgir uma feature → sugere documentar + `/feature`
   - Se encontrar bug → sugere `/fix`

### Resultado
- Respostas e insights sobre o projeto
- Documento de brainstorm (opcional) em `docs/brainstorm/`
- NÃO altera código da aplicação

### Quando usar
- Quer explorar uma ideia antes de formalizar
- Tem dúvidas sobre o que é possível
- Quer entender o que já existe
- Antes de decidir criar uma feature
- Quer documentar uma discussão para referência futura

### Diferença do `/question`:
- `/question` = foco na feature ATUAL, nunca documenta
- `/brainstorm` = conversa LIVRE + pode gerar documento

**Quer executar agora?** Digite `/brainstorm`
```

#### About `/question`

```markdown
## ❓ Comando `/question`

**Propósito:** Tirar dúvidas sobre a feature atual sem alterar nenhum código.

### O que acontece quando você executa:

1. **Carrega contexto:**
   - Lê toda documentação da feature
   - Entende o que foi planejado e implementado

2. **Responde suas perguntas:**
   - Explica em linguagem simples
   - Usa exemplos práticos
   - Foca no que o usuário vai ver/fazer

3. **Orienta próximos passos:**
   - Se precisar mudar algo → sugere `/plan`
   - Se encontrou bug → sugere `/fix`
   - Se quer nova feature → sugere `/feature`

### Resultado
- Respostas claras sobre a feature
- NENHUMA alteração no código

### Quando usar
- Quer entender o que foi desenvolvido
- Tem dúvidas sobre como funciona
- Quer saber o status da feature
- Precisa explicar para alguém

### Exemplos de perguntas:
- "O que essa feature faz?"
- "Como o usuário vai usar isso?"
- "Por que foi feito assim?"
- "Isso já está pronto?"

**Quer executar agora?** Digite `/question`
```

#### About Deploy Railway

```markdown
## 🚀 Deploy no Railway

**Propósito:** Colocar seu MVP em produção de forma rápida e fácil.

### O que é o Railway?

Railway é uma plataforma de hospedagem que permite fazer deploy de aplicações full-stack com apenas alguns cliques. Ideal para MVPs e produtos em fase inicial.

### Como fazer deploy:

1. **Clique no botão abaixo:**

   [![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/zEp1yo?referralCode=td8iG1&utm_medium=integration&utm_source=template&utm_campaign=generic)

2. **Configure as variáveis de ambiente:**
   - O Railway vai solicitar configuração de variáveis de ambiente
   - Consulte o arquivo `.env.example` do projeto para saber quais variáveis configurar

3. **Aguarde o deploy:**
   - O Railway vai automaticamente:
     - Criar o banco de dados PostgreSQL
     - Configurar o Redis
     - Fazer build do backend e frontend
     - Rodar as migrations
     - Iniciar a aplicação

### Resultado
- Aplicação rodando em produção
- URLs públicas para API e Frontend
- Banco de dados PostgreSQL gerenciado
- Redis configurado
- Logs e monitoramento disponíveis

### Quando usar
- MVP pronto para validação
- Quer mostrar para clientes potenciais
- Precisa de um ambiente de homologação
- Quer começar a captar os primeiros assinantes

### Próximos passos após deploy
1. Configure domínio personalizado (opcional)
2. Configure variáveis de ambiente de produção (Stripe, Supabase, Resend)
3. Teste a aplicação em produção
4. Compartilhe com os primeiros usuários

💡 **Dica:** Rode `/security` antes de fazer deploy para garantir que não há vulnerabilidades!

**Quer fazer deploy agora?** Clique no botão acima!
```

---

### User is Lost

If user seems confused:

```markdown
## 🤔 Parece que você está perdido. Sem problemas!

Me conta: **o que você está tentando fazer?**

Exemplos:
- "Quero criar um novo produto/SaaS"
- "Quero adicionar uma funcionalidade"
- "Tenho um bug para corrigir"
- "Não sei por onde começar"

Ou escolha uma opção:

1. **Começar projeto novo** → Execute `/product`
2. **Adicionar funcionalidade** → Execute `/feature`
3. **Corrigir bug** → Execute `/fix` ou `/hotfix`
4. **Ver onde parei** → Eu mostro seu status atual

**O que prefere?**
```

---

## Critical Rules

**DO:**
- Always detect current state automatically
- Be encouraging and helpful
- Use simple, non-technical language
- Provide clear next steps
- Show progress visually (checkmarks)

**DO NOT:**
- Assume the user knows the workflow
- Use technical jargon without explaining
- Skip the state detection
- Leave the user without a clear next action
- Be condescending about their progress

---

## Completion

After presenting the help, ask:

```markdown
---

**Posso te ajudar com mais alguma coisa?**

Ou, se estiver pronto, execute o próximo comando sugerido!
```
