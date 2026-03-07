# Criado: 2026-03-06 01:00 | Ultima edicao: 2026-03-06 01:00
# graph_identidade.md — Identidade & Conta

## Nos
| ID | Nome | Arquivo principal | Linhas |
|---|---|---|---|
| ID01 | Signup (cadastro) | components/AuthModal.tsx | 537 |
| ID02 | Login | components/AuthModal.tsx | 537 |
| ID03 | Logout | modules/profile/ProfileView.tsx | 732 |
| ID04 | Reset de senha | components/ResetPasswordView.tsx | 123 |
| ID05 | Perfil (view principal) | modules/profile/ProfileView.tsx | 732 |
| ID06 | Editar perfil | modules/profile/EditProfileView.tsx | 666 |
| ID07 | Foto + crop | modules/profile/components/ImageCropperModal.tsx | 148 |
| ID08 | Album de fotos | services/photoService.ts | 151 |
| ID09 | Preview publico | modules/profile/PublicProfilePreviewView.tsx | 747 |
| ID10 | Historico | modules/profile/HistoricoView.tsx | 259 |
| ID11 | Preferencias | modules/profile/PreferencesView.tsx | 83 |
| ID12 | Meia-entrada | modules/profile/ComprovanteMeiaSection.tsx | 494 |
| ID13 | Excluir conta | modules/profile/ProfileView.tsx | 732 |
| ID14 | Alterar senha | modules/profile/ProfileView.tsx | 732 |
| ID15 | Clube opt-in | modules/profile/ClubeOptInView.tsx | 785 |

## Navegacao (como o usuario chega)
| De | Para | Gatilho |
|---|---|---|
| Qualquer tela (sem login) | ID01 Signup | Clica acao que exige auth -> AuthModal step 1-3 |
| AuthModal | ID02 Login | Toggle "Ja tenho conta" dentro do AuthModal |
| ID02 Login | ID04 Reset | Link "Esqueci minha senha" -> resetPasswordForEmail |
| PASSWORD_RECOVERY event | ID04 Reset | Supabase redireciona com token -> ResetPasswordView |
| Bottom nav "Perfil" | ID05 Perfil | navigateToTab('PERFIL') |
| ID05 Perfil | ID06 Editar | setSubView('EDIT_PROFILE') |
| ID06 Editar | ID07 Foto+crop | Clica foto -> ImageCropperModal |
| ID06 Editar | ID08 Album | Clica slot album -> photoService.syncAlbum |
| ID05 Perfil | ID09 Preview | setSubView('PREVIEW_PUBLIC') |
| ID05 Perfil | ID10 Historico | setSubView('HISTORICO') |
| ID05 Perfil | ID11 Prefs | setSubView('PREFERENCES') |
| ID05 Perfil | ID12 Meia | setSubView('MEIA_ENTRADA') |
| ID05 Perfil | ID13 Excluir | Botao "Excluir minha conta" -> modal confirmacao |
| ID05 Perfil | ID14 Alterar senha | Botao "Alterar Senha" -> modal |
| ID05 Perfil | ID15 Clube | setSubView('CLUBE') |
| Notificacao tipo CLUBE | ID15 Clube | handleNotificationAction -> PERFIL + CLUBE |

## Servicos e Stores
| Servico | Arquivo | Usado por |
|---|---|---|
| authService | services/authService.ts (348L) | ID01, ID02, ID03, ID04 |
| photoService | services/photoService.ts (151L) | ID07, ID08 |
| useAuthStore | stores/authStore.ts (193L) | TODOS |
| authHelpers | components/auth/authHelpers.ts (36L) | ID01 |
| selfieAnalysis | components/auth/selfieAnalysis.ts (142L) | ID01 |
| comprovanteService | features/admin/services/comprovanteService.ts | ID12 |
| clubeService | features/admin/services/clubeService.ts | ID15 |

## Tabelas Supabase
| Tabela | Operacao | Usado por |
|---|---|---|
| profiles | SELECT/UPDATE/UPSERT | ID01-ID15 |
| comprovantes_meia | SELECT/INSERT | ID12 |
| solicitacoes_clube | SELECT/INSERT | ID15 |
| membros_clube | SELECT | ID15 |
| avatars (bucket) | UPLOAD/DELETE | ID07, ID08 |

## Fluxos end-to-end (cadeia completa ate nao ter mais consequencia)

### 1. SIGNUP (cadeia completa)
```
Usuario: AuthModal step1(dados pessoais) -> step2(contato+senha) -> step3(selfie com analise)
-> authService.signUp -> supabase.auth.signUp -> profiles.upsert (17 campos)
-> enrichInstagramFollowers (background, se tem instagram)
-> notificationsService.add(tipo:SISTEMA, "Novo membro para curadoria")
-> Login automatico -> authStore.set -> Feed

Master recebe: NotificacoesAdminView mostra notificacao SISTEMA
-> Master abre CuradoriaView -> TabNovosMembros (curadoria_concluida=false)
-> Master seleciona membro -> MembroCuradoriaDetalhe
-> Master classifica com tags -> concluirCuradoriaComTags
-> profiles.update(curadoria_concluida:true, tags_curadoria:[...])
-> auditService.log(MEMBRO_APROVADO, tags, curadoria_por, curadoria_em)
-> Membro migra para TabMembros (classificados)
-> Master pode: toggleDestaque(destaque_curadoria) ou ConviteMaisVantaModal
FIM
```

### 2. LOGIN
```
Usuario: AuthModal toggle "Ja tenho conta" -> email + senha
-> authService.signIn -> signInWithPassword -> profiles.select(*)
-> authStore.set(currentAccount, profile) -> Feed
-> enrichInstagramFollowers (background, 1x se campo vazio)
FIM
```

