---
name: documentation-style
description: |
  Skill central de padrões de documentação. SEMPRE usar quando criar/atualizar documentos técnicos, specs, brainstorms ou qualquer markdown do projeto.
---

# Padrões de Documentação Técnica

Skill central que define padrões de escrita para TODA documentação do projeto. Todos os comandos que geram documentação DEVEM seguir estas diretrizes.

## Princípio Central

Documentação é código. Docs desatualizados são piores que nenhum doc - enganam e erodem confiança. Seja breve, específico e verificável.

---

## Regras de Formatação

### Idioma
- **Documentação técnica**: Português (PT-BR)
- **Código e termos técnicos**: Inglês (mantidos como estão)
- **Git (commits, branches)**: Inglês

### Brevidade
- **Máximo 100 palavras por parágrafo**
- **~50 palavras por conceito/seção**
- **~20 palavras por item de lista**
- Se precisar de mais, divida em subseções

### Especificidade
- SEMPRE mencionar arquivos/classes concretos com paths
- SEMPRE incluir versões de dependências
- NUNCA usar termos vagos como "vários serviços" ou "algumas classes"

### Proibições
- ❌ Emojis em headers (permitido apenas em corpo de texto quando relevante)
- ❌ Blocos de código extensos (máximo 5-10 linhas)
- ❌ Documentação aspiracional ("vai suportar X" - ainda não implementado)
- ❌ Duplicação de informação entre documentos

---

## Estrutura de Documentos

### Headers
```markdown
# Título Principal (H1) - apenas 1 por documento
## Seção Principal (H2)
### Subseção (H3)
#### Detalhe (H4) - usar com moderação
```

### Tabelas (preferir para comparações)
```markdown
| Aspecto | Opção A | Opção B |
|---------|---------|---------|
| [item]  | [valor] | [valor] |
```

### Listas (preferir para itens relacionados)
```markdown
- **Item**: Descrição breve (~20 palavras)
- **Item**: Descrição breve (~20 palavras)
```

### Checklists (preferir para validações)
```markdown
- [ ] Item pendente
- [x] Item concluído
```

---

## Padrões por Tipo de Documento

### Documentação Técnica (technical-spec.md, CLAUDE.md)

**Incluir:**
- Stack tecnológica com versões
- Paths de arquivos importantes
- Convenções de nomenclatura
- Padrões arquiteturais (descrição textual)
- Regras de negócio importantes

**Não incluir:**
- Blocos de código com implementações
- Exemplos de uso detalhados
- Controllers, DTOs, POCOs (apenas listar paths)
- Variáveis de ambiente detalhadas

**Formato para listar arquivos:**
```markdown
**[Categoria]** (path/base/)
- Arquivo.ts - Descrição em ~10 palavras
- OutroArquivo.ts - Descrição em ~10 palavras
```

### Documentação de Features (about.md, discovery.md)

**Incluir:**
- Problema/necessidade do usuário
- Decisões tomadas e justificativas
- Referências a arquivos relacionados

**Não incluir:**
- Detalhes de implementação (vai no implementation.md)
- Código fonte

### Documentação de Brainstorm

**Incluir:**
- Contexto da discussão
- Descobertas e insights
- Decisões e próximos passos

**Não incluir:**
- Jargões técnicos (API, endpoint, service)
- Detalhes de implementação

---

## Verificação de Qualidade

### Antes de Finalizar Documento

```markdown
## Checklist de Documentação

- [ ] **Brevidade**: Nenhum parágrafo excede 100 palavras
- [ ] **Especificidade**: Paths de arquivos são concretos e existem
- [ ] **Versões**: Dependências incluem números de versão
- [ ] **Idioma**: PT-BR para texto, EN para código/termos técnicos
- [ ] **Sem emojis**: Headers não contêm emojis
- [ ] **Sem código extenso**: Blocos de código ≤ 10 linhas
- [ ] **Atualizado**: Reflete estado ATUAL do código, não aspirações
```

### Comandos de Verificação
```bash
# Verificar se paths mencionados existem
grep -oP '`[^`]+\.(ts|js|json)`' [documento.md] | while read f; do
  path=$(echo $f | tr -d '`')
  [ ! -f "$path" ] && echo "Path não existe: $path"
done
```

---

## Anti-Patterns (Evitar)

| Errado | Correto |
|--------|---------|
| "O sistema usa vários serviços" | "Serviços: AuthService, WorkspaceService em apps/backend/src/api/modules/" |
| "Configurado via ambiente" | "Variáveis: DATABASE_URL, REDIS_URL em .env.example" |
| "Funciona com o banco de dados" | "PostgreSQL 15 + Kysely 0.27 em libs/app-database/" |
| Parágrafo de 200 palavras | Dividir em 2-3 subseções de ~60 palavras |
| "TODO: documentar depois" | Documentar agora ou não mencionar |

---

## Racionalizações Comuns (e Realidade)

| Desculpa | Realidade |
|----------|-----------|
| "Vou documentar depois" | Depois nunca chega. Faça agora. |
| "É só uma pequena mudança" | Pequenas mudanças acumulam. |
| "O código é auto-documentado" | Arquitetura e "por quê" não estão no código. |
| "Todo mundo sabe disso" | Você do futuro e assistentes IA não sabem. |
