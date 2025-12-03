# Discovery: Supabase Environment Configuration Refactor

**Branch:** refactor/F0004-supabase-env-config
**Date:** 2025-12-03

## Initial Analysis

### Commit History

**Recent commits analyzed:**
```
0b82fd9 .
6c647d3 refactor(F0003): complete Supabase Auth migration
380f840 modified:   .claude/settings.local.json modified:   apps/backend/.env.example modified:   libs/app-database/.env.example
6568aba Remove legacy migration files and consolidate initial schema and seed data for plans
6af8ecf .
3f9b897 refactor(F0001): implement billing system and workspace enhancements
8bb02ef feat: add Stripe integration documentation and database migration for billing tables
```

**Key observations:**
- Commit recente (6c647d3) completou migração para Supabase Auth, mas ainda usa nomenclatura antiga
- Commit 380f840 modificou `.env.example` files mas não adicionou variáveis Supabase no backend
- Projeto está em fase ativa de refatoração e limpeza (remoção de migrations legadas)
- Múltiplas features foram adicionadas recentemente (billing, workspaces)

### Modified Files

**Files already modified in this branch:**
```
(branch acabou de ser criada - nenhum arquivo modificado ainda)
```

**Analysis:**
Branch criada especificamente para esta refatoração de configuração Supabase.

### Related Functionalities

**Similar features in codebase:**
- F0003 - Supabase Auth Migration: Migração completa para Supabase Auth, mas manteve nomenclatura antiga de variáveis
- Backend `.env.example`: Atualmente não possui variáveis Supabase, causando confusão
- Frontend `.env.example`: Possui variáveis Supabase mas com nomenclatura antiga ("anon key")
- `docs/setup/supabase-auth-setup.md`: Parcialmente atualizado com nomenclatura nova

**Patterns identified:**
- Projeto usa monorepo com apps separados (backend, frontend)
- Cada app deveria ter seu próprio `.env.example` completo
- Configuração centralizada em `SharedModule` no backend
- Frontend usa Vite, variáveis devem ter prefixo `VITE_`

## Strategic Questionnaire

### Category 1: Scope & Objective

**Q:** What is the main goal of this functionality?
**A:** Atualizar nomenclatura das variáveis Supabase para corresponder ao dashboard atual ("Publishable key" e "Secret key") e consolidar configuração de .env em cada app, removendo o .env.example da raiz.

**Q:** Who are the users/systems that will interact with it?
**A:** Alunos da FND que farão setup inicial do projeto e desenvolvedores que contribuem com o template.

**Q:** What specific problem are we solving?
**A:**
1. Comentários desatualizados causam confusão ("anon key" não existe mais no dashboard)
2. Backend não tem as variáveis Supabase no .env.example
3. .env.example na raiz é confuso e pode gerar dúvida sobre onde configurar
4. JWT_SECRET marcado DEPRECATED mas ainda aparece no backend

### Category 2: Business Rules

**Q:** Are there specific validations or restrictions?
**A:**
- Backend deve ter TODAS as variáveis Supabase necessárias
- Nomenclatura deve ser 100% consistente com o dashboard atual
- Comentários devem ser descritivos e indicar onde obter cada chave
- Zero variáveis deprecated devem permanecer

**Q:** How should error cases be handled?
**A:** Documentar claramente onde obter cada chave no dashboard, com valores placeholder descritivos.

**Q:** Are there dependencies on other functionalities?
**A:** Sim - autenticação Supabase depende dessas variáveis estarem configuradas corretamente.

**Q:** Are there limits, quotas, or throttling to consider?
**A:** Não aplicável - refatoração de configuração apenas.

### Category 3: Data & Integration

**Q:** What data needs to be persisted?
**A:** Nenhum dado - apenas atualização de arquivos de configuração (.env.example) e código.

**Q:** Are there external integrations (APIs, services)?
**A:** Integração com Supabase já existe - apenas renomeando variáveis de configuração.

**Q:** Are asynchronous processes necessary?
**A:** Não - refatoração síncrona de código.

