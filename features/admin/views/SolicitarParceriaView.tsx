import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  Music2,
  Instagram,
  Upload,
  Users,
  ExternalLink,
  X as XIcon,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { parceriaService } from '../services/parceriaService';

const CATEGORIAS = [
  'Boate / Club',
  'Bar',
  'Casa de Shows',
  'Restaurante / Lounge',
  'Pool Party',
  'Festival',
  'Produtora de Eventos',
  'Outro',
];

const TEMPO_MERCADO = ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', 'Mais de 5 anos'];

const CAPACIDADES = ['Até 100', '100–500', '500–1.000', '1.000–5.000', '5.000+'];

const INTENCOES = [
  { key: 'vitrine', label: 'Vitrine', desc: 'Mostrar eventos no app' },
  { key: 'venda_ingressos', label: 'Vender ingressos', desc: 'Vender pelo VANTA com gateway de pagamento' },
  { key: 'listas', label: 'Listas de convidados', desc: 'Gerenciar listas e promoters' },
  { key: 'equipe', label: 'Operar equipe', desc: 'Portaria, caixa, check-in digital' },
  { key: 'clube', label: 'Clube MAIS VANTA', desc: 'Oferecer benefícios exclusivos aos membros' },
];

const FAIXAS_ETARIAS = ['18–21', '21–25', '25–30', '30+'];

const ESTILOS = [
  'Funk',
  'Sertanejo',
  'Eletrônica',
  'Pop',
  'Rock',
  'Pagode',
  'Forró',
  'Hip Hop / Rap',
  'Reggaeton',
  'MPB',
  'Jazz',
  'Outro',
];

const FREQUENCIAS = ['Semanal', 'Quinzenal', 'Mensal', 'Pontual / Esporádico'];

const MEDIAS_PUBLICO = ['Até 100', '100–500', '500–1.000', '1.000–5.000', '5.000+'];

