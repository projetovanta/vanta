import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Check,
  X,
  Instagram,
  ExternalLink,
  MapPin,
  Users,
  Music2,
  Building2,
  Zap,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { parceriaService, SolicitacaoParceria } from '../services/parceriaService';
import { comunidadesService } from '../services/comunidadesService';
import { globalToast } from '../../../components/Toast';

type AbaStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export const SolicitacoesParceriaView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const [aba, setAba] = useState<AbaStatus>('PENDENTE');
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoParceria[]>([]);
  const [loading, setLoading] = useState(true);
  const [detalhe, setDetalhe] = useState<SolicitacaoParceria | null>(null);
  const [rejeitando, setRejeitando] = useState(false);
  const [aprovando, setAprovando] = useState(false);
  const [showTaxas, setShowTaxas] = useState(false);
  const [showAvancado, setShowAvancado] = useState(false);
  const [taxas, setTaxas] = useState({
    taxaServico: 10,
    taxaProcessamento: 2.5,
    quemPaga: 'PRODUTOR_ESCOLHE' as 'PRODUTOR_ABSORVE' | 'COMPRADOR_PAGA' | 'PRODUTOR_ESCOLHE',
    taxaMinima: 2,
    taxaPorta: 10,
    cotaNomes: 500,
    cotaCortesias: 50,
    taxaNomeExcedente: 0.5,
    taxaCortesiaExcedentePct: 5,
    taxaFixaEvento: 0,
  });
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [fotoFullscreen, setFotoFullscreen] = useState<string | null>(null);

  const carregar = async () => {
    setLoading(true);
    const data = await parceriaService.listarTodas(aba);
    setSolicitacoes(data);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba]);

  const handleRejeitar = async () => {
    if (!detalhe) return;
    setRejeitando(true);
    const ok = await parceriaService.rejeitar(detalhe.id, motivoRejeicao.trim() || 'Não aprovado');
    setRejeitando(false);
    if (ok) {
      setDetalhe(null);
      setMotivoRejeicao('');
      carregar();
    }
  };

  const handleConfirmarAprovacao = async () => {
    if (!detalhe) return;
    setAprovando(true);
    try {
      // 1. Criar comunidade com dados da solicitação
      const comunidadeId = await comunidadesService.criar({
        nome: detalhe.nome,
        descricao: `${detalhe.tipo === 'PRODUTORA' ? 'Produtora' : 'Espaço'} — ${detalhe.categoria}`,
        cidade: detalhe.cidade,
        endereco: detalhe.googleMaps ?? '',
        foto: detalhe.fotos?.[0] ?? undefined,
        donoId: detalhe.userId,
        createdBy: detalhe.userId,
        telefone: detalhe.telefone,
      });

      if (!comunidadeId) {
        globalToast('erro', 'Erro ao criar comunidade. Tente novamente.');
        setAprovando(false);
        return;
      }

      // 2. Definir taxas na comunidade criada
      await comunidadesService.atualizar(comunidadeId, {
        vanta_fee_percent: taxas.taxaServico / 100,
        vanta_fee_fixed: taxas.taxaMinima,
        gateway_fee_mode: taxas.quemPaga === 'COMPRADOR_PAGA' ? 'REPASSAR' : 'ABSORVER',
        taxa_processamento_percent: taxas.taxaProcessamento / 100,
        taxa_porta_percent: taxas.taxaPorta / 100,
        taxa_minima: taxas.taxaMinima,
        cota_nomes_lista: taxas.cotaNomes,
        cota_cortesias: taxas.cotaCortesias,
        taxa_nome_excedente: taxas.taxaNomeExcedente,
        taxa_cortesia_excedente_pct: taxas.taxaCortesiaExcedentePct / 100,
        vanta_fee_repasse_percent: taxas.quemPaga === 'COMPRADOR_PAGA' ? taxas.taxaServico / 100 : 0,
      });

      // 3. Aprovar solicitação (marca APROVADA + notifica solicitante)
      const ok = await parceriaService.aprovar(detalhe.id, comunidadeId);
      if (ok) {
        globalToast('sucesso', `Comunidade "${detalhe.nome}" criada com taxa de ${taxas.taxaServico}%!`);
        setDetalhe(null);
        setShowTaxas(false);
        carregar();
      } else {
        globalToast('erro', 'Comunidade criada mas erro ao aprovar solicitação.');
      }
    } catch (e) {
      console.error('[SolicitacoesParceriaView] handleConfirmarAprovacao:', e);
      globalToast('erro', 'Erro inesperado ao aprovar.');
    }
    setAprovando(false);
  };

  // ── Detalhe (dossiê) ────────────────────────────────────────────────────
  if (detalhe) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
        <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 flex justify-between items-start shrink-0">
          <div>
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
              Dossiê
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic truncate">
              {detalhe.nome}
            </h1>
            <p className="text-zinc-400 text-[0.625rem] mt-1">
              {detalhe.userName ?? 'Usuário'} · {new Date(detalhe.criadoEm).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button
            onClick={() => setDetalhe(null)}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all mt-1"
          >
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 max-w-lg mx-auto w-full">
          {/* Info básica */}
          <Section title="Sobre">
            <InfoRow label="Tipo" value={detalhe.tipo === 'PRODUTORA' ? 'Produtora / Evento avulso' : 'Espaço fixo'} />
            <InfoRow label="Categoria" value={detalhe.categoria} />
            <InfoRow label="Cidade" value={detalhe.cidade} />
            {detalhe.capacidadeMedia && <InfoRow label="Capacidade" value={detalhe.capacidadeMedia} />}
            {detalhe.tempoMercado && <InfoRow label="Tempo de mercado" value={detalhe.tempoMercado} />}
            {detalhe.emailContato && <InfoRow label="Email" value={detalhe.emailContato} />}
            {detalhe.telefone && (
              <InfoRow
                label="Telefone"
                value={
                  detalhe.telefone.length >= 10
                    ? `(${detalhe.telefone.slice(0, 2)}) ${detalhe.telefone.slice(2, detalhe.telefone.length === 11 ? 7 : 6)}-${detalhe.telefone.slice(detalhe.telefone.length === 11 ? 7 : 6)}`
                    : detalhe.telefone
                }
              />
            )}
          </Section>

          {/* Presença digital */}
          <Section title="Presença Digital">
            <div className="flex items-center gap-2">
              <Instagram size="0.875rem" className="text-pink-400" />
              <a
                href={`https://instagram.com/${detalhe.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-pink-400 text-xs font-bold underline"
              >
                {detalhe.instagram}
              </a>
            </div>
            {detalhe.site && (
              <div className="flex items-center gap-2">
                <ExternalLink size="0.875rem" className="text-blue-400" />
                <a
                  href={detalhe.site}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 text-xs underline truncate"
                >
                  {detalhe.site}
                </a>
              </div>
            )}
            {detalhe.googleMaps && (
              <div className="flex items-center gap-2">
                <MapPin size="0.875rem" className="text-emerald-400" />
                <a
                  href={detalhe.googleMaps}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 text-xs underline truncate"
                >
                  Google Maps
                </a>
              </div>
            )}
            {detalhe.fotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2">
                {detalhe.fotos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover shrink-0 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => setFotoFullscreen(url)}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Intenção */}
          <Section title="Intenção">
            <div className="flex flex-wrap gap-1.5">
              {detalhe.intencoes.map(int => (
                <span
                  key={int}
                  className="text-[0.5625rem] font-bold uppercase tracking-widest px-2.5 py-1 bg-[#FFD300]/10 text-[#FFD300] rounded-full border border-[#FFD300]/20"
                >
                  {int.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </Section>

          {/* Público */}
          <Section title="Público">
            {detalhe.publicoAlvo.length > 0 && <InfoRow label="Faixa etária" value={detalhe.publicoAlvo.join(', ')} />}
            {detalhe.estilos.length > 0 && <InfoRow label="Estilos" value={detalhe.estilos.join(', ')} />}
            {detalhe.frequencia && <InfoRow label="Frequência" value={detalhe.frequencia} />}
            {detalhe.mediaPublico && <InfoRow label="Média público" value={detalhe.mediaPublico} />}
          </Section>

          {/* Solicitante */}
          <Section title="Solicitante">
            <div className="flex items-center gap-3">
              {detalhe.userFoto ? (
                <img src={detalhe.userFoto} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Users size="1rem" className="text-zinc-400" />
                </div>
              )}
              <div>
                <p className="text-white text-sm font-bold">{detalhe.userName ?? '—'}</p>
                {detalhe.userInstagram && <p className="text-zinc-400 text-[0.625rem]">{detalhe.userInstagram}</p>}
              </div>
            </div>
          </Section>

          {/* Rejeição inline */}
          {detalhe.status === 'PENDENTE' && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-3">
              <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest">
                Motivo da rejeição (se aplicável)
              </p>
              <textarea
                value={motivoRejeicao}
                onChange={e => setMotivoRejeicao(e.target.value)}
                placeholder="Ex: Não se encaixa no perfil da plataforma..."
                rows={2}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-red-500/30 placeholder-zinc-700 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer ações */}
        {detalhe.status === 'PENDENTE' && !showTaxas && (
          <div
            className="shrink-0 px-5 pt-3 border-t border-white/5 flex gap-3"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
          >
            <button
              onClick={handleRejeitar}
              disabled={rejeitando}
              className="flex-1 py-4 bg-zinc-900 border border-red-500/20 text-red-400 font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              <X size="0.875rem" /> Rejeitar
            </button>
            <button
              onClick={() => setShowTaxas(true)}
              className="flex-1 py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Check size="0.875rem" /> Aprovar e Criar
            </button>
          </div>
        )}

        {/* Painel de taxas */}
        {showTaxas && detalhe.status === 'PENDENTE' && (
          <div
            className="shrink-0 border-t border-[#FFD300]/20 bg-zinc-950 px-5 pt-4 animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
          >
            <p className="text-[0.5625rem] font-black uppercase tracking-widest text-[#FFD300] mb-3">
              Definir Taxas da Comunidade
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <TaxaInput
                label="Taxa VANTA (%)"
                value={taxas.taxaServico}
                onChange={v => setTaxas(p => ({ ...p, taxaServico: v }))}
              />
              <TaxaInput
                label="Taxa gateway (%)"
                value={taxas.taxaProcessamento}
                onChange={v => setTaxas(p => ({ ...p, taxaProcessamento: v }))}
              />
              <TaxaInput
                label="Mínimo/ingresso (R$)"
                value={taxas.taxaMinima}
                onChange={v => setTaxas(p => ({ ...p, taxaMinima: v }))}
              />
              <TaxaInput
                label="Taxa porta (%)"
                value={taxas.taxaPorta}
                onChange={v => setTaxas(p => ({ ...p, taxaPorta: v }))}
              />
            </div>

            <div className="mb-3">
              <label className="text-[0.5rem] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">
                Quem paga a taxa VANTA?
              </label>
              <div className="flex gap-2">
                {(
                  [
                    ['PRODUTOR_ABSORVE', 'Produtor absorve'],
                    ['COMPRADOR_PAGA', 'Comprador paga'],
                    ['PRODUTOR_ESCOLHE', 'Produtor escolhe'],
                  ] as const
                ).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setTaxas(p => ({ ...p, quemPaga: val }))}
                    className={`flex-1 py-2 text-[0.5rem] font-bold uppercase tracking-widest rounded-xl border transition-all ${
                      taxas.quemPaga === val
                        ? 'bg-[#FFD300]/10 border-[#FFD300]/40 text-[#FFD300]'
                        : 'bg-zinc-900 border-white/5 text-zinc-500'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <TaxaInput
                label="Nomes grátis na lista"
                value={taxas.cotaNomes}
                onChange={v => setTaxas(p => ({ ...p, cotaNomes: v }))}
                step={10}
              />
              <TaxaInput
                label="Cortesias grátis"
                value={taxas.cotaCortesias}
                onChange={v => setTaxas(p => ({ ...p, cotaCortesias: v }))}
                step={5}
              />
            </div>

            {/* Avançado */}
            <button
              onClick={() => setShowAvancado(v => !v)}
              className="text-[0.5rem] font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1"
            >
              {showAvancado ? '▾' : '▸'} Avançado
            </button>
            {showAvancado && (
              <div className="grid grid-cols-3 gap-3 mb-3 animate-in fade-in duration-200">
                <TaxaInput
                  label="R$/nome excedente"
                  value={taxas.taxaNomeExcedente}
                  onChange={v => setTaxas(p => ({ ...p, taxaNomeExcedente: v }))}
                  step={0.1}
                />
                <TaxaInput
                  label="% cortesia exc."
                  value={taxas.taxaCortesiaExcedentePct}
                  onChange={v => setTaxas(p => ({ ...p, taxaCortesiaExcedentePct: v }))}
                />
                <TaxaInput
                  label="Fixo/evento (R$)"
                  value={taxas.taxaFixaEvento}
                  onChange={v => setTaxas(p => ({ ...p, taxaFixaEvento: v }))}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowTaxas(false)}
                className="flex-1 py-3 bg-zinc-900 border border-white/10 text-zinc-400 font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAprovacao}
                disabled={aprovando}
                className="flex-1 py-3 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {aprovando ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size="0.875rem" /> Confirmar e Criar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {detalhe.status === 'REJEITADA' && detalhe.motivoRejeicao && (
          <div className="shrink-0 px-5 py-3 border-t border-white/5">
            <p className="text-red-400 text-xs italic text-center">{detalhe.motivoRejeicao}</p>
          </div>
        )}

        {/* Foto fullscreen com zoom */}
        {fotoFullscreen && (
          <div
            className="absolute inset-0 z-[500] bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
            onClick={() => setFotoFullscreen(null)}
          >
            <button
              onClick={() => setFotoFullscreen(null)}
              className="absolute top-6 right-6 z-10 w-10 h-10 bg-zinc-900/80 rounded-full flex items-center justify-center active:scale-90"
            >
              <X size="1.25rem" className="text-white" />
            </button>
            <div
              className="w-full h-full overflow-auto flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={fotoFullscreen}
                alt=""
                className="max-w-none cursor-zoom-in"
                style={{ maxHeight: '90vh', maxWidth: '95vw', objectFit: 'contain' }}
                onClick={e => {
                  const img = e.currentTarget;
                  if (img.style.transform === 'scale(2)') {
                    img.style.transform = 'scale(1)';
                    img.style.cursor = 'zoom-in';
                  } else {
                    img.style.transform = 'scale(2)';
                    img.style.cursor = 'zoom-out';
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Lista ────────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 flex justify-between items-start shrink-0">
        <div>
          <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
            Parceiros
          </p>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
            Solicitações de Parceria
          </h1>
        </div>
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all mt-1"
        >
          <ArrowLeft size="1.125rem" className="text-zinc-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/5 shrink-0">
        {[
          { id: 'PENDENTE' as AbaStatus, label: 'Pendentes' },
          { id: 'APROVADA' as AbaStatus, label: 'Aprovadas' },
          { id: 'REJEITADA' as AbaStatus, label: 'Rejeitadas' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setAba(t.id)}
            className={`flex-1 py-3 text-center text-[0.625rem] font-black uppercase tracking-widest transition-all ${
              aba === t.id
                ? 'text-[#FFD300] border-b-2 border-[#FFD300]'
                : 'text-zinc-400 border-b-2 border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Clock size="1.5rem" className="text-zinc-700 animate-spin" />
          </div>
        ) : solicitacoes.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Building2 size="1.75rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">
              Nenhuma solicitação {aba === 'PENDENTE' ? 'pendente' : aba === 'APROVADA' ? 'aprovada' : 'rejeitada'}
            </p>
          </div>
        ) : (
          solicitacoes.map(s => (
            <button
              key={s.id}
              onClick={() => setDetalhe(s)}
              className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 active:border-[#FFD300]/20 active:bg-[#FFD300]/5 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                {s.tipo === 'PRODUTORA' ? (
                  <Zap size="1.25rem" className="text-purple-400" />
                ) : (
                  <Building2 size="1.25rem" className="text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{s.nome}</p>
                <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest mt-0.5">
                  {s.cidade} · {s.categoria}
                </p>
                <p className="text-zinc-700 text-[0.5625rem] mt-0.5">
                  {s.userName ?? 'Usuário'} · {new Date(s.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="shrink-0">
                {s.status === 'PENDENTE' && (
                  <span className="text-[0.4375rem] font-black uppercase tracking-widest px-2 py-1 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/20">
                    Pendente
                  </span>
                )}
                {s.status === 'APROVADA' && (
                  <span className="text-[0.4375rem] font-black uppercase tracking-widest px-2 py-1 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/20">
                    Aprovada
                  </span>
                )}
                {s.status === 'REJEITADA' && (
                  <span className="text-[0.4375rem] font-black uppercase tracking-widest px-2 py-1 bg-red-500/15 text-red-400 rounded-full border border-red-500/20">
                    Rejeitada
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-2.5">
    <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest">{title}</p>
    {children}
  </div>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start gap-2">
    <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest w-24 shrink-0 pt-0.5">{label}</p>
    <p className="text-zinc-300 text-xs">{value}</p>
  </div>
);

const TaxaInput: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}> = ({ label, value, onChange, step = 0.5 }) => (
  <div>
    <label className="text-[0.5rem] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">{label}</label>
    <input
      type="number"
      step={step}
      min={0}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FFD300]/30 transition-colors"
    />
  </div>
);
