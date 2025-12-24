# Brainstorm: Visualização de Eventos do Stripe no Manager

**Data:** 2025-12-24
**Participantes:** Founder + Claude

---

## Problema ou Necessidade

O Super Admin precisa acompanhar os eventos que chegam do Stripe (pagamentos, assinaturas, falhas) para monitorar a saúde do sistema de billing e diagnosticar problemas rapidamente.

**Quem é afetado:** Super Admin (gestor do SaaS)

**Situação atual:** Os eventos são salvos no banco de dados, mas não há forma visual de consultá-los. Para ver um evento, seria necessário acessar o banco diretamente.

---

## O que o Usuário Quer

Visualizar de forma rápida e organizada todos os eventos que o Stripe envia, identificar problemas (eventos com falha), e poder ver os detalhes completos quando necessário.

### Cenário Ideal

O Super Admin abre o painel Manager, vê no menu lateral "Eventos Stripe" com um indicador vermelho se houver falhas. Ao clicar, encontra uma tabela com todos os eventos recentes, pode filtrar por status/tipo/período, e ao clicar em um evento, vê todos os detalhes em um modal.

### Exemplos de Uso

- **Exemplo 1:** Cliente reclama que o pagamento não foi processado. Super Admin filtra por "failed" e encontra o evento com erro, identifica que o cartão foi recusado.
- **Exemplo 2:** Super Admin quer ver todos os checkouts do último mês para análise. Filtra por tipo "checkout.session.completed" e período.
- **Exemplo 3:** Desenvolvedor precisa debugar integração. Super Admin localiza o evento e copia o payload JSON completo.

---

## Discovery Inicial

### O que já existe no sistema

- Tabela no banco que guarda todos os eventos do Stripe automaticamente
- Sistema já salva: data, tipo do evento, conta vinculada, status e payload completo
- Código pronto para buscar eventos com filtros diversos

### O que precisaria ser criado

- Tela no painel Manager para listar os eventos
- Opção de filtrar por status (sucesso/falha/pendente)
- Opção de filtrar por tipo de evento e período
- Modal para ver o conteúdo completo do evento
- Indicador visual de eventos com falha no menu

---

## Funcionalidades Acordadas

### MVP (Essenciais)

| Funcionalidade | Descrição |
|----------------|-----------|
| Listagem de eventos | Tabela com data, tipo, conta, status |
| Badge de status | Verde=sucesso, amarelo=pendente, vermelho=falha |
| Modal de detalhes | Ver payload JSON formatado com opção de copiar |
| Paginação | Navegar entre páginas de resultados |

### Completas (Todas Sugeridas)

| Funcionalidade | Descrição |
|----------------|-----------|
| Filtro por status | Dropdown para filtrar processed/pending/failed |
| Filtro por tipo | Dropdown com tipos de evento (checkout, subscription, invoice, etc.) |
| Filtro por período | Seletor de data início/fim |
| Busca por account | Campo para filtrar eventos de uma conta específica |
| Badge no menu | Indicador vermelho se houver eventos com falha |
| Retry manual | Botão para re-processar evento que falhou |
| Link para account | Clicar na conta abre detalhes dela |

---

## Decisões e Preferências

| O que decidimos | Por quê |
|-----------------|---------|
| Implementar todas as funcionalidades | Super Admin precisa de visão completa para operar |
| Incluir retry manual | Permite resolver problemas sem acessar banco |
| Badge de falhas no menu | Alerta proativo de problemas |

---

## Dúvidas que Ficaram

- [ ] Definir limite de paginação (10, 25, 50 por página?)
- [ ] Retry manual deve criar novo evento ou atualizar existente?
- [ ] Manter histórico por quanto tempo? (limpeza automática?)

---

## Próximo Passo

**Para implementar essa feature:**
Execute `/feature` com a descrição abaixo.

**Descrição sugerida para o `/feature`:**
> Adicionar visualização de eventos do Stripe no Manager com listagem, filtros (status, tipo, período, account), modal de detalhes com payload JSON, badge de falhas no menu e opção de retry manual.

---

## Arquivos Relacionados (Referência)

| Arquivo | O que faz |
|---------|-----------|
| [WebhookEventTable.ts](libs/app-database/src/types/WebhookEventTable.ts) | Define estrutura da tabela de eventos |
| [WebhookEvent.ts](libs/domain/src/entities/WebhookEvent.ts) | Entidade de domínio do evento |
| [WebhookEventRepository.ts](libs/app-database/src/repositories/WebhookEventRepository.ts) | Métodos para buscar/filtrar eventos |
| [stripe-webhook.worker.ts](apps/backend/src/workers/stripe-webhook.worker.ts) | Processa e salva eventos do Stripe |
| [subscriptions.tsx](apps/manager/src/pages/subscriptions.tsx) | Exemplo de página com tabela e modais |

---

*Documento de brainstorm - usar como input para `/feature`*
