# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Perfil (Profile)

## Arquivos
- `modules/profile/ProfileView.tsx` (717L) — view principal com sub-navegação
- `modules/profile/EditProfileView.tsx` (638L) — edição de perfil
- `modules/profile/PublicProfilePreviewView.tsx` (564L) — preview público
- `modules/profile/ComprovanteMeiaSection.tsx` (494L) — upload comprovante meia
- `modules/profile/ClubeOptInView.tsx` (~670L) — opt-in MAIS VANTA (centralizado verticalmente via margin auto)
- `modules/profile/HistoricoView.tsx` (259L) — histórico de eventos
- `modules/profile/PreferencesView.tsx` (83L) — preferências do app
- `modules/profile/MinhasPendenciasView.tsx` (345L) — pendências (parcerias + amizades pendentes)
- `modules/profile/components/InterestSelector.tsx` (280L) — seletor de interesses
- `modules/profile/components/ImageCropperModal.tsx` (148L) — crop de imagem
- `modules/profile/utils/imageUtils.ts` (44L) — compress/crop

## SubViews
`ProfileSubView` type → EditProfile, Preferences, PublicPreview, Historico, ClubeOptIn, MeiaEntrada, SolicitarParceria, MinhasSolicitacoes, Pendencias, Bloqueados

## Funcionalidades
- Editar: nome, bio, foto, álbum, interesses, cidade, Instagram
- Preview público: como outros users veem o perfil
- Histórico: ingressos + presenças passadas + achievements
- Comprovante meia-entrada: upload fotos
- Clube MAIS VANTA opt-in
- Minhas Pendências: parcerias enviadas (status timeline) + amizades pendentes (enviados/recebidos)
- Botão admin (se tem cargo)
- Logout
