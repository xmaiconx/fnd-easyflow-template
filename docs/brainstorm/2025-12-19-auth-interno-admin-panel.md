# Brainstorm: Autenticação Interna + Admin Panel

**Data:** 2025-12-19
**Participantes:** Founder + Claude

---

## Problema ou Necessidade

O template atual exige que os alunos configurem dois serviços separados: Railway (backend/banco) e Supabase (autenticação). Isso aumenta a complexidade do setup inicial e fragmenta a gestão de usuários em dois dashboards diferentes.

**Quem é afetado:** Alunos do FND que estão iniciando seus projetos SaaS.

**Situação atual:** O aluno precisa criar conta no Supabase, configurar projeto, copiar chaves, entender webhooks, e manter dois sistemas sincronizados. Além disso, não há painel administrativo próprio para gerenciar usuários, fazer impersonate ou visualizar métricas.

---

## O que o Usuário Quer

Ter um template onde o aluno configure apenas um serviço (Railway) e tenha controle total sobre autenticação e gestão de usuários dentro do próprio sistema.

### Cenário Ideal

1. Aluno clica em "Deploy to Railway"
2. Railway cria projeto com PostgreSQL + Redis automaticamente
3. Aluno preenche apenas variáveis essenciais (email, Stripe se quiser billing)
4. Sistema de login/cadastro funciona nativamente
5. Painel admin permite gerenciar usuários, ver métricas, fazer impersonate

### Exemplos de Uso

- **Suporte ao cliente:** Admin loga como usuário para debugar problema
- **Métricas de negócio:** Ver quantos usuários ativos, MRR, churn
- **Gestão de usuários:** Bloquear conta problemática, resetar senha manualmente
- **Auditoria:** Saber quem fez o quê e quando

---

## Discovery Inicial

### O que já existe no sistema

- Módulo de autenticação integrado com Supabase (signUp, signIn, OAuth)
- Guard de autenticação que valida JWT do Supabase
- Tabelas de User, Account, Workspace funcionando
- Sistema de roles (owner, admin, member)
- Conceito de super-admin por email
- Sistema de audit logs para rastreabilidade

### O que precisaria ser criado

**Autenticação Interna:**
- Sistema de login/cadastro com email e senha
- Geração e validação de tokens JWT próprios
- Refresh tokens para manter sessão ativa
- Fluxo de recuperação de senha por email
- Verificação de email no cadastro

**Painel Administrativo:**
- Listagem de usuários com busca e filtros
- Visualização de detalhes de cada usuário
- Capacidade de bloquear/desbloquear contas
- Funcionalidade de impersonate (logar como outro usuário)
- Dashboard com métricas: usuários ativos, signups, receita

### Perguntas respondidas

- **Pergunta:** Supabase Auth é mais simples para o aluno?
  **Resposta:** Não. Requer configurar serviço adicional, entender webhooks, manter dois sistemas.

- **Pergunta:** Perdemos algo removendo Supabase?
  **Resposta:** OAuth social (Google, GitHub) precisa ser implementado separadamente se necessário.

- **Pergunta:** Vale o esforço de migrar?
  **Resposta:** Sim. O aluno fica com um serviço só e ganha painel admin que não existia.

---

## Decisões e Preferências

| O que decidimos | Por quê |
|-----------------|---------|
| Remover dependência do Supabase Auth | Simplificar setup para um serviço só |
| Criar autenticação com Passport.js | Padrão de mercado, bem documentado |
| Incluir painel administrativo | Essencial para operar um SaaS real |
| Manter suporte a multi-tenancy | Já funciona, não precisa mudar |

---

## Escopo da Migração

### Fase 1: Remover Supabase Auth

**O que sai:**
- Dependência `@supabase/supabase-js` do backend
- Arquivos de integração Supabase no backend
- Webhook controller do Supabase
- Guard que valida JWT do Supabase
- Hook do frontend que usa Supabase
- Variáveis de ambiente do Supabase

**Arquivos afetados no backend:**
- `apps/backend/src/shared/services/supabase.service.ts`
- `apps/backend/src/api/guards/supabase-auth.guard.ts`
- `apps/backend/src/api/modules/auth/supabase-webhook.controller.ts`
- `libs/backend/src/services/ISupabaseService.ts`

**Arquivos afetados no frontend:**
- `apps/frontend/src/lib/supabase.ts`
- `apps/frontend/src/hooks/use-supabase-auth.ts`

### Fase 2: Criar Autenticação Interna

**Novos componentes:**
- Estratégias Passport (local + JWT)
- Serviço de tokens (access + refresh)
- Serviço de senhas (hash + verificação)
- Guard JWT próprio
- Endpoints de auth (signup, signin, refresh, logout, reset-password)

**Novas tabelas:**
- `sessions` (refresh tokens, sessões ativas)
- `password_reset_tokens` (recuperação de senha)
- `email_verification_tokens` (confirmação de email)

### Fase 3: Admin Panel

**Funcionalidades:**
- CRUD de usuários
- Impersonate com auditoria
- Dashboard de métricas
- Gestão de sessões ativas

**Nova tabela:**
- `impersonate_sessions` (auditoria de impersonate)

---

## Decisões Adicionais

| Pergunta | Decisão |
|----------|---------|
| OAuth social (Google, GitHub)? | Futuro - não incluir nesta fase |
| Onde fica o admin panel? | Frontend separado em `apps/manager` com BFF próprio |
| 2FA? | Futuro - não incluir nesta fase |

---

## Arquitetura do Monorepo

