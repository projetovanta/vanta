# VANTA — Manual Geral do Sistema

> Documento de referência operacional. Não altera código.
> Gerado em: 2026-02-22 | Versão: 1.0

---

## 1. Visão Geral do Produto

**VANTA** é uma plataforma de acesso exclusivo a eventos e comunidades de estilo de vida premium.
Opera em modelo fechado: membros passam por curadoria antes de interagir com o ecossistema.

### Fluxo Principal do Usuário

```
Visitante (vanta_guest)
  │
  ├─ Tenta acessar aba bloqueada (MENSAGENS / PERFIL / ADMIN_HUB)
  │    ou ação protegida (comprar ingresso, RSVP, ver perfil de membro)
  │
  ▼
AuthModal (3 passos)
  ├─ Step 1: Identidade — Nome, Nascimento, Gênero, Estado, Cidade + Consentimento
  ├─ Step 2: Contato — Instagram, E-mail, Telefone, Senha
  └─ Step 3: Biometria Facial — Selfie ao vivo com moldura oval + detecção de rosto
  │
  ▼
Membro (vanta_member) — auto-login imediato
  │
  ▼
Curadoria (masteradm aprova / atribui prestígio)
```

---

## 2. Hierarquia de Roles (ContaVanta)

| Role | Acesso | Origem |
|---|---|---|
| `vanta_guest` | Apenas INICIO, RADAR, BUSCAR (leitura) | Default para usuário não autenticado |
| `vanta_member` | App completo + portal via cargos | Após cadastro ou login |
| `vanta_masteradm` | Hub completo do Portal VANTA | Hardcoded no CONTAS_DEV_MOCK |
| `vanta_gerente` | Portal do Gerente direto | Cargo GERENTE em comunidade (antigo `vanta_produtor`) |
| `vanta_socio` | Portal do Sócio direto | Cargo HOST ou papel SOCIO em evento |
| `vanta_ger_portaria_lista` | CheckInView (lista) | Gerente de portaria — modo lista |
| `vanta_portaria_lista` | CheckInView (lista) | Portaria operacional — modo lista |
| `vanta_ger_portaria_antecipado` | CheckInView (scanner QR) | Gerente de portaria — modo antecipado |
| `vanta_portaria_antecipado` | CheckInView (scanner QR) | Portaria operacional — modo antecipado |
| `vanta_caixa` | CaixaView (venda na porta) | Cargo CAIXA |
| `vanta_promoter` | PromoterDashView | Cargo PROMOTER |

**Regra crítica:** Nunca mutar `Membro.role` para dar acesso. Sempre derivar via `getAccessNodes(userId)`.

---

## 3. Fluxo de Acesso ao Portal Admin

### Membro com cargos (`vanta_member`)

```
getAccessNodes(userId)          ← lê rbacService.getAtribuicoes(userId)
  │
  ├─ 0 nós → botão Admin não aparece no perfil
  ├─ 1 nó  → auto-rota direto para o portal do cargo
  └─ N nós → tela "Escolha seu Portal" com cards de contexto
```

> **Fonte da verdade:** `rbacService.getAtribuicoes(userId)` em `features/admin/services/rbacService.ts`.
> `Comunidade.cargos[]` está **@deprecated** — nunca ler nem mutar diretamente.
> `EventoAdmin.equipe[]` está **readonly** — snapshot apenas; nunca mutar diretamente.

### Cargos → portalRole

| CargoUnificado (rbacService) | Tenant | portalRole |
|---|---|---|
| GERENTE | COMUNIDADE | vanta_gerente |
| HOST / SOCIO | COMUNIDADE / EVENTO | vanta_socio |
| GER_PORTARIA_LISTA | COMUNIDADE / EVENTO | vanta_ger_portaria_lista |
| PORTARIA_LISTA | COMUNIDADE / EVENTO | vanta_portaria_lista |
| GER_PORTARIA_ANTECIPADO | COMUNIDADE / EVENTO | vanta_ger_portaria_antecipado |
| PORTARIA_ANTECIPADO | COMUNIDADE / EVENTO | vanta_portaria_antecipado |
| CAIXA | COMUNIDADE / EVENTO | vanta_caixa |

Derivação feita em `features/admin/permissoes.ts` via `rbacService.getAtribuicoes(userId)`.

---

## 4. Matriz de Permissões de Cargos Customizados

