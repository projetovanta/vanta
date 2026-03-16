# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 18:34
# Memoria — Regras do Usuario

## Comunicacao
- Sempre portugues do Brasil
- Respostas curtas, sem enrolacao
- Zero suposicoes, zero alucinacoes
- O USUARIO e o unico decisor
- Quando usuario falar "dono" → interpretar como SOCIO do evento
- Quando usuario falar "dono da comunidade" → interpretar como GERENTE

## Fluxo Obrigatorio
1. Ler CLAUDE.md
2. Identificar modulo afetado
3. Ler memoria do modulo
4. Conferir regras + checklist
5. Codificar

## Proibicoes
- NUNCA remover codigo sem autorizacao
- NUNCA inventar tabelas/colunas
- NUNCA declarar "100%" sem auditoria
- NUNCA commit sem pedir
- NUNCA rodar supabase db push sem confirmar (mas CLAUDE.md diz autonomia total — seguir MEMORY.md regra 8)
- NUNCA ignorar um problema so porque nao foi causado pela minha edicao. Se o usuario pede pra corrigir algo, corrigir — independente de quem ou quando criou. Tem duvida? Perguntar. O USUARIO decide. Sem excecao.
- **NUNCA ignorar NENHUM erro, warning ou problema.** Fase final de producao e testes. Zero solucoes momentaneas. Zero aceitar erros como "esperado" ou "normal". Qualquer erro encontrado → consultar regras_usuario.md → perguntar ao usuario o que fazer usando AskUserQuestion. Sem excecao.

## REGRA CRITICA — Perguntas Interativas (definida 2026-03-06, atualizada 2026-03-07, CONFIRMADA 2026-03-07)
- **MODELO DEFINITIVO**: SEMPRE usar AskUserQuestion. SEM EXCECAO. NUNCA MAIS errar isso.
- TODAS as decisoes via multipla escolha INTERATIVA usando a ferramenta AskUserQuestion
- **SEMPRE usar AskUserQuestion** — NUNCA perguntar como texto normal na conversa
- Eu NUNCA decido sozinho. NUNCA assumo. NUNCA chuto.
- Sempre sugerir a melhor opcao baseada em evidencia de codigo real
- Se nao tem certeza → pesquisar no codigo ANTES de perguntar
- **PERGUNTAS INDEPENDENTES JUNTAS**: se as perguntas NAO dependem uma da outra, enviar TODAS juntas (4, 5, 6, 7... quantas forem). O usuario navega com setas < > entre elas. Se uma pergunta DEPENDE da resposta de outra → ai sim separar em rodadas.
- **MINIMO 4 OPCOES**: sempre oferecer pelo menos 4 opcoes (3 sugestoes + "Minha opiniao")
  - Opcao 1: recomendada (marcar com estrela) — baseada em evidencia real
  - Opcoes 2-3: alternativas viaveis com trade-offs claros
  - Ultima opcao: SEMPRE "Outra coisa" — usuario escreve o que quer
  - Cada opcao com descricao curta do que acontece
- **FORMATO**: usar AskUserQuestion com questions array (1 pergunta por vez)
  - question: pergunta curta e direta, sem termos tecnicos
  - header: max 12 chars
  - options: minimo 4 opcoes, ultima sempre "Outra coisa"
  - Opcao recomendada: primeira da lista com "(Recomendado)" no label
  - preview: descricao visual curta do resultado (sem codigo, sem nomes de arquivo)
- **GRANULARIDADE MAXIMA**: quebrar cada topico no MAXIMO de decisoes possiveis
  - Cada campo, cada acao, cada permissao, cada comportamento = 1 pergunta separada
  - Ex: "O produtor pode ajustar o percentual?" → 1 pergunta. "O produtor pode enviar mensagem?" → outra pergunta. NUNCA juntar.
  - Se um topico tem 8 detalhes → sao 8 perguntas sequenciais, NAO 1 pergunta com 8 sub-itens
  - Quanto mais granular, melhor. Na duvida, QUEBRAR MAIS.
- **LINGUAGEM**: sem termos tecnicos. Sem nomes de componentes, arquivos, funcoes. Falar como usuario/produto. O usuario NAO e programador nas perguntas — e dono do produto.
- NUNCA perguntar "correto/errado/falta algo" — isso NAO e opcao
- Se usuario diz "diferente": perguntar COM OPCOES o que e diferente

## REGRA CRITICA — Mapa do Projeto (definida 2026-03-06)
- Fase atual: MAPEAMENTO COMPLETO DO PROJETO
- DUAS CAMADAS:
  1. MAPA_PROJETO.md = documento unico com TODOS os fluxos acao->reacao->quem recebe->o que faz
  2. graph_*.md = memoria especifica de cada item/fluxo com detalhe tecnico
- Cada acao gera reacao. Mapear: como chega? quem recebe? o que faz? gera o que?
- Seguir ate nao ter mais consequencia
- Baseado em codigo e navegacao REAL (zero achismo)
- NAO corrigir nada durante o mapeamento — apenas documentar

## REGRA CRITICA — Entrega Completa (definida 2026-03-06)
- NUNCA entregar uma tarefa parcialmente. Toda entrega DEVE incluir TUDO que foi afetado:
  1. **Backend** (services, RPCs, tipos TS)
  2. **Frontend** (views, componentes, modais)
  3. **Supabase** (migrations, regenerar types/supabase.ts)
  4. **Memorias** (TODAS as memorias afetadas atualizadas)
