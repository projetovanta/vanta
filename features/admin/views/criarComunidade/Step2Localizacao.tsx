import React, { useState } from 'react';
import { Check, MapPin } from 'lucide-react';
import { buscarCep, formatCep, geocodeEndereco } from '../../../../services/cepService';

const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';
const labelCls = 'text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5 block';

export const Step2Localizacao: React.FC<{
  cep: string;
  setCep(v: string): void;
  rua: string;
  setRua(v: string): void;
  numero: string;
  setNumero(v: string): void;
  complemento: string;
  setComplemento(v: string): void;
  bairro: string;
  setBairro(v: string): void;
  cidade: string;
  setCidade(v: string): void;
  estado: string;
  setEstado(v: string): void;
  coords: { lat: number; lng: number } | null;
  setCoords(v: { lat: number; lng: number } | null): void;
}> = p => {
  const [buscando, setBuscando] = useState(false);
  const [cepOk, setCepOk] = useState(false);

  const handleCep = async (raw: string) => {
    const formatted = formatCep(raw);
    p.setCep(formatted);
    const clean = raw.replace(/\D/g, '');
    if (clean.length === 8) {
      setBuscando(true);
      setCepOk(false);
      const result = await buscarCep(clean);
      if (result) {
        if (result.logradouro) p.setRua(result.logradouro);
        if (result.bairro) p.setBairro(result.bairro);
        if (result.cidade) p.setCidade(result.cidade);
        if (result.estado) p.setEstado(result.estado);
        setCepOk(true);
        // Geocodificar endereço para obter coords reais
        const geo = await geocodeEndereco(result.logradouro, result.cidade, result.estado);
        if (geo) p.setCoords(geo);
      }
      setBuscando(false);
    } else {
      setCepOk(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* CEP */}
      <div>
        <label className={labelCls}>CEP *</label>
        <div className="relative">
          <input
            value={p.cep}
            onChange={e => handleCep(e.target.value)}
            placeholder="00000-000"
            className={inputCls + ' pr-10'}
            inputMode="numeric"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {buscando && (
              <div className="w-4 h-4 border-2 border-[#FFD300]/30 border-t-[#FFD300] rounded-full animate-spin" />
            )}
            {cepOk && !buscando && <Check size={14} className="text-emerald-400" />}
          </div>
        </div>
        {cepOk && (
          <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest mt-1">
            CEP encontrado — endereço preenchido automaticamente
          </p>
        )}
        {!cepOk && p.cep.replace(/\D/g, '').length === 8 && !buscando && (
          <p className="text-amber-400 text-[9px] font-black uppercase tracking-widest mt-1">
            CEP não encontrado — preencha os campos manualmente
          </p>
        )}
      </div>

      {/* Rua + Número */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className={labelCls}>Rua / Avenida *</label>
          <input
            value={p.rua}
            onChange={e => p.setRua(e.target.value)}
            placeholder="Av. Paulista"
            className={inputCls}
          />
        </div>
        <div className="w-24 shrink-0">
          <label className={labelCls}>Número *</label>
          <input value={p.numero} onChange={e => p.setNumero(e.target.value)} placeholder="1000" className={inputCls} />
        </div>
      </div>

      {/* Complemento */}
      <div>
        <label className={labelCls}>Complemento</label>
        <input
          value={p.complemento}
          onChange={e => p.setComplemento(e.target.value)}
          placeholder="Apto, Bloco, Casa..."
          className={inputCls}
        />
      </div>

      {/* Bairro */}
      <div>
        <label className={labelCls}>Bairro *</label>
        <input
          value={p.bairro}
          onChange={e => p.setBairro(e.target.value)}
          placeholder="Jardins"
          className={inputCls}
        />
      </div>

      {/* Cidade + Estado */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className={labelCls}>Cidade *</label>
          <input
            value={p.cidade}
            onChange={e => p.setCidade(e.target.value)}
            placeholder="São Paulo"
            className={inputCls}
          />
        </div>
        <div className="w-20 shrink-0">
          <label className={labelCls}>Estado *</label>
          <input
            value={p.estado}
            onChange={e => p.setEstado(e.target.value)}
            placeholder="SP"
            className={inputCls}
            maxLength={2}
          />
        </div>
      </div>

      {/* Coords info */}
      {p.coords ? (
        <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3">
          <MapPin size={13} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Coordenadas definidas</p>
            <p className="text-zinc-500 text-[8px] mt-0.5">
              Lat {p.coords.lat.toFixed(4)} · Lng {p.coords.lng.toFixed(4)}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3">
          <MapPin size={13} className="text-zinc-600 shrink-0" />
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
            Digite o CEP para obter coordenadas automáticas
          </p>
        </div>
      )}
    </div>
  );
};