### Category 4: Edge Cases & Failure Scenarios

**Q:** What happens in failure scenarios?
**A:**
- Se busca não encontrar todas as ocorrências: executar múltiplas buscas com padrões diferentes
- Se build falhar: revisar logs de TypeScript/Vite e corrigir manualmente

**Q:** How to handle legacy data or migrations?
**A:** Não aplicável - este é um projeto template sem dados legados.

**Q:** Are there performance or scalability concerns?
**A:** Não - zero impacto em performance.

**Q:** Are there specific security considerations?
**A:** Sim - comentários devem deixar claro que Secret key é APENAS para backend e NUNCA deve ser exposta no frontend.

### Category 5: UI/UX (if applicable)

**Q:** How should the user experience be?
**A:** Não aplicável - refatoração de configuração backend/frontend, sem mudanças em UI.

**Q:** Are there specific loading/error states?
**A:** Não aplicável.

**Q:** Are there responsiveness requirements?
**A:** Não aplicável.

## Decisions and Clarifications

### Decision 1: Renomear Variáveis no Código
**Context:** Usuário confirmou que pode atualizar código sem backward compatibility pois é um projeto template.
**Decision:** Renomear TODAS as variáveis no código (não apenas em .env.example):
- `SUPABASE_ANON_KEY` → `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SECRET_KEY`
- `VITE_SUPABASE_ANON_KEY` → `VITE_SUPABASE_PUBLISHABLE_KEY`
**Impact:** Backend, frontend, documentação, configuração - todos os arquivos que referenciam essas variáveis.
**Rationale:** Projeto template deve estar 100% alinhado com práticas atuais. Alunos não terão dúvidas pois tudo estará consistente.

### Decision 2: Remover .env.example da Raiz
**Context:** Usuário mencionou que não tem .env na raiz, apenas .env.example, e este arquivo não é utilizado.
**Decision:** Remover `.env.example` da raiz completamente.
**Impact:** Simplifica estrutura do projeto - cada app tem seu próprio .env.example.
**Rationale:** Evita confusão sobre onde configurar variáveis. Estrutura de monorepo requer configuração por app.

### Decision 3: Adicionar Variáveis Supabase Completas no Backend
**Context:** Backend `.env.example` atualmente não possui variáveis Supabase, dificultando setup.
**Decision:** Adicionar seção completa com:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_WEBHOOK_SECRET`
**Impact:** Backend `.env.example` terá todas as variáveis necessárias.
**Rationale:** Facilita setup inicial - desenvolvedores sabem exatamente o que configurar.

### Decision 4: Remover JWT_SECRET do Backend
**Context:** Variável já marcada como DEPRECATED no código, mas ainda aparece em alguns lugares.
**Decision:** Remover completamente todas as referências a `JWT_SECRET`.
**Impact:** Backend `.env.example` e qualquer código que referencie.
**Rationale:** Projeto usa exclusivamente Supabase Auth - JWT_SECRET não é mais necessário.

## Assumptions & Premises

1. **Projeto Template sem Backward Compatibility**: Este é um projeto template em desenvolvimento, não um produto em produção. Não há necessidade de manter compatibilidade com versões antigas.
   - Impact if wrong: Se houvesse instâncias em produção, esta refatoração quebraria a configuração existente.

2. **Alunos Seguem Documentação Atualizada**: Assume-se que alunos sempre consultam a documentação mais recente do repositório.
   - Impact if wrong: Alunos com documentação antiga teriam instruções desatualizadas, mas isso é esperado em projetos template.

3. **Supabase Não Mudará Nomenclatura Novamente**: Assume-se que "Publishable key" e "Secret key" são nomes estáveis no dashboard.
   - Impact if wrong: Seria necessária outra refatoração futura, mas isso é aceitável.

4. **Configuração por App é Padrão**: Cada aplicação do monorepo deve ter seu próprio .env.example completo.
   - Impact if wrong: Se houvesse necessidade de configuração centralizada, estrutura seria diferente.

## Edge Cases Identified

1. **Variáveis em Comentários de Código**:
   - Description: Comentários TypeScript/JavaScript podem referenciar nomes antigos (ex: `// Get anon key from env`)
   - Likelihood: Medium
   - Handling Strategy: Buscar padrões em comentários também usando Grep com flags apropriadas

