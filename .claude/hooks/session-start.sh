#!/bin/bash
# Hook: SessionStart
# Carrega estado atual do projeto e injeta como contexto para o Claude.
# Lê: MEMORY.md (estado jabuticaba), sessao_atual.md (continuidade), pendências.

# Usar CLAUDE_PROJECT_DIR (definido pelo Claude Code) com fallback
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/Users/vanta/prevanta}"
MEMORY_DIR="$PROJECT_DIR/memory"
# Fallback: tentar path auto-discovery se nao existir
if [ ! -d "$MEMORY_DIR" ]; then
  MEMORY_DIR="$HOME/.claude/projects/-Users-vanta-prevanta/memory"
fi
SESSAO="$MEMORY_DIR/sessao_atual.md"
MEMORY="$MEMORY_DIR/MEMORY.md"

CONTEXT=""

# 1. Ler sessao_atual.md (o que foi feito na última sessão)
if [ -f "$SESSAO" ]; then
  SESSAO_CONTENT=$(cat "$SESSAO")
  CONTEXT="${CONTEXT}
=== ESTADO DA ÚLTIMA SESSÃO ===
${SESSAO_CONTENT}
"
fi

# 2. Extrair pendências do MEMORY.md (linhas com PENDÊNCIAS ou bloqueadas)
if [ -f "$MEMORY" ]; then
  PENDENCIAS=$(grep -A 1 "PENDÊNCIA\|bloqueada\|CRÍTIC" "$MEMORY" 2>/dev/null | head -20)
  if [ -n "$PENDENCIAS" ]; then
    CONTEXT="${CONTEXT}
=== PENDÊNCIAS ATIVAS ===
${PENDENCIAS}
"
  fi
fi

# 3. Contar memórias desatualizadas
if [ -f "$CLAUDE_PROJECT_DIR/scripts/memory-audit.mjs" ]; then
  AUDIT_OUT=$(cd "$CLAUDE_PROJECT_DIR" && node scripts/memory-audit.mjs 2>&1)
  MISSING=$(echo "$AUDIT_OUT" | grep -o '[0-9]* ausentes' | head -1)
  if [ -n "$MISSING" ] && [ "$MISSING" != "0 ausentes" ]; then
    CONTEXT="${CONTEXT}
=== MEMÓRIAS DESATUALIZADAS ===
${MISSING} — rodar 'npm run memory-audit' para detalhes.
"
  fi
fi

# 4. Lembrete de regras críticas
CONTEXT="${CONTEXT}
=== LEMBRETES ===
- LER TODAS as memórias de feedback (feedback_*.md) ANTES de qualquer ação — sem exceção
- Rafa NUNCA age sozinho — SEMPRE convocar especialistas (Luna, Kai, Iris, etc.) antes de decisões
- Fluxo: Rafa convoca → especialistas analisam e assinam → Rafa consolida → Dan decide
- Ler memória do módulo ANTES de codificar (CLAUDE.md regra)
- ZERO exclusões sem autorização do usuário
- Atualizar memórias ANTES de entregar cada ação
- Divergência memória vs código = PARAR e reportar ao usuário
- Atualizar sessao_atual.md ao final da sessão
- PERGUNTAS: SEMPRE usar AskUserQuestion — NUNCA perguntar como texto normal
  - Mínimo 4 opções (3 sugestões + 'Outra coisa')
  - Primeira opção = recomendada com '(Recomendado)'
  - Linguagem de produto, ZERO termos técnicos (sem nomes de arquivos/componentes/funções)
  - Granularidade máxima: 1 decisão = 1 pergunta
  - Perguntas independentes = enviar JUNTAS no mesmo AskUserQuestion
"

# Injetar como contexto
if [ -n "$CONTEXT" ]; then
  jq -n --arg ctx "$CONTEXT" '{
    "hookSpecificOutput": {
      "hookEventName": "SessionStart",
      "additionalContext": $ctx
    }
  }'
fi

exit 0
