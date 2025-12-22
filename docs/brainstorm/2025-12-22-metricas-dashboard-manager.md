# Brainstorm: Métricas e Dashboards do Manager

**Data:** 2025-12-22
**Participantes:** Founder + Claude

---

## Problema ou Necessidade

O painel de administração (Manager) possui apenas métricas básicas de usuários. O dono do SaaS precisa de uma visão completa do negócio para tomar decisões estratégicas: entender receita, monitorar cancelamentos, acompanhar crescimento e identificar problemas antes que se tornem críticos.

**Quem é afetado:** Owner/Super Admin do SaaS

**Situação atual:** Dashboard com apenas 5 métricas simples (total de usuários, ativos, bloqueados, cadastros recentes, logins recentes). Não existe visão de assinaturas, receita ou churn.

---

## O que o Usuário Quer

O owner quer abrir o painel e rapidamente entender:
- Quanto está faturando e se está crescendo
- Quantos clientes estão cancelando e por quê
- Quais contas estão em risco de sair
- Se a base está engajada ou dormindo

### Cenário Ideal

Ao abrir o Manager, o owner vê um resumo executivo com os números mais importantes. Com um clique, pode mergulhar em detalhes específicos: receita por plano, tendência de cancelamentos, contas que precisam de atenção.

### Exemplos de Uso

- **Exemplo 1:** Owner abre o painel na segunda-feira e vê que o churn subiu 2% na última semana. Clica para ver quais contas cancelaram e identifica um padrão.
- **Exemplo 2:** Investidor pede relatório mensal. Owner acessa dashboard de receita e tem MRR, ARR e breakdown por plano prontos.
- **Exemplo 3:** Owner percebe que tem 5 contas com pagamento atrasado há 3+ dias e entra em contato proativamente.

---

## Discovery Inicial

### O que já existe no sistema

- Métricas básicas de usuários (total, ativos, bloqueados)
- Contagem de cadastros e logins recentes
- Dados de assinaturas no banco (status, cancelamento, período)
- Dados de planos e preços
- Registro de sessões e atividade

### O que precisaria ser criado

- Cálculo de receita recorrente (MRR/ARR)
- Métricas de churn e retenção
- Identificação de contas em risco
- Análise de engajamento (DAU/MAU)
- Dashboards separados por objetivo

---

## Proposta: 5 Dashboards Especializados

### Dashboard 1: Visão Executiva (Executive Overview)

**Objetivo:** Snapshot da saúde do negócio em 30 segundos

| O que mostra | Por que importa |
|--------------|-----------------|
| MRR (Receita Mensal) | Quanto está entrando por mês |
| ARR (Receita Anual) | Projeção anual do faturamento |
| Total de Contas | Tamanho da base de clientes |
| Assinaturas Ativas | Quantos estão pagando |
| Taxa de Churn | Saúde da retenção |
| Taxa de Crescimento | Se está melhorando ou piorando |

---

### Dashboard 2: Receita e Faturamento (Revenue)

**Objetivo:** Entender de onde vem o dinheiro

| O que mostra | Por que importa |
|--------------|-----------------|
| MRR por Plano | Qual plano traz mais receita |
| Receita Média por Cliente | Quanto cada cliente vale |
| Valor Vitalício (LTV) | Quanto um cliente gera ao longo do tempo |
| Receita Perdida | Quanto saiu com cancelamentos |
| Upgrades | Receita de clientes que subiram de plano |

**Visualizações:**
- Gráfico de área: Receita dividida por plano ao longo do tempo
- Barras: Novas vendas vs Cancelamentos por mês
- Lista: Top 10 clientes por receita

---

### Dashboard 3: Crescimento e Aquisição (Growth)

**Objetivo:** Acompanhar se a base está crescendo

| O que mostra | Por que importa |
|--------------|-----------------|
| Novas Contas | Quantos clientes novos chegaram |
| Novos Usuários | Pessoas que se cadastraram |
| Taxa de Ativação | Quantos realmente começaram a usar |
| Conversão Trial → Pago | Eficácia do período de teste |
| Aceite de Convites | Se convites estão funcionando |

