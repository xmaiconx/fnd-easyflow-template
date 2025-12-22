# Brainstorm: Reorganização da UX - Área Administrativa

**Data:** 2025-12-22
**Participantes:** Founder + Claude

---

## Problema ou Necessidade

O sistema atual mistura funcionalidades administrativas (gestão de usuários, sessões, auditoria) com funcionalidades pessoais do usuário no mesmo menu. Isso causa confusão e não reflete a hierarquia de permissões.

**Quem é afetado:**
- Administradores que precisam acessar ferramentas de gestão
- Usuários comuns que veem opções que não deveriam usar
- Todos os usuários, pois algumas opções do menu não funcionam

**Situação atual:**
- Menu lateral tem "Usuários" e "Sessions" expostos para todos
- Opções "Settings", "Profile" e "Account Settings" não funcionam
- Filtro de usuários é lento (busca a cada letra digitada)
- Sessões mostram dados fictícios ao invés de dados reais

---

## O que o Usuário Quer

### Cenário Ideal

**Para usuário comum (member):**
- Ver apenas o que pode usar: Dashboard, Workspaces, suas configurações pessoais
- Acessar suas próprias sessões ativas e poder encerrar dispositivos
- Editar seu perfil e preferências

**Para administrador (owner/admin):**
- Tudo do usuário comum MAIS
- Área separada para administração
- Gerenciar usuários da conta
- Ver histórico de ações (auditoria)
- Controlar sessões de todos os usuários

### Exemplos de Uso

- **Exemplo 1:** João é admin e precisa desativar um usuário que saiu da empresa. Ele vai em "Administração > Usuários", busca pelo nome e altera o status.

- **Exemplo 2:** Maria quer ver se deixou sua conta logada no computador do trabalho. Ela vai em "Configurações > Minhas Sessões" e vê todos os dispositivos conectados.

- **Exemplo 3:** Pedro é apenas member e não vê a seção "Administração" no menu - só o que ele pode usar.

---

## Discovery Inicial

### O que já existe no sistema

- Página de gestão de usuários com listagem, convites e histórico
- Componentes de sessões (tabela e cards) prontos
- Backend completo para buscar e revogar sessões
- Sistema de permissões (owner, admin, member)

### O que precisaria ser criado

- **Página de Configurações Pessoais** - onde o usuário edita perfil, vê sessões, muda preferências
- **Separação no menu** - área comum vs área administrativa
- **Conexão com dados reais** - sessões hoje mostram dados de exemplo
- **Filtro inteligente** - esperar o usuário parar de digitar antes de buscar
- **Menu de Auditoria** - separar o histórico de ações em menu próprio

### Perguntas respondidas

- **Pergunta:** O backend de sessões está pronto?
  **Resposta:** Sim, existem endpoints para listar e revogar sessões do usuário logado.

- **Pergunta:** Por que o filtro é lento?
  **Resposta:** Cada letra digitada dispara uma busca no servidor. Precisa esperar o usuário terminar de digitar.

---

## Decisões e Preferências

| O que decidimos | Por quê |
|-----------------|---------|
| Separar menu em área comum e administrativa | Usuários veem só o que podem usar |
| Criar página única de Settings com abas | Centraliza configurações, mais organizado |
| Mover Auditoria para menu separado | Não faz sentido dentro de "Usuários" |
| Usar dados reais nas sessões | Backend já existe, só conectar |
| Implementar espera no filtro (debounce) | Evita sobrecarregar o servidor |

---

## Dúvidas que Ficaram

- [ ] Qual o tempo ideal de espera no filtro? (sugestão: 300ms)
- [ ] Incluir upload de avatar na página de perfil agora ou deixar para depois?
- [ ] A auditoria deve mostrar ações de todos ou só do usuário logado?

---

## Próximo Passo

**Se quiser transformar isso em feature:**
Execute `/feature` e use este documento como base para a conversa inicial.

**Descrição sugerida para o `/feature`:**
> Reorganizar a navegação do sistema separando área administrativa da área pessoal, criar página de configurações do usuário e fazer as sessões funcionarem com dados reais.

---

## Arquivos Relacionados (Referência)

| Arquivo | O que faz |
|---------|-----------|
| `apps/frontend/src/components/layout/sidebar.tsx` | Menu lateral com navegação |
| `apps/frontend/src/components/layout/header.tsx` | Menu do usuário (Profile, Settings) |
| `apps/frontend/src/pages/users-management.tsx` | Página de gestão de usuários |
| `apps/frontend/src/pages/sessions.tsx` | Página de sessões (dados mockados) |
| `apps/frontend/src/routes.tsx` | Rotas do sistema |
| `apps/frontend/src/hooks/use-account-admin.ts` | Funções de admin (usuários, convites) |
| `apps/backend/src/api/modules/auth/auth.controller.ts` | Endpoints de sessões no backend |

---

## Estrutura de Menu Sugerida

```
MENU PRINCIPAL (todos os usuários)
├── Dashboard
├── Workspaces
└── Configurações
    ├── Meu Perfil
    ├── Minhas Sessões
    └── Preferências

ADMINISTRAÇÃO (só owner/admin)
├── Usuários
├── Convites
├── Sessões (da conta)
└── Auditoria
```

---

## Priorização Sugerida

| Tarefa | Prioridade | Por quê |
|--------|------------|---------|
| Debounce no filtro | Alta | Melhora performance imediata |
| Sessões com dados reais | Alta | Backend pronto, só conectar |
| Página de Configurações | Alta | Resolve vários itens de uma vez |
| Reorganizar sidebar | Média | Melhora UX mas requer mais mudanças |
| Separar Auditoria | Média | Depende da reorganização do menu |

---

*Documento de brainstorm - pode ser usado como input para `/feature`*
