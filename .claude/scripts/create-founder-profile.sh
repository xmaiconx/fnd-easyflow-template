#!/bin/bash

# Script para criar o documento de perfil do founder/stakeholder
# Uso: bash .claude/scripts/create-founder-profile.sh

set -e

PROFILE_FILE="docs/founder_profile.md"

# Verifica se o perfil já existe
if [ -f "$PROFILE_FILE" ]; then
    echo "⚠️  Perfil já existe em $PROFILE_FILE"
    echo "STATUS: EXISTS"
    echo "PATH: $PROFILE_FILE"
    exit 0
fi

# Cria diretório docs se não existir
mkdir -p docs

# Cria o template do perfil
cat > "$PROFILE_FILE" << 'EOF'
# Perfil do Founder/Stakeholder

> **Status:** Pendente
> **Última atualização:** [DATA]

---

## Identificação

**Nome:** [Nome do stakeholder]
**Papel:** [Founder / Co-founder / Gestor / Product Owner / etc.]

---

## Nível Técnico

### Classificação
- [ ] **Leigo** - Não tem experiência com desenvolvimento
- [ ] **Básico** - Entende conceitos gerais de tecnologia
- [ ] **Intermediário** - Tem noções de programação ou já trabalhou com devs
- [ ] **Técnico** - Desenvolvedor ou background técnico forte

### Indicadores
- **Experiência com desenvolvimento:** [Nunca / Superficial / Alguma / Profissional]
- **Familiaridade com termos técnicos:** [Nenhuma / Básica / Boa / Avançada]
- **Experiência prévia com projetos de software:** [Nenhuma / 1-2 projetos / Vários / Muitos]

---

## Background Profissional

**Área de atuação:** [Área principal]
**Experiência empreendedora:** [Primeiro negócio / Já empreendeu antes / Empreendedor serial]
**Experiência com produtos digitais:** [Nenhuma / Usuário avançado / Já lançou produto]

---

## Preferências de Comunicação

### Estilo Preferido
- [ ] **Simplificado** - Explicações em linguagem do dia-a-dia, sem jargões
- [ ] **Balanceado** - Termos técnicos quando necessário, com explicações
- [ ] **Técnico** - Pode usar terminologia técnica livremente

### Nível de Detalhe
- [ ] **Alto nível** - Foco no "o quê", não no "como"
- [ ] **Moderado** - Quer entender decisões importantes
- [ ] **Detalhado** - Quer acompanhar decisões técnicas

---

## Contexto do Projeto

**Motivação principal:** [Por que está construindo este produto]
**Urgência:** [Explorando / Validando ideia / Precisa lançar logo]
**Disponibilidade:** [Dedicação parcial / Full-time no projeto]

---

## Expectativas

**O que espera do processo de desenvolvimento:**
[Expectativas do stakeholder]

**Preocupações principais:**
[Medos ou preocupações sobre o projeto]

---

## Notas Adicionais

[Observações relevantes sobre o stakeholder]

---

## Histórico de Alterações

| Data | Alteração |
|------|-----------|
| [DATA] | Criação inicial |

EOF

echo "✅ Perfil criado com sucesso!"
echo "STATUS: CREATED"
echo "PATH: $PROFILE_FILE"
