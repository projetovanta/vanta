# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-15
# Memória — Event Detail

## Arquivos
- `modules/event-detail/EventDetailView.tsx` (~578L) — view principal
- `modules/event-detail/components/EventHeader.tsx` (~111L) — header com imagem + share + favorito
- `modules/event-detail/components/EventInfo.tsx` (~122L) — info evento (data, local, descrição)
- `modules/event-detail/components/EventFooter.tsx` (~100L) — footer adaptativo por tipo de evento
- `modules/event-detail/components/EventSocialProof.tsx` (~338L) — confirmados, amigos indo (fotos + nomes)
- `modules/event-detail/components/MaisVantaBeneficioModal.tsx` (~196L) — modal resgate MV
- `modules/event-detail/components/PresencaConfirmationModal.tsx` (~85L) — confirmação presença
- `modules/event-detail/components/InviteFriendsModal.tsx` (~127L) — convidar amigos

## Footer Adaptativo (redesign)
- **Pago**: "Eu vou!" (secundário) + "Garantir Ingresso" (dourado principal)
- **Gratuito**: "Eu vou!" como botão dourado principal (sem "Garantir Ingresso")
- **Já comprou**: "Eu vou!" + "Garantido ✓" (verde) — "Eu vou!" sempre visível
- **Lotando (>80%)**: "Últimas vagas" em vermelho (prop `capacityPct` opcional)

## Social Proof
- Amigos primeiro (foto + nome em dourado), depois total geral
- "João e Maria vão + 23 pessoas"
- Sem amigos: "47 pessoas confirmadas"
- Clicável → abre lista com busca

## Seção MAIS VANTA
- Não-membro: "Este evento tem vantagens pra membros — saiba mais" (sutil, Crown icon)
- Membro: benefício + botão "Resgatar Benefício" (dourado)
- Estados: dívida pendente, sem benefício pro perfil, passport necessário, vagas esgotadas

## Funcionalidades
- Variações de ingresso com preço
- Share nativo / copiar link
- Favoritar evento
- Comemoração (aniversário/despedida)
- Review após evento passado
- Report evento
