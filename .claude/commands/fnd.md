# FND - Gateway Inteligente do Ecossistema

> **LANGUAGE RULE:** PT-BR para interação | EN para código/git

Gateway único para todo o ecossistema FND. Analisa a intenção do usuário e executa o comando apropriado.

**Princípio:** O usuário descreve o que precisa em linguagem natural. Você identifica e executa o comando certo.

---

## Spec

### Config
{"cli":"fnd","config_file":".fnd/about.json","scripts_path":".fnd/scripts"}

### DevelopmentFlow
{"setup":["founder","product"],"main":["feature","design","plan","dev","autopilot","review","done"],"fixes":["fix","hotfix"],"support":["question","brainstorm","help","architecture","security","tech-health-check"],"special":["test-api"]}

### FlowSequence
{"complete":"/product → /feature → /design → /plan → /dev → /review → /done","with_ui":"/feature → /design → /plan → /dev → /done","simple":"/feature → /dev → /done","autonomous":"/feature → /autopilot → /done","fix_during_dev":"/dev → /fix → /dev → /done","hotfix":"/hotfix → /done → deploy","exploration":"/brainstorm → (document?) → /feature"}

### IntentMapping
{"explore":{"triggers":["não sei","ainda não tenho certeza","quero entender","preciso pensar","ideia","brainstorm","explorar","conversar sobre","discutir"],"command":"brainstorm","confidence":"high"},"document":{"triggers":["criar funcionalidade","nova feature","implementar","adicionar","quero construir","preciso de","desenvolver"],"command":"feature","confidence":"high"},"plan":{"triggers":["planejar","como implementar","estratégia","arquitetura","definir tasks","organizar"],"command":"plan","confidence":"high"},"design":{"triggers":["design","interface","tela","layout","ux","ui","mobile","frontend visual"],"command":"design","confidence":"high"},"execute":{"triggers":["desenvolver agora","codar","implementar agora","executar plano","começar dev"],"command":"dev","confidence":"high"},"auto":{"triggers":["autopilot","automático","fazer tudo","modo autônomo","sozinho"],"command":"autopilot","confidence":"high"},"review":{"triggers":["revisar","code review","verificar qualidade","validar código"],"command":"review","confidence":"medium"},"complete":{"triggers":["finalizar","merge","concluir","done","terminar","fechar"],"command":"done","confidence":"high"},"fix":{"triggers":["bug","erro","problema","não funciona","quebrou","fix","corrigir"],"command":"fix","confidence":"high"},"hotfix":{"triggers":["urgente","produção","crítico","down","emergência"],"command":"hotfix","confidence":"high"},"question":{"triggers":["dúvida","como funciona","onde fica","explicar","entender"],"command":"question","confidence":"medium"},"security":{"triggers":["segurança","vulnerabilidade","audit","security","owasp"],"command":"security","confidence":"high"},"health":{"triggers":["saúde do projeto","tech health","análise técnica","qualidade código"],"command":"tech-health-check","confidence":"high"},"architecture":{"triggers":["arquitetura","estrutura do projeto","como está organizado"],"command":"architecture","confidence":"medium"},"help":{"triggers":["ajuda","comandos","o que posso fazer","perdido"],"command":"help","confidence":"high"},"product":{"triggers":["definir produto","criar mvp","começar projeto","novo saas"],"command":"product","confidence":"high"},"founder":{"triggers":["meu perfil","comunicação","como prefiro"],"command":"founder","confidence":"medium"}}

