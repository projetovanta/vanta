# CLAUDE.md — Regras do Projeto prevanta

## Idioma
Sempre responder em português do Brasil.

## ⚠️ FLUXO OBRIGATÓRIO — Antes de QUALQUER ação

```
1. Ler este CLAUDE.md (já carregado)
2. Identificar qual módulo/página será afetado
3. Consultar MEMORY.md → achar o modulo_*.md ou sub_*.md correto
4. Ler a memória modular → ver tabelas, services, fluxos, checklist
5. Se mudar schema/store/RPC → consultar EDGES.md → identificar TODOS os consumers afetados
6. Voltar aqui → conferir REGRAS DE EXECUÇÃO + CHECKLIST
8. Só ENTÃO codificar
```
**Se não leu a memória do módulo → NÃO COMEÇAR a codificar.**

## 🔴 REGRAS DE EXECUÇÃO

### Dados
- **Supabase = ÚNICA fonte da verdade.** ZERO mocks. Todo novo código lê/grava direto no Supabase.
- Datas: ISO 8601 com offset `-03:00`. NUNCA `new Date().toISOString()` pro banco.
- Usar: `new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00'`

### TypeScript
- `npx tsc --noEmit` deve retornar 0 erros antes de qualquer entrega.

### Regras Absolutas
- ZERO suposições/alucinações. ZERO decisões autônomas. ZERO remoções sem autorização.
- **O USUÁRIO é o único decisor.** Eu NUNCA decido sozinho o que mudar, deletar, corrigir ou adaptar. Eu reporto o que encontrei (resumido + motivo) e ESPERO autorização. Sem exceção.
- **NUNCA REMOVER código/campo/coluna/memória sem autorização EXPLÍCITA.** Encontrou algo que parece obsoleto? Reportar resumido e esperar SIM antes de agir.
- **NUNCA declarar "100%" ou "completo" sem auditoria profunda.**
- **NUNCA INVENTAR tabelas/colunas/funções.** Consultar schema real (migrations, Supabase Dashboard) antes.
- **NUNCA rodar `supabase db push`** sem confirmação explícita do usuário.
- Se falta info → avisar. Se conflito → perguntar. Se conflito com memória → PARAR, apresentar opções.

### Memória Viva — Protocolo de Atualização
- **REGRA #1: Atualizar memória ANTES de entregar cada ação.** Se mudei algo num módulo, a memória desse módulo DEVE refletir a mudança ANTES de eu reportar ao usuário que terminei. Sem exceção.
- **REGRA #2: Conflito memória vs código = PARAR e reportar.** Se a memória diz X e o código diz Y → **NÃO tomar decisão sozinho. NÃO corrigir nada.** Reportar ao usuário: "Encontrei divergência: memória diz X, código diz Y. Qual é o correto?" O USUÁRIO decide. SEMPRE.
- **REGRA #3: ZERO exclusões autônomas.** NUNCA deletar arquivo, código, coluna, memória ou qualquer dado sem autorização EXPLÍCITA do usuário. Encontrou algo que parece obsoleto? Reportar: "Encontrei X que parece não ser mais usado porque Y. Posso remover?" Esperar SIM antes de agir.
- **REGRA #4: Sem changelog, sem logs acumulativos.** Memórias contêm APENAS o estado ATUAL. Nunca "em 2026-03-01 fizemos X". Só "X funciona assim."
- **Conflito detectado** (memória diz X, usuário diz Y): **PARAR TUDO**. Mostrar ao usuário: "Na memória está definido que X. Você está dizendo Y. Atualizo a memória?" Esperar resposta antes de continuar.
- **REGRA #5: MEMORY.md máximo 180 linhas.** Se passar, mover blocos para memórias específicas antes de continuar. Nunca deixar ultrapassar 200L (truncamento automático).
- **NUNCA sobrescrever memória silenciosamente.** Toda alteração de definição existente requer confirmação.
- **NUNCA adicionar à memória algo que já está definido de outra forma.** Primeiro verificar se já existe, depois decidir com o usuário se atualiza ou mantém.

