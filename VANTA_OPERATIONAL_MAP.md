# VANTA — Mapa Operacional

> Documento vivo. Atualizar a cada entrega de módulo.
> Status: ✅ Implementado | ⚠️ Parcial/Mock | 🔲 Planejado

---

## 1. Tabela de Módulos

### Módulos Públicos (`modules/`)

| View | Status | Arquivo Principal | O que faz |
|---|---|---|---|
| HomeView | ✅ | `modules/home/HomeView.tsx` | Feed de eventos, destaques, agenda rápida, notificações |
| RadarView | ✅ | `modules/radar/RadarView.tsx` | Mapa interativo + calendário premium de eventos |
| SearchView | ✅ | `modules/search/SearchView.tsx` | Busca com filtros de vibe, preço, horário e cidade |
| MessagesView | ✅ | `modules/messages/MessagesView.tsx` | Lista de chats e sala de conversa |
| ProfileView | ✅ | `modules/profile/ProfileView.tsx` | Perfil do usuário + botão de acesso ao painel admin |
| WalletView | ✅ | `modules/wallet/WalletView.tsx` | Ingressos agrupados por evento (carousel) + histórico passado |
| EventDetailView | ✅ | `modules/event-detail/EventDetailView.tsx` | Detalhe do evento + RSVP + link de compra web |
| ComunidadePublicView | ✅ | `modules/community/ComunidadePublicView.tsx` | Vitrine pública de uma comunidade |
| CheckoutPage | ✅ | `modules/checkout/CheckoutPage.tsx` | Checkout web externo (sem taxa Apple IAP) |

### Painel Admin (`features/admin/`)

| View | Acesso | Arquivo | O que faz |
|---|---|---|---|
| AdminDashboardView | Hub | `features/admin/AdminDashboardView.tsx` | Roteador central: despacha por role para o portal correto |
| GerenteDashboardView | vanta_gerente | `views/GerenteDashboardView.tsx` | Métricas de faturamento + ocupação + navegação do gerente |
| FinanceiroView | vanta_gerente | `views/FinanceiroView.tsx` | Saldo disponível, configuração PIX e solicitação de saque |
| MasterFinanceiroView | masteradm | `views/MasterFinanceiroView.tsx` | Dashboard de taxas VANTA, gráfico 7 dias, aprovação de saques |
| GestaoSaquesView | masteradm | `views/GestaoSaquesView.tsx` | Lista focada de saques pendentes para aprovação rápida |
| DefinirCargosView | masteradm | `views/DefinirCargosView.tsx` | Atribuir cargo a membro por email → comunidade ou evento |
| CuradoriaView | masteradm | `views/CuradoriaView.tsx` | Aprovar / reprovar candidatos à plataforma |
| CuradoriaView (aba Membros) | masteradm | `views/CuradoriaView.tsx` | Lista de membros (integrada na Curadoria) |
| PrestigioAdminView | masteradm | `views/PrestigioAdminView.tsx` | Configurar selos e níveis de prestígio |
| ComunidadesView | masteradm | `views/ComunidadesView.tsx` | CRUD de comunidades (lista + criar/editar) |
| CriarComunidadeView | masteradm | `views/CriarComunidadeView.tsx` | Formulário de nova comunidade |
| VantaIndicaView | masteradm | `views/VantaIndicaView.tsx` | Gerenciar cards da seção "VANTA Indica" na HomeView |
| NotificacoesAdminView | masteradm | `views/NotificacoesAdminView.tsx` | Disparar notificações em massa para membros |
| (removida — integrada no Dashboard) | masteradm | — | Métricas gerais da plataforma |
| EventManagementView | prod/sócio | `views/EventManagementView.tsx` | Gestão completa de evento: lotes, listas, caixa, check-in |
| MeusEventosView | sócio | `views/MeusEventosView.tsx` | Lista de eventos vinculados ao sócio ou membro |
| CriarEventoView | prod | `views/CriarEventoView.tsx` | Formulário de novo evento |
| CheckInView | portaria | `views/CheckInView.tsx` | Scanner QR com feedback visual (VERDE/AMARELO/VERMELHO) |
| CaixaView | caixa | `views/CaixaView.tsx` | Venda na porta + QR dinâmico anti-print + queima de ingresso |
| ListasView | prod/sócio | `views/ListasView.tsx` | Todas as listas de convidados de um evento |

---

## 2. Matriz de Acessos