### 3. LOGOUT
```
Usuario: ProfileView botao Sair -> authService.signOut
-> supabase.auth.signOut -> authStore.clear -> AuthModal
FIM (sem consequencia para outros atores)
```

### 4. RESET SENHA
```
Usuario: AuthModal -> "Esqueci minha senha" -> resetPasswordForEmail(email)
-> Supabase envia email com link de recuperacao
-> Usuario clica link -> Supabase redireciona com tokens na URL
-> onAuthStateChange detecta PASSWORD_RECOVERY event
-> window.dispatchEvent('vanta:password-recovery')
-> App.tsx escuta evento -> mostra ResetPasswordView
-> Usuario digita nova senha -> supabase.auth.updateUser({password})
-> Toast "Senha alterada" -> volta ao app
FIM
```

### 5. EXCLUIR CONTA
```
Usuario: ProfileView -> botao "Excluir minha conta"
-> Modal confirmacao: digitar "EXCLUIR"
-> profiles.update(excluido:true, excluido_em:timestamp-03:00)
-> supabase.auth.signOut -> onLogout -> AuthModal
-> NENHUMA notificacao pro admin (exclusao silenciosa)
-> DatabaseHealthView pode detectar perfis excluidos (check de saude)
FIM
```

### 6. ALTERAR SENHA
```
Usuario: ProfileView -> botao "Alterar Senha" -> modal
-> Digita senha atual + nova + confirmacao
-> supabase.auth.updateUser({password: nova})
-> Toast sucesso/erro -> fecha modal
FIM (sem consequencia para outros atores)
```

### 7. EDITAR PERFIL
```
Usuario: ProfileView -> setSubView('EDIT_PROFILE') -> EditProfileView
-> Edita ate 12 campos (nome, bio, instagram, genero, estado, cidade, etc)
-> profiles.update({...campos}) -> toast "Perfil atualizado"
-> onBack -> volta pro ProfileView
-> Mudancas refletem em: PublicProfilePreview, chat, social proof, busca
FIM
```

### 8. FOTO + ALBUM
```
Usuario: EditProfileView -> clica foto de perfil
-> ImageCropperModal (crop quadrado)
-> photoService.uploadAvatar -> bucket avatars/{userId}/avatar.jpg
-> profiles.update(avatar_url) -> preview atualiza

Album: EditProfileView -> clica slot 1-6
-> photoService.uploadAlbumPhoto -> bucket avatars/{userId}/album_N.jpg
-> photoService.syncAlbum atualiza array de URLs
-> Fotos visiveis no PublicProfilePreviewView
FIM
```

### 9. MEIA-ENTRADA (cadeia completa)
```
Usuario: ProfileView -> setSubView('MEIA_ENTRADA') -> ComprovanteMeiaSection
-> Upload foto do comprovante -> comprovantes_meia.insert(status:'pendente')
-> Aguarda aprovacao

Admin: GestaoComprovantesView (features/admin/views/GestaoComprovantesView.tsx)
-> Ve comprovantes pendentes -> aprovar ou rejeitar
-> comprovantes_meia.update(status:'aprovado'/'rejeitado')
-> Se aprovado: usuario pode usar desconto meia no checkout
FIM
```

### 10. CLUBE OPT-IN (cadeia completa)
```
Usuario: ProfileView -> setSubView('CLUBE') -> ClubeOptInView
-> Verifica elegibilidade (maisVantaConfigService)
-> solicitacoes_clube.insert

Admin: CuradoriaView -> tabClube -> SubTabMembros
-> Ve solicitacao -> PerfilMembroOverlay
-> Aprovar: membros_clube.insert -> membro ganha tier
-> Rejeitar: solicitacoes_clube.update(status:'rejeitado')
-> Se aprovado: membro ve beneficios MV no EventDetail (lotes exclusivos, reservas)
FIM
```

## Checklist de Status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Signup 3 steps | OK | AuthModal -> authService.signUp -> profiles.upsert |
| 2 | Login email+senha | OK | authService.signIn -> signInWithPassword |
| 3 | Logout | OK | authService.signOut -> authStore.clear |
| 4 | Reset senha | OK | resetPasswordForEmail -> ResetPasswordView -> updateUser |
| 5 | Editar perfil | OK | EditProfileView -> profiles.update (12 campos) |
| 6 | Foto + crop | OK | ImageCropperModal -> photoService.uploadAvatar |
| 7 | Album 6 slots | OK | photoService.uploadAlbumPhoto + syncAlbum |
| 8 | Preview publico | OK | PublicProfilePreviewView (747L) |
| 9 | Historico | OK | HistoricoView (259L) |
| 10 | Meia-entrada | OK | ComprovanteMeiaSection -> GestaoComprovantesView (admin) |
| 11 | Excluir conta | OK | soft delete + signOut (sem notif pro admin) |
| 12 | Alterar senha | OK | updateUser({password}) via modal |
| 13 | Clube opt-in | OK | ClubeOptInView -> solicitacoes_clube |
| 14 | Curadoria master | OK | CuradoriaView -> concluirCuradoriaComTags -> audit |
| 15 | Preferencias notif | QUEBRADO | Toggles NAO salvam no Supabase — fake setTimeout, perde ao relogar |
| 16 | Rate limiting login | INCOMPLETO | Apenas sessionStorage client-side, facilmente contornavel |
| 17 | Login social | NAO EXISTE | Google/Apple Sign-In nao implementado |
| 18 | Onboarding slides | NAO EXISTE | Flag localStorage existe mas sem componente visual |
| 19 | Excluir conta notif | INCOMPLETO | Nenhuma notificacao pro admin quando usuario exclui conta |