### Layout — Regras Críticas
- **ZERO scroll horizontal** — tudo cabe na tela do usuário.
- **Zero valores fixos de largura** — usar %, flex, `w-full`, `min-w-0`, `truncate`.
- **Mobile-first** (iOS, Android, browser mobile). Desktop: `max-w` proporcional.
- Textos longos: sempre `truncate` ou `line-clamp-N`.
- Modais: `absolute inset-0` (nunca `fixed inset-0` ou `w-screen`).
- Exceção: páginas standalone podem usar `h-screen` e `fixed inset-0`.

### Contêiner Master (App.tsx)
- **Outer**: `fixed inset-0 flex flex-col items-center overflow-hidden bg-[#050505]`
- **Inner**: `w-full flex-1 overflow-hidden flex flex-col bg-[#0A0A0A]`
  - App normal: `max-w-[500px]`. Painel Admin: `max-w-4xl` sempre
  - Desktop ≥768px: sidebar `w-56` fixa. Mobile: sidebar colapsável `w-14`/`w-48`

### Regra de Scroll — FocusViews (CRÍTICA)
App.tsx aplica `overflow-hidden` quando `isFocusView = true`. Todo componente DEVE gerenciar seu próprio scroll:
```
✅ <div className="absolute inset-0 flex flex-col overflow-hidden">
     <div className="flex-1 overflow-y-auto no-scrollbar">

❌ <div className="min-h-full">  ← scroll travado
```

### UI
- NUNCA `<select>` HTML nativo → sempre dropdown/modal Vanta
- TODA ação deve mostrar toast/modal de feedback. ZERO ações silenciosas
- Ações destrutivas: modal "Tem certeza?" antes
- Scroll horizontal de tabs: `overflow-x-auto snap-x no-scrollbar` + `shrink-0`
- Safe area PWA: `pt-[env(safe-area-inset-top)]` header, `pb-[env(safe-area-inset-bottom)]` footer
- Tipografia: Playfair Display SC Bold 700, clamp responsivo

## ✅ CHECKLIST — Auditoria Pré-Entrega (14 itens)
1. TSC: `npx tsc --noEmit` → 0 erros
2. Imports: zero não utilizados
3. Hooks React: TODOS antes de qualquer `if (...) return`
4. Supabase 100%: zero mocks, migrations para tabelas/colunas novas
5. Memórias: todas afetadas atualizadas
6. Navegação: sidebar → routing → view renderiza, onBack funciona
7. Duplicidade: zero views/services/types duplicados
8. Caminhos/nomes: imports e nomes corretos
9. Responsividade: zero `w-[Npx]`, truncate, shrink-0, safe areas, modais `absolute inset-0`
10. Optional chaining: `?.` em dados que podem ser undefined
11. **Schema vs Queries**: TODA coluna em `.select()` DEVE existir na migration
12. **Timestamps**: `-03:00` em todo dado que vai pro banco
13. **Campos de auditoria/legal**: reembolsos, infrações, bloqueios, saques DEVEM ter timestamp + quem + prova de notificação
14. Se falhar → corrigir antes de entregar
15. **Mobile Best Practices**: gerenciamento de memória (cleanup useEffect, abort controllers), permissões (camera/location/push declaradas), sem memory leaks (listeners removidos)
16. **Security gate**: `npm run security-scan` deve passar sem erros críticos antes de merge/deploy

## 🔒 AUDITORIA TOTAL — Scripts Disponíveis
| Script | O que faz |
|---|---|
| `npm run full-audit` | Master: roda TUDO em paralelo (security + quality + dead code + bundle + store) |
| `npm run security-scan` | Gitleaks + npm audit + Trivy + grep de secrets |
| `npm run bundle-audit` | Build size, chunks pesados, deps grandes, assets >100KB |
| `npm run store-readiness` | Ícones, splash, manifest, permissions, env safety |
| `npm run bridge-audit` | Chamadas nativas sem try/catch, guards de plataforma Capacitor |
| `npm run privacy-audit` | Info.plist vs uso real de APIs — detecta rejeição Apple |

