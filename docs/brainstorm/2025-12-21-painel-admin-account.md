# Brainstorm: Painel Administrativo do Account

**Data:** 2025-12-21
**Participantes:** Founder + Claude

---

## Problema ou Necessidade

Owners e Admins de uma conta precisam gerenciar seus próprios usuários sem depender do super-admin do SaaS. Hoje não existe uma área dentro da aplicação principal onde possam ver sessões ativas, revogar acessos ou alterar permissões de membros da equipe.

**Quem é afetado:** Owners e Admins de cada conta. Owner tem acesso a todas as workspaces da conta. Admin e Member são vinculados a workspaces específicas.

**Situação atual:** Não há interface para gestão de usuários. O Manager existente é exclusivo do super-admin (dono do SaaS) e não serve para gestão interna de contas.

---

## O que o Usuário Quer

O Owner/Admin quer um painel dentro da aplicação principal onde possa:
- Ver todos os usuários da sua conta
- Controlar quem está logado e de onde
- Remover acessos quando necessário
- Alterar permissões de membros da equipe
- Convidar novos usuários por email

### Cenário Ideal

O Owner acessa "Configurações > Usuários" e vê uma lista com todos os membros. Clica em um usuário e vê detalhes: quando entrou, de quais dispositivos está logado, qual a permissão atual. Com um clique, pode deslogar um dispositivo específico ou alterar a permissão de "admin" para "membro".

### Exemplos de Uso

- **Funcionário saiu da empresa:** Owner revoga todas as sessões e inativa o usuário
- **Notebook roubado:** Admin revoga apenas a sessão do dispositivo comprometido
- **Promoção:** Owner altera role de "member" para "admin"
- **Novo funcionário:** Admin envia convite por email, pessoa faz signup já vinculada

---

## Discovery Inicial

### O que já existe no sistema

- Tabela de sessões com dados de IP, device, último acesso
- Tabela de usuários com role e status
- Módulo Manager com endpoints de listagem e gestão (apenas super-admin)
- Estrutura de audit logs para registrar eventos
- Guards de autenticação e autorização

### O que precisaria ser criado

- Novos endpoints específicos para Admin do account (separado do Manager)
- Interface de listagem de usuários com filtros
- Tela de detalhes com sessões ativas do usuário
- Funcionalidade de revogar sessões (individual e todas)
- Funcionalidade de alterar role (owner, admin, member)
- Sistema de convite por email com signup vinculado
- Guard específico que aceita Owner/Admin mas bloqueia Member

### Perguntas respondidas

- **Super-admin aparece na listagem?**
  Não. Super-admin usa o Manager separado e não deve ser editável aqui.

- **Quem pode acessar o painel?**
  Apenas roles >= admin (owner e admin). Member não acessa.

- **Qual a hierarquia de permissões?**
  Super-admin > Owner > Admin > Member. Ninguém altera role de quem está acima.

- **Este painel é para o dono do SaaS?**
  Não. É para o owner do account (cliente). Super-admin tem o Manager.

---

## Decisões e Preferências

| O que decidimos | Por quê |
|-----------------|---------|
| Super-admin não listado nem editável | Segurança - super-admin usa Manager separado |
| Roles editáveis: owner, admin, member | Evitar escalação de privilégio para super-admin |
| Validação no backend obrigatória | Nunca confiar no que vem do client |
| Admin não altera Owner | Hierarquia - só quem está acima pode alterar |
| Separar do Manager existente | Manager é super-admin only, este é para accounts |

---

## Funcionalidades Acordadas

### Sessões Ativas

- Listar sessões de um usuário (device, IP, último acesso)
- Ação rápida: revogar sessão individual
- Ação rápida: revogar todas as sessões (logout total)

### Gerenciar Usuários

- Listar usuários do account com busca e filtros
- Alterar role (owner, admin, member)
- Ativar/inativar usuário
- Ver detalhes: workspaces, sessões ativas, histórico

### Convidar Usuários

- Owner/Admin envia convite informando email, role e workspace(s)
- Sistema envia email com link de convite (token único)
- Pessoa clica no link e faz signup já vinculada à conta e workspace
- Convite expira após período definido (ex: 7 dias)
- Owner/Admin pode ver convites pendentes e reenviar/cancelar
- Quem convida não pode definir role maior que o seu

### Segurança Crítica

- Backend valida whitelist de roles permitidos
- Backend rejeita qualquer tentativa de role=super-admin
- Backend valida account_id (não aceitar gestão cross-account)
- Backend valida hierarquia (não alterar quem está acima)

---

## Dúvidas que Ficaram

- [ ] Histórico de atividades deve ser visível nesta tela ou em área separada?
- [ ] Reset de senha administrativo: owner pode forçar reset para outro usuário?
- [ ] Limite de usuários por account existe? (baseado em plano?)

---

## Próximo Passo

**Para transformar isso em feature:**
Execute `/feature` e use este documento como base para a conversa inicial.

**Descrição sugerida para o `/feature`:**
> Painel administrativo para owners e admins gerenciarem usuários: sessões ativas com revogação, alterar permissões, convidar novos membros por email com signup vinculado à conta e workspace.

---

## Arquivos Relacionados (Referência)

| Arquivo | O que faz |
|---------|-----------|
| [manager.controller.ts](apps/backend/src/api/modules/manager/manager.controller.ts) | Endpoints do Manager (super-admin only) |
| [manager.service.ts](apps/backend/src/api/modules/manager/manager.service.ts) | Lógica de listagem e métricas |
| [User.ts](libs/domain/src/entities/User.ts) | Entidade usuário com role e status |
| [super-admin.guard.ts](apps/backend/src/api/guards/super-admin.guard.ts) | Guard que valida super-admin |
| [Database.ts](libs/app-database/src/types/Database.ts) | Schema com tabela sessions |

---

*Documento de brainstorm - usar como input para `/feature`*
