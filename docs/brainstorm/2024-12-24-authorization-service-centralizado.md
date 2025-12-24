# Brainstorm: Authorization Service Centralizado

**Data:** 2024-12-24
**Participantes:** Founder + Claude

---

## Problema ou Necessidade

Super-admins não conseguem acessar funcionalidades no menu de Administração do frontend quando selecionam um workspace do qual não são membros diretos. O sistema exibe erro "Você não tem acesso a este workspace".

**Quem é afetado:** Super-administradores do sistema

**Situação atual:** Cada serviço do backend faz sua própria verificação de acesso ao workspace, checando apenas se existe um registro na tabela `workspace_users`. Como super-admin pode não ser membro de um workspace específico, a validação falha mesmo ele tendo privilégios superiores.

---

## O que o Usuário Quer

Super-admins devem ter acesso irrestrito a qualquer workspace e funcionalidade do sistema, independente de serem membros diretos ou não.

### Cenário Ideal

1. Super-admin faz login no sistema
2. Seleciona qualquer workspace da lista (mesmo sem ser membro)
3. Acessa todas as funcionalidades (Billing, Usuários, Configurações, etc.) sem erros
4. Sistema reconhece automaticamente que super-admin tem privilégios elevados

### Exemplos de Uso

- **Exemplo 1:** Super-admin precisa verificar a assinatura de um cliente que reportou problema - deve conseguir acessar a página de Billing do workspace do cliente
- **Exemplo 2:** Super-admin precisa investigar atividade suspeita em um workspace - deve conseguir ver logs de auditoria sem ser adicionado como membro

---

## Discovery Inicial

### O que já existe no sistema

- Hierarquia de roles definida: SUPER_ADMIN > OWNER > ADMIN > MEMBER
- RolesGuard que implementa hierarquia corretamente
- Verificações de acesso espalhadas em vários services
- Dois níveis de roles: global (user.role) e workspace (workspace_users.role)

### O que precisaria ser criado

- Serviço centralizado que concentra todas as verificações de permissão
- Matriz de permissões declarativa (actions + resources)
- Métodos genéricos ao invés de hardcoded para cada caso

### Perguntas respondidas

- **Pergunta:** Por que super-admin não tem acesso?
  **Resposta:** Services verificam apenas `workspace_users` sem considerar role global

- **Pergunta:** Hardcodar bypass para super-admin resolve?
  **Resposta:** Resolve pontualmente mas gera retrabalho futuro e inconsistência

- **Pergunta:** Qual abordagem é mais escalável?
  **Resposta:** Authorization Service com matriz de permissões (action + resource)

---

## Decisões e Preferências

| O que decidimos | Por quê |
|-----------------|---------|
| Criar Authorization Service centralizado | Evita duplicação e garante consistência |
| Usar abordagem action-based (action + resource) | Mais flexível, evita retrabalho quando adicionar novas permissões |
| Matriz de permissões declarativa | Fácil de auditar, testar e modificar |
| Super-admin sempre tem acesso via role global | Simplifica regras e garante acesso irrestrito |

---

## Estratégia Definida

### Estrutura de Actions e Resources

**Actions disponíveis:**
- `create` - Criar novo recurso
- `read` - Visualizar recurso
- `update` - Atualizar recurso
- `delete` - Remover recurso
- `manage` - Controle total (inclui todas acima)
- `invite` - Convidar usuários
- `archive` - Arquivar recurso
- `restore` - Restaurar recurso arquivado
- `impersonate` - Assumir identidade de outro usuário

**Resources disponíveis:**
- `workspace` - Workspaces
- `user` - Usuários
- `billing` - Cobrança e pagamentos
- `subscription` - Assinaturas
- `invite` - Convites
- `session` - Sessões de login
- `audit_log` - Logs de auditoria
- `plan` - Planos

### Matriz de Permissões

| Resource | Action | Super-Admin | Owner | Admin | Member |
|----------|--------|-------------|-------|-------|--------|
| workspace | read | Global | Workspace | Workspace | Workspace |
| workspace | update | Global | Workspace | Workspace | - |
| workspace | manage | Global | Workspace | - | - |
| workspace | archive | Global | Workspace | - | - |
| billing | read | Global | Workspace | Workspace | Workspace |
| billing | manage | Global | Workspace | - | - |
| user | read | Global | Workspace | Workspace | - |
| user | invite | Global | Workspace | Workspace | - |
| user | update | Global | Workspace | Workspace | - |
| user | impersonate | Global | - | - | - |
| session | read | Global | - | - | - |
| session | delete | Global | - | - | - |
| plan | create/update/read | Global | - | - | - |

**Legenda:**
- **Global:** Permissão via role global do usuário (user.role)
- **Workspace:** Permissão via role no workspace (workspace_users.role)

### Fluxo de Verificação

1. Recebe: usuário, action, resource, contexto (workspaceId opcional)
2. Busca regra na matriz para action + resource
3. Verifica role global primeiro (super-admin bypass)
4. Se não passou, verifica role no workspace (se aplicável)
5. Retorna allowed/denied com motivo

### Uso nos Services

```
// Antes (hardcoded)
verificar se existe workspace_user → lançar erro se não existir

// Depois (centralizado)
authorizationService.require(user, 'read', 'billing', { workspaceId })
```

---

## Dúvidas Resolvidas

| Dúvida | Decisão |
|--------|---------|
| Cache das permissões? | Não precisa por enquanto |
| Logging de acessos negados? | Não precisa por enquanto |
| Migrar services existentes? | Não - aplicar apenas em novos usos |

---

## Próximo Passo

**Para implementar essa feature:**
Execute `/feature` e use este documento como base para a conversa inicial.

**Descrição sugerida para o `/feature`:**
> Criar um serviço centralizado de autorização que verifica permissões baseado em actions e resources, garantindo que super-admins tenham acesso irrestrito a qualquer workspace

---

## Arquivos Relacionados (Referência)

| Arquivo | O que faz |
|---------|-----------|
| `apps/backend/src/api/modules/billing/billing.service.ts` | Valida acesso ao workspace manualmente (linha 151) |
| `apps/backend/src/api/guards/roles.guard.ts` | Implementa hierarquia de roles |
| `apps/backend/src/api/guards/admin.guard.ts` | Rejeita super-admin explicitamente (linha 46) |
| `libs/domain/src/enums/UserRole.ts` | Define roles do sistema |
| `libs/backend/src/services/` | Pasta onde interfaces de services ficam |
| `apps/backend/src/shared/services/` | Pasta onde implementações ficam |

---

*Documento de brainstorm - usar como input para `/feature`*
