---
name: documentation-style
description: |
  Guia de estilo para criação de documentação. SEMPRE seguir ao criar/atualizar qualquer documento do projeto.
---

# Guia de Estilo - Documentação

Toda documentação criada pelo agente DEVE seguir este padrão híbrido.

## Princípio

Documentação é código. Docs desatualizados enganam. Seja breve, específico e verificável.

---

## Regras Gerais

**Idioma:** PT-BR para texto | EN para código/git

**Brevidade:** ~100 palavras/parágrafo | ~20 palavras/item

**Especificidade:** Paths concretos | Versões explícitas | Zero termos vagos

**Proibido:** Emojis em headers | Código >10 linhas | Aspiracional | Duplicação

---

## Estrutura Híbrida (OBRIGATÓRIA)

Todo documento DEVE ter duas partes:

### Parte 1: Human-Readable (topo)
- Título e propósito (~2-3 linhas)
- Contexto essencial para humanos
- Regras fundamentais em texto corrido
- Separador `---` antes da próxima seção

### Parte 2: Token-Efficient (restante)
- JSON minificado em uma linha
- Arrays para listas de itens
- Zero redundância
- Máximo 10 palavras por descrição

---

## Spec (Token-Efficient)

> Formato para a Parte 2 dos documentos.

### Padrões JSON
```
Objeto: {"key":"value","nested":{"a":"b"}}
Array: [{"name":"X","desc":"10 palavras"}]
Lista: - [item] - [máx 10 palavras]
Fluxo: step1 → step2 → step3
```

### Quando Usar Cada Formato
{"tokenEfficient":["specs técnicas","context files","skills","commands"]}
{"humanReadable":["README","about.md","brainstorms","onboarding"]}

### Checklist Pré-Finalização
{"validar":["paths existem","versões corretas","sem duplicação","estrutura híbrida","brevidade"]}

### Anti-Patterns
[{"errado":"vários arquivos","correto":"listar paths explícitos"}]
[{"errado":"configurado no ambiente","correto":"nomear variáveis + arquivo"}]
[{"errado":"parágrafo extenso","correto":"dividir em subseções"}]
[{"errado":"TODO: documentar","correto":"documentar agora ou omitir"}]
