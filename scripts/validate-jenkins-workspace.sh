#!/bin/bash
# Validação de workspace Jenkins para Gestão Consultório

set -e

echo "🔍 Validando workspace Jenkins..."

# Verificar se TEMP_WORKSPACE está definido
if [ -z "$TEMP_WORKSPACE" ]; then
  echo "❌ TEMP_WORKSPACE não está definido"
  exit 1
fi

# Verificar se o diretório existe
if [ ! -d "$TEMP_WORKSPACE" ]; then
  echo "❌ Workspace não existe: $TEMP_WORKSPACE"
  exit 1
fi

# Verificar permissões
if [ ! -w "$TEMP_WORKSPACE" ]; then
  echo "❌ Sem permissão de escrita no workspace: $TEMP_WORKSPACE"
  exit 1
fi

echo "✅ Workspace validado com sucesso: $TEMP_WORKSPACE"
echo "📁 Diretório: $(ls -la "$TEMP_WORKSPACE" | wc -l) arquivos"
exit 0
