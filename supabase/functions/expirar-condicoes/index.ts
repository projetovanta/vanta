/**
 * expirar-condicoes — Supabase Edge Function
 *
 * Cron job (1x/dia): Expira condições comerciais pendentes com prazo vencido.
 * Atualiza status da comunidade para PAUSADO.
 * Envia notificação ao master e ao responsável.
 *
 * POST /functions/v1/expirar-condicoes
 * Body: {} (vazio, chamado por cron)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const nowBRT = () =>
  new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

serve(async (_req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const agora = nowBRT();

    // 1. Buscar condições pendentes expiradas
    const { data: expiradas, error: fetchErr } = await supabase
      .from('condicoes_comerciais')
      .select('id, comunidade_id, definido_por')
      .eq('status', 'PENDENTE')
      .lt('expira_em', agora);

    if (fetchErr) {
      console.error('[expirar-condicoes] fetch error:', fetchErr);
      return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 });
    }

    if (!expiradas || expiradas.length === 0) {
      return new Response(JSON.stringify({ message: 'Nada para expirar', count: 0 }), { status: 200 });
    }

    const ids = expiradas.map((e: { id: string }) => e.id);
    const comunidadeIds = [...new Set(expiradas.map((e: { comunidade_id: string }) => e.comunidade_id))];

    // 2. Marcar como EXPIRADO
    const { error: updateErr } = await supabase
      .from('condicoes_comerciais')
      .update({ status: 'EXPIRADO' })
      .in('id', ids);

    if (updateErr) {
      console.error('[expirar-condicoes] update error:', updateErr);
    }

    // 3. Pausar comunidades
    for (const comId of comunidadeIds) {
      await supabase
        .from('comunidades')
        .update({ condicoes_status: 'PAUSADO' })
        .eq('id', comId);
    }

    // 4. Notificar master e responsáveis
    for (const cond of expiradas) {
      // Notificar master
      await supabase.from('notifications').insert({
        user_id: cond.definido_por,
        titulo: 'Condições expiradas',
        mensagem: 'As condições comerciais não foram aceitas no prazo. Comunidade pausada.',
        tipo: 'SISTEMA',
        lida: false,
        link: '',
        created_at: agora,
      });

      // Buscar dono da comunidade
      const { data: com } = await supabase
        .from('comunidades')
        .select('dono_id')
        .eq('id', cond.comunidade_id)
        .single();

      if (com?.dono_id && com.dono_id !== cond.definido_por) {
        await supabase.from('notifications').insert({
          user_id: com.dono_id,
          titulo: 'Comunidade pausada',
          mensagem: 'As condições comerciais expiraram. Atividades pausadas até novo aceite.',
          tipo: 'SISTEMA',
          lida: false,
          link: '',
          created_at: agora,
        });
      }
    }

    console.log(`[expirar-condicoes] Expiradas: ${ids.length}, Comunidades pausadas: ${comunidadeIds.length}`);

    return new Response(
      JSON.stringify({ message: 'OK', expiradas: ids.length, comunidadesPausadas: comunidadeIds.length }),
      { status: 200 },
    );
  } catch (err) {
    console.error('[expirar-condicoes] erro:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