| Usuário (CONTAS_DEV_MOCK) | Role | Portal Aberto |
|---|---|---|
| `vanta_guest` (padrão) | vanta_guest | INICIO, RADAR, BUSCAR — ações protegidas abrem AuthModal |
| `dev_master` | vanta_masteradm | Hub completo: Curadoria, Membros, Financeiro Global, Definir Cargos, etc. |
| `dev_prod` | vanta_gerente | GerenteDashboardView direto (Finanças, Listas, Check-in, Comunidades) |
| `dev_socio` | vanta_socio | MeusEventosView direto |
| `m1` | vanta_member | Tela "Escolha seu Portal" → cargo GERENTE em joa-club → vanta_gerente |
| `c1` | vanta_member | Tela "Escolha seu Portal" → cargo CAIXA → CaixaView (filtrado por caixaAtivo) |
| Membro com cargo PORTARIA_LISTA | → vanta_portaria_lista | CheckInView (lista) |
| Membro com cargo PORTARIA_ANTECIPADO | → vanta_portaria_antecipado | CheckInView (QR) |
| Membro com cargo HOST | → vanta_socio | MeusEventosView |

### Rota do Visitante (`vanta_guest`)

Tabs bloqueadas: `MENSAGENS`, `PERFIL`, `ADMIN_HUB`
Ações bloqueadas: comprar ingresso, RSVP, clicar em perfil de membro

**Gatekeeper em App.tsx:**
- `requireAuth<T>(fn)` → HoF que abre AuthModal se `isGuest`, senão executa `fn`
- `guestNavigateToTab(tab)` → bloqueia tabs proibidas, redireciona para AuthModal
- Após cadastro: `registerUser(novaMembro)` → push em MEMBROS_MOCK + CONTAS_DEV_MOCK + auto-login

**Regra chave:** `getAccessNodes(userId)` em `features/admin/permissoes.ts` consolida cargos via `rbacService.getAtribuicoes(userId)`.
Nunca mutar `Membro.role` para dar acesso — sempre derivar de cargos.

> **Campos @deprecated / readonly:**
> - `Comunidade.cargos[]` — **@deprecated**. Seed-only. Nunca mutar; usar `rbacService.atribuir()`.
> - `EventoAdmin.equipe[]` — **readonly**. Snapshot para duplicação de evento. Fonte ativa: `rbacService.getAtribuicoesTenant('EVENTO', eventoId)`.

### Roles Reservados para Expansão

> **Nota:** `vanta_financeiro` foi removido como cargo — virou flag `temAcessoFinanceiro` em `AtribuicaoRBAC`.

## 2b. Matriz de Permissões Dinâmicas (Cargos Customizados)

Cargos customizados são criados pelo Produtor/Sócio na aba "Funções" do `EventManagementView`.
Persistidos via `rbacService.atribuir()` — **nunca** mutar `Comunidade.cargosCustomizados` diretamente (campo @deprecated).
Leitura via `rbacService.getAtribuicoesTenant(tipo, tenantId)`.

| Permissão | Tipo | Efeito Esperado |
|---|---|---|
| `VER_FINANCEIRO` | leitura | Acesso a relatórios de receita (sem saques) |
| `VENDER_PORTA` | escrita | Exibe CaixaView para o portador do cargo |
| `VALIDAR_ENTRADA` | escrita | Exibe CheckInView (scanner QR) |
| `GERIR_LISTAS` | escrita | Permite criar/editar listas e cotas |
| `GERIR_EQUIPE` | escrita | Permite adicionar/remover membros da equipe |

### Resultados dos Testes de Permissão

**Teste 1 — Cargo "Financeiro Junior" (só VER_FINANCEIRO):**
- Cenário: Produtor cria cargo com apenas `VER_FINANCEIRO` via aba Funções.
- Resultado esperado: Membro com esse cargo vê relatório de receita mas não tem botão "Vender" nem scanner.
- Status: ⚠️ Parcial — a interface de criação está implementada; a guarda de `VENDER_PORTA` no CaixaView ainda é por role (`vanta_caixa`), não por `PermissaoVanta`. Próxima entrega: `hasPermissao(userId, eventoId, 'VENDER_PORTA')`.

**Teste 2 — `vanta_gerente` tentando acessar `MasterFinanceiroView`:**
- Cenário: Login como `dev_prod` (role `vanta_gerente`) → clicar "Financeiro Global".
- Resultado: O item "Financeiro Global" só aparece quando `persona === 'masteradm'` em `AdminDashboardView`. Como `vanta_gerente` vai direto para `GerenteDashboardView` sem passar pelo Hub, o acesso é bloqueado por roteamento — nunca renderiza `MasterFinanceiroView`.
- Status: ✅ Bloqueado corretamente.

**Teste 3 — `vanta_portaria_antecipado` (c1 → cargo PORTARIA_ANTECIPADO) no scanner:**
- Cenário: Login como `c1` → getAccessNodes → portalRole `vanta_portaria_antecipado` → CheckInView.
- Resultado: Scanner funciona normalmente. Nenhuma rota para `FinanceiroView` ou `GestaoSaquesView` — essas views não são acessíveis sem `vanta_masteradm` ou `vanta_gerente`.
- Status: ✅ Funciona corretamente. Sem acesso a saques.

---

## 3. Fluxo de Dados Financeiro