### Regra: Nenhum código aprovado sem passar em Mobile Best Practices
- useEffect DEVE ter cleanup quando cria listeners/subscriptions
- Abort controllers em fetch requests
- Permissions (camera, location, push) declaradas em Info.plist + AndroidManifest
- Sem imports dinâmicos desnecessários que inflam o bundle
- Assets otimizados (<100KB por imagem quando possível)

## 🔄 WORKFLOW — Economia de Tokens

### Princípio #0 — Memória Primeiro
Ver fluxo obrigatório no topo deste arquivo.

### Princípio #1 — Mínimo de round-trips
- Arquivo desconhecido: ler inteiro 1x. Já conhecido via memória: leitura cirúrgica.
- Nunca reler arquivo já lido na sessão (a menos que editado).
- Todas as edições de um arquivo em sequência antes de mover pro próximo.
- Respostas curtas. Zero enrolação.

### Princípio #2 — Ritual no final da sessão
- **TSC CHECK** — 1x no final da sessão ou quando o usuário pedir.
- **MEMORY** — Atualizar memórias afetadas antes de encerrar. 1x no final.
- **sessao_atual.md** — OBRIGATÓRIO atualizar `memory/sessao_atual.md` antes de encerrar qualquer sessão. Conteúdo: o que foi feito, pendências, próximos passos. Sem changelog — apenas ESTADO ATUAL. Itens resolvidos = removidos (não marcados como "concluído"). Só declarar algo como pronto com OK explícito do usuário.
- **Commit**: sugerir apenas quando o usuário pedir. Zero commits intermediários.
- **pbcopy**: usar em comandos sugeridos ao usuário.

### Princípio #3 — Blocos de trabalho
- Esperar o usuário definir o bloco completo antes de começar.
- Executar sem parar pra perguntar (a menos que ambiguidade real).
- Se não tiver certeza sobre algo → consultar memórias (Grep no arquivo, não ler inteiro) ou perguntar ao usuário. NUNCA chutar.
- Zero mensagens de "vou fazer X agora" — só fazer e reportar.

### Princípio #4 — Onde anotar o quê
- **CLAUDE.md** = SOMENTE regras de operação entre eu e o usuário (como trabalhar, fluxos, checklist). NUNCA anotar detalhes de arquivos/módulos aqui.
- **memory/[modulo].md** = detalhes técnicos, schema, regras de negócio, arquivos. Cada módulo na sua memória.
- Se uma regra é sobre "como eu devo agir" → CLAUDE.md. Se é sobre "como X funciona" → memória do módulo.

### Princípio #5 — Economia real de tokens
- Antes de ler um arquivo inteiro → Grep primeiro pra achar a linha/seção exata.
- Antes de ler código → checar se a memória do módulo já tem a resposta.
- Se a tarefa é simples (CSS, rename, 1 edit) → sugerir `/model haiku`.
- Se a tarefa é pesada (feature nova, debug, arquitetura) → avisar que precisa de Opus.
- Usar `/compact` quando a conversa ficar longa e mudar de assunto.
- Usar `/clear` entre blocos totalmente independentes.

### Proibições
- Nunca rodar tsc/memory/commit após cada micro-tarefa.
- Nunca grep + read + grep no mesmo arquivo (ler inteiro 1x).
- Nunca sugerir comandos sem pbcopy.
- Nunca encerrar com memórias desatualizadas.
- Nunca ler arquivo inteiro se só precisa de 1 função (usar Grep + offset/limit).

## 🛠️ USO OBRIGATÓRIO DE SCRIPTS

### Antes de codificar OU planejar
- `npm run explore -- <path>` → quando NÃO conheço o módulo/arquivo alvo
- `npm run deps -- <arquivo>` → antes de mudar interface, props ou store (saber quem é afetado)
- `npm run props -- <Component>` → antes de alterar props de qualquer componente
- `npm run store-map -- <store>` → antes de mudar estado/ações de qualquer store Zustand
- `npm run lines -- top20` → antes de qualquer discussão sobre refactor ou complexidade

### Durante (a cada grupo de edits)
- `npm run diff-check` → após cada grupo de edits (substitui TSC manual, ~5x mais rápido que preflight)

