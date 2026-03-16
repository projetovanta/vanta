#!/bin/bash
# Hook: PreToolUse → Bash
# SUBSTITUI block-dangerous-git.sh — cobre mais padrões
# Bloqueia: git destrutivo + SQL destrutivo + deploy + rm + commit sem Gate Duplo

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

DANGEROUS=""

# Git destrutivo
if echo "$COMMAND" | grep -qEi 'git\s+push\s+.*--force|git\s+push\s+-f\b'; then
  DANGEROUS="git push --force — pode sobrescrever trabalho remoto"
elif echo "$COMMAND" | grep -qEi 'git\s+reset\s+--hard'; then
  DANGEROUS="git reset --hard — descarta mudanças locais irreversivelmente"
elif echo "$COMMAND" | grep -qEi 'git\s+checkout\s+\.'; then
  DANGEROUS="git checkout . — descarta mudanças não commitadas"
elif echo "$COMMAND" | grep -qEi 'git\s+clean\s+-f'; then
  DANGEROUS="git clean -f — deleta arquivos não rastreados"
elif echo "$COMMAND" | grep -qEi 'git\s+branch\s+-[Dd]'; then
  DANGEROUS="git branch -D — deleta branch sem verificar merge"
elif echo "$COMMAND" | grep -qEi 'git\s+restore\s+\.'; then
  DANGEROUS="git restore . — descarta mudanças não commitadas"

# SQL destrutivo
elif echo "$COMMAND" | grep -qEi 'DROP\s+TABLE|DROP\s+DATABASE|TRUNCATE'; then
  DANGEROUS="SQL destrutivo detectado (DROP/TRUNCATE)"

# Deploy
elif echo "$COMMAND" | grep -qEi 'vercel\s+--prod|vercel\s+deploy'; then
  DANGEROUS="Deploy direto pra produção — precisa autorização"

# rm destrutivo
elif echo "$COMMAND" | grep -qEi 'rm\s+-rf\s+/|rm\s+-rf\s+\.\s|rm\s+-r\s+/'; then
  DANGEROUS="rm -rf em diretório raiz — potencialmente catastrófico"

# npm publish
elif echo "$COMMAND" | grep -qEi 'npm\s+publish'; then
  DANGEROUS="npm publish — publicação de pacote"

# supabase reset
elif echo "$COMMAND" | grep -qEi 'supabase\s+db\s+reset'; then
  DANGEROUS="supabase db reset — reseta banco inteiro"
fi

if [ -n "$DANGEROUS" ]; then
  jq -n --arg reason "$DANGEROUS" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("BLOQUEADO: comando destrutivo detectado.\n" + $reason + "\nPedir confirmação EXPLÍCITA do usuário antes de executar.")
    }
  }'
  exit 0
fi

# Gate Duplo no commit — checar marcador /tmp/vanta_gate_duplo_ok
if echo "$COMMAND" | grep -qEi 'git\s+commit'; then
  if [ ! -f /tmp/vanta_gate_duplo_ok ]; then
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "BLOQUEADO: git commit requer Gate Duplo (Lia ✅ + Memo ✅).\nApós aprovação, rodar: touch /tmp/vanta_gate_duplo_ok\nDepois tentar o commit novamente."
      }
    }'
    exit 0
  fi
  # Gate aprovado — limpar marcador (one-shot)
  rm -f /tmp/vanta_gate_duplo_ok
fi

exit 0
