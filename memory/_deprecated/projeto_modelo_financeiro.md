---
name: Modelo Financeiro VANTA — Decisões Definitivas
description: Como o dinheiro entra, passa e sai da VANTA. Decisões tomadas com o Dan em 2026-03-16.
type: project
---

## Fontes de receita da VANTA (4 fontes)

### 1. Taxa por ingresso vendido no app
- % variável por negócio (master define ao criar comunidade)
- Padrão sugerido: ~10% (mercado cobra 12-20%)
- Mínimo por ingresso: R$ 2 (se % der menos)
- **Quem paga: dono da comunidade escolhe**
  - Se absorve: desconta da receita do produtor
  - Se repassa: comprador paga ingresso + taxa VANTA + taxa Stripe
  - Taxa Stripe (processamento): se repassada, vai direto pro Stripe, não conta pra ninguém

### 2. Assinaturas dos produtores (MAIS VANTA lado B)
- Plano mensal pra ter programa MV nos eventos
- Cobrança: decisão pendente (investigar melhor opção)

### 3. Taxas operacionais
- Taxa processamento Stripe: 2.5% (produtor absorve ou repassa)
- Nomes excedentes na lista: R$ 0.50/nome (configurável)
- Cortesias excedentes: 5% do valor face (configurável)
- Taxa fixa por evento: opcional

## Fluxo de pagamento

### Compra de ingresso
```
Comprador paga → Stripe processa → dinheiro fica retido
  → Após evento + D+15 → Master autoriza → Stripe paga produtor
  → Taxa VANTA já descontada automaticamente
```

### Regras
- **Produtor recebe D+15 após o evento** (segurança contra chargebacks)
- **Master DEVE autorizar** todo repasse (ou funcionário delegado)
- **Stripe Connect**: cada produtor tem sub-conta Stripe
- **Reembolso: produtor absorve** (valor sai da receita dele, taxa VANTA não devolvida)

## Porta/Presencial
- VANTA **NÃO processa pagamento presencial**
- Caixa recebe com maquininha própria do produtor
- VANTA só emite QR e registra entrada
- Sem taxa de porta

## Eventos gratuitos
- Master pode criar evento 100% gratuito (dentro ou fora de comunidade)
- Donos de comunidade: mínimo 1 lote pago obrigatório
- Taxa VANTA em evento gratuito: negociável caso a caso

## Referências de mercado
- Sympla: até 12% + R$ 3.99 mínimo + 2-2.5% processamento
- DICE: booking fee inclusa, split com organizador
- Eventim: taxa ADM variável
- Ticketmaster: 20% online, bilheteria isenta
- VANTA é mais barato que todos — diferencial competitivo

## Meios de pagamento do comprador (no SITE, nunca no app)
- **Cartão** (crédito/débito) via Stripe: 3.49% + R$ 0.39
- **Apple Pay** via Stripe: mesma taxa do cartão (Apple NÃO cobra lojista)
- **Google Pay** via Stripe: mesma taxa do cartão
- **PIX** via Stripe: 0.80%
- **Parcelamento**: comprador paga juros
- ❌ NUNCA In-App Purchase (Apple cobra 30%)
- Checkout SEMPRE abre no navegador (maisvanta.com/checkout/[evento])

## Assinatura dos produtores
- Negociável caso a caso
- Opção principal: desconto automático na receita dos eventos
- Se produtor não gera receita (parceiro sem eventos): cobrar separado (cartão/boleto)
- Decisão: o master define a melhor forma pra cada parceiro

## Negociação comercial (TODOS — produtores e parceiros)
- Master define condições caso a caso (campo editável no painel)
- Ao alterar condições: sistema notifica o responsável do outro lado
- Responsável tem **7 dias corridos** pra aceitar
- Se não aceitar no prazo → **atividades pausadas automaticamente**
- Quando aceitar → reativa
- Aceite digital com timestamp (validade legal: Marco Civil art. 7º)
- Notificação por push + email + banner no painel
- Histórico de todas as negociações salvo (auditoria)

## Taxas operacionais — TUDO negociável pelo master