### Skills
{"using-git-worktrees":{"description":"Cria workspace isolado com VSCode separado","trigger":"worktree, isolado, paralelo, separado","use_case":"Trabalhar em múltiplas features simultaneamente"},"stripe":{"description":"Padrões de integração Stripe com versionamento de preços","trigger":"stripe, billing, assinatura, pagamento","use_case":"Implementar sistema de cobrança"},"plan-based-features":{"description":"Padrão de 3 camadas para features por plano","trigger":"plano, limite, feature flag, freemium","use_case":"Implementar recursos limitados por plano"},"ux-design":{"description":"Componentes e padrões frontend","trigger":"shadcn, tailwind, componente, ui","use_case":"Desenvolvimento de interfaces"},"backend-development":{"description":"Padrões NestJS e arquitetura backend","trigger":"api, controller, service, nestjs","use_case":"Desenvolvimento backend"},"database-development":{"description":"Migrations, queries, Kysely","trigger":"database, migration, query, kysely","use_case":"Trabalho com banco de dados"},"security-audit":{"description":"Checklist OWASP e análise de vulnerabilidades","trigger":"vulnerabilidade, injection, xss","use_case":"Auditoria de segurança"},"code-review":{"description":"Padrões de revisão de código","trigger":"review, qualidade, padrão","use_case":"Revisão de implementações"}}

---

## Phase 1: Ler Contexto

1. Verificar se existe `.fnd/about.json`:

```bash
cat .fnd/about.json
```

**Se existir:**
```json
{
  "type": "quicklaunch" | "legacy",
  "name": "...",
  "version": "..."
}
```

**Se NÃO existir:**
```markdown
⚠️ **FND não configurado neste projeto**

Para começar a usar o FND, execute no terminal:

```bash
fnd setup
```

Isso vai:
1. Detectar o tipo do seu projeto
2. Configurar o agente de IA
3. Instalar os comandos necessários

Após o setup, tente novamente!
```
**→ Parar execução**

---

## Phase 2: Analisar Intenção

### 2.1 Classificar a Mensagem

Analise a mensagem do usuário usando o **IntentMapping**.

**Regras de Classificação por Estágio:**

| Estágio do Usuário | Sinais | Comando |
|-------------------|--------|---------|
| Início absoluto | "novo projeto", "começar", "criar saas" | `product` |
| Exploração | "não sei bem", "pensando em", "será que" | `brainstorm` |
| Sabe o que quer | "quero criar X", "preciso de Y" | `feature` |
| Tem feature, quer design | "interface", "tela", "ux" | `design` |
| Tem feature, quer planejar | "como implementar", "organizar tasks" | `plan` |
| Quer codar | "desenvolver", "implementar agora" | `dev` |
| Quer autonomia | "autopilot", "fazer sozinho" | `autopilot` |
| Quer revisar | "review", "verificar" | `review` |
| Quer finalizar | "done", "merge", "concluir" | `done` |
| Problema/Bug | "erro", "bug", "não funciona" | `fix` |
| Emergência | "produção", "urgente", "crítico" | `hotfix` |
| Dúvida | "como funciona", "explicar" | `question` |
| Perdido | "ajuda", "o que fazer" | `help` |

### 2.2 Detectar Menção a Skills

Se a mensagem mencionar algo relacionado às **Skills**, inclua a skill relevante no contexto:

| Menção | Skill a Carregar |
|--------|------------------|
| "worktree", "isolado", "paralelo" | `using-git-worktrees` |
| "stripe", "billing", "pagamento" | `stripe` |
| "plano", "limite", "feature flag" | `plan-based-features` |
| "shadcn", "tailwind", "componente" | `ux-design` |
| "controller", "service", "nestjs" | `backend-development` |
| "migration", "query", "database" | `database-development` |

### 2.3 Confiança Baixa

Se a intenção não for clara (< 70% confiança), **pergunte ao usuário:**

```markdown
Entendi que você quer **[interpretação]**.

Posso te ajudar de algumas formas:

1. **Brainstorm** - Explorar a ideia juntos, sem compromisso
2. **Feature** - Documentar e começar a construir
3. **[Outro relevante]** - [Descrição]

Qual prefere?
```

---

## Phase 3: Buscar e Executar Comando

### 3.1 Buscar no FND CLI

```bash
fnd get-command [command_name] --type=[type_from_about.json] --raw
```

**Exemplos:**
```bash
# Projeto quicklaunch querendo criar feature
fnd get-command feature --type=quicklaunch --raw

# Projeto legacy querendo fazer brainstorm
fnd get-command brainstorm --type=legacy --raw
```

