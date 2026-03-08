#!/bin/bash
# Hook: PostToolUse → Bash
# Após git push, verifica:
# 1. Push teve sucesso (exit code)
# 2. Commit está no GitHub
# 3. Deploy Vercel iniciou
# Emite avisos para eu verificar.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
EXIT_CODE=$(echo "$INPUT" | jq -r '.tool_output.exit_code // 0')

# Detectar git push
if ! echo "$COMMAND" | grep -qE 'git\s+push'; then
  # Detectar git commit (lembrar de verificar)
  if echo "$COMMAND" | grep -qE 'git\s+commit'; then
    if [ "$EXIT_CODE" != "0" ]; then
      echo "🔴 COMMIT FALHOU (exit code $EXIT_CODE). NÃO reportar como feito ao usuário. Investigar o erro."
    else
      echo "✅ Commit criado. Lembrar: push + verificar deploy ANTES de reportar ao usuário."
    fi
  fi
  exit 0
fi

# Git push executado
if [ "$EXIT_CODE" != "0" ]; then
  echo "🔴 PUSH FALHOU (exit code $EXIT_CODE). NÃO reportar como feito ao usuário."
  echo "🔴 Investigar o erro. Se timeout → tentar novamente. Se rejeição → verificar branch."
  exit 0
fi

echo "✅ Push com sucesso. OBRIGATÓRIO verificar ANTES de reportar ao usuário:"
echo "  1. 'git log --oneline -1' → confirmar commit certo"
echo "  2. Aguardar 30s e rodar 'npx vercel ls 2>&1 | head -5' → verificar se deploy iniciou"
echo "  3. Se deploy deu erro → investigar e reportar ao usuário"
echo "  4. NUNCA dizer 'pushado com sucesso' sem verificar deploy"

exit 0
