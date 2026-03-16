# Skill: Gestao de Produto VANTA
# Ativada automaticamente por: gerente-geral (Alex), diretoria, conselho-estrategico

## O Produto

**VANTA** e um aplicativo mobile-first (iOS + Android via Capacitor) e web para experiencias exclusivas de noite premium em Sao Paulo.

### Planos
| Plano | Preco | Beneficios |
|-------|-------|------------|
| FREE | R$0 | Ver eventos, lista de espera, 1 ingresso/mes com taxa |
| VANTA | R$49/mes | Acesso antecipado, sem taxa, 3 ingressos/mes, area VIP |
| MAIS VANTA | R$149/mes | Tudo VANTA + concierge, +1 acompanhante, prioridade total |

### Features Principais
- Descoberta de eventos curados (feed personalizado)
- Compra de ingressos com QR code
- Check-in digital no evento
- Planos de assinatura com beneficios progressivos
- Lista de espera com referral (avanca posicao indicando amigos)
- Perfil social (historico de eventos, avaliacoes)
- Notificacoes push personalizadas
- Painel admin com 68 views de gestao

### Stack Tecnico
- Frontend: React 19 + TypeScript 5.8 + Vite 6 + Tailwind 4
- State: Zustand 5
- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- Pagamentos: Stripe
- Mobile: Capacitor 8 (iOS + Android)
- Deploy: Vercel
- Monitoramento: Sentry
- Escala: 120.600 linhas TS/TSX, 539 arquivos, 199 migrations

## Comandos de Produto

### /roadmap [horizonte]
Gera ou atualiza roadmap do produto:
- `sprint`: proximas 2 semanas (tasks concretas)
- `mensal`: proximo mes (features e milestones)
- `trimestral`: proximo trimestre (temas estrategicos)
- Sempre priorizar por: impacto no usuario > esforco tecnico > dependencias

### /spec [feature]
Escreve PRD (Product Requirements Document) completo:
1. **Problema**: Qual dor do usuario resolve?
2. **Hipotese**: Por que acreditamos que isso funciona?
3. **Solucao**: Descricao detalhada da feature
4. **Criterios de aceite**: Lista de "Done = quando..."
5. **Design**: Wireframes ou descricao de telas (Iris pode fazer)
6. **Tecnico**: Quais modulos afeta, migrations, Edge Functions
7. **Metricas**: Como vamos medir sucesso?
8. **Riscos**: O que pode dar errado?
9. **Estimativa**: Tamanho (P/M/G) e dependencias

### /priorizar [lista-de-features]
Aplica framework ICE (Impact x Confidence x Ease):
- Impact (1-10): Quanto melhora a experiencia do usuario?
- Confidence (1-10): Quao certo estamos que funciona?
- Ease (1-10): Quao facil e implementar?
- Score = I x C x E
- Ordena por score e recomenda as top 3

### /relatorio-produto [periodo]
Relatorio executivo do produto:
- Status do roadmap (% concluido)
- Metricas-chave do periodo
- Bugs criticos abertos
- Feedback mais recorrente dos usuarios
- Proximos passos recomendados

### /feedback-sintese
Sintetiza feedback de usuarios:
- Agrupa por tema (UX, performance, features, bugs)
- Identifica padroes recorrentes
- Prioriza por frequencia e severidade
- Sugere acoes concretas

## Fase Atual do Produto

**Fase: Pre-lancamento / Desenvolvimento final**
- App funcional mas em desenvolvimento ativo
- Foco em: estabilidade, onboarding, fluxo de pagamento
- Sem usuarios em producao ainda (lista de espera ativa)
- Objetivo: MVP pronto pra soft launch com 100-500 usuarios iniciais

## Criterios de Lancamento (Definition of Done pro MVP)

- [ ] Onboarding < 3 telas, < 60 segundos
- [ ] Fluxo de compra de ingresso funcionando (browse > comprar > QR)
- [ ] Planos VANTA e MAIS VANTA funcionando (Stripe)
- [ ] Check-in digital no evento funcionando
- [ ] Push notifications funcionando (iOS + Android)
- [ ] Admin: criar/editar eventos, ver vendas, check-ins
- [ ] Testes passando (Val aprova)
- [ ] Seguranca aprovada (Zara aprova)
- [ ] Performance: First Load < 3s, Lighthouse > 80
- [ ] LGPD: termos, privacidade, consentimento

## Regras de Produto

1. **Usuario primeiro**: Toda decisao comeca com "isso melhora a experiencia do usuario?"
2. **Simplicidade**: Menos e mais. Corte features, nao adicione complexidade.
3. **Mobile first**: Sempre desenhar pra mobile, adaptar pra web. Nunca o contrario.
4. **Medir tudo**: Nenhuma feature sem metrica de sucesso definida.
5. **Iterar rapido**: MVP > feedback > ajuste. Nao espere perfeicao.
6. **Dan decide**: Nenhuma feature entra sem aprovacao do Dan. Agentes propoem, Dan decide.
