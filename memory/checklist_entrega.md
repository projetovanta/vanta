# Checklist de Entrega — GOVERNANCA NIVEL EXTREMA

## Gatilho
Usuario diz: "OLHA A MEMORIA DE ENTREGA"

## Regra
Antes de entregar qualquer tarefa, executar TODOS os passos na ordem. PROIBIDO ERRAR. Se qualquer passo falhar: PARAR, corrigir, recomecar do passo 1.

## Passos — A CADA ENTREGA (rapido, so o que mudou)

1. `npm run diff-check` — TSC + ESLint + layout + memory-audit nos arquivos alterados (~20s)
2. Verificar migrations — confirmar que aplicaram no Supabase sem erro
3. Atualizar memorias — TODAS as camadas afetadas:
   - Modulos (`modulo_*.md`) — tabelas, services, fluxos, checklist
   - Sub-modulos (`sub_*.md`) — features especificas, RPCs, views
   - `EDGES.md` — se mudou schema, store ou RPC → atualizar consumers
   - Mapas (`mapa_*.md`) — infraestrutura, UI, operacoes, RBAC, financeiro, social
   - Componentes (`componentes_compartilhados.md`) — se criou/removeu/renomeou componente
   - Fluxos (`MAPA_PROJETO.md`) — se mudou fluxo acao→reacao→quem recebe→o que faz
   - `sessao_atual.md` — estado atual, mudancas nao commitadas, pendencias
   - `MEMORY.md` — indice, commit, contagem migrations, stack info
4. `npm run memory-audit` — verificar coerencia memoria vs codigo

## Passos — NO COMMIT/PUSH (projeto todo, antes de deploy)

5. `npm run preflight` — TSC completo + imports + hooks + optional chaining + build
6. `npm run deep-audit` — TSC + ESLint + schema Supabase vs queries + imports + exports
7. `npm run full-audit` — security + quality + dead code + bundle + store + bridge + privacy

## Formato da resposta
Extremamente objetivo. Sem explicacoes longas. Sem citar arquivos. Sem citar codigo.
Apenas: "Passos 1 a 4 realizados com sucesso." (entrega) ou "Passos 1 a 7 realizados com sucesso." (commit)
Se teve erro: informar qual passo falhou, corrigir, recomecar do 1.