| Taxa | Default | Negociável | Descrição |
|---|---|---|---|
| Taxa serviço (%) | ~10% (sugerido) | ✅ Por comunidade | % sobre cada ingresso vendido no app |
| Taxa mínima | R$ 2 | ✅ Por comunidade | Mínimo por ingresso (se % der menos) |
| Taxa processamento (Stripe) | 3.49% + R$ 0.39 | ❌ Fixo Stripe | Produtor absorve ou repassa ao comprador |
| Nomes excedentes lista | R$ 0.50/nome | ✅ Por comunidade | Cota grátis + preço excedente (master define) |
| Cortesias excedentes | 5% valor face | ✅ Por comunidade | Cota grátis + % excedente (master define) |
| Taxa de porta | R$ 0 (padrão) | ✅ Por comunidade | Cobra pelo uso do sistema de portaria (se ativado) |
| Taxa fixa por evento | R$ 0 (padrão) | ✅ Por evento | Custo fixo opcional por evento |

**Regra: SÓ o master muda. Produtor só escolhe absorver ou repassar gateway.**

## Parceiros MV (restaurantes, bares)
- NÃO vendem ingresso pelo VANTA
- Modelo de receita: negociável caso a caso pelo master
- Opções disponíveis no campo: mensalidade fixa / comissão por resgate / freemium / personalizado
- Cobrança: separada (cartão/boleto) — não tem receita de eventos pra descontar

## Autonomia do Master
- SÓ o master pode definir: %, taxas, modelo de cobrança, condições comerciais
- Produtor/parceiro só pode: aceitar/recusar condições + escolher absorver ou repassar taxa gateway
- Precisa de TELA no painel master pra:
  1. Definir condições por comunidade/parceiro
  2. Ver histórico de negociações
  3. Ver quem aceitou/quem tá pendente
  4. Editar condições a qualquer momento (dispara novo aceite)

## Telas que PRECISAM existir (a construir)

### Pra o Master:
- **Negociação comercial**: tela pra definir condições por comunidade/parceiro
- **Visão financeira**: dashboard com as 3 fontes de receita (drill-down)
- **Stripe Connect**: onboarding de produtores (cada um com sub-conta)
- **Regras de taxas**: nomes excedentes, cortesias excedentes, taxa porta, taxa fixa

### Pro Produtor/Gerente:
- **Minhas condições**: ver o que foi definido pelo master, aceitar/recusar
- **Meus dados de pagamento**: cadastrar Stripe (pra receber)
- **Explicação das regras**: tela clara com "como funciona" (sem jargão)
- **Escolher**: absorver ou repassar taxa gateway

### Pro Comprador:
- **Checkout no site**: cartão, Apple Pay, Google Pay, PIX
- **Transparência**: ver valor do ingresso + taxa separados

## Onboarding financeiro do produtor
- **Stripe Connect** como padrão (formulário Stripe: CPF/CNPJ, conta, docs)
- **PIX manual** como alternativa (produtor informa chave, master paga manual)
- Produtor escolhe qual método ao se cadastrar

## Extrato do produtor
- Lista cronológica: venda, taxa, saque, reembolso
- Exporta PDF/Excel
- Filtro por evento, período

## Nota fiscal
- NFS-e OBRIGATÓRIA pra cada taxa cobrada (lei brasileira)
- Fase 1: emissão manual (contador)
- Fase 2: integração automática (NFe.io, eNotas)
- CNPJ da VANTA precisa estar ativo ANTES de faturar
- Consultar contador + advogado tributarista

## Fonte 4 — Publicidade no Vanta Indica
- Marcas/parceiros pagam pra aparecer no carrossel de destaques (Highlights)
- Anúncio nativo — parece card do Indica, não banner
- Tipo já existe: PUBLICIDADE no TipoIndicaCard
- Modelo: negociável (CPM, fixo por período, pacote)
- Implementação futura — estrutura de dados já existe

## Parceiros MV — modelo comercial
- 100% negociável pelo master caso a caso
- Opções: trial grátis, mensalidade fixa, comissão por resgate, personalizado
- Cobrança separada (cartão/boleto) — não tem receita de eventos pra descontar

## Decisões pendentes
- Como explicar regras pro produtor não-técnico (tela "Como funciona")
- Regime tributário (Simples vs Lucro Presumido) — consultar contador
- Integrador de NFS-e
- Modelo de preço da publicidade no Indica