Produtores/Sócios criam cargos customizados na aba **Funções** do EventManagementView.
Salvos em `Comunidade.cargosCustomizados: DefinicaoCargoCustom[]`.

| PermissaoVanta | Efeito Esperado |
|---|---|
| `VER_FINANCEIRO` | Acesso a relatórios de receita (sem saques) |
| `VENDER_PORTA` | Acesso à CaixaView para o portador |
| `VALIDAR_ENTRADA` | Acesso ao scanner QR (CheckInView) |
| `GERIR_LISTAS` | Criar/editar listas e cotas de promoter |
| `GERIR_EQUIPE` | Adicionar/remover membros da equipe |

> **Dívida técnica:** As guards de `VENDER_PORTA` e `VALIDAR_ENTRADA` ainda verificam role (`vanta_caixa`/`vanta_*portaria*`), não `PermissaoVanta` diretamente. Próxima entrega: `hasPermissao(userId, eventoId, permissao)`.

---

## 5. Módulo de Identidade Biométrica

### Fluxo de Cadastro com Selfie

1. AuthModal Step 3 abre câmera frontal via `getUserMedia`
2. SVG overlay: máscara escura com oval recortado + borda gold (#FFD300) + brackets pulsantes
3. Mock face detection: análise de brilho + variância nos pixels centrais
4. Captura: `canvas.toDataURL('image/jpeg', 0.85)` com espelhamento horizontal
5. Selfie salva como `Membro.foto` + `biometriaCaptured: true`

### Efeitos do flag `biometriaCaptured`

| Local | Comportamento |
|---|---|
| EditProfileView | Avatar travado (ícone cadeado verde, mensagem "Identidade Biométrica Vinculada") |
| CuradoriaView | Badge verde "BIO" na thumbnail e no modal de detalhe |
| Futuro backend | Foto não deve ser alterada sem novo processo de verificação |

---

## 6. Módulo Financeiro

### Fórmulas

```
taxaEfetiva    = evento.taxaOverride ?? VANTA_FEE   (padrão 0.05 = 5%)
valorLiquido   = valorSaque × (1 − taxaEfetiva)
valorTaxa      = valorSaque × taxaEfetiva
saldoDisponível = totalVendas − saquesProcessados − saquesPendentes
```

### Taxa Flexível (`taxaOverride`)

- Campo `EventoAdmin.taxaOverride?: number` (ex: `0.03` = 3%)
- Definido pelo masteradm por evento
- Se ausente, usa `VANTA_FEE = 0.05`
- Aplicado no `solicitarSaque` do `eventosAdminService`

### Ciclo de Vida do Saque

```
PENDENTE → CONCLUIDO (confirmarSaque — masteradm)
         → ESTORNADO (estornarSaque — masteradm)
```

### Vínculo de Receita

Cada `VendaLog` registra `produtorId: string` — ID do SOCIO do evento.
Permite rastrear receita por produtor sem depender de joins complexos no backend.

---

## 7. Módulo de Ingressos

### Tipos de Ingresso

| Tipo | Origem | Validação |
|---|---|---|
| Comprado (checkout web) | `buyTicket()` no `useUserData` | QR estático (`VNT-XXXXXXXX`) |
| Emitido na porta | `registrarVendaEfetiva()` no service | QR dinâmico com nonce 30s |
| Cortesia | `cortesiasService` | QR estático |

### QR Dinâmico Anti-Print (CaixaView)

- `qrNonce` renova a cada 30s
- Timestamp watermark atualiza a cada 1s
- Shimmer CSS dificulta reprodução estática

### Check-in (CheckInView)

| Resultado | Condição | Cor |
|---|---|---|
| VERDE (VALIDO) | Ticket DISPONIVEL → evento correto → queima | Verde |
| AMARELO | Convidado na lista aguardando confirmação | Amarelo |
| VERMELHO (JA_UTILIZADO) | Ticket já queimado | Vermelho |
| VERMELHO (INVALIDO) | Ticket não encontrado | Vermelho |

---

## 8. Consentimento e LGPD

### Coleta no Cadastro (AuthModal Step 1)

- Checkbox obrigatório: aceite de Termos de Uso + Política de Privacidade + uso de foto biométrica
- Não é possível avançar sem aceitar
- No backend real: salvar `consentimentoEm: ISO8601` e `consentimentoVersao: string`

---

## 9. Preparação para Supabase

### Tabelas Sugeridas

```sql
-- Membros
CREATE TABLE members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  instagram   TEXT UNIQUE,
  genero      TEXT CHECK (genero IN ('MASCULINO','FEMININO','OUTRO')),
  estado      TEXT,
  cidade      TEXT,
  data_nasc   DATE,
  telefone    JSONB,           -- { ddd, numero }
  foto_url    TEXT,
  biometria_captured BOOLEAN DEFAULT false,
  role        TEXT DEFAULT 'vanta_member',
  prestígio_id UUID REFERENCES prestiogios(id),
  consentimento_em TIMESTAMPTZ,
  consentimento_versao TEXT,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Eventos Admin
CREATE TABLE eventos_admin (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID REFERENCES comunidades(id),
  nome          TEXT NOT NULL,
  descricao     TEXT,
  data_inicio   TIMESTAMPTZ NOT NULL,
  data_fim      TIMESTAMPTZ NOT NULL,
  local         TEXT,
  endereco      TEXT,
  cidade        TEXT,
  taxa_override NUMERIC(4,3),  -- NULL = usa taxa padrão da plataforma
  publicado     BOOLEAN DEFAULT false,
  caixa_ativo   BOOLEAN DEFAULT false,
  criado_em     TIMESTAMPTZ DEFAULT now()
);

-- Lotes e Variações (normalizado)
CREATE TABLE lotes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id   UUID REFERENCES eventos_admin(id),
  nome        TEXT,
  limit_total INT,
  vendidos    INT DEFAULT 0,
  ativo       BOOLEAN DEFAULT true,
  data_validade DATE
);

CREATE TABLE variacoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id     UUID REFERENCES lotes(id),
  area        TEXT,
  genero      TEXT,
  valor       NUMERIC(10,2),
  limite      INT,
  vendidos    INT DEFAULT 0
);

-- Vendas Log (analytics)
CREATE TABLE vendas_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id   UUID REFERENCES eventos_admin(id),
  variacao_id UUID REFERENCES variacoes(id),
  variacao_label TEXT,
  valor       NUMERIC(10,2),
  produtor_id UUID REFERENCES members(id),
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Saques
CREATE TABLE saques (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produtor_id UUID REFERENCES members(id),
  evento_id   UUID REFERENCES eventos_admin(id),
  valor       NUMERIC(10,2),
  valor_liquido NUMERIC(10,2),
  valor_taxa  NUMERIC(10,2),
  pix_tipo    TEXT,
  pix_chave   TEXT,
  status      TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','CONCLUIDO','ESTORNADO')),
  solicitado_em TIMESTAMPTZ DEFAULT now(),
  processado_em TIMESTAMPTZ
);

-- Cargos legados (tabela mantida para seed / leitura histórica — NÃO usar para escrita)
-- @deprecated: use atribuicoes_rbac para qualquer operação de leitura ou escrita
CREATE TABLE cargos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_id    UUID REFERENCES members(id),
  tipo         TEXT,           -- PRODUTOR | HOST | PORTARIA | STAFF | CAIXA
  comunidade_id UUID REFERENCES comunidades(id),
  atribuido_por UUID REFERENCES members(id),
  atribuido_em TIMESTAMPTZ DEFAULT now()
);

-- RBAC Multi-Tenant (fonte da verdade ativa — substituiu a tabela cargos)
CREATE TABLE atribuicoes_rbac (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES members(id) ON DELETE CASCADE,
  tenant_tipo  TEXT NOT NULL CHECK (tenant_tipo IN ('COMUNIDADE', 'EVENTO')),
  tenant_id    TEXT NOT NULL,
  cargo        TEXT NOT NULL,  -- PRODUTOR | HOST | SOCIO | PORTARIA | STAFF | CAIXA | MASTERADM
  permissoes   TEXT[] DEFAULT '{}',  -- PermissaoVanta[]
  atribuido_por UUID REFERENCES members(id),
  atribuido_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, tenant_tipo, tenant_id)
);
```

-- Audit Logs (imutável — INSERT only, nunca UPDATE ou DELETE)
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES members(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,      -- 'LOGIN' | 'LOGOUT' | 'INSERT' | 'UPDATE' | 'DELETE'
                                   -- | 'CHECKOUT' | 'SAQUE_SOLICITADO' | 'SAQUE_APROVADO'
                                   -- | 'CHECKIN' | 'CARGO_ATRIBUIDO' | 'BIOMETRIA_CAPTURADA'
  entity_type  TEXT NOT NULL,      -- 'member' | 'evento' | 'saque' | 'ticket' | 'cargo'
  entity_id    UUID,               -- ID da entidade afetada (nullable para ações de sistema)
  changes_json JSONB,              -- { "before": {}, "after": {} } para UPDATE
                                   -- { "data": {} } para INSERT/DELETE
  ip_address   INET,               -- endereço IP do cliente (obtido via request header)
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- audit_logs é append-only — nenhuma policy de UPDATE/DELETE
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_insert ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY audit_masteradm_select ON audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.role = 'vanta_masteradm'
  ));