- Se mudou backend sem frontend (ou vice-versa) → NAO ESTA PRONTO. Continuar ate completar.
- Se criou migration sem atualizar types/supabase.ts → NAO ESTA PRONTO.
- Se alterou fluxo sem atualizar memorias → NAO ESTA PRONTO.
- Checar ANTES de reportar ao usuario: "mudei algo em backend? frontend reflete? supabase types atualizado? memorias atualizadas?"

## REGRA CRITICA — Memorias (definida 2026-03-06)
- SEMPRE atualizar memorias ANTES de qualquer clear/encerramento
- NUNCA sugerir /clear se existir trabalho nao salvo em arquivo
- SEMPRE confirmar ao usuario que a memoria foi salva (com evidencia)
- Memorias sao do usuario tambem — ele deve ter acesso e visibilidade

## REGRA CRITICA — Documentacao no Mapeamento (definida 2026-03-06)
- NUNCA documentar algo como "existe" ou "OK" sem investigar no codigo ate ter CERTEZA
- Investigar = achar o arquivo, a funcao, a tabela, a coluna REAL
- Se nao achar apos investigacao completa → perguntar ao usuario. ELE decide o que fazer
- NUNCA assumir que algo funciona so porque um service exporta o metodo — verificar se e chamado e se a tabela/RPC existe
- Status OK = confirmado no codigo. A CONFIRMAR = encontrei referencia mas nao confirmei end-to-end. NAO EXISTE = investiguei e nao achei

## REGRA CRITICA — Checklist de Pendencias no Mapeamento (definida 2026-03-06)
- Durante o mapeamento, se algo NAO EXISTE, esta QUEBRADO, ou NAO FOI ENCONTRADO:
  - Registrar como item no checklist do grafo com status claro
  - Status possiveis: OK | NAO EXISTE | QUEBRADO | INCOMPLETO | A CONFIRMAR
  - Cada item deve ter: o que falta, onde deveria estar, impacto
  - NAO corrigir durante mapeamento — apenas documentar
  - Esses itens viram tarefas futuras depois do mapeamento completo

## REGRA CRITICA — Autenticacao de Mudancas (definida 2026-03-06)
- TODA mudanca registrada no Log de Mudancas do sessao_atual.md com timestamp
- Apos cada acao: verificar com stat que o arquivo existe e foi salvo
- Antes de confirmar ao usuario: reler o arquivo e validar que o conteudo esta correto
- Fluxo: fazer → stat → reler → validar → registrar no log → so entao confirmar ao usuario

## REGRA CRITICA — Rafa Convoca Equipe (definida 2026-03-16)
- Rafa (gerente-geral) NUNCA faz trabalho especializado sozinho
- SEMPRE convocar os agentes certos antes de qualquer decisao tecnica/visual/arquitetural
- Cada agente ASSINA sua contribuicao (ex: "— Luna, Frontend")
- Fluxo: Rafa convoca → especialistas analisam e reportam → Rafa consolida → pergunta ao Dan → Dan decide
- Dan e o UNICO decisor. Rafa coordena. Especialistas contribuem.
- Mesmo pra AskUserQuestion: ouvir especialistas ANTES de formular perguntas

## REGRA CRITICA — Ler Memorias Obrigatorio (definida 2026-03-16)
- SEMPRE ler TODAS as memorias de feedback (feedback_*.md) no inicio de cada sessao
- Antes de qualquer acao relevante: verificar se existe feedback aplicavel
- Se nao leu memorias → NAO agir. Ler primeiro. Sem excecao.

## REGRA CRITICA — Supabase: Migration Antes de Codigo (definida 2026-03-16)
- NUNCA escrever service/componente que referencia tabela nova sem ANTES ter aplicado a migration
- Ordem OBRIGATORIA: 1. Criar migration → 2. Aplicar no Supabase (MCP apply_migration) → 3. Gerar tipos (MCP generate_typescript_types) → 4. Salvar types/supabase.ts → 5. Codar service
- NUNCA usar `as any` pra contornar tipo inexistente — se TypeScript reclama, a migration nao foi aplicada
- SEMPRE consultar schema real (MCP list_tables ou execute_sql) antes de codar queries novas
- Plano envolve tabela/coluna nova? → migration PRIMEIRO, antes de qualquer linha de codigo
- Edge Functions novas → deploy IMEDIATO (nao "depois")

## Scripts Obrigatorios
- Antes de codificar: explore, deps, props, store-map
- Durante: diff-check
- Antes de entregar: preflight
- Gate obrigatorio: deep-audit apos correcoes

## Memoria Viva
- Atualizar ANTES de entregar
- Conflito memoria vs codigo → PARAR e perguntar
- ZERO exclusoes autonomas
- Sem changelog, so estado atual
- MEMORY.md maximo 180 linhas

## ARQUIVO CONGELADO — checklist_entrega.md
- `memory/checklist_entrega.md` e CONGELADO. PROIBIDO mexer, adicionar, editar, remover qualquer linha SEM autorizacao EXPRESSA do usuario.
- Se precisar mudar algo nesse arquivo → PARAR e pedir permissao. Sem excecao.
