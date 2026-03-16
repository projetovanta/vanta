# PROTOCOLO DE REPORTE DE ERROS — OBRIGATÓRIO
# Todo agente DEVE seguir este protocolo. Sem exceção.
# Nenhum erro, por menor que seja, pode ser ignorado ou corrigido silenciosamente.

---

## REGRA FUNDAMENTAL

**É MELHOR reportar 100 erros pequenos do que esconder 1 erro grave.**

O Dan PRECISA saber de TUDO que acontece. Transparência total.
Agente que esconde erro está SABOTANDO o projeto.

---

## FORMATO PADRÃO DE REPORTE

```
🚨 ERRO DETECTADO
━━━━━━━━━━━━━━━━
Severidade: [🟢 VERDE | 🟡 AMARELO | 🔴 VERMELHO]
Agente: [nome do agente]
Timestamp: [data e hora]
━━━━━━━━━━━━━━━━

O que aconteceu:
[Descrição clara e objetiva do erro]

Onde:
[Arquivo, linha, comando, ou contexto específico]

Impacto:
[O que isso afeta no projeto]

Causa provável:
[Por que aconteceu — se souber. Se não souber, dizer "causa desconhecida"]

Sugestão de correção:
[Como resolver — proposta, NÃO execução]

Preciso de ajuda do Dan: [SIM/NÃO]
Posso continuar trabalhando enquanto isso: [SIM/NÃO]
```

---

## CLASSIFICAÇÃO DE SEVERIDADE

### 🟢 VERDE — Informativo
- Aviso menor, não bloqueia nada
- Exemplo: "Arquivo de memória X está vazio"
- Ação: Reportar e continuar (se autorizado)

### 🟡 AMARELO — Atenção necessária
- Problema que precisa ser resolvido, mas não é urgente
- Exemplo: "Conflito entre MEMORIA-COMPARTILHADA.md e ata de ontem"
- Ação: Reportar e ESPERAR orientação do Dan

### 🔴 VERMELHO — Parar tudo
- Problema grave, risco de dano ao projeto
- Exemplo: "Migration vai deletar tabela com dados de produção"
- Ação: Reportar, NÃO FAZER NADA, esperar Dan

---

## O QUE DEVE SER REPORTADO (lista não-exaustiva)

### Erros Técnicos
- Comando falhou (npm, git, qualquer coisa)
- Build quebrou
- Teste falhou
- Tipo errado (TypeScript)
- Dependência não encontrada
- API retornou erro

### Erros de Contexto
- Memória não encontrada
- Memória desatualizada
- Conflito entre memórias
- Decisão anterior contradiz pedido atual
- Informação faltando pra completar a tarefa

### Erros de Processo
- Gate Duplo não cumprido
- Ata não registrada
- Agente errado pra tarefa
- Escopo mudou sem autorização
- Comunicação falhou entre agentes

### Incertezas (SIM, reportar incertezas!)
- "Não tenho certeza se é isso que o Dan quis dizer"
- "Não sei qual abordagem é melhor"
- "Existe mais de uma forma de resolver e não sei qual o Dan prefere"
- "Não encontrei informação suficiente pra responder"

---

## FLUXO DE TRATAMENTO

```
1. Erro detectado
   ↓
2. Classificar severidade (🟢/🟡/🔴)
   ↓
3. Reportar ao Dan (formato padrão)
   ↓
4. Se 🔴 → PARAR tudo. Esperar Dan.
   Se 🟡 → Esperar orientação. Pode continuar em outras tarefas.
   Se 🟢 → Informar e continuar (se já autorizado).
   ↓
5. Dan decide como resolver
   ↓
6. Agente executa a correção (com autorização)
   ↓
7. Registrar em APRENDIZADOS.md (seção "Erros a NUNCA Repetir")
   ↓
8. Memo registra na ata do dia
```

---

## REGRAS ABSOLUTAS

1. **NUNCA esconder erro** — mesmo que pareça bobagem
2. **NUNCA corrigir sozinho** — sempre avisar ANTES
3. **NUNCA minimizar** — "ah, é só um warning" → reportar igual
4. **NUNCA assumir que o Dan sabe** — se teve erro, FALAR
5. **NUNCA continuar após 🔴** — parar e esperar
6. **NUNCA culpar outro agente** — fatos, não acusações
7. **SEMPRE registrar** — ata + APRENDIZADOS.md
8. **SEMPRE propor solução** — mesmo que simples
9. **SEMPRE ser honesto** — "não sei" é aceitável, mentir NUNCA
10. **SEMPRE em português do Brasil**
