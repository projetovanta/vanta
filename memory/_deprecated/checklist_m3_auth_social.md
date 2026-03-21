# M3 — Auth + Perfil + Social + Chat

## F3.1 — SIGNUP
- QUEM: visitante | ONDE: LoginView → OnboardingView
- COMO: authService.signUp() → supabase.auth.signUp()
- TABELAS: auth.users (INSERT via Supabase Auth), profiles (UPSERT)
- CAMPOS profiles: nome, email, telefone, cpf, data_nascimento, genero, cidade, role='membro'
- NOTIF: nenhuma
- DOWNSTREAM: useAuthStore.currentAccount
- FALTA: login social (Google/Apple) — pendente G7
- STATUS: OK (email/senha)

## F3.2 — LOGIN
- QUEM: usuario | ONDE: LoginView
- COMO: authService.signIn() → supabase.auth.signInWithPassword()
- TABELAS: profiles (SELECT → profileToMembro)
- NOTIF: nenhuma (se ja tem push granted → registerFcmPush silencioso)
- DOWNSTREAM: carrega stores (tickets, social, extras, chat)
- STATUS: OK

## F3.3 — RESET SENHA
- QUEM: usuario | ONDE: ResetPasswordView
- COMO: supabase.auth.resetPasswordForEmail()
- TABELAS: nenhuma (Supabase Auth gerencia)
- NOTIF: email automatico do Supabase
- STATUS: OK

## F3.4 — EXCLUIR CONTA
- QUEM: usuario | ONDE: ProfileView → botao "Excluir minha conta"
- COMO: supabase.from('profiles').update({ excluido: true, excluido_em: agora }) + supabase.auth.signOut()
- TABELAS: profiles (UPDATE excluido, excluido_em) — SOFT DELETE
- UI: modal confirmacao, digitar "EXCLUIR" para confirmar
- NOTIF: nenhuma
- FALTA: hard delete dos dados pessoais (LGPD — apenas marca como excluido, nao apaga dados)
- STATUS: OK (soft delete funcional)

## F3.5 — EDITAR PERFIL
- QUEM: usuario | ONDE: EditProfileView
- COMO: supabase.from('profiles').update(...)
- CAMPOS editaveis: nome, bio, instagram, cidade, avatar_url, data_nascimento, genero
- TABELAS: profiles (UPDATE)
- SUB-FLUXO foto: photoService.uploadAvatar() → Supabase Storage bucket 'avatars'
- SUB-FLUXO album: photoService.uploadAlbum() → bucket 'album'
- DOWNSTREAM: todos que leem profiles (feed cards, chat, evento detail)
- STATUS: OK

## F3.6 — MEIA-ENTRADA (comprovante)
- QUEM: usuario | ONDE: ProfileView → ComprovanteMeiaSection
- COMO: upload comprovante → profiles.comprovante_meia_url
- TABELAS: profiles (UPDATE comprovante_meia_url, meia_verificada)
- QUEM VALIDA: master via GestaoComprovantesView
- STATUS: OK

## F3.7 — ONBOARDING
- QUEM: usuario novo | ONDE: OnboardingView (apos signup)
- COMO: preenche nome, cidade, interesses, foto
- TABELAS: profiles (UPDATE)
- STATUS: OK

## F3.8 — AMIZADE (enviar/aceitar/recusar)
- QUEM: usuario | ONDE: PublicProfilePreviewView, SearchView
- COMO: friendshipsService (enviar, aceitar, recusar, remover, bloquear)
- TABELAS: friendships (INSERT/UPDATE/DELETE)
- NOTIF: notify() "X quer ser seu amigo" tipo AMIZADE — IN_APP + PUSH
- DOWNSTREAM: useSocialStore.friendships, mutuos em EventDetailView
- STATUS: OK

## F3.9 — BUSCAR PESSOAS
- QUEM: usuario | ONDE: SearchView (aba pessoas)
- COMO: authService.buscarMembros(q)
- TABELAS: profiles (SELECT com textSearch)
- STATUS: OK

## F3.10 — ONLINE STATUS
- QUEM: sistema | ONDE: MessagesView, chat
- COMO: messagesService.updateLastSeen() → profiles.last_seen
- TABELAS: profiles (UPDATE last_seen)
- STATUS: OK

## F3.11 — CHAT (enviar mensagem)
- QUEM: usuario | ONDE: MessagesView
- COMO: messagesService.sendMessage()
- TABELAS: messages (INSERT)
- NOTIF: nenhuma push — apenas realtime subscription
- FALTA: push notification quando recebe mensagem offline?
- STATUS: PARCIAL — falta push para msg offline

## F3.12 — CHAT (reactions)
- QUEM: usuario | ONDE: MessagesView (long press)
- COMO: messagesService.addReaction()
- TABELAS: messages (UPDATE reactions JSONB)
- STATUS: OK

## F3.13 — CHAT (deletar mensagem)
- QUEM: usuario | ONDE: MessagesView
- COMO: messagesService.deleteMessage() → soft delete (deleted_at)
- TABELAS: messages (UPDATE deleted_at)
- STATUS: OK

## F3.14 — PREFERENCIAS
- NAO EXISTE como view separada
- Notif preferences: gerenciado via PushPermissionBanner (ON/OFF push browser)
- Tema: nao implementado (dark only)
- Idioma: nao implementado (PT-BR only)
- STATUS: NAO IMPLEMENTADO (nao ha PreferencesView)

## F3.15 — HISTORICO
- QUEM: usuario | ONDE: HistoricoView
- COMO: SELECT tickets_caixa + eventos_admin
- TABELAS: tickets_caixa (SELECT), eventos_admin (SELECT)
- STATUS: OK

## F3.16 — PUBLIC PROFILE PREVIEW
- QUEM: usuario vendo outro | ONDE: PublicProfilePreviewView
- COMO: SELECT profiles + friendships + achievements
- TABELAS: profiles (SELECT), friendships (SELECT), tickets_caixa (SELECT para achievements)
- STATUS: OK

## F3.17 — ACHIEVEMENTS
- QUEM: sistema calcula | ONDE: PublicProfilePreviewView
- COMO: achievementsService.getAchievements()
- TABELAS: tickets_caixa (SELECT), friendships (SELECT), reviews_evento (SELECT)
- STATUS: OK (read-only, calculado on-the-fly)

## F3.18 — SEGUIR COMUNIDADE
- QUEM: usuario | ONDE: ComunidadePublicView
- COMO: communityFollowService.follow/unfollow()
- TABELAS: community_follows (INSERT/DELETE)
- STATUS: OK
