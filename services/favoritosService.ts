import { supabase } from './supabaseClient';

class FavoritosService {
  /** Retorna IDs dos eventos favoritados pelo usuário */
  async getMyFavoritos(userId: string): Promise<string[]> {
    const { data } = await supabase.from('evento_favoritos').select('evento_id').eq('user_id', userId).limit(1000);
    return (data ?? []).map((r: { evento_id: string }) => r.evento_id);
  }

  /** Toggle: desfavorita se já existe, favorita se não. Retorna true = favoritou */
  async toggle(userId: string, eventoId: string): Promise<boolean> {
    // Tenta remover
    const { data: removed } = await supabase
      .from('evento_favoritos')
      .delete()
      .eq('user_id', userId)
      .eq('evento_id', eventoId)
      .select('id');

    if (removed && removed.length > 0) return false; // removeu = desfavoritou

    // Não existia → insere
    const { error } = await supabase.from('evento_favoritos').insert({ user_id: userId, evento_id: eventoId });
    if (error) console.error('[favoritosService] toggle insert:', error);

    return true; // favoritou
  }
}

export const favoritosService = new FavoritosService();