```
[Entrada de Receita]
        │
        ├─ CaixaView ──────────────────────────────────────────────────────────┐
        │   Operador seleciona evento/lote/variação → insere e-mail            │
        │   → registrarVendaEfetiva(eventoId, loteId, variacaoId, email)       │
        │     · Incrementa variacao.vendidos in-place em EVENTOS_ADMIN         │
        │     · Cria TicketCaixa { status: 'DISPONIVEL' } em TICKETS_CAIXA    │
        │     · Retorna ticketId → exibido no QR dinâmico                      │
        │                                                                       │
        └─ CheckoutPage (Web) ─────────────────────────────────────────────────┘
            Compra externa via link → sem persistência real no service

[Acúmulo de Saldo — getSaldoFinanceiro(userId)]
    totalVendas    = Σ (variacao.vendidos × variacao.valor) nos eventos do produtor
    saldoDisponivel = totalVendas − saques CONCLUIDOS − saques PENDENTES
    aReceber       = saques PENDENTES do produtor

[Solicitação de Saque — FinanceiroView]
    Produtor configura chave PIX → digita valor → confirma
    → solicitarSaque({ valor, pixTipo, pixChave, ... })
      · valorLiquido = valor × (1 - taxaServico)   [taxa variavel por evento via ContractedFees]
      · valorTaxa    = valor × taxaServico
      · status: 'PENDENTE'
    → push em SOLICITACOES_SAQUE[]
    → addNotification ao produtor ("Saque solicitado")

[Aprovação — MasterFinanceiroView / GestaoSaquesView]
    Master Admin vê lista PENDENTE
    → confirmarSaque(id)
      · status → 'CONCLUIDO', processadoEm = agora
    → Taxa (valorTaxa) contabilizada em "Total em Caixa" do master
    → Gráfico 7 dias filtra concluidos por processadoEm
    → estornarSaque(id) → status → 'ESTORNADO'
```

---

## 4. Protocolo de Segurança do QR

### QR Dinâmico Anti-Print (CaixaView)

| Mecanismo | Implementação | Proteção |
|---|---|---|
| `qrNonce` | `Math.random(36)`, renova a cada **30 segundos** | Screenshot de QR fica obsoleto em ≤ 30s |
| `clockTime` watermark | `toLocaleTimeString`, atualiza a cada **1 segundo** | Visual confirma ao porteiro que o QR está "vivo" |
| Shimmer CSS | `@keyframes shimmerQR` overlay sobre o QR | Dificulta reprodução estática |
| `ticketId` único | Gerado em `registrarVendaEfetiva`, exibido no rodapé | Vincula QR a um ticket específico |

### Queima de Ingresso (CheckInView)

| Resultado | Condição | Ação |
|---|---|---|
| VERDE | TicketCaixa `DISPONIVEL` → evento correto | Muda status para `USADO` (queima) |
| AMARELO | Convidado aguardando confirmação na lista | Alerta visual, não queima |
| VERMELHO | Ticket `JA_UTILIZADO` ou inválido | Bloqueia entrada, alerta vermelho |

Função: `validarEQueimarIngresso(ticketId, eventoId)` → retorna `ValidacaoIngresso`.

---

## 5. Estado Atual de Implementacao

### Persistencia (100% Supabase — ZERO mocks)

| Item | Situacao |
|---|---|
| Tickets / Vendas | Supabase `tickets_caixa` + `transactions` + `vendas_log` |
| Saques | Supabase `solicitacoes_saque` (hierarquia gerente -> master) |
| Eventos / Comunidades | Supabase `eventos_admin` + `comunidades` |
| Auth | Supabase Auth (email/senha + magic link) |
| QR | JWT assinado via `jwtService` |
| Notificacoes | 3 canais: in-app (Supabase) + push (FCM) + email (Resend) |
| Listas | Supabase `convidados_lista` + `inserido_por_nome` persistido |
| RBAC | Supabase `atribuicoes_rbac` (cascata comunidade -> evento) |

### Taxas (modelo completo)

| Item | Situacao |
|---|---|
| ContractedFees | 13 campos com 3-level inheritance (defaults -> comunidade -> evento) |
| Aprovacao com taxas | EventosPendentesView: 11 inputs de taxas na aprovacao master |
| Taxas na comunidade | Criar + editar comunidade: 7 campos avancados (master only) |
| Drill-down publico | PublicoDrilldown: donut interativo por origem (ingressos/lista/cortesia) |

### Proximos Passos

1. **Gateway real**: Stripe/Mercado Pago no CheckoutPage (Edge Functions existem)
2. **Solicitacao parceria**: notificacoes, upload fotos, onboarding pos-aprovacao
3. **UI gerente correcoes**: wizard com campos cinza/vermelho editaveis
4. **Proposta VANTA**: botao "Propor venda no app" para eventos sem venda