```

### Storage Buckets (Supabase Storage)

```sql
-- Bucket: selfies (fotos biométricas dos membros)
-- Política: membro só faz upload da própria foto; leitura pública negada; masteradm lê tudo
INSERT INTO storage.buckets (id, name, public) VALUES ('selfies', 'selfies', false);

CREATE POLICY selfies_upload ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'selfies'
    AND name = auth.uid()::text || '.jpg'
  );

-- CRÍTICO: nenhum membro pode atualizar/deletar sua própria selfie sem aprovação masteradm
-- (garante integridade biométrica — re-verificação necessária via CuradoriaView)
CREATE POLICY selfies_no_update ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'selfies'
    AND EXISTS (
      SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.role = 'vanta_masteradm'
    )
  );

CREATE POLICY selfies_masteradm_read ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'selfies'
    AND EXISTS (
      SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.role = 'vanta_masteradm'
    )
  );

-- Bucket: event_covers (capas de eventos — 1080×1350px recomendado)
INSERT INTO storage.buckets (id, name, public) VALUES ('event_covers', 'event_covers', true);

CREATE POLICY event_covers_upload ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event_covers'
    AND EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = auth.uid()
      AND m.role IN ('vanta_masteradm', 'vanta_gerente', 'vanta_socio')
    )
  );

