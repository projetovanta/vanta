#!/bin/bash
# Hook: PostToolUse → qualquer tool
# MONITOR DE CONTEXTO — avisa quando a conversa está ficando pesada.
#
# Como funciona:
# - Conta o número de tool calls feitas na sessão (proxy do tamanho do contexto)
# - A cada 50 calls, estima o nível de peso
# - Quando atinge ~90% do limite estimado, PARA TUDO e avisa
#
# Limites estimados (baseado no modelo Opus com 200k context):
# - Até 80 tool calls: zona verde (conversa normal)
# - 80-120 tool calls: zona amarela (ficando pesada)
# - 120-150 tool calls: zona laranja (considerar /compact ou /clear)
# - 150+: zona vermelha (PARAR — risco de perda de contexto)

COUNTER_FILE="/tmp/vanta_context_counter"

# Incrementar contador
if [ -f "$COUNTER_FILE" ]; then
  COUNT=$(cat "$COUNTER_FILE" 2>/dev/null)
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi
echo "$COUNT" > "$COUNTER_FILE"

# Zona verde — silêncio total (até 60%)
if [ "$COUNT" -le 50 ]; then
  exit 0
fi

ALERTAS=""

# Zona amarela (60-75%)
if [ "$COUNT" -ge 51 ] && [ "$COUNT" -le 80 ]; then
  # Avisar a cada 15 calls
  if [ $((COUNT % 15)) -eq 0 ]; then
    ALERTAS="⚠️ CONTEXTO 60%%: ${COUNT} interações. Conversa ficando pesada. Considere finalizar o bloco atual, atualizar memórias e usar /compact."
  fi
fi

# Zona laranja (75-90%)
if [ "$COUNT" -ge 81 ] && [ "$COUNT" -le 120 ]; then
  # Avisar a cada 10 calls
  if [ $((COUNT % 10)) -eq 0 ]; then
    ALERTAS="🟠 CONTEXTO PESADO: ${COUNT} interações. RECOMENDADO: finalizar bloco atual, atualizar memórias/sessao_atual.md, e usar /compact ou /clear antes de continuar."
  fi
fi

# Zona vermelha — PARAR
if [ "$COUNT" -ge 151 ]; then
  # Avisar a cada 5 calls
  if [ $((COUNT % 5)) -eq 0 ]; then
    ALERTAS="🔴 CONTEXTO CRÍTICO: ${COUNT} interações! PARAR o que está fazendo. Salvar memórias AGORA. Atualizar sessao_atual.md. Usar /clear para nova sessão. Risco de perda de contexto e degradação de qualidade."
  fi
fi

# Emitir
if [ -n "$ALERTAS" ]; then
  jq -n --arg alertas "$ALERTAS" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: $alertas
    }
  }'
fi

exit 0
