import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const homeDuration = new Trend('home_duration', true);
const eventoDuration = new Trend('evento_duration', true);
const checkoutDuration = new Trend('checkout_duration', true);
const supabaseDuration = new Trend('supabase_api_duration', true);

const BASE = __ENV.BASE_URL || 'http://localhost:5173';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://daldttuibmxwkpbqtebm.supabase.co';
const SUPABASE_ANON = __ENV.SUPABASE_ANON_KEY || '';

export const options = {
  scenarios: {
    smoke: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 50 },
        { duration: '20s', target: 100 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    errors: ['rate<0.05'],
    home_duration: ['p(95)<2000'],
    evento_duration: ['p(95)<2000'],
    supabase_api_duration: ['p(95)<2000'],
  },
};

// ── Helpers ──────────────────────────────────────────────
function get(url, metric) {
  const res = http.get(url, { timeout: '10s' });
  const ok = res.status === 200;
  errorRate.add(!ok);
  if (metric) metric.add(res.timings.duration);
  check(res, { [`${url} status 200`]: (r) => r.status === 200 });
  return res;
}

function supabaseGet(path, metric) {
  const headers = {};
  if (SUPABASE_ANON) {
    headers['apikey'] = SUPABASE_ANON;
    headers['Authorization'] = `Bearer ${SUPABASE_ANON}`;
  }
  const res = http.get(`${SUPABASE_URL}${path}`, { headers, timeout: '10s' });
  const ok = res.status >= 200 && res.status < 300;
  errorRate.add(!ok);
  if (metric) metric.add(res.timings.duration);
  check(res, { [`supabase${path} ok`]: (r) => r.status >= 200 && r.status < 300 });
  return res;
}

// ── Cenarios ─────────────────────────────────────────────
export default function () {
  // 1. Home / SPA shell
  get(BASE, homeDuration);

  // 2. Manifest + assets
  get(`${BASE}/manifest.json`);

  // 3. Landing page de evento (slug ficticio — testa o SPA routing)
  get(`${BASE}/evento/teste-k6`, eventoDuration);

  // 4. Checkout page (slug ficticio)
  get(`${BASE}/checkout/teste-k6`, checkoutDuration);

  // 5. Supabase REST API — listar eventos (public, com RLS)
  if (SUPABASE_ANON) {
    supabaseGet('/rest/v1/eventos_admin?select=id,nome,slug&limit=10', supabaseDuration);
    supabaseGet('/rest/v1/comunidades?select=id,nome&limit=5', supabaseDuration);
    supabaseGet('/rest/v1/profiles?select=id,nome&limit=5', supabaseDuration);
  }

  sleep(0.5 + Math.random());
}