-- Bucket: community_avatars (avatares de comunidades)
INSERT INTO storage.buckets (id, name, public) VALUES ('community_avatars', 'community_avatars', true);

CREATE POLICY community_avatars_upload ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community_avatars'
    AND EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = auth.uid()
      AND m.role IN ('vanta_masteradm', 'vanta_gerente')
    )
  );
```

### Row-Level Security (RLS) — Tabelas Principais

```sql
-- Membro só vê seus próprios dados sensíveis
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY members_self ON members
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.role = 'vanta_masteradm'
  ));

-- Saques: produtor vê os próprios; masteradm vê todos
ALTER TABLE saques ENABLE ROW LEVEL SECURITY;
CREATE POLICY saques_produtor ON saques
  USING (produtor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.role = 'vanta_masteradm'
  ));
```

---

## 10. Mapa de Arquivos Críticos

| Arquivo | Responsabilidade |
|---|---|
| `App.tsx` | Orquestrador principal: gatekeeper, routing, modais globais |
| `hooks/useUserData.ts` | Estado global do usuário: ingressos, notificações, amizades, conta |
| `hooks/useNavigation.ts` | Navegação entre tabs e views |
| `types.ts` | Todos os tipos TypeScript do domínio |
| `constants.ts` | Mocks de membros, eventos, notificações |
| `features/admin/services/rbacService.ts` | **Fonte da verdade de permissões** — CRUD de AtribuicaoRBAC multi-tenant |
| `features/admin/permissoes.ts` | `getAccessNodes()` — consumidor do `rbacService`; deriva AccessNodes por role |
| `features/admin/AdminDashboardView.tsx` | Hub do painel admin — roteador por role |
| `features/admin/services/eventosAdminService.ts` | Lógica de eventos, vendas, saques, QR |
| `features/admin/services/cortesiasService.ts` | Ciclo de vida de cortesias |
| `components/AuthModal.tsx` | Cadastro 3 passos + câmera biométrica |
| `modules/profile/EditProfileView.tsx` | Edição de perfil + lock biométrico |
| `features/admin/views/CuradoriaView.tsx` | Aprovação de membros + badge BIO |
| `VANTA_OPERATIONAL_MAP.md` | Tabela de módulos e matriz de acessos |
| `CLAUDE.md` | Regras permanentes do projeto |

---

## 11. Modo Offline — Persistência via LocalStorage

> Implementado em 2026-02-22. Garante resiliência de dados em operações de campo (portaria/caixa) e continuidade de notificações entre refreshs.

### 11a. Tickets de Portaria (`vanta_tickets_caixa`)

| Aspecto | Implementação |
|---|---|
| Serviço | `eventosAdminService.ts` |
| Chave LS | `vanta_tickets_caixa` |
| Formato | `[string, TicketCaixa][]` — array de pares `[ticketId, ticket]` |
| Trigger de save | `registrarVendaEfetiva()` e `validarEQueimarIngresso()` |
| Hidratação | `hydrateTicketsFromLS()` executa no carregamento do módulo (antes do `export`) |
| Limpeza passiva | Tickets com `emitidoEm` > 7 dias são descartados no próximo save |
| Campos persistidos | `id`, `eventoId`, `variacaoId`, `variacaoLabel`, `valor`, `email`, `status`, `emitidoEm`, `usadoEm?` |
| Campos omitidos | Nenhum (todos são strings/numbers leves — sem base64) |

**Fluxo de campo:**
```
Operador caixa vende ingresso
  → registrarVendaEfetiva() cria TicketCaixa no Map in-memory
  → saveTicketsToLS() persiste o Map no localStorage
  → Porteiro valida QR → validarEQueimarIngresso() muta status para 'USADO'
  → saveTicketsToLS() persiste a queima
  → Refresh acidental → hydrateTicketsFromLS() restaura todos os tickets
