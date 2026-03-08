import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, CheckCircle, PartyPopper, Calendar } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { eventoPrivadoService, EventoPrivadoForm } from '../../services/eventoPrivadoService';
import { useAuthStore } from '../../stores/authStore';
import { VantaDropdown } from '../../components/VantaDropdown';

const HORARIO_OPTS = [
  { value: 'DIURNO', label: 'Diurno' },
  { value: 'NOTURNO', label: 'Noturno' },
  { value: 'DIA_INTEIRO', label: 'Dia inteiro' },
];

interface Props {
  comunidadeId: string;
  comunidadeNome: string;
  onBack: () => void;
}

export const EventoPrivadoFormView: React.FC<Props> = ({ comunidadeId, comunidadeNome, onBack }) => {
  const profile = useAuthStore(s => s.profile);

  const [config, setConfig] = useState<{
    texto: string | null;
    fotos: string[];
    formatos: string[];
    atracoes: string[];
    faixas_capacidade: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Form fields
  const [nomeCompleto, setNomeCompleto] = useState(profile?.nome ?? '');
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [telefone, setTelefone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [dataEstimativa, setDataEstimativa] = useState('');
  const [faixaCapacidade, setFaixaCapacidade] = useState('');
  const [horario, setHorario] = useState('');
  const [formatosSel, setFormatosSel] = useState<string[]>([]);
  const [atracoesSel, setAtracoesSel] = useState<string[]>([]);
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    let cancelled = false;
    eventoPrivadoService.getConfigComunidade(comunidadeId).then(c => {
      if (cancelled) return;
      setConfig(c);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId]);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  const canSubmit =
    nomeCompleto.trim() &&
    empresa.trim() &&
    email.trim() &&
    telefone.trim() &&
    instagram.trim() &&
    (dataEvento || dataEstimativa.trim()) &&
    faixaCapacidade &&
    horario &&
    descricao.trim();

  const handleSubmit = async () => {
    if (!canSubmit || sending) return;
    setSending(true);
    try {
      const form: EventoPrivadoForm = {
        comunidade_id: comunidadeId,
        nome_completo: nomeCompleto.trim(),
        empresa: empresa.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        instagram: instagram.trim(),
        data_evento: dataEvento || undefined,
        data_estimativa: dataEstimativa.trim() || undefined,
        faixa_capacidade: faixaCapacidade,
        horario: horario as 'DIURNO' | 'NOTURNO' | 'DIA_INTEIRO',
        formatos: formatosSel,
        atracoes: atracoesSel,
        descricao: descricao.trim(),
      };
      await eventoPrivadoService.solicitar(form);
      setSent(true);
    } catch {
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
        <Loader2 size={24} className="text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (sent) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] px-8 gap-5">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white text-center">
          Solicitação enviada!
        </h2>
        <p className="text-zinc-400 text-sm text-center leading-relaxed max-w-xs">
          A equipe do {comunidadeNome} recebeu sua solicitação e entrará em contato em breve.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-8 py-3 bg-[#FFD300] text-black rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
        >
          Voltar
        </button>
      </div>
    );
  }

  const inputClass =
    'w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50 transition-colors';
  const labelClass = 'text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5';

  return (
    <div className="absolute inset-0 flex flex-col bg-[#050505] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 border-b border-white/5">
        <button aria-label="Voltar"
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 style={TYPOGRAPHY.screenTitle} className="text-base text-white truncate">
            Evento Privado
          </h1>
          <p className="text-[10px] text-zinc-400 truncate">{comunidadeNome}</p>
        </div>
        <PartyPopper size={20} className="text-[#FFD300] shrink-0" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-5">
        {/* Texto de apresentação */}
        {config?.texto && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{config.texto}</p>
          </div>
        )}

        {/* Galeria de fotos */}
        {config?.fotos && config.fotos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x pb-1">
            {config.fotos.map((url, i) => (
              <div key={i} className="w-40 h-28 rounded-xl overflow-hidden shrink-0 snap-start bg-zinc-800">
                <img src={url} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        )}

        {/* Formulário */}
        <div className="space-y-4">
          <div>
            <p className={labelClass}>Nome completo *</p>
            <input
              type="text"
              value={nomeCompleto}
              onChange={e => setNomeCompleto(e.target.value)}
              placeholder="Seu nome e sobrenome"
              className={inputClass}
            />
          </div>

          <div>
            <p className={labelClass}>Empresa / Cliente *</p>
            <input
              type="text"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
              placeholder="Nome da empresa ou cliente"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={labelClass}>E-mail *</p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className={inputClass}
              />
            </div>
            <div>
              <p className={labelClass}>Telefone *</p>
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="+55 (21) 99999-9999"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <p className={labelClass}>Instagram *</p>
            <input
              type="text"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              placeholder="@seuinstagram"
              className={inputClass}
            />
          </div>

          <div>
            <p className={labelClass}>Data do evento *</p>
            <input
              type="date"
              value={dataEvento}
              onChange={e => setDataEvento(e.target.value)}
              className={inputClass}
            />
            <p className="text-[9px] text-zinc-400 mt-1">Ou descreva uma estimativa:</p>
            <input
              type="text"
              value={dataEstimativa}
              onChange={e => setDataEstimativa(e.target.value)}
              placeholder="Ex: Primeira semana de abril, ainda não definido..."
              className={`${inputClass} mt-1`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={labelClass}>Capacidade *</p>
              {config?.faixas_capacidade && config.faixas_capacidade.length > 0 ? (
                <VantaDropdown
                  value={faixaCapacidade}
                  options={config.faixas_capacidade.map(f => ({ value: f, label: f }))}
                  onChange={setFaixaCapacidade}
                  placeholder="Selecione"
                />
              ) : (
                <input
                  type="text"
                  value={faixaCapacidade}
                  onChange={e => setFaixaCapacidade(e.target.value)}
                  placeholder="Ex: 200 pessoas"
                  className={inputClass}
                />
              )}
            </div>
            <div>
              <p className={labelClass}>Horário *</p>
              <VantaDropdown value={horario} options={HORARIO_OPTS} onChange={setHorario} placeholder="Selecione" />
            </div>
          </div>

          {/* Formatos — multi-select chips */}
          {config?.formatos && config.formatos.length > 0 && (
            <div>
              <p className={labelClass}>Formato do evento</p>
              <div className="flex flex-wrap gap-2">
                {config.formatos.map(f => (
                  <button
                    key={f}
                    onClick={() => toggleItem(formatosSel, f, setFormatosSel)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 ${
                      formatosSel.includes(f)
                        ? 'bg-[#FFD300] border-[#FFD300] text-black'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Atrações — multi-select chips */}
          {config?.atracoes && config.atracoes.length > 0 && (
            <div>
              <p className={labelClass}>Atrações do evento</p>
              <div className="flex flex-wrap gap-2">
                {config.atracoes.map(a => (
                  <button
                    key={a}
                    onClick={() => toggleItem(atracoesSel, a, setAtracoesSel)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 ${
                      atracoesSel.includes(a)
                        ? 'bg-[#FFD300] border-[#FFD300] text-black'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className={labelClass}>Conte-nos sobre o evento *</p>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Corporativo? Social? Dê detalhes do que você planeja..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* Footer — botão enviar */}
      <div className="shrink-0 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)] border-t border-white/5">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || sending}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
            canSubmit ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-400'
          } disabled:opacity-50`}
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Send size={14} />
              Enviar Solicitação
            </>
          )}
        </button>
      </div>
    </div>
  );
};
