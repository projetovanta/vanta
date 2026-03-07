/**
 * cepService — Busca de CEP via ViaCEP (API pública, sem autenticação)
 * Autorizado pelo usuário em 2026-02-24.
 * Formato da URL: https://viacep.com.br/ws/{cep}/json/
 */

export interface CepResult {
  logradouro: string; // Ex: "Avenida Paulista"
  bairro: string; // Ex: "Bela Vista"
  cidade: string; // Ex: "São Paulo"
  estado: string; // UF — Ex: "SP"
  estadoNome?: string; // Nome completo — Ex: "São Paulo"
}

const UF_NOME: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

export const formatCep = (v: string): string => {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

/**
 * Busca o CEP na API ViaCEP.
 * Retorna null se CEP inválido ou não encontrado.
 * Nunca lança exceção — erros de rede retornam null silenciosamente.
 */
export const buscarCep = async (cep: string): Promise<CepResult | null> => {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, string>;
    if (data.erro) return null;

    return {
      logradouro: data.logradouro ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      estado: data.uf ?? '',
      estadoNome: UF_NOME[data.uf ?? ''] ?? data.uf ?? '',
    };
  } catch {
    return null;
  }
};

/**
 * Geocodifica um endereço via Nominatim (OpenStreetMap).
 * API pública, sem chave. Retorna null se não encontrar.
 */
export const geocodeEndereco = async (
  endereco: string,
  cidade: string,
  estado: string,
): Promise<{ lat: number; lng: number } | null> => {
  const query = [endereco, cidade, estado, 'Brasil'].filter(Boolean).join(', ');
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { 'Accept-Language': 'pt-BR' } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
};
