/**
 * process-scheduled-push — Processa campanhas agendadas pendentes.
 *
 * Chamado a cada minuto via pg_cron + pg_net.
 * Busca push_agendados com status=PENDENTE e agendar_para <= now(),
 * resolve destinatarios, dispara via send-push/in-app/email, atualiza status.
 *
 * Secrets necessarios:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function nowBRT(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const agora = nowBRT();

    // 1. Buscar campanhas pendentes que ja passaram do horario
    const { data: pendentes, error: fetchErr } = await supabase
      .from('push_agendados')
      .select('*')
      .eq('status', 'PENDENTE')
      .lte('agendar_para', agora)
      .limit(10);

    if (fetchErr) {
      console.error('[process-scheduled-push] fetch error:', fetchErr);
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!pendentes || pendentes.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[process-scheduled-push] ${pendentes.length} campanha(s) para processar`);

    const results: { id: string; status: string; resultado?: Record<string, unknown> }[] = [];

    for (const campanha of pendentes) {
      try {
        // 2. Resolver destinatarios com base no segmento
        const destinatarios = await resolverDestinatarios(supabase, campanha.segmento_tipo, campanha.segmento_valor);

        if (destinatarios.length === 0) {
          await supabase
            .from('push_agendados')
            .update({ status: 'ERRO', resultado: { erro: 'Nenhum destinatario encontrado' }, enviado_em: nowBRT() })
            .eq('id', campanha.id);
          results.push({ id: campanha.id, status: 'ERRO' });
          continue;
        }

        const canais: string[] = campanha.canais ?? ['IN_APP'];
        const resultado: Record<string, { enviados: number; erros: number }> = {};

        // 3. In-App
        if (canais.includes('IN_APP')) {
          let enviados = 0;
          let erros = 0;
          for (const d of destinatarios) {
            const { error: insertErr } = await supabase.from('notifications').insert({
              user_id: d.id,
              tipo: campanha.tipo_acao ?? 'SISTEMA',
              titulo: campanha.titulo,
              mensagem: campanha.mensagem,
              lida: false,
              link: campanha.link_notif ?? '',
              created_at: nowBRT(),
            });
            if (insertErr) erros++;
            else enviados++;
          }
          resultado.inApp = { enviados, erros };
        }

        // 4. Push (via send-push edge function)
        if (canais.includes('PUSH')) {
          try {
            const pushRes = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                userIds: destinatarios.map(d => d.id),
                title: campanha.titulo,
                body: campanha.mensagem,
                data: { link: campanha.link_notif ?? '', tipo: campanha.tipo_acao ?? 'SISTEMA' },
              }),
            });
            const pushData = await pushRes.json();
            resultado.push = { enviados: pushData?.sent ?? 0, erros: (pushData?.total ?? 0) - (pushData?.sent ?? 0) };
          } catch {
            resultado.push = { enviados: 0, erros: destinatarios.length };
          }
        }

        // 5. Email (via send-invite edge function)
        if (canais.includes('EMAIL')) {
          let enviados = 0;
          let erros = 0;
          for (const d of destinatarios) {
            try {
              const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-invite`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({ nome: d.nome, email: d.email, mensagem: campanha.mensagem, tipo: 'broadcast' }),
              });
              const emailData = await emailRes.json();
              if (emailData?.ok) enviados++;
              else erros++;
            } catch {
              erros++;
            }
          }
          resultado.email = { enviados, erros };
        }

        // 6. Atualizar status
        await supabase
          .from('push_agendados')
          .update({ status: 'ENVIADO', resultado, enviado_em: nowBRT() })
          .eq('id', campanha.id);

        results.push({ id: campanha.id, status: 'ENVIADO', resultado });
        console.log(`[process-scheduled-push] campanha ${campanha.id} enviada`, resultado);
      } catch (err) {
        console.error(`[process-scheduled-push] erro campanha ${campanha.id}:`, err);
        await supabase
          .from('push_agendados')
          .update({ status: 'ERRO', resultado: { erro: String(err) }, enviado_em: nowBRT() })
          .eq('id', campanha.id);
        results.push({ id: campanha.id, status: 'ERRO' });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[process-scheduled-push] fatal:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ── Resolver destinatarios ────────────────────────────────────────────────

type Dest = { id: string; email: string; nome: string };

async function resolverDestinatarios(
  supabase: ReturnType<typeof createClient>,
  segmentoTipo: string,
  segmentoValor: string,
): Promise<Dest[]> {
  switch (segmentoTipo) {
    case 'TODOS': {
      const { data } = await supabase.from('profiles').select('id, email, nome').limit(2000);
      return (data ?? []) as Dest[];
    }
    case 'TAG': {
      const { data } = await supabase
        .from('membros_clube')
        .select('user_id, profiles!inner(id, email, nome)')
        .contains('tags', [segmentoValor]);
      return (data ?? []).map((r: Record<string, unknown>) => {
        const p = r.profiles as Record<string, unknown>;
        return { id: p.id as string, email: p.email as string, nome: p.nome as string };
      });
    }
    case 'COMUNIDADE': {
      const { data } = await supabase
        .from('community_follows')
        .select('user_id, profiles!inner(id, email, nome)')
        .eq('community_id', segmentoValor);
      return (data ?? []).map((r: Record<string, unknown>) => {
        const p = r.profiles as Record<string, unknown>;
        return { id: p.id as string, email: p.email as string, nome: p.nome as string };
      });
    }
    case 'EVENTO': {
      const { data } = await supabase
        .from('tickets_caixa')
        .select('owner_id, profiles!inner(id, email, nome)')
        .eq('evento_id', segmentoValor)
        .in('status', ['DISPONIVEL', 'USADO']);
      const seen = new Set<string>();
      return (data ?? [])
        .map((r: Record<string, unknown>) => {
          const p = r.profiles as Record<string, unknown>;
          return { id: p.id as string, email: p.email as string, nome: p.nome as string };
        })
        .filter(d => {
          if (seen.has(d.id)) return false;
          seen.add(d.id);
          return true;
        });
    }
    case 'CIDADE': {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, nome')
        .ilike('cidade', segmentoValor);
      return (data ?? []) as Dest[];
    }
    default:
      return [];
  }
}