### Antes de entregar
- `npm run preflight` → 1x final antes de reportar ao usuário que terminou

### Sob demanda
- `npm run audit` → quando pedir auditoria profunda
- `npm run knip` → quando suspeitar de código morto
- `npm run memory-audit` → verificar se memórias referenciam arquivos que ainda existem
- `npm run memory-audit-deep` → **1x no início de cada sessão** — valida funções/exports/componentes das memórias vs código real

### Regra absoluta
**Se o script existe e o momento se aplica → USAR. Sem exceção. Sem "esqueci".**

### PROIBIÇÃO: Explore Agents para ler código
- **NUNCA lançar Explore Agent para ler arquivos inteiros.** Usar `npm run explore -- <path>` + Grep/Read cirúrgico.
- **NUNCA ler arquivo inteiro quando um script dá a resposta.** Exemplos: `npm run props` em vez de ler e procurar interfaces; `npm run deps` em vez de grep manual; `npm run lines` em vez de contar.
- **Explore Agents** são APENAS para buscas semânticas abertas (ex: "onde no codebase existe X?") quando scripts não resolvem. Nunca para ler conteúdo de arquivos conhecidos.

## 🗂️ ÍNDICE — Documentação Modular (ler ANTES de mexer)

### Fluxo de consulta
1. MEMORY.md (autoloaded) → achar `modulo_*.md` ou `sub_*.md` pelo domínio
2. Ler memória modular → ver tabelas, services, fluxos, checklist
3. Se mudar schema/store/RPC → consultar `EDGES.md` → saber TODOS os consumers afetados

### Módulos (10) — tabelas, services, fluxos, checklist
| Domínio | Arquivo |
|---|---|
| Comunidade | `modulo_comunidade.md` |
| Evento | `modulo_evento.md` |
| Compra & Ingresso | `modulo_compra_ingresso.md` |
| Carteira | `modulo_carteira.md` |
| Listas | `modulo_listas.md` |
| Financeiro | `modulo_financeiro_completo.md` |
| Social | `modulo_social.md` |
| Perfil & Feed | `modulo_perfil_feed.md` |
| RBAC | `modulo_rbac.md` |
| MAIS VANTA | `modulo_clube.md` |

### Sub-Módulos (15) — detalhe de features específicas
| Feature | Arquivo |
|---|---|
| Criar Evento | `sub_criar_evento.md` |
| Dashboard Evento | `sub_dashboard_evento.md` |
| Transferência & Cortesia | `sub_transferencia_cortesia.md` |
| Promoter | `sub_promoter.md` |
| Saque & Reembolso | `sub_saque_reembolso.md` |
| Portaria & Caixa | `sub_portaria_caixa.md` |
| Aprovação & Negociação | `sub_aprovacao_negociacao.md` |
| Notificações | `sub_notificacoes.md` |
| Comunidade CRUD | `sub_comunidade_crud.md` |
| MAIS VANTA Admin | `sub_clube_admin.md` |
| Relatórios | `sub_relatorios.md` |
| Offline | `sub_offline.md` |
| Busca & Filtros | `sub_busca_filtros.md` |
| Chat & Realtime | `sub_chat_realtime.md` |
| Solicitação Parceria | `sub_solicitacao_parceria.md` |

### Propagação cross-domínio
- `EDGES.md` — mapa tabela/store/RPC → consumers afetados. **OBRIGATÓRIO consultar quando mudar schema ou store.**

### Meta
| Tópico | Memória |
|---|---|
| Estado atual + pendências | `memory/MEMORY.md` |
| Regras de conduta | `memory/regras_usuario.md` |
| Fluxos detalhados | `MAPA_PROJETO.md` (raiz) |

## 📍 Utilitários
- **Mapa Operacional Completo**: `VANTA_OPERATIONAL_MAP.md` na raiz
- **Índice de Arquivos**: `.vanta_index.md` na raiz (ler quando não souber o caminho)
- **Explore Agents**: estritamente PROIBIDO
- **vite.config.ts**: `logLevel: 'error'` permanente
