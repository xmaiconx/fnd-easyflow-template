---
name: documentation-style
description: |
  Hub de estilos de documentação. Roteia para o estilo correto baseado no tipo de documento.
---

# Documentation Style Guide

Hub central para estilos de documentação. Cada tipo de documento segue um estilo otimizado.

## Roteamento de Estilos

| Documento | Estilo | Arquivo |
|-----------|--------|---------|
| plan.md, implementation.md, architecture | **Technical** | ./technical.md |
| design.md, UI specs | **Design** | ./design.md |
| about.md, discovery.md, brainstorm/ | **Business** | ./business.md |

**IMPORTANTE:** Carregar o arquivo de estilo correto ANTES de escrever documentação.

---

## Regras Universais

Aplicam-se a TODOS os estilos:

### Idioma
- **PT-BR:** Texto, explicações, documentação
- **EN:** Código, git (commits, branches), termos técnicos

### Proibições
- Emojis em headers
- Código >10 linhas (linkar arquivo)
- Conteúdo aspiracional ("futuramente", "idealmente")
- Duplicação de informação entre documentos
- TODOs sem owner/deadline

### Obrigações
- Paths concretos e verificáveis
- Versões explícitas quando relevante
- Máximo ~20 palavras por item de lista
- Máximo ~100 palavras por parágrafo

---

## Quick Reference

### Quando usar cada estilo

```
Technical → "COMO implementar" (estrutura, código, configs)
Design    → "COMO se parece" (layouts, fluxos, componentes UI)
Business  → "O QUE e POR QUE" (requisitos, decisões, contexto)
```

### Checklist Pré-Documentação

1. Identificar tipo de documento
2. Carregar estilo correto: `cat .claude/skills/documentation-style/[estilo].md`
3. Aplicar formato do estilo
4. Validar contra regras universais

---

## Arquivos de Estilo

- [./technical.md](./technical.md) - Specs técnicas, planos de implementação
- [./design.md](./design.md) - UX specs, layouts, componentes visuais
- [./business.md](./business.md) - Features, requisitos, brainstorms
