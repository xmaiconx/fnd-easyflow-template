# Task: Supabase Environment Configuration Refactor

**Branch:** refactor/F0004-supabase-env-config
**Date:** 2025-12-03

## Objective

Refatorar completamente a configuração de variáveis de ambiente do Supabase em todo o projeto para alinhar com a nomenclatura atual do Supabase Dashboard. O dashboard mudou de "anon public key" / "service_role key" para "Publishable key" / "Secret key", mas o código ainda utiliza as nomenclaturas antigas, causando confusão durante o setup inicial.

Esta refatoração também visa consolidar a estrutura de arquivos `.env.example` em cada aplicação (backend, frontend) e remover o arquivo da raiz que não é utilizado. Adicionalmente, variáveis deprecated como `JWT_SECRET` serão removidas completamente do backend, pois o projeto agora usa exclusivamente Supabase Auth.

Como este é um projeto template para alunos da Fábrica de Negócios Digitais (FND), não há preocupação com backward compatibility - a refatoração deve deixar tudo 100% consistente e alinhado com as melhores práticas atuais.

## Business Context

**Why this functionality is needed:**
- Alunos da FND enfrentam confusão ao configurar o Supabase pela primeira vez
- Dashboard atual do Supabase usa nomenclatura diferente da documentada no projeto
- Arquivo `.env.example` na raiz do projeto não é usado e gera dúvida sobre onde configurar
- Backend não possui todas as variáveis Supabase necessárias no `.env.example`, dificultando setup
- Variáveis deprecated continuam aparecendo na documentação e código

**What problem it solves:**
- Elimina confusão entre nomenclatura antiga ("anon key") e atual ("Publishable key")
- Facilita onboarding de novos alunos com documentação 100% alinhada ao dashboard
- Consolida configuração em local correto (dentro de cada app)
- Remove código e variáveis deprecated que podem causar confusão
- Melhora experiência de setup inicial para desenvolvedores

**Who are the stakeholders:**
- Alunos da FND (usuários finais do template)
- Instrutores da FND (suporte ao setup)
- Desenvolvedores contribuindo com o template
- Time de manutenção do template

## Scope

### What IS included
- Renomear variáveis de ambiente no código backend: `SUPABASE_ANON_KEY` → `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SECRET_KEY`
- Renomear variáveis de ambiente no código frontend: `VITE_SUPABASE_ANON_KEY` → `VITE_SUPABASE_PUBLISHABLE_KEY`
- Atualizar todos os comentários em código para usar nomenclatura atual
- Adicionar seção completa de variáveis Supabase no `apps/backend/.env.example`
- Atualizar `apps/frontend/.env.example` com nomenclatura nova e comentários descritivos
- Remover arquivo `.env.example` da raiz do projeto
- Remover variável `JWT_SECRET` do backend (deprecated)
- Atualizar documentação: `docs/setup/supabase-auth-setup.md` (já parcialmente atualizado)
- Atualizar `CLAUDE.md` se houver referências às variáveis antigas
- Atualizar `README.md` se houver instruções de setup

### What is NOT included (out of scope)
- Mudanças em lógica de negócio ou funcionalidades
- Alterações no fluxo de autenticação Supabase
- Implementação de novas features de Supabase
- Alterações na estrutura de banco de dados
- Criação de migrations ou alteração de schema

## Business Rules

### Validations
1. **Nomenclatura Consistente**: Todas as referências devem usar "Publishable key" e "Secret key" ao invés de "anon key" e "service_role key"
2. **Completude do Backend .env.example**: O arquivo deve conter TODAS as variáveis necessárias para Supabase funcionar (URL, Publishable key, Secret key, Webhook secret)
3. **Comentários Descritivos**: Cada variável deve ter comentário explicando onde obter no dashboard e seu propósito
4. **Zero Variáveis Deprecated**: Nenhuma referência a `JWT_SECRET` ou outras variáveis não utilizadas deve permanecer