// ── Chip selector ───────────────────────────────────────────────────────────
const ChipSelect: React.FC<{
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  multi?: boolean;
}> = ({ options, selected, onToggle, multi = false }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const active = selected.includes(opt);
      return (
        <button
          key={opt}
          type="button"
          onClick={() => {
            if (multi) onToggle(opt);
            else onToggle(opt);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            active
              ? 'bg-[#FFD300]/15 border-[#FFD300]/40 text-[#FFD300]'
              : 'bg-zinc-900/60 border-white/5 text-zinc-400'
          }`}
        >
          {active && <Check size="0.625rem" className="inline mr-1" />}
          {opt}
        </button>
      );
    })}
  </div>
);

// ── Label ───────────────────────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5">
    {children} {required && <span className="text-red-400">*</span>}
  </p>
);

const inputCls =
  'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';

// ── Main View ───────────────────────────────────────────────────────────────
export const SolicitarParceriaView: React.FC<{
  onBack: () => void;
  onSucesso: () => void;
}> = ({ onBack, onSucesso }) => {
  const [step, setStep] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // Step 1
  const [tipo, setTipo] = useState<'ESPACO_FIXO' | 'PRODUTORA' | ''>('');
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [categoria, setCategoria] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [tempoMercado, setTempoMercado] = useState('');

  const [emailContato, setEmailContato] = useState('');
  const [telefone, setTelefone] = useState('');

  // Step 2
  const [instagram, setInstagram] = useState('');
  const [site, setSite] = useState('');
  const [googleMaps, setGoogleMaps] = useState('');
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3
  const [intencoes, setIntencoes] = useState<string[]>([]);

  // Step 4
  const [publicoAlvo, setPublicoAlvo] = useState<string[]>([]);
  const [estilos, setEstilos] = useState<string[]>([]);
  const [frequencia, setFrequencia] = useState('');
  const [mediaPublico, setMediaPublico] = useState('');
  const [aceiteTermos, setAceiteTermos] = useState(false);

  const handleFotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - fotos.length;
    const toAdd = files.slice(0, remaining);
    setFotos(prev => [...prev, ...toAdd]);
    setFotoPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f as Blob))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFotoRemove = (idx: number) => {
    URL.revokeObjectURL(fotoPreviews[idx]);
    setFotos(prev => prev.filter((_, i) => i !== idx));
    setFotoPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const canNext = () => {
    if (step === 1)
      return (
        tipo !== '' &&
        nome.trim() &&
        cidade.trim() &&
        categoria !== '' &&
        emailContato.includes('@') &&
        telefone.length >= 10
      );
    if (step === 2) return instagram.trim().length > 0;
    if (step === 3) return intencoes.length > 0;
    if (step === 4) return aceiteTermos;
    return false;
  };

  const handleEnviar = async () => {
    setEnviando(true);
    setErro('');

    // Upload fotos primeiro
    let fotoUrls: string[] = [];
    if (fotos.length > 0) {
      fotoUrls = await parceriaService.uploadFotos(fotos);
    }

    const id = await parceriaService.criar({
      tipo: tipo as 'ESPACO_FIXO' | 'PRODUTORA',
      nome: nome.trim(),
      cidade: cidade.trim(),
      categoria,
      capacidadeMedia: capacidade || undefined,
      tempoMercado: tempoMercado || undefined,
      instagram: instagram.trim(),
      emailContato: emailContato.trim() || undefined,
      telefone: telefone.trim() || undefined,
      site: site.trim() || undefined,
      fotos: fotoUrls.length > 0 ? fotoUrls : undefined,
      googleMaps: googleMaps.trim() || undefined,
      intencoes,
      publicoAlvo: publicoAlvo.length > 0 ? publicoAlvo : undefined,
      estilos: estilos.length > 0 ? estilos : undefined,
      frequencia: frequencia || undefined,
      mediaPublico: mediaPublico || undefined,
    });
    setEnviando(false);
    if (id) {
      onSucesso();
    } else {
      setErro('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  const stepTitles = ['Sobre você', 'Presença digital', 'O que você quer?', 'Seu público'];

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={step > 1 ? () => setStep(s => s - 1) : onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
          <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest">Passo {step} de 4</p>
        </div>
        <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
          Parceria VANTA
        </p>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-lg">
          {stepTitles[step - 1]}
        </h1>
        {/* Progress bar */}
        <div className="flex gap-1.5 mt-3">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all ${s <= step ? 'bg-[#FFD300]' : 'bg-zinc-800'}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 max-w-lg mx-auto w-full">
        {/* ── Step 1: Sobre você ────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div>
              <Label required>Tipo</Label>
              <div className="flex gap-2">
                {(
                  [
                    { key: 'ESPACO_FIXO', label: 'Espaço fixo', desc: 'Boate, bar, casa de shows' },
                    { key: 'PRODUTORA', label: 'Produtora / Evento', desc: 'Eventos em locais variados' },
                  ] as const
                ).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTipo(t.key)}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                      tipo === t.key ? 'bg-[#FFD300]/10 border-[#FFD300]/30' : 'bg-zinc-900/60 border-white/5'
                    }`}
                  >
                    <Building2 size="1rem" className={tipo === t.key ? 'text-[#FFD300] mb-1' : 'text-zinc-400 mb-1'} />
                    <p className={`text-xs font-bold ${tipo === t.key ? 'text-[#FFD300]' : 'text-zinc-400'}`}>
                      {t.label}
                    </p>
                    <p className="text-[0.5625rem] text-zinc-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label required>Nome do {tipo === 'PRODUTORA' ? 'marca / produtora' : 'espaço'}</Label>
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Bosque Bar"
                className={inputCls}
              />
            </div>
            <div>
              <Label required>Cidade</Label>
              <input
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Ex: São Paulo"
                className={inputCls}
              />
            </div>
            <div>
              <Label required>Categoria</Label>
              <ChipSelect
                options={CATEGORIAS}
                selected={categoria ? [categoria] : []}
                onToggle={v => setCategoria(categoria === v ? '' : v)}
              />
            </div>
            <div>
              <Label>Capacidade média</Label>
              <ChipSelect
                options={CAPACIDADES}
                selected={capacidade ? [capacidade] : []}
                onToggle={v => setCapacidade(capacidade === v ? '' : v)}
              />
            </div>
            <div>
              <Label>Tempo de mercado</Label>
              <ChipSelect
                options={TEMPO_MERCADO}
                selected={tempoMercado ? [tempoMercado] : []}
                onToggle={v => setTempoMercado(tempoMercado === v ? '' : v)}
              />
            </div>
            <div>
              <Label required>Email de contato</Label>
              <input
                type="email"
                value={emailContato}
                onChange={e => setEmailContato(e.target.value)}
                placeholder="contato@seunegocio.com"
                className={inputCls}
              />
            </div>
            <div>
              <Label required>Telefone com DDD</Label>
              <input
                type="tel"
                value={telefone}
                onChange={e => {
                  const nums = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setTelefone(nums);
                }}
                placeholder="11999991234"
                className={inputCls}
                inputMode="numeric"
              />
              {telefone && (
                <p className="text-[0.625rem] text-zinc-400 mt-1">
                  {telefone.length >= 10
                    ? `(${telefone.slice(0, 2)}) ${telefone.slice(2, telefone.length === 11 ? 7 : 6)}-${telefone.slice(telefone.length === 11 ? 7 : 6)}`
                    : 'Digite DDD + número'}
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Step 2: Presença digital ─────────────────────────────── */}
        {step === 2 && (
          <>
            <div>
              <Label required>Instagram</Label>
              <div className="relative">
                <Instagram size="0.875rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  placeholder="@seuperfil"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <Label>Site</Label>
              <div className="relative">
                <ExternalLink size="0.875rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={site}
                  onChange={e => setSite(e.target.value)}
                  placeholder="https://..."
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <Label>Link Google Maps</Label>
              <input
                value={googleMaps}
                onChange={e => setGoogleMaps(e.target.value)}
                placeholder="https://maps.google.com/..."
                className={inputCls}
              />
            </div>
            <div>
              <Label>Fotos do espaço / eventos ({fotos.length}/5)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFotoAdd}
              />
              {fotoPreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2">
                  {fotoPreviews.map((url, i) => (
                    <div
                      key={i}
                      className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10"
                    >
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleFotoRemove(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"
                      >
                        <XIcon size="0.75rem" className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {fotos.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-zinc-900/60 border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <Upload size="1.25rem" className="text-zinc-400" />
                  <p className="text-zinc-400 text-xs">Toque para adicionar fotos</p>
                </button>
              )}
            </div>
          </>
        )}

        {/* ── Step 3: Intenção ─────────────────────────────────────── */}
        {step === 3 && (
          <>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Selecione o que você gostaria de usar no VANTA. Isso nos ajuda a entender como te atender melhor.
            </p>
            <div className="space-y-2">
              {INTENCOES.map(int => {
                const active = intencoes.includes(int.key);
                return (
                  <button
                    key={int.key}
                    onClick={() => toggleArr(intencoes, int.key, setIntencoes)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      active ? 'bg-[#FFD300]/10 border-[#FFD300]/30' : 'bg-zinc-900/60 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          active ? 'border-[#FFD300] bg-[#FFD300]' : 'border-zinc-600'
                        }`}
                      >
                        {active && <Check size="0.625rem" className="text-black" />}
                      </span>
                      <div>
                        <p className={`text-sm font-bold ${active ? 'text-[#FFD300]' : 'text-zinc-300'}`}>
                          {int.label}
                        </p>
                        <p className="text-[0.625rem] text-zinc-400 mt-0.5">{int.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Step 4: Público + Termos ─────────────────────────────── */}
        {step === 4 && (
          <>
            <div>
              <Label>Público-alvo (faixa etária)</Label>
              <ChipSelect
                options={FAIXAS_ETARIAS}
                selected={publicoAlvo}
                onToggle={v => toggleArr(publicoAlvo, v, setPublicoAlvo)}
                multi
              />
            </div>
            <div>
              <Label>Estilos musicais</Label>
              <ChipSelect
                options={ESTILOS}
                selected={estilos}
                onToggle={v => toggleArr(estilos, v, setEstilos)}
                multi
              />
            </div>
            <div>
              <Label>Frequência de eventos</Label>
              <ChipSelect
                options={FREQUENCIAS}
                selected={frequencia ? [frequencia] : []}
                onToggle={v => setFrequencia(frequencia === v ? '' : v)}
              />
            </div>
            <div>
              <Label>Média de público por evento</Label>
              <ChipSelect
                options={MEDIAS_PUBLICO}
                selected={mediaPublico ? [mediaPublico] : []}
                onToggle={v => setMediaPublico(mediaPublico === v ? '' : v)}
              />
            </div>

            {/* Termos */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3 mt-2">
              <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest">Termos de Parceria</p>
              <div className="text-zinc-400 text-[0.625rem] leading-relaxed space-y-1.5">
                <p>Ao enviar esta solicitação, você declara que:</p>
                <p>• Todas as informações fornecidas são verdadeiras</p>
                <p>
                  • A solicitação <strong className="text-zinc-400">não garante aprovação</strong> — o VANTA se reserva
                  o direito de aprovar ou recusar
                </p>
                <p>• Autoriza o uso do nome e imagens para divulgação na plataforma</p>
                <p>• O VANTA atua como intermediador, não como organizador dos eventos</p>
                <p>• As condições comerciais (taxas) serão definidas após aprovação</p>
                <p>• Dados pessoais tratados conforme a LGPD</p>
              </div>
              <button onClick={() => setAceiteTermos(!aceiteTermos)} className="flex items-center gap-3 w-full pt-2">
                <span
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    aceiteTermos ? 'border-[#FFD300] bg-[#FFD300]' : 'border-zinc-600'
                  }`}
                >
                  {aceiteTermos && <Check size="0.625rem" className="text-black" />}
                </span>
                <p className={`text-xs ${aceiteTermos ? 'text-[#FFD300] font-bold' : 'text-zinc-400'}`}>
                  Li e aceito os Termos de Parceria
                </p>
              </button>
            </div>

            {erro && <p className="text-red-400 text-xs text-center">{erro}</p>}
          </>
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 px-5 pt-3 border-t border-white/5"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
      >
        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            Próximo <ArrowRight size="0.875rem" />
          </button>
        ) : (
          <button
            onClick={handleEnviar}
            disabled={!canNext() || enviando}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {enviando ? 'Enviando...' : 'Enviar Solicitação'}
          </button>
        )}
      </div>
    </div>
  );
};
