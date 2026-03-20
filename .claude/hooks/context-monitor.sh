#!/bin/bash
# Hook: PostToolUse → qualquer tool
# MONITOR DE CONTEXTO — avisa quando a conversa está ficando pesada.
#
# Como funciona:
# - Conta o número de tool calls feitas na sessão (proxy do tamanho do contexto)
# - A cada N calls, estima o nível de peso
# - Quando atinge ~90% do limite estimado, PARA TUDO e avisa
#
# Limites calibrados para Opus 4.6 com 1M de contexto:
# - Até 250 tool calls: zona verde (conversa normal)
# - 250-400 tool calls: zona amarela (ficando pesada)
# - 400-600 tool calls: zona laranja (considerar /compact ou /clear)
# - 750+: zona vermelha (PARAR — risco de perda de contexto)

COUNTER_FILE="/tmp/vanta_context_counter"

# Incrementar contador
if [ -f "$COUNTER_FILE" ]; then
  COUNT=$(cat "$COUNTER_FILE" 2>/dev/null)
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi
echo "$COUNT" > "$COUNTER_FILE"

# Zona verde — silêncio total (até 250)
if [ "$COUNT" -le 250 ]; then
  exit 0
fi

ALERTAS=""

# Zona amarela (250-400)
if [ "$COUNT" -ge 251 ] && [ "$COUNT" -le 400 ]; then
  # Avisar a cada 50 calls
  if [ $((COUNT % 50)) -eq 0 ]; then
    ALERTAS="⚠️ CONTEXTO 60%%: ${COUNT} interações. Conversa ficando pesada. Considere finalizar o bloco atual, atualizar memórias e usar /compact."
  fi
fi

# Zona laranja (400-600)
if [ "$COUNT" -ge 401 ] && [ "$COUNT" -le 600 ]; then
  # Avisar a cada 30 calls
  if [ $((COUNT % 30)) -eq 0 ]; then
    ALERTAS="🟠 CONTEXTO PESADO: ${COUNT} interações. RECOMENDADO: finalizar bloco atual, atualizar memórias/sessao_atual.md, e usar /compact ou /clear antes de continuar."
  fi
fi

# Zona vermelha — PARAR
if [ "$COUNT" -ge 750 ]; then
  # Avisar a cada 15 calls
  if [ $((COUNT % 15)) -eq 0 ]; then
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
