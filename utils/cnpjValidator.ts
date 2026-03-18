/**
 * cnpjValidator — Validação de CNPJ com consulta à Receita Federal.
 * Fallback: validação de dígito verificador offline se API cair.
 */

/** Valida dígito verificador do CNPJ (offline) */
export function validarDigitoCnpj(cnpj: string): boolean {
  const nums = cnpj.replace(/\D/g, '');
  if (nums.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(nums)) return false; // todos iguais

  const calc = (digits: string, weights: number[]): number => {
    const sum = digits.split('').reduce((s, d, i) => s + Number(d) * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calc(nums.slice(0, 12), w1);
  const d2 = calc(nums.slice(0, 13), w2);

  return Number(nums[12]) === d1 && Number(nums[13]) === d2;
}

/** Formata CNPJ: 12.345.678/0001-90 */
export function formatarCnpj(cnpj: string): string {
  const nums = cnpj.replace(/\D/g, '');
  if (nums.length !== 14) return cnpj;
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
}

export interface DadosReceitaCnpj {
  cnpj: string;
  razaoSocial: string;
  situacao: string; // ATIVA, BAIXADA, SUSPENSA, etc
  atividadePrincipal: string;
  uf: string;
  municipio: string;
  valido: boolean;
}

/**
 * Consulta CNPJ na API pública da Receita Federal.
 * Fallback: se API cair, retorna apenas validação de dígito.
 */
export async function consultarCnpj(cnpj: string): Promise<DadosReceitaCnpj> {
  const nums = cnpj.replace(/\D/g, '');

  // Validação offline primeiro
  if (!validarDigitoCnpj(nums)) {
    return {
      cnpj: nums,
      razaoSocial: '',
      situacao: 'INVÁLIDO',
      atividadePrincipal: '',
      uf: '',
      municipio: '',
      valido: false,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${nums}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return {
      cnpj: nums,
      razaoSocial: data.razao_social ?? '',
      situacao: data.descricao_situacao_cadastral ?? 'DESCONHECIDA',
      atividadePrincipal: data.cnae_fiscal_descricao ?? '',
      uf: data.uf ?? '',
      municipio: data.municipio ?? '',
      valido: (data.descricao_situacao_cadastral ?? '').toUpperCase() === 'ATIVA',
    };
  } catch {
    // Fallback: dígito OK mas sem dados da Receita
    return {
      cnpj: nums,
      razaoSocial: '',
      situacao: 'API INDISPONÍVEL — dígito verificador OK',
      atividadePrincipal: '',
      uf: '',
      municipio: '',
      valido: true, // dígito OK, assumir válido
    };
  }
}
