import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapPin, Camera, AlertTriangle, X, Check, Lock, ArrowRightLeft, PartyPopper, Plus, Trash2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { Comunidade, ContaVanta, HorarioSemanal, HorarioOverride } from '../../../../types';
import { ImageCropModal } from '../../../../components/ImageCropModal';
import { UnsavedChangesModal } from '../../../../components/UnsavedChangesModal';
import { HorarioFuncionamentoEditor, DEFAULT_HORARIOS } from '../../../../components/HorarioFuncionamentoEditor';
import { VantaDropdown } from '../../../../components/VantaDropdown';
import { HorarioOverridesEditor } from '../../../../components/HorarioOverridesEditor';
import { rbacService } from '../../services/rbacService';

export const EditarModal: React.FC<{
  comunidade: Comunidade;
  adminRole: ContaVanta;
  onSave: (updates: Partial<Comunidade>) => void;
  onClose: () => void;
}> = ({ comunidade, adminRole, onSave, onClose }) => {
  const [descricao, setDescricao] = useState(comunidade.descricao);
  const [foto, setFoto] = useState(comunidade.foto);
  const [fotoCapa, setFotoCapa] = useState(comunidade.fotoCapa || comunidade.foto);
  const [showEndAlert, setShowEndAlert] = useState(false);
  const fotoRef = useRef<HTMLInputElement>(null);
  const capaRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'perfil' | 'capa'>('perfil');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // ── Estado: Contrato Vanta ──────────────────────────────────────────────────
  const [feePercStr, setFeePercStr] = useState(
    comunidade.vanta_fee_percent !== undefined ? (comunidade.vanta_fee_percent * 100).toFixed(1) : '',
  );
  const [feeFixedStr, setFeeFixedStr] = useState(
    comunidade.vanta_fee_fixed !== undefined ? comunidade.vanta_fee_fixed.toFixed(2) : '',
  );
  const [gatewayMode, setGatewayMode] = useState<'ABSORVER' | 'REPASSAR'>(comunidade.gateway_fee_mode ?? 'ABSORVER');
  const [repasseStr, setRepasseStr] = useState(
    comunidade.vanta_fee_repasse_percent !== undefined ? String(comunidade.vanta_fee_repasse_percent * 100) : '0',
  );
  const [showFeeAlert, setShowFeeAlert] = useState(false);

  // ── Estado: Taxas Avançadas (comunidade defaults) ──────────────────────────
  const [taxaProcStr, setTaxaProcStr] = useState(
    comunidade.taxa_processamento_percent !== undefined ? String(comunidade.taxa_processamento_percent * 100) : '',
  );
  const [taxaPortaStr, setTaxaPortaStr] = useState(
    comunidade.taxa_porta_percent !== undefined ? String(comunidade.taxa_porta_percent * 100) : '',
  );
  const [taxaMinimaStr, setTaxaMinimaStr] = useState(
    comunidade.taxa_minima !== undefined ? String(comunidade.taxa_minima) : '',
  );
  const [cotaNomesStr, setCotaNomesStr] = useState(
    comunidade.cota_nomes_lista !== undefined ? String(comunidade.cota_nomes_lista) : '',
  );
  const [taxaNomeExcStr, setTaxaNomeExcStr] = useState(
    comunidade.taxa_nome_excedente !== undefined ? String(comunidade.taxa_nome_excedente) : '',
  );
  const [cotaCortesiasStr, setCotaCortesiasStr] = useState(
    comunidade.cota_cortesias !== undefined ? String(comunidade.cota_cortesias) : '',
  );
  const [taxaCortExcStr, setTaxaCortExcStr] = useState(
    comunidade.taxa_cortesia_excedente_pct !== undefined ? String(comunidade.taxa_cortesia_excedente_pct * 100) : '',
  );

  // ── Estado: Evento Privado ──────────────────────────────────────────────────
  const [epAtivo, setEpAtivo] = useState(comunidade.evento_privado_ativo ?? false);
  const [epTexto, setEpTexto] = useState(comunidade.evento_privado_texto ?? '');
  const [epFormatos, setEpFormatos] = useState<string[]>(comunidade.evento_privado_formatos ?? []);
  const [epAtracoes, setEpAtracoes] = useState<string[]>(comunidade.evento_privado_atracoes ?? []);
  const [epFaixas, setEpFaixas] = useState<string[]>(comunidade.evento_privado_faixas_capacidade ?? []);
  const [novoFormato, setNovoFormato] = useState('');
  const [novaAtracao, setNovaAtracao] = useState('');
  const [novaFaixa, setNovaFaixa] = useState('');

  // ── Estado: Horário de Funcionamento ──────────────────────────────────────
  const [horarios, setHorarios] = useState<HorarioSemanal[]>(
    comunidade.horarioFuncionamento?.length ? comunidade.horarioFuncionamento : DEFAULT_HORARIOS,
  );
  const [overrides, setOverrides] = useState<HorarioOverride[]>(comunidade.horarioOverrides ?? []);

  const isMaster = adminRole === 'vanta_masteradm';

  // ── Estado: Transferir Titularidade ──────────────────────────────────────────
  const [novoDonoId, setNovoDonoId] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  // Membros da comunidade (candidatos a novo dono)
  const membrosComunidade = useMemo(() => {
    if (!isMaster) return [];
    return rbacService.getAtribuicoesTenant('COMUNIDADE', comunidade.id).filter(a => a.userId !== comunidade.donoId);
  }, [isMaster, comunidade.id, comunidade.donoId]);

  // Lookup de nomes via profiles (assíncrono)
  const [nomesMap, setNomesMap] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!isMaster || membrosComunidade.length === 0) return;
    const ids = membrosComunidade.map(m => m.userId);
    import('../../../../services/supabaseClient').then(({ supabase }) => {
      void supabase
        .from('profiles')
        .select('id, nome')
        .in('id', ids)
        .then(({ data }) => {
          const map: Record<string, string> = {};
          (data ?? []).forEach((p: { id: string; nome: string }) => {
            map[p.id] = p.nome;
          });
          setNomesMap(map);
        })
        .then(undefined, () => {
          /* audit-ok */
        });
    });
  }, [isMaster, membrosComunidade]);

  const hasChanges = useMemo(() => {
    return (
      descricao !== comunidade.descricao ||
      foto !== comunidade.foto ||
      fotoCapa !== (comunidade.fotoCapa || comunidade.foto) ||
      gatewayMode !== (comunidade.gateway_fee_mode ?? 'ABSORVER') ||
      feePercStr !==
        (comunidade.vanta_fee_percent !== undefined ? (comunidade.vanta_fee_percent * 100).toFixed(1) : '') ||
      feeFixedStr !== (comunidade.vanta_fee_fixed !== undefined ? comunidade.vanta_fee_fixed.toFixed(2) : '') ||
      JSON.stringify(horarios) !== JSON.stringify(comunidade.horarioFuncionamento ?? DEFAULT_HORARIOS) ||
      JSON.stringify(overrides) !== JSON.stringify(comunidade.horarioOverrides ?? []) ||
      repasseStr !==
        (comunidade.vanta_fee_repasse_percent !== undefined
          ? String(comunidade.vanta_fee_repasse_percent * 100)
          : '0') ||
      taxaProcStr !==
        (comunidade.taxa_processamento_percent !== undefined
          ? String(comunidade.taxa_processamento_percent * 100)
          : '') ||
      taxaPortaStr !==
        (comunidade.taxa_porta_percent !== undefined ? String(comunidade.taxa_porta_percent * 100) : '') ||
      taxaMinimaStr !== (comunidade.taxa_minima !== undefined ? String(comunidade.taxa_minima) : '') ||
      cotaNomesStr !== (comunidade.cota_nomes_lista !== undefined ? String(comunidade.cota_nomes_lista) : '') ||
      taxaNomeExcStr !== (comunidade.taxa_nome_excedente !== undefined ? String(comunidade.taxa_nome_excedente) : '') ||
      cotaCortesiasStr !== (comunidade.cota_cortesias !== undefined ? String(comunidade.cota_cortesias) : '') ||
      taxaCortExcStr !==
        (comunidade.taxa_cortesia_excedente_pct !== undefined
          ? String(comunidade.taxa_cortesia_excedente_pct * 100)
          : '') ||
      epAtivo !== (comunidade.evento_privado_ativo ?? false) ||
      epTexto !== (comunidade.evento_privado_texto ?? '') ||
      JSON.stringify(epFormatos) !== JSON.stringify(comunidade.evento_privado_formatos ?? []) ||
      JSON.stringify(epAtracoes) !== JSON.stringify(comunidade.evento_privado_atracoes ?? []) ||
      JSON.stringify(epFaixas) !== JSON.stringify(comunidade.evento_privado_faixas_capacidade ?? [])
    );
  }, [
    descricao,
    foto,
    fotoCapa,
    gatewayMode,
    feePercStr,
    feeFixedStr,
    horarios,
    overrides,
    repasseStr,
    taxaProcStr,
    taxaPortaStr,
    taxaMinimaStr,
    cotaNomesStr,
    taxaNomeExcStr,
    cotaCortesiasStr,
    taxaCortExcStr,
    epAtivo,
    epTexto,
    epFormatos,
    epAtracoes,
    epFaixas,
    comunidade,
  ]);

  const safeClose = () => {
    if (cropSrc) return;
    if (hasChanges) setShowExitConfirm(true);
    else onClose();
  };

  const pickImg = (ref: React.RefObject<HTMLInputElement>, type: 'perfil' | 'capa') => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setCropType(type);
      setCropSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (ref.current) ref.current.value = '';
  };

  const handleSave = () => {
    const baseUpdates: Partial<Comunidade> = {
      descricao,
      foto,
      fotoCapa,
      gateway_fee_mode: gatewayMode,
      horarioFuncionamento: horarios,
      horarioOverrides: overrides,
    };
    if (isMaster) {
      const feePercNum = parseFloat(feePercStr);
      if (feePercStr && !isNaN(feePercNum)) baseUpdates.vanta_fee_percent = feePercNum / 100;
      const feeFixedNum = parseFloat(feeFixedStr);
      if (feeFixedStr && !isNaN(feeFixedNum)) baseUpdates.vanta_fee_fixed = feeFixedNum;
      const repasseNum = parseFloat(repasseStr);
      if (!isNaN(repasseNum)) baseUpdates.vanta_fee_repasse_percent = repasseNum / 100;
      // Taxas avançadas
      const tp = parseFloat(taxaProcStr);
      if (taxaProcStr && !isNaN(tp)) baseUpdates.taxa_processamento_percent = tp / 100;
      const tpo = parseFloat(taxaPortaStr);
      if (taxaPortaStr && !isNaN(tpo)) baseUpdates.taxa_porta_percent = tpo / 100;
      const tm = parseFloat(taxaMinimaStr);
      if (taxaMinimaStr && !isNaN(tm)) baseUpdates.taxa_minima = tm;
      const cn = parseInt(cotaNomesStr);
      if (cotaNomesStr && !isNaN(cn)) baseUpdates.cota_nomes_lista = cn;
      const tne = parseFloat(taxaNomeExcStr);
      if (taxaNomeExcStr && !isNaN(tne)) baseUpdates.taxa_nome_excedente = tne;
      const cc = parseInt(cotaCortesiasStr);
      if (cotaCortesiasStr && !isNaN(cc)) baseUpdates.cota_cortesias = cc;
      const tce = parseFloat(taxaCortExcStr);
      if (taxaCortExcStr && !isNaN(tce)) baseUpdates.taxa_cortesia_excedente_pct = tce / 100;
    }
    // Evento Privado config
    baseUpdates.evento_privado_ativo = epAtivo;
    baseUpdates.evento_privado_texto = epTexto || undefined;
    baseUpdates.evento_privado_formatos = epFormatos;
    baseUpdates.evento_privado_atracoes = epAtracoes;
    baseUpdates.evento_privado_faixas_capacidade = epFaixas;
    onSave(baseUpdates);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
      onClick={safeClose}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        <div className="px-6 pt-3 pb-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic">
            Editar Comunidade
          </h2>
          <button
            onClick={safeClose}
            className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10"
          >
            <X size="0.875rem" className="text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
          {/* Imagens */}
          <div className="space-y-2.5">
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Imagens</p>
            <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest">
              Perfil: 400×400 · 1:1 — Capa: 1200×400 · 3:1
            </p>
            <div className="flex gap-3 items-end">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <button
                  onClick={() => fotoRef.current?.click()}
                  className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 relative group active:scale-95 transition-all"
                >
                  {foto ? (
                    <img loading="lazy" src={foto} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 flex items-center justify-center">
                    <Camera size="1rem" className="text-white" />
                  </div>
                </button>
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Perfil</p>
                <input
                  ref={fotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => pickImg(fotoRef, 'perfil')}
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <button
                  onClick={() => capaRef.current?.click()}
                  className="w-full h-20 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 relative group active:scale-95 transition-all"
                >
                  {fotoCapa ? (
                    <img loading="lazy" src={fotoCapa} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 flex items-center justify-center">
                    <Camera size="1rem" className="text-white" />
                  </div>
                </button>
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Capa</p>
                <input
                  ref={capaRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => pickImg(capaRef, 'capa')}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Descrição / Bio</p>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700 resize-none"
            />
          </div>

          {/* Endereço */}
          <div className="space-y-1.5">
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Endereço / Local</p>
            {isMaster ? (
              <input
                defaultValue={comunidade.endereco}
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
              />
            ) : (
              <button
                onClick={() => setShowEndAlert(true)}
                className="w-full flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3 text-left"
              >
                <MapPin size="0.8125rem" className="text-zinc-400 shrink-0" />
                <p className="text-zinc-400 text-sm flex-1 truncate">{comunidade.endereco}</p>
                <AlertTriangle size="0.75rem" className="text-zinc-700 shrink-0" />
              </button>
            )}
            {showEndAlert && (
              <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2.5">
                <AlertTriangle size="0.75rem" className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-400/80 text-[0.625rem] leading-relaxed">
                  Somente administradores do VANTA podem alterar endereços de comunidades.
                </p>
              </div>
            )}
          </div>

          {/* Horário de Funcionamento */}
          <div className="pt-1 border-t border-white/5">
            <HorarioFuncionamentoEditor horarios={horarios} onChange={setHorarios} />
          </div>

          {/* Exceções de Horário */}
          <div className="pt-1 border-t border-white/5">
            <HorarioOverridesEditor overrides={overrides} onChange={setOverrides} />
          </div>

          {/* Contrato Vanta */}
          <div className="space-y-3 pt-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Lock size="0.625rem" className="text-[#FFD300]/70 shrink-0" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Contrato Vanta</p>
            </div>
            <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest leading-relaxed">
              Lucro do VANTA por ingresso vendido nesta comunidade. Definido pelo master.
            </p>

            {/* Taxa % — lucro da plataforma */}
            <div className="space-y-1.5">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                Taxa Vanta — Lucro por ingresso (%)
              </p>
              {isMaster ? (
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={feePercStr}
                    onChange={e => setFeePercStr(e.target.value)}
                    placeholder="5.0"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700 pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">%</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowFeeAlert(true)}
                  className="w-full flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3 text-left"
                >
                  <Lock size="0.75rem" className="text-zinc-700 shrink-0" />
                  <p className="text-zinc-400 text-sm flex-1">
                    {comunidade.vanta_fee_percent !== undefined
                      ? `${(comunidade.vanta_fee_percent * 100).toFixed(1)}%`
                      : '5.0% (padrão)'}
                  </p>
                </button>
              )}
            </div>

            {/* Taxa Fixa — valor adicional por ingresso */}
            <div className="space-y-1.5">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                Taxa Fixa por ingresso (R$)
              </p>
              {isMaster ? (
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={feeFixedStr}
                    onChange={e => setFeeFixedStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">R$</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowFeeAlert(true)}
                  className="w-full flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3 text-left"
                >
                  <Lock size="0.75rem" className="text-zinc-700 shrink-0" />
                  <p className="text-zinc-400 text-sm flex-1">
                    {comunidade.vanta_fee_fixed !== undefined
                      ? `R$ ${comunidade.vanta_fee_fixed.toFixed(2)}`
                      : 'R$ 0,00'}
                  </p>
                </button>
              )}
            </div>

            {/* Alerta taxa bloqueada */}
            {showFeeAlert && (
              <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2.5">
                <AlertTriangle size="0.75rem" className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-400/80 text-[0.625rem] leading-relaxed">
                  Somente administradores do VANTA podem alterar taxas contratuais.
                </p>
              </div>
            )}

            {/* Info: taxa VANTA sempre do cliente */}
            <div className="bg-[#FFD300]/5 border border-[#FFD300]/15 rounded-xl px-3 py-2">
              <p className="text-[0.5rem] text-[#FFD300]/70 font-black uppercase tracking-widest">
                Taxa de Serviço VANTA
              </p>
              <p className="text-zinc-400 text-[0.5625rem] leading-relaxed mt-0.5">
                Sempre cobrada do cliente no checkout. O organizador recebe o valor integral do ingresso.
              </p>
            </div>

            {/* Modo gateway — quem paga o processamento */}
            <div className="space-y-1.5">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Quem paga o Gateway?</p>
              <div className="flex gap-2">
                {(['ABSORVER', 'REPASSAR'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setGatewayMode(mode)}
                    className={`flex-1 py-2.5 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest transition-all border ${
                      gatewayMode === mode
                        ? 'bg-[#FFD300]/15 border-[#FFD300]/40 text-[#FFD300]'
                        : 'bg-zinc-900/40 border-white/5 text-zinc-400 active:text-zinc-300'
                    }`}
                  >
                    {mode === 'ABSORVER' ? 'Organizador absorve' : 'Repassa ao cliente'}
                  </button>
                ))}
              </div>
              <p className="text-zinc-700 text-[0.5625rem] leading-relaxed">
                {gatewayMode === 'ABSORVER'
                  ? 'O custo de processamento do pagamento é descontado do repasse ao organizador.'
                  : 'O custo de processamento é cobrado do cliente no checkout.'}
              </p>
            </div>
          </div>

          {/* Split Taxa VANTA — master only */}
          {isMaster && (
            <div className="space-y-3 pt-1 border-t border-white/5">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Repasse da taxa VANTA</p>
              <p className="text-zinc-700 text-[0.5625rem] leading-relaxed">
                Percentual da taxa VANTA que o master repassa ao sócio/gerente desta comunidade.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={repasseStr}
                  onChange={e => setRepasseStr(e.target.value)}
                  className="w-24 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FFD300]/40"
                />
                <span className="text-zinc-400 text-xs">%</span>
                <span className="text-zinc-700 text-[0.5625rem] ml-2">
                  {repasseStr === '0' ? 'Sem repasse' : `${repasseStr}% repassado`}
                </span>
              </div>
            </div>
          )}

          {/* Taxas Avançadas — master only */}
          {isMaster && (
            <div className="space-y-3 pt-1 border-t border-white/5">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                Taxas Avançadas (Padrão Comunidade)
              </p>
              <p className="text-zinc-700 text-[0.5625rem] leading-relaxed">
                Valores padrão para novos eventos. O produtor pode propor alterações na criação do evento.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    Taxa Processamento (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxaProcStr}
                    onChange={e => setTaxaProcStr(e.target.value)}
                    placeholder="2.5"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    Taxa Porta (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxaPortaStr}
                    onChange={e => setTaxaPortaStr(e.target.value)}
                    placeholder="= Taxa App"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    Taxa Mínima (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxaMinimaStr}
                    onChange={e => setTaxaMinimaStr(e.target.value)}
                    placeholder="2.00"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    Cota Nomes Lista
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={cotaNomesStr}
                    onChange={e => setCotaNomesStr(e.target.value)}
                    placeholder="500"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    R$/Nome Excedente
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxaNomeExcStr}
                    onChange={e => setTaxaNomeExcStr(e.target.value)}
                    placeholder="0.50"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    Cota Cortesias
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={cotaCortesiasStr}
                    onChange={e => setCotaCortesiasStr(e.target.value)}
                    placeholder="50"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    % Cortesia Excedente (sobre valor face)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxaCortExcStr}
                    onChange={e => setTaxaCortExcStr(e.target.value)}
                    placeholder="5.0"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Evento Privado — config */}
          <div className="space-y-3 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PartyPopper size="0.625rem" className="text-purple-400/70 shrink-0" />
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Evento Privado</p>
              </div>
              <button
                onClick={() => setEpAtivo(!epAtivo)}
                className={`w-10 h-5 rounded-full transition-all relative ${epAtivo ? 'bg-[#FFD300]' : 'bg-zinc-700'}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${epAtivo ? 'left-[1.375rem]' : 'left-0.5'}`}
                />
              </button>
            </div>

            {epAtivo && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    Texto de Apresentação
                  </label>
                  <textarea
                    value={epTexto}
                    onChange={e => setEpTexto(e.target.value)}
                    placeholder="Descreva o espaço para eventos privados..."
                    rows={3}
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700 resize-none"
                  />
                </div>

                {/* Formatos */}
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    Formatos
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {epFormatos.map((f, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[0.625rem] font-bold px-2.5 py-1 rounded-full"
                      >
                        {f}
                        <button
                          onClick={() => setEpFormatos(epFormatos.filter((_, idx) => idx !== i))}
                          className="text-purple-400/50 hover:text-purple-300"
                        >
                          <X size="0.625rem" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novoFormato}
                      onChange={e => setNovoFormato(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && novoFormato.trim()) {
                          setEpFormatos([...epFormatos, novoFormato.trim()]);
                          setNovoFormato('');
                        }
                      }}
                      placeholder="Ex: Corporativo, Aniversário..."
                      className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                    />
                    <button
                      onClick={() => {
                        if (novoFormato.trim()) {
                          setEpFormatos([...epFormatos, novoFormato.trim()]);
                          setNovoFormato('');
                        }
                      }}
                      className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <Plus size="0.875rem" className="text-purple-400" />
                    </button>
                  </div>
                </div>

                {/* Atrações */}
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    Atrações
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {epAtracoes.map((a, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[0.625rem] font-bold px-2.5 py-1 rounded-full"
                      >
                        {a}
                        <button
                          onClick={() => setEpAtracoes(epAtracoes.filter((_, idx) => idx !== i))}
                          className="text-blue-400/50 hover:text-blue-300"
                        >
                          <X size="0.625rem" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novaAtracao}
                      onChange={e => setNovaAtracao(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && novaAtracao.trim()) {
                          setEpAtracoes([...epAtracoes, novaAtracao.trim()]);
                          setNovaAtracao('');
                        }
                      }}
                      placeholder="Ex: DJ, Banda ao vivo..."
                      className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                    />
                    <button
                      onClick={() => {
                        if (novaAtracao.trim()) {
                          setEpAtracoes([...epAtracoes, novaAtracao.trim()]);
                          setNovaAtracao('');
                        }
                      }}
                      className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <Plus size="0.875rem" className="text-blue-400" />
                    </button>
                  </div>
                </div>

                {/* Faixas de Capacidade */}
                <div className="space-y-1">
                  <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                    Faixas de Capacidade
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {epFaixas.map((f, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[0.625rem] font-bold px-2.5 py-1 rounded-full"
                      >
                        {f}
                        <button
                          onClick={() => setEpFaixas(epFaixas.filter((_, idx) => idx !== i))}
                          className="text-emerald-400/50 hover:text-emerald-300"
                        >
                          <X size="0.625rem" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novaFaixa}
                      onChange={e => setNovaFaixa(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && novaFaixa.trim()) {
                          setEpFaixas([...epFaixas, novaFaixa.trim()]);
                          setNovaFaixa('');
                        }
                      }}
                      placeholder="Ex: 50-100 pessoas..."
                      className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                    />
                    <button
                      onClick={() => {
                        if (novaFaixa.trim()) {
                          setEpFaixas([...epFaixas, novaFaixa.trim()]);
                          setNovaFaixa('');
                        }
                      }}
                      className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <Plus size="0.875rem" className="text-emerald-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transferir Titularidade — master only */}
          {isMaster && (
            <div className="space-y-3 pt-1 border-t border-white/5">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size="0.625rem" className="text-amber-400/70 shrink-0" />
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                  Transferir Titularidade
                </p>
              </div>
              <p className="text-zinc-700 text-[0.5625rem] leading-relaxed">
                Transferir a propriedade desta comunidade para outro membro.
                {comunidade.donoId && nomesMap[comunidade.donoId] && (
                  <>
                    {' '}
                    Dono atual: <span className="text-zinc-400">{nomesMap[comunidade.donoId]}</span>
                  </>
                )}
              </p>
              {membrosComunidade.length === 0 ? (
                <p className="text-zinc-700 text-[0.5625rem]">Nenhum membro disponível para transferência.</p>
              ) : (
                <>
                  <VantaDropdown
                    value={novoDonoId}
                    onChange={setNovoDonoId}
                    placeholder="Selecione o novo dono"
                    options={membrosComunidade.map(m => ({
                      value: m.userId,
                      label: `${nomesMap[m.userId] || m.userId} — ${m.cargo}`,
                    }))}
                    className="w-full"
                  />
                  {novoDonoId && !showTransferConfirm && (
                    <button
                      onClick={() => setShowTransferConfirm(true)}
                      className="w-full py-3 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest active:scale-[0.98] transition-all"
                    >
                      Transferir para {nomesMap[novoDonoId] || novoDonoId}
                    </button>
                  )}
                  {showTransferConfirm && (
                    <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3 space-y-2">
                      <p className="text-red-400 text-[0.625rem] font-bold">Tem certeza? Esta ação é irreversível.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowTransferConfirm(false)}
                          className="flex-1 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            onSave({ donoId: novoDonoId } as Partial<Comunidade>);
                            setShowTransferConfirm(false);
                          }}
                          className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest"
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div
          className="px-6 pt-3 border-t border-white/5 shrink-0"
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
        >
          <button
            onClick={handleSave}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Check size="0.8125rem" /> Salvar
          </button>
        </div>
      </div>

      {/* Crop modal — onClick stop para não fechar o EditarModal */}
      {cropSrc && (
        <div
          className="absolute inset-0 z-[500]"
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
        >
          <ImageCropModal
            src={cropSrc}
            aspect={cropType === 'perfil' ? 1 : 3}
            minWidth={cropType === 'perfil' ? 400 : 1200}
            minHeight={cropType === 'perfil' ? 400 : 400}
            label={cropType === 'perfil' ? 'Foto de Perfil' : 'Foto de Capa'}
            onConfirm={dataUrl => {
              if (cropType === 'perfil') setFoto(dataUrl);
              else setFotoCapa(dataUrl);
              setCropSrc(null);
            }}
            onClose={() => setCropSrc(null)}
          />
        </div>
      )}

      {showExitConfirm && <UnsavedChangesModal onStay={() => setShowExitConfirm(false)} onLeave={onClose} />}
    </div>
  );
};
