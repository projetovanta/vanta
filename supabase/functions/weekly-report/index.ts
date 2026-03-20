/**
 * weekly-report — Supabase Edge Function
 *
 * Gera relatório semanal para cada comunidade ativa e envia push + email ao gerente/sócio.
 * Agendada via pg_cron: todo domingo às 10h BRT.
 *
 * POST /functions/v1/weekly-report
 * Headers: Authorization: Bearer <service_role_key>
 *
 * Pode ser chamada manualmente (masteradm) ou via cron.
 * Body opcional: { comunidadeId?: string } — para gerar de uma comunidade específica.
 *
 * Variáveis de ambiente:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('origin') ?? '';
  if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174') return origin;
  return 'https://maisvanta.com';
}
let corsHeaders = { 'Access-Control-Allow-Origin': 'https://maisvanta.com', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

/** Timestamp BRT -03:00 */
const nowBRT = () =>
  new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

/** Data formatada YYYY-MM-DD */
const fmtDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

serve(async (req: Request) => {
  corsHeaders = { 'Access-Control-Allow-Origin': getCorsOrigin(req), 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Opcional: gerar para uma comunidade específica
    let targetComunidadeId: string | null = null;
    try {
      const body = await req.json();
      targetComunidadeId = body?.comunidadeId ?? null;
    } catch {
      // Body vazio = gerar para todas
    }

    // Buscar comunidades ativas (com pelo menos 1 evento)
    const { data: comunidades } = await supabase
      .from('comunidades')
      .select('id, nome');

    if (!comunidades?.length) {
      return new Response(JSON.stringify({ ok: true, reports: 0, reason: 'Nenhuma comunidade.' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const targets = targetComunidadeId
      ? comunidades.filter(c => c.id === targetComunidadeId)
      : comunidades;

    const now = new Date();
    const startThisWeek = new Date(now);
    startThisWeek.setDate(now.getDate() - now.getDay());
    startThisWeek.setHours(0, 0, 0, 0);

    const startLastWeek = new Date(startThisWeek);
    startLastWeek.setDate(startLastWeek.getDate() - 7);

    const thisWeekFilter = startThisWeek.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
    const lastWeekFilter = startLastWeek.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

    let reportsGenerated = 0;

    for (const com of targets) {
      // Buscar eventos da comunidade
      const { data: eventos } = await supabase
        .from('eventos_admin')
        .select('id')
        .eq('comunidade_id', com.id);

      const eventoIds = eventos?.map(e => e.id) ?? [];
      if (!eventoIds.length) continue;

      // Vendas desta semana
      const { data: twTickets } = await supabase
        .from('tickets_caixa')
        .select('status, valor')
        .in('evento_id', eventoIds)
        .gte('criado_em', thisWeekFilter)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('origem', 'in', '("CORTESIA","CAIXA")');

      // Vendas semana passada
      const { data: lwTickets } = await supabase
        .from('tickets_caixa')
        .select('status, valor')
        .in('evento_id', eventoIds)
        .gte('criado_em', lastWeekFilter)
        .lt('criado_em', thisWeekFilter)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('origem', 'in', '("CORTESIA","CAIXA")');

      const tw = twTickets ?? [];
      const lw = lwTickets ?? [];

      const twVendas = tw.length;
      const lwVendas = lw.length;
      const twReceita = tw.reduce((s, t) => s + (t.valor ?? 0), 0);
      const lwReceita = lw.reduce((s, t) => s + (t.valor ?? 0), 0);
      const twCheckins = tw.filter(t => t.status === 'USADO').length;
      const lwCheckins = lw.filter(t => t.status === 'USADO').length;
      const twNoShow = twVendas > 0 ? ((twVendas - twCheckins) / twVendas) * 100 : 0;

      const pctDelta = (curr: number, prev: number) =>
        prev > 0 ? ((curr - prev) / prev) * 100 : 0;

      const reportData = {
        comunidadeId: com.id,
        comunidadeNome: com.nome,
        semanaInicio: fmtDate(startThisWeek),
        semanaFim: fmtDate(now),
        vendas: {
          total: twVendas,
          delta: Math.round(pctDelta(twVendas, lwVendas) * 10) / 10,
          receita: twReceita,
          receitaDelta: Math.round(pctDelta(twReceita, lwReceita) * 10) / 10,
        },
        publico: {
          checkins: twCheckins,
          checkinsDelta: Math.round(pctDelta(twCheckins, lwCheckins) * 10) / 10,
          taxaNoShow: Math.round(twNoShow * 10) / 10,
        },
        geradoEm: nowBRT(),
      };

      // Salvar no banco
      const { error: insertErr } = await supabase
        .from('relatorios_semanais')
        .upsert({
          comunidade_id: com.id,
          semana_inicio: fmtDate(startThisWeek),
          semana_fim: fmtDate(now),
          dados: reportData,
          enviado_em: nowBRT(),
        }, { onConflict: 'comunidade_id,semana_inicio' });

      if (insertErr) {
        console.error(`[weekly-report] insert error for ${com.id}:`, insertErr.message);
        continue;
      }

      // Buscar gerentes/sócios da comunidade para notificar
      const { data: followers } = await supabase
        .from('community_follows')
        .select('user_id')
        .eq('comunidade_id', com.id);

      const userIds = followers?.map(f => f.user_id) ?? [];

      if (userIds.length > 0) {
        // Inserir notificação in-app
        const notifRows = userIds.map(uid => ({
          user_id: uid,
          tipo: 'RELATORIO_SEMANAL',
          titulo: `Relatório Semanal — ${com.nome}`,
          mensagem: `${twVendas} vendas (${pctDelta(twVendas, lwVendas) > 0 ? '+' : ''}${Math.round(pctDelta(twVendas, lwVendas))}%) · R$ ${twReceita.toFixed(0)} receita`,
          lida: false,
        }));
        await supabase.from('notifications').insert(notifRows);

        // Enviar push via send-push (invocação interna)
        try {
          await supabase.functions.invoke('send-push', {
            body: {
              userIds,
              title: `📊 Relatório Semanal — ${com.nome}`,
              body: `${twVendas} vendas esta semana · R$ ${twReceita.toFixed(0)}`,
              data: { type: 'RELATORIO_SEMANAL', comunidadeId: com.id },
            },
          });
        } catch (pushErr) {
          console.error(`[weekly-report] push error for ${com.id}:`, pushErr);
        }
      }

      reportsGenerated++;
      console.log(`[weekly-report] generated for ${com.nome}`, {
        vendas: twVendas,
        receita: twReceita,
        notificados: userIds.length,
      });
    }

    return new Response(JSON.stringify({ ok: true, reports: reportsGenerated }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[weekly-report] error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
