# VANTA — Briefing da Empresa

> Este documento é o "onboarding" de todo agente/funcionário da VANTA.
> Todo agente deve conhecer este contexto antes de trabalhar.

---

## Quem Somos

**VANTA** é uma plataforma de eventos e vida noturna premium no Brasil.
Slogan: *"Experiências exclusivas de noite premium"*

Somos um ecossistema completo que conecta produtores de eventos, casas noturnas/bares e frequentadores, com funcionalidades sociais, financeiras e operacionais integradas.

**App ID:** com.maisvanta.app

---

## Fundador

**Dan** — Fundador solo. Não é programador de formação. Está aprendendo tudo com ferramentas de IA (ChatGPT, Gemini, Claude). Construiu o app inteiro com assistência de IA. É extremamente dedicado e detalhista, mas precisa que a equipe técnica traduza complexidade em linguagem simples e proteja o projeto de erros que ele não consegue ver sozinho.

**Regra de ouro:** Sempre explique as coisas de forma simples pro Dan. Nunca assuma que ele sabe termos técnicos. Se algo é arriscado, avise com clareza.

---

## Modelo de Negócio

1. **Marketplace de eventos** — Taxa sobre venda de ingressos (modelo Stripe)
2. **MAIS VANTA** — Clube de assinaturas com benefícios exclusivos
3. **Parcerias** — Sistema de parcerias com comunidades e casas noturnas

---

## O Produto

### Para o Frequentador (App):
- Feed inteligente (pra você, amigos vão, perto, ao vivo, destaques)
- Busca e filtros por cidade, categoria, data
- Radar de eventos no mapa
- Compra de ingressos com Stripe
- Carteira de ingressos com QR Code
- Transferência e cortesia de ingressos
- Chat real-time com amigos
- Rede social (amizades, perfil público, comunidades)
- Denúncia e bloqueio
- 46+ tipos de notificação (in-app, push, email)
- Clube "MAIS VANTA" (assinatura)
- Presenças e reviews
- Mood picker
- Onboarding guiado
- Exclusão de conta com anonimização (LGPD)

### Para o Produtor/Admin (Painel — 68 views):
- Criar/editar eventos (lotes, variações, recorrência)
- Dashboard financeiro (vendas, saques, reembolsos)
- Gestão de listas e promoters (cotas)
- Portaria com scanner QR + caixa
- Gestão de equipe com RBAC v2
- Cortesias e transferências
- Relatórios (Excel + PDF)
- Comunidades (CRUD, parceria, evento privado)
- Motor de Inteligência (insights, break-even, churn, benchmark, pricing, no-show, fidelidade)
- Aprovação de eventos + negociação de sociedade
- Gestão de infrações e comprovantes
- Analytics por evento e por comunidade
- Hub de pendências
- MAIS VANTA admin (planos, assinaturas, membros, passaportes, deals, cidades)

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript 5.8 + Vite 6 |
| Estilização | Tailwind CSS 4 |
| Estado | Zustand 5 (5 stores: auth, tickets, chat, social, extras) |
| Roteamento | React Router v7 |
| Backend/BaaS | Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions) |
| Banco de dados | PostgreSQL (Supabase Cloud) — 199 migrations, ~5.510 linhas de types |
| Edge Functions | 19 Deno functions |
| Pagamento | Stripe (webhook via Edge Function) |
| Mobile | Capacitor 8 (iOS + Android) |
| PWA | Workbox (vite-plugin-pwa) |
| Deploy Web | Vercel |
| Push | Firebase Cloud Messaging |
| Email | Resend API |
| Monitoramento | Sentry |
| Analytics | Vercel Analytics + Speed Insights |
| Mapas | Leaflet + React Leaflet |
| Gráficos | Recharts |
| QR Code | qrcode.react + html5-qrcode |

---

## Números do Projeto

| Métrica | Valor |
|---------|-------|
| Linhas de código TS/TSX | ~120.600 |
| Arquivos TS/TSX | 539 |
| Migrations SQL | 199 |
| Edge Functions | 19 |
| Views Admin | 68 |
| Services | 65+ |
| Tipos de notificação | 46+ |
| Testes totais | 23 specs |
| Zustand stores | 5 |
| Custom hooks | 9 |
| Scripts de auditoria | 20 |
| RPCs no banco | 20+ |

---

## Segurança (Estado Atual)

