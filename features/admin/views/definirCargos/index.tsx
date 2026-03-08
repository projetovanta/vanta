import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Download, Lock, X } from 'lucide-react';
import { Membro, CargoUnificado, DefinicaoCargoCustom } from '../../../../types';
import { TYPOGRAPHY } from '../../../../constants';
import { authService } from '../../../../services/authService';
import { comunidadesService } from '../../services/comunidadesService';
import { eventosAdminService } from '../../services/eventosAdminService';
import { rbacService, CARGO_LABELS, CARGO_PERMISSOES } from '../../services/rbacService';
import { tsBR } from '../../../../utils';

import {
  DefinirCargosProps,
  CargoCustomState,
  DestinoOption,
  cargoCustomVazio,
  inputCls,
  labelCls,
  CARGOS_PREDEFINIDOS,
  VARIACOES_GENERICAS,
} from './types';
import { PainelCargoCustom } from './PainelCargoCustom';
import { ImportarStaffPanel } from './ImportarStaffPanel';
import { SuccessScreen } from './SuccessScreen';
import { ConfirmacaoModal } from './ConfirmacaoModal';

export const DefinirCargosView: React.FC<DefinirCargosProps> = ({ onBack, currentUserId, addNotification }) => {
  const [modo, setModo] = useState<'ADICIONAR' | 'IMPORTAR'>('ADICIONAR');
  const [importDone, setImportDone] = useState(0);

  const [emailQuery, setEmailQuery] = useState('');
  const [selectedMembro, setSelectedMembro] = useState<Membro | null>(null);
  const [destinoQuery, setDestinoQuery] = useState('');
  const [selectedDestino, setSelectedDestino] = useState<DestinoOption | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<CargoUnificado | null>(null);
  const [usarCargoCustom, setUsarCargoCustom] = useState(false);
  const [cargoCustom, setCargoCustom] = useState<CargoCustomState>(cargoCustomVazio);
  const [showModal, setShowModal] = useState(false);
  const [done, setDone] = useState(false);

  const todasComunidades = comunidadesService.getAll();
  const todosEventos = eventosAdminService.getEventos();

  const [membrosFiltrados, setMembrosFiltrados] = useState<Membro[]>([]);
  useEffect(() => {
    if (emailQuery.length < 2) {
      setMembrosFiltrados([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      try {
        const r = await authService.buscarMembros(emailQuery, 5);
        if (cancelled) return;
        setMembrosFiltrados(r);
      } catch (err) {
        console.error('[definirCargos] busca:', err);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [emailQuery]);

  const destinosFiltrados = (() => {
    const q = destinoQuery.toLowerCase();
    const comuns = todasComunidades
      .filter(c => !q || c.nome.toLowerCase().includes(q))
      .map(c => ({ tipo: 'COMUNIDADE' as const, id: c.id, nome: c.nome }));
    const eventos = todosEventos
      .filter(e => !q || e.nome.toLowerCase().includes(q))
      .map(e => ({ tipo: 'EVENTO' as const, id: e.id, nome: e.nome }));
    return [...comuns, ...eventos];
  })();

  // Variações disponíveis: reais do evento ou genéricas para comunidade
  const variacoesDisponiveis = useMemo<string[]>(() => {
    if (!selectedDestino) return VARIACOES_GENERICAS;
    if (selectedDestino.tipo === 'EVENTO') {
      const ev = eventosAdminService.getEvento(selectedDestino.id);
      if (ev) {
        const labels = ev.lotes.flatMap(l =>
          l.variacoes.map(v => {
            const area = v.area === 'OUTRO' ? (v.areaCustom ?? 'Outro') : v.area;
            return `${area} · ${v.genero === 'MASCULINO' ? 'Masc' : v.genero === 'FEMININO' ? 'Fem' : 'Unisex'}`;
          }),
        );
        const unicas = [...new Set(labels)];
        return unicas.length > 0 ? unicas : VARIACOES_GENERICAS;
      }
    }
    return VARIACOES_GENERICAS;
  }, [selectedDestino]);

  // Validação do cargo customizado
  const cargoCustomValido = useMemo(() => {
    if (!usarCargoCustom) return true;
    if (!cargoCustom.nome.trim()) return false;
    const algumModulo = cargoCustom.listas.ativo || cargoCustom.portaria || cargoCustom.financeiro || cargoCustom.caixa;
    if (!algumModulo) return false;
    if (cargoCustom.listas.ativo) {
      const temCotaValida = cargoCustom.listas.cotas.some(c => c.limite > 0);
      if (!temCotaValida) return false;
    }
    return true;
  }, [usarCargoCustom, cargoCustom]);

  const podeConfirmar = selectedMembro && selectedDestino && (usarCargoCustom ? cargoCustomValido : !!selectedCargo);

  const confirmar = async () => {
    if (!selectedMembro || !selectedDestino) return;

    const tenantNome =
      selectedDestino.tipo === 'COMUNIDADE'
        ? (comunidadesService.getAll().find(c => c.id === selectedDestino.id)?.nome ?? selectedDestino.nome)
        : (eventosAdminService.getEvento(selectedDestino.id)?.nome ?? selectedDestino.nome);
    const tenantFoto =
      selectedDestino.tipo === 'COMUNIDADE'
        ? comunidadesService.getAll().find(c => c.id === selectedDestino.id)?.foto
        : eventosAdminService.getEvento(selectedDestino.id)?.foto;

    let cargoCustomId: string | undefined;
    let cargoUnificado: CargoUnificado;
    let labelFinal: string;

    if (usarCargoCustom) {
      // Criar e persistir cargo customizado no tenant
      const def: DefinicaoCargoCustom = {
        id: `cargo_${Date.now().toString(36)}`,
        nome: cargoCustom.nome.trim(),
        modulos: {
          listas: cargoCustom.listas,
          portaria: cargoCustom.portaria,
          financeiro: cargoCustom.financeiro,
          caixa: cargoCustom.caixa,
        },
      };
      await rbacService.criarCargoCustom(selectedDestino.tipo, selectedDestino.id, def);
      cargoCustomId = def.id;
      // Cargo base derivado dos módulos ativados
      if (cargoCustom.portaria || cargoCustom.caixa) cargoUnificado = cargoCustom.caixa ? 'CAIXA' : 'PORTARIA_LISTA';
      else cargoUnificado = 'PROMOTER';
      labelFinal = cargoCustom.nome.trim();
    } else {
      cargoUnificado = selectedCargo!;
      labelFinal = CARGO_LABELS[selectedCargo!];
    }

    // Permissões derivadas dos módulos
    const permissoes = usarCargoCustom
      ? (() => {
          const p = [];
          if (cargoCustom.listas.ativo) p.push('INSERIR_LISTA' as const);
          if (cargoCustom.portaria) {
            p.push('CHECKIN_LISTA' as const);
            p.push('VALIDAR_QR' as const);
          }
          if (cargoCustom.financeiro) p.push('VER_FINANCEIRO' as const);
          if (cargoCustom.caixa) p.push('VENDER_PORTA' as const);
          return p;
        })()
      : (CARGO_PERMISSOES[cargoUnificado] ?? []);

    await rbacService.atribuir({
      userId: selectedMembro.id,
      tenant: { tipo: selectedDestino.tipo, id: selectedDestino.id, nome: tenantNome, foto: tenantFoto },
      cargo: cargoUnificado,
      permissoes,
      atribuidoPor: currentUserId,
      ativo: true,
      ...(cargoCustomId ? { cargoCustomId } : {}),
    });

    addNotification({
      titulo: 'Acesso ao Painel Admin',
      mensagem: `Você recebeu acesso ao painel administrativo como ${labelFinal} em ${selectedDestino.nome}. Toque para ver onde acessar.`,
      tipo: 'SISTEMA',
      lida: false,
      link: 'ADMIN_ACCESS_GUIDE',
      timestamp: tsBR(),
    });

    setShowModal(false);
    setDone(true);
  };

  // Label do cargo para exibição
  const labelCargoAtual = usarCargoCustom ? cargoCustom.nome.trim() : selectedCargo ? CARGO_LABELS[selectedCargo] : '';

  if (done) {
    return (
      <SuccessScreen
        onBack={onBack}
        selectedMembro={selectedMembro}
        selectedDestino={selectedDestino}
        labelCargo={labelCargoAtual}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-10 pb-4 shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
          <div>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic leading-none text-white">
              Definir Cargos
            </h1>
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-1">Permissões de acesso</p>
          </div>
        </div>
        {/* Abas Adicionar / Importar */}
        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl border border-white/5">
          {(['ADICIONAR', 'IMPORTAR'] as const).map(m => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wide transition-all ${
                modo === m ? 'bg-[#FFD300] text-black' : 'text-zinc-400 active:text-zinc-300'
              }`}
            >
              {m === 'IMPORTAR' && <Download size={10} />}
              {m === 'ADICIONAR' ? 'Novo Cargo' : 'Importar Staff'}
            </button>
          ))}
        </div>
      </div>
      {/* Banner de sucesso de importação */}
      {importDone > 0 && (
        <div className="mx-4 mt-3 flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl shrink-0">
          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
          <p className="text-emerald-300 text-xs font-bold flex-1 min-w-0">
            {importDone} membro{importDone > 1 ? 's' : ''} importado{importDone > 1 ? 's' : ''} com sucesso.
          </p>
          <button onClick={() => setImportDone(0)} className="text-zinc-400 active:text-white transition-all shrink-0">
            <X size={13} />
          </button>
        </div>
      )}
      {/* Aba Importar */}
      {modo === 'IMPORTAR' && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          {/* Precisa selecionar destino primeiro */}
          {!selectedDestino ? (
            <div className="space-y-3">
              <p className="text-zinc-400 text-xs leading-relaxed">
                Selecione o evento ou comunidade de <span className="text-white font-semibold">destino</span> para
                importar o staff.
              </p>
              <label className={labelCls}>Destino</label>
              <input
                className={inputCls}
                placeholder="Filtrar comunidade ou evento..."
                value={destinoQuery}
                onChange={e => setDestinoQuery(e.target.value)}
              />
              <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                {(() => {
                  const q = destinoQuery.toLowerCase();
                  const comuns = comunidadesService
                    .getAll()
                    .filter(c => !q || c.nome.toLowerCase().includes(q))
                    .map(c => ({ tipo: 'COMUNIDADE' as const, id: c.id, nome: c.nome }));
                  const eventos = eventosAdminService
                    .getEventos()
                    .filter(e => !q || e.nome.toLowerCase().includes(q))
                    .map(e => ({ tipo: 'EVENTO' as const, id: e.id, nome: e.nome }));
                  return [...comuns, ...eventos].map(d => (
                    <button
                      key={`${d.tipo}-${d.id}`}
                      onClick={() => setSelectedDestino(d)}
                      className="w-full flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3 active:bg-zinc-800/60 transition-all text-left"
                    >
                      <span
                        className={`shrink-0 text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${d.tipo === 'COMUNIDADE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}
                      >
                        {d.tipo === 'COMUNIDADE' ? 'Local' : 'Evento'}
                      </span>
                      <p className="text-white text-sm truncate min-w-0">{d.nome}</p>
                    </button>
                  ));
                })()}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Destino selecionado */}
              <div className="flex items-center gap-3 bg-zinc-900/60 border border-emerald-500/20 rounded-xl px-4 py-3">
                <span
                  className={`shrink-0 text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${selectedDestino.tipo === 'COMUNIDADE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}
                >
                  {selectedDestino.tipo === 'COMUNIDADE' ? 'Local' : 'Evento'}
                </span>
                <p className="text-white text-sm font-medium truncate min-w-0 flex-1">{selectedDestino.nome}</p>
                <button
                  onClick={() => setSelectedDestino(null)}
                  className="ml-auto shrink-0 text-zinc-400 text-[9px] font-black uppercase tracking-wider active:text-white transition-all"
                >
                  Trocar
                </button>
              </div>
              <ImportarStaffPanel
                currentUserId={currentUserId}
                destinoId={selectedDestino.id}
                destinoNome={selectedDestino.nome}
                destinoTipo={selectedDestino.tipo}
                onImportado={count => {
                  setImportDone(count);
                  setSelectedDestino(null);
                }}
              />
            </div>
          )}
        </div>
      )}
      {/* Aba Adicionar (conteúdo original) */}
      {modo === 'ADICIONAR' && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Seção 1 — Membro */}
          <div>
            <label className={labelCls}>Membro</label>
            {selectedMembro ? (
              <div className="flex items-center gap-3 bg-zinc-900/60 border border-emerald-500/20 rounded-xl px-4 py-3">
                <img
                  src={selectedMembro.foto}
                  alt={selectedMembro.nome}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold truncate">{selectedMembro.nome}</p>
                  <p className="text-zinc-400 text-[10px] truncate">{selectedMembro.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMembro(null);
                    setEmailQuery('');
                  }}
                  className="ml-auto shrink-0 text-zinc-400 text-[9px] font-black uppercase tracking-wider active:text-white transition-all"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <input
                  className={inputCls}
                  placeholder="Buscar por e-mail..."
                  value={emailQuery}
                  onChange={e => setEmailQuery(e.target.value)}
                />
                {membrosFiltrados.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {membrosFiltrados.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMembro(m);
                          setEmailQuery('');
                        }}
                        className="w-full flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3 active:bg-zinc-800/60 transition-all text-left"
                      >
                        <img
                          loading="lazy"
                          src={m.foto}
                          alt={m.nome}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{m.nome}</p>
                          <p className="text-zinc-400 text-[10px] truncate">{m.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {emailQuery.length >= 2 && membrosFiltrados.length === 0 && (
                  <p className="text-zinc-400 text-xs mt-2 pl-1">Nenhum membro encontrado.</p>
                )}
              </>
            )}
          </div>

          {/* Seção 2 — Comunidade ou Evento */}
          <div>
            <label className={labelCls}>Comunidade ou Evento</label>
            {selectedDestino ? (
              <div className="flex items-center gap-3 bg-zinc-900/60 border border-emerald-500/20 rounded-xl px-4 py-3">
                <span
                  className={`shrink-0 text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${selectedDestino.tipo === 'COMUNIDADE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}
                >
                  {selectedDestino.tipo === 'COMUNIDADE' ? 'Local' : 'Evento'}
                </span>
                <p className="text-white text-sm font-medium truncate min-w-0">{selectedDestino.nome}</p>
                <button
                  onClick={() => setSelectedDestino(null)}
                  className="ml-auto shrink-0 text-zinc-400 text-[9px] font-black uppercase tracking-wider active:text-white transition-all"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <input
                  className={inputCls}
                  placeholder="Filtrar comunidade ou evento..."
                  value={destinoQuery}
                  onChange={e => setDestinoQuery(e.target.value)}
                />
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                  {destinosFiltrados.map(d => (
                    <button
                      key={`${d.tipo}-${d.id}`}
                      onClick={() => setSelectedDestino(d)}
                      className="w-full flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3 active:bg-zinc-800/60 transition-all text-left"
                    >
                      <span
                        className={`shrink-0 text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${d.tipo === 'COMUNIDADE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}
                      >
                        {d.tipo === 'COMUNIDADE' ? 'Local' : 'Evento'}
                      </span>
                      <p className="text-white text-sm truncate min-w-0">{d.nome}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Seção 3 — Cargo */}
          <div>
            <label className={labelCls}>Cargo</label>

            {/* Grid de cargos pré-definidos */}
            <div className="grid grid-cols-2 gap-2">
              {CARGOS_PREDEFINIDOS.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCargo(c.id);
                    setUsarCargoCustom(false);
                  }}
                  className={`flex flex-col p-4 rounded-xl border transition-all text-left active:scale-[0.97] ${
                    !usarCargoCustom && selectedCargo === c.id
                      ? 'bg-[#FFD300]/10 border-[#FFD300]/40'
                      : 'bg-zinc-900/40 border-white/5 active:bg-zinc-800/60'
                  }`}
                >
                  <p
                    className={`text-sm font-bold leading-none mb-1 ${!usarCargoCustom && selectedCargo === c.id ? 'text-[#FFD300]' : 'text-white'}`}
                  >
                    {c.label}
                  </p>
                  <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">{c.desc}</p>
                </button>
              ))}

              {/* Botão cargo personalizado */}
              <button
                onClick={() => {
                  setUsarCargoCustom(true);
                  setSelectedCargo(null);
                }}
                className={`flex flex-col p-4 rounded-xl border transition-all text-left active:scale-[0.97] ${
                  usarCargoCustom
                    ? 'bg-[#FFD300]/10 border-[#FFD300]/40'
                    : 'bg-zinc-900/40 border-white/5 active:bg-zinc-800/60'
                }`}
              >
                <p
                  className={`text-sm font-bold leading-none mb-1 ${usarCargoCustom ? 'text-[#FFD300]' : 'text-white'}`}
                >
                  ＋ Personalizado
                </p>
                <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">Permissões customizadas</p>
              </button>
            </div>

            {/* Painel de cargo customizado (inline, expande abaixo do grid) */}
            {usarCargoCustom && (
              <PainelCargoCustom
                estado={cargoCustom}
                setEstado={setCargoCustom}
                variacoesDisponiveis={variacoesDisponiveis}
              />
            )}

            {/* Aviso de validação cargo customizado */}
            {usarCargoCustom && !cargoCustomValido && (cargoCustom.nome.trim() || cargoCustom.listas.ativo) && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Lock size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-300 text-[10px] font-bold leading-relaxed">
                  {!cargoCustom.nome.trim()
                    ? 'Informe o nome do cargo.'
                    : cargoCustom.listas.ativo && !cargoCustom.listas.cotas.some(c => c.limite > 0)
                      ? 'Adicione ao menos uma variação com limite maior que zero.'
                      : 'Selecione ao menos um módulo de acesso.'}
                </p>
              </div>
            )}
          </div>

          {/* Botão confirmar */}
          <button
            onClick={() => setShowModal(true)}
            disabled={!podeConfirmar}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Confirmar
          </button>
        </div>
      )}{' '}
      {/* fim modo === 'ADICIONAR' */}
      {/* Modal de confirmação */}
      {showModal && selectedMembro && selectedDestino && (
        <ConfirmacaoModal
          selectedMembro={selectedMembro}
          selectedDestino={selectedDestino}
          usarCargoCustom={usarCargoCustom}
          cargoCustom={cargoCustom}
          labelCargo={labelCargoAtual}
          onConfirmar={confirmar}
          onCancelar={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
