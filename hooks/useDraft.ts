import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

interface DraftData {
  dados: Record<string, unknown>;
  step_atual: number;
  updated_at: string;
}

interface DraftRow {
  user_id: string;
  tipo: string;
  comunidade_id: string | null;
  dados: Record<string, unknown>;
  step_atual: number;
  updated_at: string;
  expires_at: string;
}

// Client sem tipagem de schema — tabela 'drafts' ainda não está nos types gerados
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim() || 'https://placeholder.supabase.co';
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim() || 'placeholder-anon-key';
const dbUntyped = createClient(supabaseUrl, supabaseKey);

export function useDraft(tipo: 'EVENTO' | 'COMUNIDADE', comunidadeId?: string) {
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Carregar rascunho existente ao montar
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await dbUntyped.auth.getUser();
      if (!user) {
        setDraftLoaded(true);
        return;
      }

      let query = dbUntyped.from('drafts').select('*').eq('user_id', user.id).eq('tipo', tipo);

      if (comunidadeId) query = query.eq('comunidade_id', comunidadeId);
      else query = query.is('comunidade_id', null);

      const { data } = await query.maybeSingle();
      const row = data as DraftRow | null;
      if (row) {
        setHasDraft(true);
        setDraftData({
          dados: row.dados,
          step_atual: row.step_atual,
          updated_at: row.updated_at,
        });
      }
      setDraftLoaded(true);
    })();
  }, [tipo, comunidadeId]);

  // Salvar rascunho com debounce de 3 segundos
  const saveDraft = useCallback(
    (dados: Record<string, unknown>, stepAtual: number) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        const {
          data: { user },
        } = await dbUntyped.auth.getUser();
        if (!user) return;

        await dbUntyped.from('drafts').upsert(
          {
            user_id: user.id,
            tipo,
            comunidade_id: comunidadeId || null,
            dados,
            step_atual: stepAtual,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          { onConflict: 'user_id,tipo,comunidade_id' },
        );

        setHasDraft(true);
      }, 3000);
    },
    [tipo, comunidadeId],
  );

  // Descartar rascunho
  const discardDraft = useCallback(async () => {
    const {
      data: { user },
    } = await dbUntyped.auth.getUser();
    if (!user) return;

    let query = dbUntyped.from('drafts').delete().eq('user_id', user.id).eq('tipo', tipo);

    if (comunidadeId) query = query.eq('comunidade_id', comunidadeId);
    else query = query.is('comunidade_id', null);

    await query;
    setHasDraft(false);
    setDraftData(null);
  }, [tipo, comunidadeId]);

  // Limpar timeout no unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return { draftLoaded, hasDraft, draftData, saveDraft, discardDraft };
}