### 3.2 Executar o Comando

1. O CLI retorna o conteúdo do comando (markdown)
2. **Siga as instruções do comando retornado**
3. **Passe o contexto original do usuário** como input para o comando

**Exemplo de execução:**
```
Usuário: /fnd quero criar um dashboard de analytics

→ Detecta: "quero criar" + escopo claro = feature
→ Executa: fnd get-command feature --type=quicklaunch --raw
→ Inicia o comando feature com contexto: "dashboard de analytics"
```

---

## Phase 4: Orientar Próximos Passos

Após executar o comando, sempre oriente o usuário sobre o próximo passo no fluxo:

| Comando Executado | Próximo Passo |
|-------------------|---------------|
| `product` | `/fnd` + descreva a primeira feature |
| `brainstorm` | `/fnd` + "documentar como feature" OU continuar explorando |
| `feature` | `/fnd design` (se tem UI) OU `/fnd plan` OU `/fnd dev` |
| `design` | `/fnd plan` OU `/fnd dev` |
| `plan` | `/fnd dev` OU `/fnd autopilot` |
| `dev` | `/fnd review` OU `/fnd done` |
| `autopilot` | `/fnd review` OU `/fnd done` |
| `review` | `/fnd done` (se aprovado) OU ajustes |
| `done` | `/fnd` + próxima feature |
| `fix` | Continuar `/fnd dev` |
| `hotfix` | `/fnd done` → deploy |

---

## Fluxos de Desenvolvimento

### Fluxo Completo (Recomendado para features complexas com UI)
```
/product → /feature → /design → /plan → /dev → /review → /done
```

### Fluxo com UI (Design primeiro)
```
/feature → /design → /plan → /dev → /done
```

### Fluxo Normal (Backend ou sem design específico)
```
/feature → /plan → /dev → /done
```

### Fluxo Simples (Features pequenas)
```
/feature → /dev → /done
```

### Fluxo Autônomo (Claude faz tudo)
```
/feature → /autopilot → /done
```

### Fluxo de Exploração
```
/brainstorm → (gera doc?) → /feature → ...
```

### Fluxo de Correção
```
/dev → encontra bug → /fix → continua /dev → /done
```

### Fluxo de Emergência
```
/hotfix → /done → deploy
```

---

## Referência Rápida de Comandos

### Setup Inicial (uma vez)
| Comando | Quando Usar |
|---------|-------------|
| `founder` | Definir perfil de comunicação |
| `product` | Definir produto/MVP |

### Fluxo Principal
| Comando | Quando Usar |
|---------|-------------|
| `feature` | Início de cada funcionalidade |
| `design` | Após feature (para UIs) |
| `plan` | Após feature/design (para complexas) |
| `dev` | Implementar (você acompanha) |
| `autopilot` | Implementar (Claude faz tudo) |
| `review` | Revisar antes de finalizar |
| `done` | Finalizar e merge |

### Correções
| Comando | Quando Usar |
|---------|-------------|
| `fix` | Bug durante desenvolvimento |
| `hotfix` | Bug urgente em produção |

### Suporte
| Comando | Quando Usar |
|---------|-------------|
| `brainstorm` | Explorar ideias livremente |
| `question` | Dúvidas sobre feature atual |
| `help` | Ver status e comandos |
| `security` | Auditoria OWASP |
| `architecture` | Entender estrutura do projeto |

---

## Skills Disponíveis

Skills são conhecimentos especializados que o agente carrega automaticamente quando relevante:

| Skill | Descrição | Trigger |
|-------|-----------|---------|
| `using-git-worktrees` | Workspace isolado para features | "worktree", "isolado" |
| `stripe` | Integração de pagamentos | "stripe", "billing" |
| `plan-based-features` | Features limitadas por plano | "plano", "limite" |
| `ux-design` | Padrões de interface | "shadcn", "tailwind" |
| `backend-development` | Padrões NestJS | "controller", "service" |
| `database-development` | Migrations e queries | "migration", "database" |
| `security-audit` | Checklist OWASP | "vulnerabilidade", "xss" |
| `code-review` | Padrões de revisão | "review", "qualidade" |

