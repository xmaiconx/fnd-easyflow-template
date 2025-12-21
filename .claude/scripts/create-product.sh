#!/bin/bash

# Script para criar o documento Product Blueprint inicial
# Uso: bash .claude/scripts/create-product.sh

set -e

PRODUCT_FILE="docs/product.md"

# Function to check Product Blueprint completion status
check_product_status() {
    local file="$1"
    local filled_sections=0
    local total_sections=6

    # Check each major section for content (placeholders indicate unfilled)
    ! grep -q "\[Descrição do produto\]" "$file" 2>/dev/null && ((filled_sections++)) || true
    ! grep -q "\[Público-alvo\]" "$file" 2>/dev/null && ((filled_sections++)) || true
    ! grep -q "\[Feature 1\]" "$file" 2>/dev/null && ((filled_sections++)) || true
    ! grep -q "\[Tipo de usuário\]" "$file" 2>/dev/null && ((filled_sections++)) || true
    ! grep -q "\[Integração\]" "$file" 2>/dev/null && ((filled_sections++)) || true
    ! grep -q "\[Feature mais importante\]" "$file" 2>/dev/null && ((filled_sections++)) || true

    echo "$filled_sections/$total_sections"
}

# Verifica se o Product Blueprint já existe
if [ -f "$PRODUCT_FILE" ]; then
    COMPLETION=$(check_product_status "$PRODUCT_FILE")

    echo "========================================"
    echo "RESULT"
    echo "========================================"
    echo "STATUS: EXISTS"
    echo "PATH: $PRODUCT_FILE"
    echo "COMPLETION: $COMPLETION sections filled"
    echo ""

    # List pending sections
    echo "PENDING_SECTIONS:"
    grep -q "\[Descrição do produto\]" "$PRODUCT_FILE" 2>/dev/null && echo "  - 1. O Produto (Product description)"
    grep -q "\[Feature 1\]" "$PRODUCT_FILE" 2>/dev/null && echo "  - 2. O que o MVP faz (MVP features)"
    grep -q "\[Tipo de usuário\]" "$PRODUCT_FILE" 2>/dev/null && echo "  - 3. Quem usa (User types)"
    grep -q "\[Feature mais importante\]" "$PRODUCT_FILE" 2>/dev/null && echo "  - 5. Roadmap (Implementation order)"
    echo ""
    echo "NEXT_ACTION: Fill pending sections in Blueprint"
    echo "========================================"
    exit 0
fi

# Cria diretório docs se não existir
mkdir -p docs

# Cria o template do Blueprint
cat > "$PRODUCT_FILE" << 'EOF'
# Product Blueprint

> **Status:** Em Discovery
> **Última atualização:** [DATA]
> **Versão:** 1.0

---

## 1. O Produto

### O que é?
[Descrição do produto em 2-3 frases - o que faz e qual valor entrega]

### Para quem?
[Público-alvo principal - quem vai usar e se beneficiar]

### Que problema resolve?
[A dor principal que o produto endereça]

---

## 2. O que o MVP faz

### Funcionalidades Principais

| # | Feature | Por que é essencial |
|---|---------|---------------------|
| 1 | [Feature 1] | [Justificativa] |
| 2 | [Feature 2] | [Justificativa] |
| 3 | [Feature 3] | [Justificativa] |
| 4 | [Feature 4] | [Justificativa] |

### O que NÃO faz (fica para depois)

| Feature | Motivo |
|---------|--------|
| [Feature futura 1] | [Por que não é MVP] |
| [Feature futura 2] | [Por que não é MVP] |

---

## 3. Quem usa

### Tipos de Usuário

| Tipo | Descrição | O que pode fazer |
|------|-----------|------------------|
| [Tipo de usuário 1] | [Quem é] | [Permissões principais] |
| [Tipo de usuário 2] | [Quem é] | [Permissões principais] |

### Multi-tenancy
- [ ] Sim - Múltiplas empresas/contas usam o sistema isoladamente
- [ ] Não - Sistema single-tenant

---

## 4. Integrações

### Necessárias para o MVP

| Integração | Propósito |
|------------|-----------|
| [Integração 1] | [Para que serve] |
| Email (Resend) | Já incluso no template |

### Futuras (pós-MVP)

- [Integração futura 1] - [Propósito]
- [Integração futura 2] - [Propósito]

---

## 5. Roadmap de Implementação

### Fase 1 - Core (sem isso não funciona)

| Ordem | Feature | Depende de |
|-------|---------|------------|
| 1 | [Feature mais importante] | - |
| 2 | [Segunda mais importante] | #1 |

### Fase 2 - Essencial (para ir ao mercado)

| Ordem | Feature | Depende de |
|-------|---------|------------|
| 3 | [Feature] | #1, #2 |
| 4 | [Feature] | - |

### Fase 3 - Nice to have (pode vir depois)

| Ordem | Feature | Valor |
|-------|---------|-------|
| 5 | [Feature] | [Alto/Médio/Baixo] |
| 6 | [Feature] | [Alto/Médio/Baixo] |

---

## 6. Decisões Importantes

| Decisão | Escolha | Por quê |
|---------|---------|---------|
| [Decisão 1] | [O que decidimos] | [Justificativa] |
| [Decisão 2] | [O que decidimos] | [Justificativa] |

---

## Histórico de Alterações

| Data | Versão | Alteração | Autor |
|------|--------|-----------|-------|
| [DATA] | 1.0 | Criação inicial | [Nome] |

EOF

echo "✅ Blueprint criado com sucesso!"

# === STRUCTURED OUTPUT FOR AGENT ===
echo ""
echo "========================================"
echo "RESULT"
echo "========================================"
echo "STATUS: CREATED"
echo "PATH: $PRODUCT_FILE"
echo "COMPLETION: 0/6 sections filled"
echo ""
echo "SECTIONS_TO_FILL:"
echo "  1. O Produto (O que é, Para quem, Problema)"
echo "  2. O que o MVP faz (Features principais e excluídas)"
echo "  3. Quem usa (Tipos de usuário, Multi-tenancy)"
echo "  4. Integrações (Necessárias e futuras)"
echo "  5. Roadmap (Ordem de implementação)"
echo "  6. Decisões Importantes (Escolhas e justificativas)"
echo ""
echo "PRIORITY_SECTIONS:"
echo "  - HIGH: 1. O Produto, 2. O que o MVP faz"
echo "  - MEDIUM: 3. Quem usa, 5. Roadmap"
echo "  - LOW: 4. Integrações, 6. Decisões"
echo ""
echo "NEXT_ACTION: Start discovery conversation"
echo "========================================"
