/**
 * photoService — upload e gerenciamento de fotos de perfil e álbum.
 *
 * Buckets Supabase:
 *   avatars         → foto de perfil (1 por usuário)
 *   profile-albums  → álbum de fotos (máx 6 por usuário)
 *
 * Estratégia de economia de espaço:
 *   - Avatar: ao trocar, deleta o arquivo anterior antes de fazer upload
 *   - Álbum:  ao remover ou trocar slot, deleta o arquivo anterior
 *   - Nomes de arquivo baseados em posição de slot (album_0.jpg ... album_5.jpg)
 *     → garantia de 1 arquivo por slot, sem acúmulo
 */

import { supabase } from './supabaseClient';

const AVATARS_BUCKET = 'avatars';
const ALBUMS_BUCKET = 'profile-albums';
const MAX_ALBUM_SLOTS = 6;

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Converte dataURL base64 em Blob */
const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return new Blob([buffer], { type: mime });
};

/** Gera URL pública de um path no bucket */
const publicUrl = (bucket: string, path: string): string =>
  supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

// ── Avatar (foto de perfil) ────────────────────────────────────────────────────

/**
 * Faz upload da foto de perfil. Deleta a anterior (se existir no Storage).
 * Retorna a URL pública da nova foto.
 */
export const uploadAvatar = async (userId: string, dataUrl: string): Promise<string> => {
  const path = `${userId}/avatar.jpg`;

  // Remove o arquivo anterior (upsert não é necessário — garantimos delete explícito)
  await supabase.storage
    .from(AVATARS_BUCKET)
    .remove([path])
    .catch(() => {});

  const blob = dataUrlToBlob(dataUrl);
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) throw new Error(`[photoService] Avatar upload falhou: ${error.message}`);

  // Retorna URL com cache-busting para forçar refresh nos navegadores
  return `${publicUrl(AVATARS_BUCKET, path)}?t=${Date.now()}`;
};

/**
 * Deleta o avatar de um usuário (usado ao excluir conta).
 */
export const deleteAvatar = async (userId: string): Promise<void> => {
  await supabase.storage
    .from(AVATARS_BUCKET)
    .remove([`${userId}/avatar.jpg`])
    .catch(() => {});
};

// ── Álbum de fotos ─────────────────────────────────────────────────────────────

/**
 * Faz upload de uma foto no slot indicado (0–5).
 * Deleta qualquer arquivo anterior naquele slot antes de fazer upload.
 * Retorna a URL pública da foto.
 */
export const uploadAlbumPhoto = async (userId: string, slotIndex: number, dataUrl: string): Promise<string> => {
  if (slotIndex < 0 || slotIndex >= MAX_ALBUM_SLOTS) {
    throw new Error(`[photoService] slotIndex inválido: ${slotIndex}`);
  }

  const path = `${userId}/album_${slotIndex}.jpg`;

  // Remove o arquivo anterior do slot (garante que não acumula)
  await supabase.storage
    .from(ALBUMS_BUCKET)
    .remove([path])
    .catch(() => {});

  const blob = dataUrlToBlob(dataUrl);
  const { error } = await supabase.storage
    .from(ALBUMS_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) throw new Error(`[photoService] Album upload slot ${slotIndex} falhou: ${error.message}`);

  return `${publicUrl(ALBUMS_BUCKET, path)}?t=${Date.now()}`;
};

/**
 * Deleta uma foto de álbum por slot.
 */
export const deleteAlbumPhoto = async (userId: string, slotIndex: number): Promise<void> => {
  const path = `${userId}/album_${slotIndex}.jpg`;
  await supabase.storage
    .from(ALBUMS_BUCKET)
    .remove([path])
    .catch(() => {});
};

/**
 * Sincroniza o álbum completo do usuário:
 *   - Para cada slot com dataUrl novo (começa com "data:"), faz upload
 *   - Para cada slot removido (undefined/null mas antes tinha URL), deleta
 *   - Para slots já com URL do Supabase, mantém sem mudança
 *
 * Retorna o array de URLs final (somente slots preenchidos).
 */
export const syncAlbum = async (
  userId: string,
  novoEstado: (string | undefined)[], // array de até 6 elementos
  estadoAnterior: (string | undefined)[],
): Promise<string[]> => {
  const urls: (string | undefined)[] = [...novoEstado];

  for (let i = 0; i < MAX_ALBUM_SLOTS; i++) {
    const novo = novoEstado[i];
    const anterior = estadoAnterior[i];

    if (novo && novo.startsWith('data:')) {
      // Slot com foto nova/trocada → upload
      try {
        urls[i] = await uploadAlbumPhoto(userId, i, novo);
      } catch (e) {
        console.error(`[photoService] Erro no slot ${i}:`, e);
        urls[i] = anterior; // fallback: mantém a anterior
      }
    } else if (!novo && anterior) {
      // Slot removido → deleta do Storage
      await deleteAlbumPhoto(userId, i);
      urls[i] = undefined;
    }
    // else: slot sem mudança — mantém URL atual
  }

  return urls.filter(Boolean) as string[];
};
