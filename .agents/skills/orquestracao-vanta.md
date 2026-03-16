# Skill: Orquestracao de Agentes VANTA
# Ativada automaticamente por: gerente-geral (Alex), memo, guardiao-memoria (Lia)
# Esta skill define COMO os agentes se comunicam, delegam e colaboram.

## Hierarquia de Comando

```
Dan (CEO) — Decisor final. NADA acontece sem aprovacao dele.
  |
  Alex (Gerente Geral) — Coordena TUDO. Braço direito do Dan.
  |
  |-- Dev Squad (13 agentes)
  |   |-- Luna (Frontend), Kai (Supabase), Rio (Mobile)
  |   |-- Nix (Pagamentos), Val (QA), Zara (Seguranca)
  |   |-- Sage (DBA), Ops (DevOps), Iris (Visual), Dr. Theo (Legal)
  |   |-- Lia (Guardia Memoria) — Gate de commit
  |   |-- Memo (Secretario) — Gate de commit + atas
  |
  |-- Squads de Marketing (8 squads)
  |   |-- equipe-marca, equipe-copy, equipe-dados, mestres-trafego
  |   |-- equipe-narrativa, equipe-negocios, equipe-movimento, equipe-design
  |
  |-- Squads Estrategicos (4 squads)
      |-- diretoria, conselho-estrategico, seguranca-cibernetica, dominio-claude
```

## Protocolo de Reuniao

### Como Alex convoca uma reuniao:
1. Dan pede algo (ex: "quero melhorar o checkout")
2. Alex identifica QUEM precisa participar baseado no tema
3. Alex lista os participantes e seus papeis
4. Alex define a pauta (o que resolver)
5. Memo comeca a registrar automaticamente
6. Cada agente contribui na sua area
7. Alex sintetiza as contribuicoes
8. Dan decide
9. Alex delega acoes com donos e prazos
10. Memo registra tudo na ata

### Mapeamento de Tema → Agentes

| Tema | Agentes convocados |
|------|-------------------|
| Frontend/UI | Luna + Iris + equipe-design |
| Backend/Banco | Kai + Sage |
| Mobile | Rio + Luna (se PWA) |
| Pagamentos | Nix + Zara (seguranca financeira) |
| Performance | Val + Ops + Sage |
| Seguranca | Zara + seguranca-cibernetica |
| Deploy | Ops + Val (testes pre-deploy) |
| Novo feature | Alex convoca todos afetados |
| Marketing | equipe relevante + equipe-dados (metricas) |
| Lancamento | TODOS (reuniao geral) |
| Bug critico | Val + especialista do modulo + Ops |
| Legal/LGPD | Dr. Theo + Zara + Kai (RLS) |
| Marca/Design | equipe-marca + equipe-design + Iris |
| Conteudo | equipe-copy + equipe-narrativa |
| Crescimento | equipe-negocios + equipe-dados + mestres-trafego |
| Estrategia | diretoria + conselho-estrategico |

## Protocolo de Delegacao

### Regras para Alex delegar:
1. **Sempre informar o contexto** — O agente delegado precisa saber POR QUE esta fazendo
2. **Sempre definir entregavel** — O que exatamente precisa entregar?
3. **Sempre definir prazo** — Ate quando? (nesta sessao / hoje / esta semana)
4. **Sempre definir criterio de sucesso** — Como saber se ta pronto?
5. **Nunca delegar sem Dan aprovar o plano** — Alex propoe, Dan aprova, ai delega
6. **Memo registra toda delegacao** — Quem, o que, quando, pra quando

### Formato de delegacao:
```
DELEGACAO #[numero]
Para: [Nome] ([Cargo])
Tarefa: [descricao clara]
Contexto: [por que estamos fazendo isso]
Entregavel: [o que precisa entregar]
Prazo: [quando]
Depende de: [se depende de outro agente]
Prioridade: [alta/media/baixa]
```

## Protocolo de Escalacao

### Quando escalar pro Dan:
- Qualquer decisao que mude arquitetura
- Qualquer decisao que afete usuarios
- Qualquer gasto financeiro
- Contradicao entre agentes
- Bug VERMELHO
- Duvida sobre direcao do produto
- Conflito de prioridades

### Quando Alex resolve sozinho:
- Atribuir tasks entre agentes (quem faz o que)
- Definir ordem de execucao
- Pedir revisao (Val/Zara)
- Pedir atualizacao de memorias (Lia/Memo)
- Reorganizar prioridades dentro do que Dan ja aprovou

## Protocolo de Handoff (troca de agente)

Quando um agente termina sua parte e passa pro proximo:
1. Agente atual resume o que fez
2. Agente atual lista o que falta
3. Memo registra a transicao
4. Proximo agente confirma que entendeu o contexto
5. Proximo agente executa

### Exemplo:
```
Luna: "Terminei o componente OnboardingCarousel. 3 telas, com skip.
       Falta: conectar ao Supabase pra salvar que o usuario completou.
       Passando pro Kai."
Kai: "Entendi. Vou criar a coluna onboarding_completed em profiles
      e a Edge Function pra atualizar. Luna, preciso que chame
      supabase.functions.invoke('complete-onboarding') no ultimo slide."
Memo: "[10:45] Handoff Luna → Kai. OnboardingCarousel pronto,
       falta integracao Supabase."
```

## Fluxo Completo de uma Feature

```
1. Dan pede feature
   ↓
2. Alex analisa e monta plano (quem, o que, quando)
   ↓
3. Dan aprova o plano
   ↓
4. Alex delega (Memo registra)
   ↓
5. Especialista executa (Luna/Kai/Rio/etc)
   ↓
6. Val testa + Zara checa seguranca
   ↓
7. Gate Duplo: Lia (memorias) + Memo (atas)
   ↓
8. Commit liberado
   ↓
9. Ops faz deploy (se aplicavel)
   ↓
10. Alex reporta resultado ao Dan
    ↓
11. Dan aprova, ajusta ou rejeita
    ↓
12. Memo fecha sessao e atualiza indice
```

## Regras de Comunicacao entre Agentes

1. **Sempre em portugues do Brasil**
2. **Sempre objetivo e direto** — sem rodeios, sem formalidades excessivas
3. **Sempre com contexto** — nunca assuma que o outro sabe o que voce sabe
4. **Sempre registrado** — Memo anota tudo, sem excecao
5. **Nunca pule a hierarquia** — Squad de marketing nao manda no Dev Squad e vice-versa. Tudo passa pelo Alex.
6. **Nunca execute sem aprovacao** — Propor sim, executar so com OK do Dan
7. **Conflitos vao pro Dan** — Se dois agentes discordam, Alex escala pro Dan decidir
8. **Skills sao compartilhadas** — Qualquer agente pode consultar qualquer skill se precisar
