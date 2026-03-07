import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ── Metrics ──────────────────────────────────────────────
const errorRate = new Rate('errors');
const comprasDuration = new Trend('compras_duration', true);
const listasDuration = new Trend('listas_duration', true);
const promoterDuration = new Trend('promoter_duration', true);
const portariaDuration = new Trend('portaria_duration', true);
const comprasOk = new Counter('compras_ok');
const listasOk = new Counter('listas_ok');
const promoterOk = new Counter('promoter_ok');
const portariaOk = new Counter('portaria_ok');

const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://daldttuibmxwkpbqtebm.supabase.co';
const SUPABASE_ANON = __ENV.SUPABASE_ANON_KEY || '';
const BASE = __ENV.BASE_URL || 'http://localhost:5173';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON,
  'Authorization': `Bearer ${SUPABASE_ANON}`,
  'Prefer': 'return=minimal',
};

export const options = {
  scenarios: {
    // 500 pessoas comprando ingressos
    compradores: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 100 },
        { duration: '30s', target: 500 },
        { duration: '30s', target: 500 },
        { duration: '15s', target: 0 },
      ],
      exec: 'comprarIngresso',
    },
    // 200 entrando na lista
    lista: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 50 },
        { duration: '30s', target: 200 },
        { duration: '30s', target: 200 },
        { duration: '15s', target: 0 },
      ],
      exec: 'entrarLista',
    },
    // 30 promoters adicionando nomes
    promoters: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 30 },
        { duration: '40s', target: 30 },
        { duration: '10s', target: 0 },
      ],
      exec: 'promoterAddNome',
    },
    // 10 portarias fazendo check-in
    portaria: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '30s', target: 10 },
        { duration: '40s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      exec: 'checkinPortaria',
    },
  },
  thresholds: {
    errors: ['rate<0.10'],
    http_req_duration: ['p(95)<5000'],
    compras_duration: ['p(95)<3000'],
    listas_duration: ['p(95)<2000'],
    promoter_duration: ['p(95)<2000'],
    portaria_duration: ['p(95)<2000'],
  },
};

// ── Helpers ──────────────────────────────────────────────
function supabaseGet(path, metric) {
  const res = http.get(`${SUPABASE_URL}${path}`, { headers, timeout: '10s' });
  const ok = res.status >= 200 && res.status < 400;
  errorRate.add(!ok);
  if (metric) metric.add(res.timings.duration);
  return res;
}

function supabasePost(path, body, metric) {
  const res = http.post(`${SUPABASE_URL}${path}`, JSON.stringify(body), { headers, timeout: '10s' });
  const ok = res.status >= 200 && res.status < 400;
  errorRate.add(!ok);
  if (metric) metric.add(res.timings.duration);
  return res;
}

function supabaseRpc(name, params, metric) {
  const res = http.post(`${SUPABASE_URL}/rest/v1/rpc/${name}`, JSON.stringify(params), { headers, timeout: '10s' });
  const ok = res.status >= 200 && res.status < 400;
  errorRate.add(!ok);
  if (metric) metric.add(res.timings.duration);
  return res;
}

// ── Scenario: 500 compradores ────────────────────────────
export function comprarIngresso() {
  group('Fluxo Compra', () => {
    // 1. Carregar pagina do evento (SPA)
    const home = http.get(BASE, { timeout: '10s' });
    check(home, { 'home ok': (r) => r.status === 200 });

    // 2. Listar eventos disponiveis
    const eventos = supabaseGet('/rest/v1/eventos_admin?select=id,nome,slug,status&status=eq.PUBLICADO&limit=5', comprasDuration);
    check(eventos, { 'eventos loaded': (r) => r.status >= 200 && r.status < 400 });

    // 3. Ver detalhes de um evento (lotes + variacoes)
    supabaseGet('/rest/v1/lotes?select=id,nome,preco,qtd_total,qtd_vendida&limit=10', comprasDuration);
    supabaseGet('/rest/v1/variacoes_ingresso?select=id,nome,area,genero&limit=20', comprasDuration);

    // 4. Simular checkout — chamar RPC processar_compra_checkout (read-only, vai falhar com auth mas mede latencia)
    const rpcRes = supabaseRpc('processar_compra_checkout', {
      p_evento_id: '00000000-0000-0000-0000-000000000000',
      p_lote_id: '00000000-0000-0000-0000-000000000000',
      p_variacao_id: null,
      p_comprador_id: '00000000-0000-0000-0000-000000000000',
      p_quantidade: 1,
      p_cupom_codigo: null,
    }, comprasDuration);
    // RPC vai retornar erro (sem auth real) — medimos latencia, nao sucesso
    comprasOk.add(1);
  });

  sleep(0.5 + Math.random() * 1.5);
}

// ── Scenario: 200 entrando na lista ──────────────────────
export function entrarLista() {
  group('Fluxo Lista', () => {
    // 1. Listar listas de evento
    supabaseGet('/rest/v1/listas_evento?select=id,nome,tipo&limit=5', listasDuration);

    // 2. Listar convidados
    supabaseGet('/rest/v1/convidados_lista?select=id,nome,status&limit=20', listasDuration);

    // 3. Ver regras da lista
    supabaseGet('/rest/v1/regras_lista?select=id,genero,limite&limit=10', listasDuration);

    listasOk.add(1);
  });

  sleep(0.3 + Math.random());
}

// ── Scenario: 30 promoters ───────────────────────────────
export function promoterAddNome() {
  group('Fluxo Promoter', () => {
    // 1. Ver cotas do promoter
    supabaseGet('/rest/v1/cotas_promoter?select=id,promoter_id,usado,limite&limit=5', promoterDuration);

    // 2. Ver convidados ja adicionados
    supabaseGet('/rest/v1/convidados_lista?select=id,nome,status,adicionado_por&limit=50', promoterDuration);

    // 3. Buscar perfil por nome (simula busca)
    supabaseGet('/rest/v1/profiles?select=id,nome,avatar_url&nome=ilike.*test*&limit=10', promoterDuration);

    promoterOk.add(1);
  });

  sleep(1 + Math.random() * 2);
}

// ── Scenario: 10 portarias ───────────────────────────────
export function checkinPortaria() {
  group('Fluxo Portaria', () => {
    // 1. Buscar tickets do evento
    supabaseGet('/rest/v1/tickets_caixa?select=id,status,nome_titular&limit=20', portariaDuration);

    // 2. Simular scan QR — verificar ingresso via RPC
    const rpcRes = supabaseRpc('verify_ticket_token', {
      p_token: 'k6-test-token-fake',
    }, portariaDuration);

    // 3. Listar equipe do evento
    supabaseGet('/rest/v1/equipe_evento?select=id,user_id,papel&limit=10', portariaDuration);

    portariaOk.add(1);
  });

  sleep(0.5 + Math.random());
}
