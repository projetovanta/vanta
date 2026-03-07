/**
 * communityFollowService — seguir/desseguir comunidades via Supabase.
 */
import { supabase } from './supabaseClient';

export const communityFollowService = {
  async isFollowing(userId: string, comunidadeId: string): Promise<boolean> {
    const { count } = await supabase
      .from('community_follows')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('comunidade_id', comunidadeId);
    return (count ?? 0) > 0;
  },

  async follow(userId: string, comunidadeId: string): Promise<void> {
    await supabase.from('community_follows').insert({ user_id: userId, comunidade_id: comunidadeId });
  },

  async unfollow(userId: string, comunidadeId: string): Promise<void> {
    await supabase.from('community_follows').delete().eq('user_id', userId).eq('comunidade_id', comunidadeId);
  },

  async getFollowers(comunidadeId: string): Promise<string[]> {
    const { data } = await supabase
      .from('community_follows')
      .select('user_id')
      .eq('comunidade_id', comunidadeId)
      .limit(5000);
    return (data ?? []).map(r => r.user_id as string);
  },

  async getFollowCount(comunidadeId: string): Promise<number> {
    const { count } = await supabase
      .from('community_follows')
      .select('id', { count: 'exact', head: true })
      .eq('comunidade_id', comunidadeId);
    return count ?? 0;
  },

  async getMyFollows(userId: string): Promise<string[]> {
    const { data } = await supabase.from('community_follows').select('comunidade_id').eq('user_id', userId).limit(1000);
    return (data ?? []).map(r => r.comunidade_id as string);
  },
};