### Estrutura Proposta

```
apps/
├── frontend/          # App do usuário final (cliente SaaS)
│   └── src/
├── manager/           # Painel administrativo (super-admin)
│   └── src/
└── backend/
    └── src/
        └── api/
            └── modules/
                ├── auth/           # Auth compartilhado
                ├── workspace/      # Endpoints do frontend
                ├── billing/        # Endpoints do frontend
                └── manager/        # BFF exclusivo do manager
                    ├── users/
                    ├── metrics/
                    ├── impersonate/
                    └── sessions/
```

### Separação de Responsabilidades

| App | Público | Propósito |
|-----|---------|-----------|
| `apps/frontend` | Usuários finais | Dashboard do SaaS, funcionalidades do produto |
| `apps/manager` | Super-admin | Gestão de usuários, métricas, impersonate, suporte |

### Backend: Módulos por Contexto

| Módulo | Quem usa | Funcionalidades |
|--------|----------|-----------------|
| `auth` | Ambos | Login, signup, refresh, logout |
| `workspace` | frontend | CRUD workspaces, convites |
| `billing` | frontend | Assinaturas, pagamentos |
| `manager` | manager | Users, metrics, impersonate, sessions |

### Vantagens da Separação

- **Segurança:** Endpoints do manager isolados, mais fácil de proteger
- **Deploy independente:** Pode atualizar manager sem afetar frontend
- **Clareza:** Código do admin não polui o código do produto
- **Escalabilidade:** Pode ter políticas de cache/rate-limit diferentes

### Considerações

- **Auth compartilhado:** Mesmo sistema JWT, mas manager exige role super-admin
- **Libs compartilhadas:** `@fnd/domain`, `@fnd/database` usados por ambos
- **UI components:** Podem compartilhar `libs/ui` se necessário

---

## Práticas de Segurança - Auth

### Refresh Token Rotation

A cada uso do refresh token, o sistema gera um novo e invalida o antigo. Se alguém roubar o token, só funciona uma vez. Na próxima tentativa com token antigo, o sistema detecta uso duplicado e invalida todas as sessões do usuário por segurança.

### Account Lockout

Bloquear conta após 5 tentativas de login falhas. Bloqueio dura 15 minutos. Previne ataques de força bruta em senhas.

### Rate Limiting em Auth

Limitar requisições por IP nos endpoints sensíveis:
- `/auth/login` - máx 5/minuto
- `/auth/signup` - máx 3/minuto
- `/auth/forgot-password` - máx 3/minuto

Usar middleware do NestJS com Redis para controle distribuído.

### Device/Session Tracking

Mostrar ao usuário onde está logado: dispositivo, IP, navegador, última atividade. Permitir revogar sessões individuais ou todas de uma vez. Exemplo: "Chrome Windows (ativo agora), Safari iPhone (há 2 dias)".

### Auth Audit Events

Registrar todos eventos de autenticação no sistema de audit logs existente:
- Login sucesso/falha
- Logout
- Mudança de senha
- Reset de senha solicitado/concluído
- Sessão revogada

---

## Práticas de UX - Manager

### Impersonate com Timeout

Sessão de impersonate expira automaticamente após 30 minutos. Evita que admin esqueça que está logado como outro usuário e faça ações indevidas.

### Banner de Impersonate

Quando em modo impersonate, exibir banner fixo no topo da tela:
> "Você está visualizando como user@email.com - [Sair do Impersonate]"

Banner visível em todas as páginas até sair do modo impersonate.

### Confirmação de Ações Destrutivas

Antes de executar ações irreversíveis, exigir confirmação:
- Deletar usuário → digitar email do usuário para confirmar
- Revogar todas sessões → checkbox de confirmação
- Bloquear conta → motivo obrigatório

---

## Tabelas Adicionais (Revisado)

```sql
-- Sessões com tracking de device
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_name VARCHAR(100),  -- "Chrome Windows", "Safari iPhone"
  last_activity_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Controle de tentativas de login (lockout)
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  success BOOLEAN NOT NULL,
  locked_until TIMESTAMP,  -- Se bloqueado, até quando
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tokens de reset/verificação (já previsto)
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,  -- 'password_reset', 'email_verification'
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Impersonate com timeout
CREATE TABLE impersonate_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,  -- Motivo obrigatório
  expires_at TIMESTAMP NOT NULL,  -- Timeout de 30 min
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);
```

---

## Próximo Passo

**Se quiser transformar isso em feature:**
Execute `/feature` e use este documento como base para a conversa inicial.

**Descrição sugerida para o `/feature`:**
> Migrar autenticação do Supabase para sistema interno com Passport.js e criar painel administrativo para gestão de usuários e métricas.

---

## Arquivos Relacionados

| Arquivo | O que faz |
|---------|-----------|
| `apps/backend/src/api/guards/supabase-auth.guard.ts` | Guard atual que valida JWT do Supabase |
| `apps/backend/src/shared/services/supabase.service.ts` | Serviço que conecta com Supabase Auth |
| `apps/backend/src/api/modules/auth/auth.service.ts` | Serviço de auth atual (depende do Supabase) |
| `apps/frontend/src/hooks/use-supabase-auth.ts` | Hook React que gerencia auth via Supabase |
| `apps/frontend/src/lib/supabase.ts` | Cliente Supabase do frontend |
| `libs/backend/src/services/ISupabaseService.ts` | Interface do serviço Supabase |

---

*Documento de brainstorm - pode ser usado como input para `/feature`*