**Visualizações:**
- Linha: Tendência de cadastros diários
- Funil: Cadastro → Verificação → Primeiro uso → Pagamento
- Comparativo: Esta semana vs semana anterior

---

### Dashboard 4: Engajamento e Atividade (Engagement)

**Objetivo:** Entender se os clientes estão usando o produto

| O que mostra | Por que importa |
|--------------|-----------------|
| Usuários Ativos Hoje (DAU) | Engajamento diário |
| Usuários Ativos na Semana (WAU) | Engajamento semanal |
| Usuários Ativos no Mês (MAU) | Base ativa mensal |
| Proporção DAU/MAU | "Grudento" do produto (meta: >20%) |
| Sessões Ativas | Quantos estão online agora |
| Usuários por Conta | Densidade de uso |

**Visualizações:**
- Gráfico: Tendência DAU/WAU/MAU
- Mapa de calor: Atividade por hora/dia da semana
- Lista: Contas mais ativas vs Contas dormentes

---

### Dashboard 5: Churn e Retenção (Retention)

**Objetivo:** Monitorar e prevenir cancelamentos

| O que mostra | Por que importa |
|--------------|-----------------|
| Taxa de Churn | % de contas que cancelaram |
| Retenção de Receita | Quanto da receita foi mantida |
| Contas em Risco | Pagamentos atrasados |
| Dias sem Atividade | Contas dormentes |
| Velocidade de Cancelamento | Se está acelerando ou desacelerando |

**Alertas automáticos:**
- Contas sem login há 14+ dias
- Pagamentos atrasados há 3+ dias
- Pico de cancelamentos acima da média

**Visualizações:**
- Análise de Coorte: Retenção mês a mês
- Gráfico: Tendência de churn (últimos 12 meses)
- Lista: Contas em risco para ação proativa

---

## Decisões e Preferências

| O que decidimos | Por quê |
|-----------------|---------|
| Separar em 5 dashboards | Cada um tem objetivo diferente, evita poluição visual |
| Priorizar Visão Executiva e Churn | São os mais críticos para decisões rápidas |
| Permitir filtro por período | Flexibilidade para análises diferentes |
| Usar cores semânticas | Verde (bom), Vermelho (ruim), Amarelo (atenção) |
| Cards clicáveis | Cada métrica abre detalhamento |

---

## Dúvidas que Ficaram

- [ ] Quais métricas específicas do negócio seriam relevantes além das genéricas de SaaS?
- [ ] Existe necessidade de alertas por email/notificação?
- [ ] O cohort analysis é prioridade ou pode ficar para depois?
- [ ] Precisa de comparativo com metas/OKRs?

---

## Próximo Passo

**Se quiser transformar isso em feature:**
Execute `/feature` e use este documento como base para a conversa inicial.

**Descrição sugerida para o `/feature`:**
> Criar dashboards de métricas no Manager para o owner do SaaS acompanhar receita, churn, crescimento e engajamento

---

## Priorização Sugerida

| Prioridade | Dashboard | Justificativa |
|------------|-----------|---------------|
| P0 | Visão Executiva | Essencial para decisões rápidas |
| P0 | Churn e Retenção | Crítico para sustentabilidade |
| P1 | Receita | Saúde financeira |
| P1 | Crescimento | Pipeline de novos clientes |
| P2 | Engajamento | Otimização do produto |

---

## Arquivos Relacionados (Referência)

| Arquivo | O que faz |
|---------|-----------|
| [manager.service.ts](apps/backend/src/api/modules/manager/manager.service.ts) | Serviço com métricas atuais |
| [metrics.tsx](apps/manager/src/pages/metrics.tsx) | Página de métricas atual |
| [SubscriptionTable.ts](libs/app-database/src/types/SubscriptionTable.ts) | Estrutura de assinaturas |
| [PlanPriceTable.ts](libs/app-database/src/types/PlanPriceTable.ts) | Estrutura de preços |

---

*Documento de brainstorm - pode ser usado como input para `/feature`*
