#!/bin/bash
# Hook: PreToolUse → Edit, Write
# BLOQUEIA Rafa de atualizar memória de módulo que não é dele.
# Quem atualiza memória de módulo = o agente que trabalhou naquele módulo + Lia verifica.
# Rafa só pode atualizar: sessao_atual.md, MEMORY.md, feedback_*.md, e seus próprios arquivos.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

case "$TOOL_NAME" in
  Edit|Write) ;;
  *) exit 0 ;;
esac

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Só checar arquivos de memória
case "$FILE_PATH" in
  */memory/*) ;;
  *) exit 0 ;;
esac

BASENAME=$(basename "$FILE_PATH")

# Rafa PODE atualizar esses:
case "$BASENAME" in
  sessao_atual.md|MEMORY.md|feedback_*.md|regras_usuario.md)
    exit 0
    ;;
esac

# Rafa NÃO PODE atualizar memórias de módulo/sub/mapa/componentes/etc
# Essas são responsabilidade do agente especialista + Lia verifica
case "$BASENAME" in
  modulo_*|sub_*|mapa_*|graph_*|checklist_*|admin_*|home_*|event_*|checkout*|wallet*|profile*|search*|radar*|mensagens*|onboarding*|comunidade_*|componentes_*|graficos_*|services_*|painel_*|permissoes_*|categorias*|checkin_*|clube_*|regras_reembolso*|reviews*|relatorios*|infraestrutura*|plataformas*|responsividade*|push_*|rbac_*|projeto_*|mais_vanta_*|audit_*|EDGES.md)
    jq -n --arg file "$BASENAME" '{
      decision: "block",
      reason: ("BLOQUEADO — Rafa NAO atualiza memoria de modulo.\n\nRegra: Quem trabalhou no modulo atualiza a memoria dele. Lia verifica.\n\nVoce esta tentando editar: " + $file + "\n\nDelegue:\n- Se Luna editou frontend, Luna atualiza a memoria + Lia confere\n- Se Kai editou banco, Kai atualiza + Lia confere\n- Se Rafa precisa de atualizacao, peca ao especialista que fez a mudanca\n\nRafa so pode editar: sessao_atual.md, MEMORY.md, feedback_*.md, regras_usuario.md")
    }'
    exit 0
    ;;
esac

# Arquivos de memória não reconhecidos — avisar
jq -n --arg file "$BASENAME" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: ("Arquivo de memoria nao reconhecido: " + $file + ". Verifique se e responsabilidade do Rafa antes de editar.")
  }
}'
exit 0