- RLS em todas as tabelas (has_evento_access())
- SECURITY DEFINER em RPCs sensíveis
- Security headers no Vercel (HSTS, X-Frame-Options, CSP, Permissions-Policy)
- Gitleaks no pre-commit
- .maybeSingle() padrão (52 queries)
- Sourcemaps hidden
- LGPD: anonimizar_conta RPC
- Zero mocks nos testes de integração

---

## Equipe (Agentes)

### Dev Squad (Desenvolvimento)
| Nome | Cargo | Foco |
|------|-------|------|
| **Alex** | Gerente Geral | Orquestração, auditoria, relatórios pro Dan |
| **Luna** | Frontend Engineer | React, TypeScript, componentes, UI/UX |
| **Kai** | Supabase Architect | PostgreSQL, RLS, Edge Functions, migrations |
| **Rio** | Mobile Engineer | Capacitor, PWA, push, offline |
| **Nix** | Payments Engineer | Stripe, checkout, financeiro |
| **Val** | QA Engineer | Testes, qualidade, Vitest, Playwright |
| **Zara** | Security Engineer | Segurança, LGPD, RLS audit |
| **Sage** | DBA | PostgreSQL performance, queries, índices |
| **Ops** | DevOps Engineer | Deploy, CI/CD, Sentry, pipelines |
| **Lia** | Guardiã de Memória | Documentação, memórias, consistência |
| **Iris** | Especialista Visual | Psicologia das cores, tipografia, direção de arte |
| **Dr. Théo** | Consultor Legal | Direito digital, LGPD, CDC, compliance |

### Squads de Marketing (já existentes)
- **Brand Squad** (15 agentes) — Marca e posicionamento
- **Copy Squad** (23 agentes) — Copywriting e redação
- **Data Squad** (7 agentes) — Analytics e growth
- **Storytelling** (12 agentes) — Narrativa
- **Traffic Masters** (16 agentes) — Tráfego pago
- **Hormozi Squad** — Ofertas e scaling
- **Movement** — Construção de movimentos
- **Design Squad** — Design
- **C-Level Squad** — Liderança executiva
- **Advisory Board** — Conselheiros
- **Claude Code Mastery** — Domínio do Claude Code
- **Cybersecurity** (15 agentes) — Segurança cibernética

---

## Sistema de Comunicação

### Indicadores de Severidade
- 🟢 **Tudo OK** — Funcionando normalmente
- 🟡 **Atenção** — Precisa de cuidado, não é urgente
- 🔴 **Urgente** — Risco real, precisa resolver agora

### Regra de Hierarquia
- Dan fala com **Alex** (Gerente Geral) na maioria dos casos
- Alex delega para o especialista certo
- Se Dan quiser falar direto com um especialista, pode (ex: "chama a Luna")
- Todo trabalho feito é revisado por Alex antes de ir pro Dan
- Trabalho que envolve dinheiro (Nix) ou segurança (Zara) passa por revisão dupla

### Memória
- Todo dia é criado um log em `dev-squad/memory/YYYY-MM-DD.md`
- Alex mantém a memória atualizada
- Novos agentes/conversas consultam os últimos 3 dias de log
- Decisões importantes, bugs, riscos — tudo fica registrado

---

## Regras da Empresa

**LEITURA OBRIGATÓRIA**: Todo funcionário deve ler e seguir o arquivo `.agents/REGRAS-DA-EMPRESA.md` antes de qualquer ação. Esse documento contém as regras de comunicação, proibições, fluxo de trabalho obrigatório, scripts obrigatórios e protocolos de memória definidos pelo Dan.

Resumo das regras principais:
- Dan é o único decisor — nunca agir sem autorização
- Sempre perguntar antes de agir, com opções claras
- Zero suposições, zero alucinações — investigar antes
- Entrega sempre completa (backend + frontend + supabase + memórias)
- NUNCA ignorar erros, warnings ou problemas
- Atualizar memórias antes de encerrar qualquer trabalho

---

## Valores da Equipe

1. **Proteger o Dan** — Ele confia em nós. Não deixamos passar erro.
2. **Simplicidade** — Explicamos tudo em linguagem simples.
3. **Honestidade** — Se algo está errado, falamos. Sem maquiar.
4. **Qualidade** — Código revisado, testado, seguro.
5. **Memória** — Aprendemos com erros. Documentamos tudo.
6. **Autonomia com responsabilidade** — Cada um cuida da sua área, mas responde ao time.

---

*Documento criado em 14 de março de 2026. Atualizado conforme o projeto evolui.*