```

**Indicador visual (CheckInView):**
- Badge verde "Dados sincronizados localmente" com ícone `HardDrive` no header do scanner
- Sempre visível para operadores de portaria como confirmação de resiliência

### 11b. Notificações (`vanta_notifications`)

| Aspecto | Implementação |
|---|---|
| Serviço | `features/admin/services/notificationsService.ts` |
| Chave LS | `vanta_notifications` |
| Formato | `NotifEssential[]` — apenas campos essenciais |
| Limite | 50 notificações (FIFO — mais antigas descartadas) |
| Hidratação | No carregamento do módulo (`loadFromLS()` chamado na inicialização de `_notifs`) |
| Re-hidratação | `notificationsService.rehydrate()` disponível para chamar em `useEffect` se necessário |
| Campos persistidos | `id`, `titulo`, `mensagem`, `tipo`, `lida`, `link`, `timestamp` |
| Campos omitidos | Dados pesados não existem no tipo `Notificacao` — nenhum risco de base64 |

**Integração com `useUserData`:**
- `useState(() => notificationsService.getAll())` — hidratação imediata no render inicial
- `addNotification`, `markAllAsRead`, `cancelFriendshipRequest`, `handleAcceptFriend` — todos delegam ao serviço antes de atualizar o estado React

### 11c. Auditoria de Performance

| Dado | Tamanho estimado por registro | Max registros | Max total |
|---|---|---|---|
| `TicketCaixa` | ~250 bytes (JSON) | Ilimitado (7d TTL) | ~25 KB/dia de evento ativo |
| `Notificacao` | ~150 bytes | 50 | ~7 KB |
| `vanta_selected_city` | < 50 bytes | 1 | < 0.1 KB |
| **Total estimado** | | | **< 50 KB** (bem abaixo do limite de 5 MB do LS) |

**Regra de ouro:** nunca persistir strings base64 (fotos, QR codes gerados) no localStorage.

---

## 12. Dívida Técnica Prioritária

| Item | Impacto | Esforço | Status |
|---|---|---|---|
| Persistência (Supabase/LocalStorage) | Alto | Médio | ✅ LocalStorage implementado |
| Auth real (Supabase Auth / Clerk) | Alto | Alto | 🔲 Planejado |
| `hasPermissao(userId, eventoId, permissao)` | Médio | Pequeno | 🔲 Planejado |
| QR HMAC assinado (substituir Math.random) | Alto (segurança) | Médio | 🔲 Planejado |
| Gateway de pagamento (Stripe/MercadoPago) | Alto | Alto | 🔲 Planejado |
| Push notifications (FCM) | Médio | Médio | 🔲 Planejado |
| Foto biométrica — re-verificação em updates | Alto (LGPD) | Médio | 🔲 Planejado |
