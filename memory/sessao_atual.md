# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `a01367e` — slogan login
## Mudancas locais: SIM (protótipos admin V2/V3 + modelo financeiro)

## Repositorio e Deploy
- **GitHub**: `projetovanta/vanta` (conta: projetovanta)
- **Vercel**: projeto `vanta-a2b3` (danloures-projects) conectado a projetovanta/vanta

## O que foi feito nesta sessao

### Redesign do app (lado usuário) — COMPLETO
- Guest modal contextual, onboarding 3 telas, cadastro glass
- Home reorganizada + camada MV, VANTA Indica 5 tipos
- Detalhe evento footer adaptativo, perfil simplificado
- Checkout confete, busca "Pra Você", radar parceiros
- Minha Experiência, login redesign
- Auditoria copy (deals→benefícios, grátis→VIP, login slogan)

### Protótipos admin (paralelos, sem tocar no atual)
- `/admin-v2` — sidebar 5 ícones + glass + command palette
- `/admin-v3` — 16 itens mesclados em 4 seções + tabs internas + dashboard financeiro intuitivo
- Backup do admin atual: AdminSidebar.backup.tsx + AdminDashboardView.backup.tsx

### Modelo financeiro DEFINIDO (memory/projeto_modelo_financeiro.md)
- 4 fontes de receita: taxa ingresso + assinatura produtor + parceiros MV + publicidade Indica
- Taxa variável por negócio (master define)
- D+15 após evento, master autoriza repasse
- Stripe Connect + PIX manual como alternativa
- Reembolso: produtor absorve
- Porta: só registra, sem cobrar (negociável)
- Negociação com aceite 7 dias + pausa automática
- Pagamento SEMPRE no site (nunca in-app — evita 30% Apple)
- Apple Pay + Google Pay + PIX + cartão no site
- Nota fiscal obrigatória (NFS-e)
- Extrato completo pro produtor
- Tudo negociável caso a caso pelo master

## Pendencias

### Implementação financeira (próxima sessão)
- Criar tela "Negociação comercial" no painel master
- Criar tela "Minhas condições" pro produtor
- Integrar Stripe Connect
- Implementar checkout real no site (Stripe + PIX + Apple Pay)
- Extrato do produtor
- Campo de aceite de condições com prazo 7 dias

### Outras pendências
- Regime tributário (consultar contador)
- Integrador NFS-e
- Modelo preço publicidade Indica
- Tela "Como funciona" pro produtor não-técnico
- Login social (Google/Apple)
- Teste no celular real
- CNPJ + emails legais
- Deep links + Info.plist