2. **Exemplos em Markdown**:
   - Description: Arquivos .md (README, docs/) podem ter code blocks com variáveis antigas
   - Likelihood: High (já identificamos `supabase-auth-setup.md`)
   - Handling Strategy: Buscar em todos os arquivos .md e atualizar exemplos

3. **Type Definitions**:
   - Description: Interfaces TypeScript podem ter propriedades com nomes de variáveis antigas
   - Likelihood: Low (menos comum ter tipos específicos para env vars)
   - Handling Strategy: Buscar em arquivos de tipos (.d.ts, types.ts)

4. **Testes Unitários**:
   - Description: Testes podem mockar variáveis de ambiente com nomes antigos
   - Likelihood: Low (projeto pode não ter testes abrangentes ainda)
   - Handling Strategy: Buscar em pastas __tests__, *.spec.ts, *.test.ts

## Out of Scope Items

1. **Migração de Dados** - Não há dados a migrar, apenas configuração
2. **Alteração de Lógica de Auth** - Lógica de autenticação Supabase permanece inalterada
3. **Novas Features de Supabase** - Apenas renomeação de variáveis existentes
4. **Setup Automatizado** - Não criar scripts para setup automático (fora do escopo)
5. **Validação de Chaves** - Não adicionar validação em runtime se chaves são válidas

## References

### Codebase Files Consulted
- `.env.example` (raiz): Template completo mas não usado
- `apps/backend/.env.example`: Falta variáveis Supabase
- `apps/frontend/.env.example`: Tem variáveis mas nomenclatura antiga
- `libs/app-database/.env.example`: Apenas DATABASE_URL
- `docs/setup/supabase-auth-setup.md`: Parcialmente atualizado (tarefa anterior)

### Documentation Consulted
- Supabase Dashboard (https://supabase.com/dashboard): Verificou nomenclatura atual
- CLAUDE.md: Padrões de configuração do projeto

### Related Functionalities
- F0003 - Supabase Auth Migration: Feature que implementou Supabase Auth mas manteve nomes antigos
- Shared Module (backend): Módulo que inicializa Supabase client e lê variáveis

## Summary for Planning

**Executive Summary:**
Esta refatoração atualiza toda a nomenclatura de variáveis de ambiente do Supabase para alinhar com o dashboard atual, que mudou de "anon key"/"service_role key" para "Publishable key"/"Secret key". A decisão foi tomada de fazer refatoração completa no código (não apenas .env.example) pois este é um projeto template sem preocupação com backward compatibility. Adicionalmente, consolidamos configuração em cada app (backend, frontend) e removemos o .env.example confuso da raiz. Variáveis deprecated como JWT_SECRET também serão completamente removidas.

**Critical Requirements:**
- Renomear variáveis no código backend e frontend
- Adicionar seção completa Supabase no `backend/.env.example`
- Atualizar `frontend/.env.example` com nomenclatura nova
- Remover `.env.example` da raiz
- Remover todas as referências a `JWT_SECRET`
- Atualizar documentação (supabase-auth-setup.md, CLAUDE.md, README.md)
- Validar com busca global que nenhuma referência antiga permanece

**Technical Constraints:**
- Manter estrutura de monorepo existente
- Frontend usa Vite (variáveis com prefixo `VITE_`)
- Backend usa NestJS com ConfigService
- Nomes de variáveis devem ser claros e descritivos
- Comentários devem indicar onde obter cada chave no dashboard

**Next Phase Focus:**
O Planning Agent deve criar plano detalhado de execução com:
1. Lista completa de arquivos a modificar (usando Grep para mapear)
2. Ordem de execução (código → configuração → documentação)
3. Estratégia de validação após cada etapa
4. Build tests para garantir que nada quebrou
5. Checklist final com buscas globais para confirmar zero ocorrências antigas