**Como usar:** Mencione o contexto na sua mensagem e a skill será carregada automaticamente.

Exemplo:
```
/fnd quero criar billing com stripe

→ Detecta: feature + menção a "stripe"
→ Carrega skill: stripe
→ Executa: feature com contexto de stripe
```

---

## Scripts Disponíveis

Scripts ficam em `.fnd/scripts/` e são executados quando necessário:

| Script | Uso |
|--------|-----|
| `detect-project-structure.sh` | Detectar estrutura do projeto |
| `detect-project-state.sh` | Detectar estado atual (branch, features, etc) |
| `validate-resource-genericity.sh` | Validar recursos genéricos |

```bash
bash .fnd/scripts/[script-name].sh [args]
```

---

## Exemplos de Uso

### Exemplo 1: Usuário Perdido
```
Usuário: /fnd não sei por onde começar

Agente:
1. Identifica: "não sei" → help ou brainstorm
2. Verifica estado do projeto
3. Se não tem product.md → sugere /product
4. Se tem product.md → sugere /feature
```

### Exemplo 2: Exploração
```
Usuário: /fnd estou pensando em criar um sistema de gamificação mas não sei se faz sentido

Agente:
1. Identifica: "pensando", "não sei" → brainstorm
2. Executa: fnd get-command brainstorm --type=quicklaunch
3. Inicia conversa exploratória sobre gamificação
```

### Exemplo 3: Feature Clara
```
Usuário: /fnd quero criar a tela de dashboard com gráficos de uso

Agente:
1. Identifica: "quero criar" + "tela" + escopo claro → feature + design
2. Executa: fnd get-command feature --type=quicklaunch
3. Após feature, sugere: "Quer que eu crie as specs de design? /fnd design"
```

### Exemplo 4: Bug
```
Usuário: /fnd o login dá erro 500 quando o usuário não existe

Agente:
1. Identifica: "erro 500" → fix
2. Executa: fnd get-command fix --type=quicklaunch
3. Inicia investigação do bug
```

### Exemplo 5: Modo Autônomo
```
Usuário: /fnd implementa a feature de notificações em autopilot

Agente:
1. Identifica: "autopilot" → autopilot
2. Executa: fnd get-command autopilot --type=quicklaunch
3. Implementa 100% autonomamente
```

### Exemplo 6: Skill Específica
```
Usuário: /fnd preciso criar o sistema de billing com stripe e planos

Agente:
1. Identifica: "criar" → feature
2. Detecta skills: "stripe" + "planos" → stripe + plan-based-features
3. Executa feature com skills carregadas
```

### Exemplo 7: Worktree
```
Usuário: /fnd criar feature de relatórios em uma worktree isolada

Agente:
1. Identifica: "criar feature" → feature
2. Detecta skill: "worktree" → using-git-worktrees
3. Executa feature + cria worktree isolada
4. Abre novo VSCode na worktree
```

---

## Fallbacks

### FND CLI não instalado
```markdown
⚠️ **FND CLI não encontrado**

Instale o FND CLI:
```bash
npm install -g @fnd/cli
fnd login
fnd setup
```

Após o setup, tente novamente!
```

### Comando não encontrado
```markdown
⚠️ **Comando não disponível**

O comando `[name]` não está disponível para projetos `[type]`.

Comandos disponíveis: [lista via fnd list-commands]
```

### Erro de conexão
```markdown
⚠️ **Erro de conexão**

Não foi possível conectar ao FND Server.

Verifique sua conexão ou tente novamente em alguns minutos.

Se o problema persistir, execute: `fnd --help`
```

---

## Completion

Após executar qualquer comando, sempre finalize com:

```markdown
---

**Próximo passo:** [sugestão baseada no fluxo]

Ou use `/fnd` + descreva o que precisa!
```
