#!/bin/bash

# Script para criar o documento de perfil do founder/stakeholder
# Uso: bash .claude/scripts/create-founder-profile.sh

set -e

PROFILE_FILE="docs/founder_profile.md"

# Function to check profile completion
check_profile_sections() {
    local file="$1"
    local filled=0
    local total=6

    # Check each section
    ! grep -q "\[Nome do stakeholder\]" "$file" 2>/dev/null && ((filled++)) || true
    ! grep -q "\- \[ \] \*\*Leigo\*\*" "$file" 2>/dev/null && ((filled++)) || true  # Technical level selected
    ! grep -q "\[Área principal\]" "$file" 2>/dev/null && ((filled++)) || true
    ! grep -q "\- \[ \] \*\*Simplificado\*\*" "$file" 2>/dev/null && ((filled++)) || true  # Communication style selected
    ! grep -q "\[Por que está construindo este produto\]" "$file" 2>/dev/null && ((filled++)) || true
    ! grep -q "\[Expectativas do stakeholder\]" "$file" 2>/dev/null && ((filled++)) || true

    echo "$filled/$total"
}

# Function to detect current communication style
detect_communication_style() {
    local file="$1"

    if grep -q "\- \[x\] \*\*Técnico\*\*" "$file" 2>/dev/null; then
        echo "TECHNICAL"
    elif grep -q "\- \[x\] \*\*Simplificado\*\*" "$file" 2>/dev/null; then
        echo "SIMPLIFIED"
    elif grep -q "\- \[x\] \*\*Balanceado\*\*" "$file" 2>/dev/null; then
        echo "BALANCED"
    else
        echo "NOT_SET"
    fi
}

# Verifica se o perfil já existe
if [ -f "$PROFILE_FILE" ]; then
    COMPLETION=$(check_profile_sections "$PROFILE_FILE")
    COMM_STYLE=$(detect_communication_style "$PROFILE_FILE")

    echo "========================================"
    echo "RESULT"
    echo "========================================"
    echo "STATUS: EXISTS"
    echo "PATH: $PROFILE_FILE"
    echo "COMPLETION: $COMPLETION sections filled"
    echo "COMMUNICATION_STYLE: $COMM_STYLE"
    echo ""

    # List pending sections
    echo "PENDING_SECTIONS:"
    grep -q "\[Nome do stakeholder\]" "$PROFILE_FILE" 2>/dev/null && echo "  - Identification (name, role)"
    grep -q "\- \[ \] \*\*Leigo\*\*" "$PROFILE_FILE" 2>/dev/null && echo "  - Technical Level (select one)"
    grep -q "\[Área principal\]" "$PROFILE_FILE" 2>/dev/null && echo "  - Professional Background"
    grep -q "\- \[ \] \*\*Simplificado\*\*" "$PROFILE_FILE" 2>/dev/null && echo "  - Communication Preferences (select style)"
    grep -q "\[Por que está construindo este produto\]" "$PROFILE_FILE" 2>/dev/null && echo "  - Project Context"
    grep -q "\[Expectativas do stakeholder\]" "$PROFILE_FILE" 2>/dev/null && echo "  - Expectations"
    echo ""
    echo "IMPACT_ON_AGENT:"
    echo "  - Communication style affects how Claude explains technical concepts"
    echo "  - Technical level determines amount of detail in responses"
    echo "  - Expectations help Claude prioritize what to communicate"
    echo ""
    echo "NEXT_ACTION: Fill pending sections for personalized communication"
    echo "========================================"
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

# === STRUCTURED OUTPUT FOR AGENT ===
echo ""
echo "========================================"
echo "RESULT"
echo "========================================"
echo "STATUS: CREATED"
echo "PATH: $PROFILE_FILE"
echo "COMPLETION: 0/6 sections filled"
echo "COMMUNICATION_STYLE: NOT_SET (defaults to BALANCED)"
echo ""
echo "SECTIONS_TO_FILL:"
echo "  1. Identificação (Nome, Papel)"
echo "  2. Nível Técnico (Leigo/Básico/Intermediário/Técnico)"
echo "  3. Background Profissional (Área, Experiência)"
echo "  4. Preferências de Comunicação (Simplificado/Balanceado/Técnico)"
echo "  5. Contexto do Projeto (Motivação, Urgência)"
echo "  6. Expectativas (O que espera, Preocupações)"
echo ""
echo "IMPACT_ON_AGENT:"
echo "  - SIMPLIFIED: Explains in everyday language, avoids jargon"
echo "  - BALANCED: Technical terms with explanations when needed"
echo "  - TECHNICAL: Free use of technical terminology"
echo ""
echo "PRIORITY_SECTIONS:"
echo "  - HIGH: Nível Técnico, Preferências de Comunicação"
echo "  - MEDIUM: Identificação, Expectativas"
echo "  - LOW: Background, Contexto"
echo ""
echo "NEXT_ACTION: Fill profile to enable personalized communication"
echo "========================================"