### Flows

#### 1. Main Flow (Refatoração)
- Step 1: Buscar todas as ocorrências de variáveis antigas no codebase
- Step 2: Substituir no código backend (services, configurations, modules)
- Step 3: Substituir no código frontend (client initialization, hooks, stores)
- Step 4: Atualizar arquivos `.env.example` com nova nomenclatura e estrutura
- Step 5: Remover `.env.example` da raiz
- Step 6: Atualizar documentação
- Step 7: Validar que não sobraram referências antigas

#### 2. Alternative Flows
Não aplicável - este é um processo de refatoração único.

#### 3. Error Flows

**Error Type 1: Referência Antiga Não Detectada**
- Trigger: Busca não encontrou todas as ocorrências
- Handling: Executar múltiplas buscas com padrões diferentes (grep, glob)
- User feedback: Validação final com busca global

**Error Type 2: Build Failure Após Refatoração**
- Trigger: Alguma variável não foi renomeada corretamente
- Handling: Revisar logs de build, corrigir manualmente
- User feedback: Mensagem de erro do TypeScript/Vite apontando arquivo

## Integrations

### External APIs
Nenhuma integração externa - refatoração puramente de configuração interna.

### Internal Services
- **Supabase Client (Backend)**: Inicialização do client usa as variáveis
- **Supabase Client (Frontend)**: Inicialização do client usa as variáveis
- **Configuration Service (Backend)**: Lê e valida variáveis de ambiente

## Edge Cases Identified

1. **Variáveis em Comentários de Código**:
   - Description: Comentários podem referenciar nomes antigos das variáveis
   - Handling: Buscar e substituir também em comentários

2. **Documentação Externa Linkada**:
   - Description: Links para documentação oficial do Supabase podem usar nomenclatura antiga
   - Handling: Atualizar links se necessário, adicionar nota explicativa

3. **Exemplos em Markdown**:
   - Description: Exemplos de código em arquivos .md podem ter variáveis antigas
   - Handling: Buscar em arquivos .md também e atualizar exemplos

4. **Type Definitions**:
   - Description: Tipos TypeScript podem ter interfaces com nomes de propriedades antigas
   - Handling: Atualizar interfaces e types que referenciam as variáveis

## Acceptance Criteria

1. [ ] Nenhuma ocorrência de `SUPABASE_ANON_KEY` no código
2. [ ] Nenhuma ocorrência de `SUPABASE_SERVICE_ROLE_KEY` no código
3. [ ] Nenhuma ocorrência de `VITE_SUPABASE_ANON_KEY` no código
4. [ ] Nenhuma ocorrência de `JWT_SECRET` no código backend
5. [ ] `apps/backend/.env.example` contém seção completa com todas as variáveis Supabase
6. [ ] `apps/frontend/.env.example` usa nomenclatura nova com comentários descritivos
7. [ ] `.env.example` da raiz foi removido
8. [ ] Todos os comentários no código usam "Publishable key" e "Secret key"
9. [ ] Documentação `supabase-auth-setup.md` está 100% alinhada com nomenclatura nova
10. [ ] `CLAUDE.md` atualizado (se houver referências)
11. [ ] Backend compila sem erros TypeScript
12. [ ] Frontend compila sem erros TypeScript

## Next Steps

**Para o Planning Agent:**

1. **Mapeamento Completo**: Criar lista de TODOS os arquivos que precisam ser modificados
2. **Ordem de Execução**: Definir ordem ideal (código → configuração → documentação)
3. **Estratégia de Busca**: Usar múltiplos padrões de busca (Grep) para garantir nada fica para trás
4. **Validação**: Após cada mudança, validar que o padrão antigo não existe mais
5. **Build Testing**: Executar build do backend e frontend para validar sucesso
6. **Checklist Final**: Executar grep global para confirmar zero ocorrências de padrões antigos
