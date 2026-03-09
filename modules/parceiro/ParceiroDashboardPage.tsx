import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  ArrowLeft,
  Loader2,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Crown,
  X,
  QrCode,
  Camera,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { parceiroService } from './parceiroService';
import { clubeResgatesService } from '../../features/admin/services/clube/clubeResgatesService';
import type { ParceiroDados, DealParceiro, ResgateParceiro, MetricasParceiro } from './parceiroService';

type Tab = 'DEALS' | 'RESGATES' | 'QR_SCAN';

export const ParceiroDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentAccount = useAuthStore(s => s.currentAccount);
  const authLoading = useAuthStore(s => s.authLoading);

  const [parceiro, setParceiro] = useState<ParceiroDados | null>(null);
  const [deals, setDeals] = useState<DealParceiro[]>([]);
  const [resgates, setResgates] = useState<ResgateParceiro[]>([]);
  const [metricas, setMetricas] = useState<MetricasParceiro | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('DEALS');

  // Form sugerir deal
  const [showForm, setShowForm] = useState(false);
  const [formTitulo, setFormTitulo] = useState('');
  const [formTipo, setFormTipo] = useState('BARTER');
  const [formVagas, setFormVagas] = useState('10');
  const [formObrigacao, setFormObrigacao] = useState('');
  const [formDesconto, setFormDesconto] = useState('');
  const [criando, setCriando] = useState(false);

  // QR Scanner
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ ok: boolean; nome?: string; deal?: string; erro?: string } | null>(
    null,
  );
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const scanContainerRef = useRef<HTMLDivElement>(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = useCallback(async () => {
    setScanResult(null);
    setScanning(true);

    try {
      // Verificar permissão de câmera
      const permStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      permStream.getTracks().forEach(t => t.stop());

      const { Html5Qrcode } = await import('html5-qrcode');

      const containerId = 'qr-mv-reader';
      const el = document.getElementById(containerId);
      if (!el) return;

      el.style.display = 'block';

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async decoded => {
          // Extrair token do QR
          const token = decoded.replace('vanta://mv/', '').trim();
          if (!token || token.length < 10) return;

          // Parar scanner
          await scanner.stop().catch(() => {});
          scannerRef.current = null;
          setScanning(false);

          // Fazer check-in
          const res = await clubeResgatesService.checkin(token);
          if (res.ok && res.resgate) {
            setScanResult({ ok: true, nome: res.resgate.userName ?? 'Membro', deal: res.resgate.dealTitulo ?? 'Deal' });
            // Recarregar resgates
            if (parceiro) {
              const novosResgates = await parceiroService.getResgates(parceiro.id);
              setResgates(novosResgates);
              const novasMetricas = await parceiroService.getMetricas(parceiro.id);
              setMetricas(novasMetricas);
            }
          } else {
            setScanResult({ ok: false, erro: res.erro ?? 'QR inválido' });
          }
        },
        () => {}, // error callback
      );
    } catch {
      setScanning(false);
      setScanResult({ ok: false, erro: 'Não foi possível acessar a câmera' });
    }
  }, [parceiro]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const fetchData = useCallback(async () => {
    if (!currentAccount?.id) return;
    try {
      const p = await parceiroService.getMeuParceiro(currentAccount.id);
      if (!p) {
        setLoading(false);
        return;
      }
      setParceiro(p);

      const [d, r, m] = await Promise.all([
        parceiroService.getDeals(p.id),
        parceiroService.getResgates(p.id),
        parceiroService.getMetricas(p.id),
      ]);
      setDeals(d);
      setResgates(r);
      setMetricas(m);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentAccount?.id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSugerir = async () => {
    if (!parceiro || !formTitulo.trim()) return;
    setCriando(true);
    try {
      await parceiroService.sugerirDeal({
        parceiro_id: parceiro.id,
        cidade_id: '', // será preenchido pelo master
        titulo: formTitulo.trim(),
        tipo: formTipo,
        obrigacao_barter: formTipo === 'BARTER' ? formObrigacao : undefined,
        desconto_percentual: formTipo === 'DESCONTO' ? Number(formDesconto) || undefined : undefined,
        vagas: Number(formVagas) || 10,
      });
      setShowForm(false);
      setFormTitulo('');
      setFormObrigacao('');
      setFormDesconto('');
      void fetchData();
    } catch {
      // toast error
    } finally {
      setCriando(false);
    }
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case 'ATIVO':
        return <CheckCircle size={10} className="text-green-500" />;
      case 'RASCUNHO':
        return <Clock size={10} className="text-yellow-500" />;
      case 'PAUSADO':
        return <Pause size={10} className="text-zinc-400" />;
      case 'ENCERRADO':
      case 'EXPIRADO':
        return <XCircle size={10} className="text-zinc-400" />;
      default:
        return <Clock size={10} className="text-zinc-400" />;
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'ATIVO':
        return 'Ativo';
      case 'RASCUNHO':
        return 'Aguardando aprovação';
      case 'PAUSADO':
        return 'Pausado';
      case 'ENCERRADO':
        return 'Encerrado';
      case 'EXPIRADO':
        return 'Expirado';
      default:
        return s;
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 size={24} className="text-[#FFD300] animate-spin" />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 size={24} className="text-zinc-600 animate-spin" />
      </div>
    );
  }

  if (!currentAccount?.id) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="text-center">
          <Store size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400 text-sm">Faça login para acessar o painel do parceiro</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-[#FFD300] text-black font-bold text-xs rounded-xl"
          >
            Ir para o App
          </button>
        </div>
      </div>
    );
  }

  if (!parceiro) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="text-center">
          <Store size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400 text-sm">Você não é parceiro MAIS VANTA</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-zinc-800 border border-white/10 text-zinc-300 font-bold text-xs rounded-xl"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <button onClick={() => navigate('/')} className="p-1.5 text-zinc-400 active:text-white" aria-label="Voltar">
          <ArrowLeft size={16} />
        </button>
        <Store size={14} className="text-purple-400" />
        <div className="min-w-0 flex-1">
          <h1 className="text-white font-bold text-sm truncate">{parceiro.nome}</h1>
          <p className="text-zinc-400 text-[9px] truncate">
            {parceiro.cidade_nome ? `${parceiro.cidade_nome} · ` : ''}Plano {parceiro.plano}
          </p>
        </div>
      </div>

      {/* KPIs */}
      {metricas && (
        <div className="shrink-0 grid grid-cols-3 gap-2 p-4">
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3 text-center">
            <ShoppingCart size={14} className="mx-auto text-green-500 mb-1" />
            <p className="text-white font-bold text-lg">{metricas.totalResgates}</p>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest">Total resgates</p>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3 text-center">
            <TrendingUp size={14} className="mx-auto text-[#FFD300] mb-1" />
            <p className="text-white font-bold text-lg">{metricas.resgatesMes}</p>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest">Este mês</p>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3 text-center">
            <Users size={14} className="mx-auto text-purple-400 mb-1" />
            <p className="text-white font-bold text-lg">{metricas.membrosUnicos}</p>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest">Membros</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="shrink-0 flex gap-2 px-4 pb-3">
        {(['DEALS', 'RESGATES', 'QR_SCAN'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
              tab === t
                ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                : 'bg-zinc-900 border-white/5 text-zinc-400'
            }`}
          >
            {t === 'DEALS' ? 'Meus Deals' : t === 'RESGATES' ? 'Resgates' : 'QR Scan'}
          </button>
        ))}
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto px-3 py-2 bg-purple-500/15 border border-purple-500/30 rounded-xl text-purple-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all"
          aria-label="Sugerir novo deal"
        >
          <Plus size={10} /> Sugerir Deal
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-2">
        {tab === 'DEALS' &&
          (deals.length === 0 ? (
            <div className="text-center py-16">
              <Crown size={24} className="mx-auto text-zinc-700 mb-2" />
              <p className="text-zinc-400 text-xs">Nenhum deal ainda</p>
            </div>
          ) : (
            deals.map(d => (
              <div key={d.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon(d.status)}
                  <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider">
                    {statusLabel(d.status)}
                  </span>
                  <span className="ml-auto text-zinc-400 text-[9px]">
                    {d.tipo === 'BARTER' ? 'Barter' : 'Desconto'}
                  </span>
                </div>
                <p className="text-white font-bold text-sm truncate">{d.titulo}</p>
                <p className="text-zinc-400 text-[10px] mt-1">
                  {d.vagas_preenchidas}/{d.vagas} vagas preenchidas
                </p>
              </div>
            ))
          ))}

        {tab === 'RESGATES' &&
          (resgates.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart size={24} className="mx-auto text-zinc-700 mb-2" />
              <p className="text-zinc-400 text-xs">Nenhum resgate ainda</p>
            </div>
          ) : (
            resgates.map(r => (
              <div key={r.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <ShoppingCart size={12} className="text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-bold truncate">{r.user_nome ?? 'Membro'}</p>
                  <p className="text-zinc-400 text-[9px] truncate">{r.deal_titulo ?? 'Deal'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-zinc-400 text-[9px]">{new Date(r.aplicado_em).toLocaleDateString('pt-BR')}</p>
                  <p className="text-[8px] font-black uppercase tracking-wider text-green-500">
                    {r.status === 'CONCLUIDO' ? 'Concluído' : r.status === 'CHECK_IN' ? 'Check-in' : r.status}
                  </p>
                </div>
              </div>
            ))
          ))}

        {tab === 'QR_SCAN' && (
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Scanner container */}
            <div
              ref={scanContainerRef}
              className="w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-zinc-900 border-2 border-[#FFD300]/30 relative"
            >
              <div id="qr-mv-reader" className="w-full h-full" style={{ display: scanning ? 'block' : 'none' }} />
              {!scanning && !scanResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#FFD300]/10 flex items-center justify-center">
                    <QrCode size={28} className="text-[#FFD300]" />
                  </div>
                  <p className="text-zinc-400 text-[10px] text-center px-4">
                    Escaneie o QR VIP dourado do membro para registrar o check-in
                  </p>
                </div>
              )}
            </div>

            {/* Resultado */}
            {scanResult && (
              <div
                className={`w-full rounded-2xl p-4 border ${
                  scanResult.ok ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {scanResult.ok ? (
                    <CheckCircle size={20} className="text-green-500 shrink-0" />
                  ) : (
                    <XCircle size={20} className="text-red-500 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    {scanResult.ok ? (
                      <>
                        <p className="text-green-400 font-bold text-sm">Check-in confirmado!</p>
                        <p className="text-zinc-400 text-[10px] truncate">
                          {scanResult.nome} — {scanResult.deal}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-red-400 font-bold text-sm">Erro</p>
                        <p className="text-zinc-400 text-[10px]">{scanResult.erro}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botão */}
            <button
              onClick={() => (scanning ? void stopScanner() : void startScanner())}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all ${
                scanning
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-[#FFD300]/10 border border-[#FFD300]/30 text-[#FFD300]'
              }`}
            >
              {scanning ? (
                <>
                  <Pause size={14} />
                  Parar Scanner
                </>
              ) : (
                <>
                  <Camera size={14} />
                  {scanResult ? 'Escanear Outro' : 'Iniciar Scanner'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal Sugerir Deal */}
      {showForm && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="px-6 pt-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-white font-bold text-base">Sugerir Deal</p>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-400" aria-label="Fechar">
                  <X size={14} />
                </button>
              </div>

              {/* Tipo */}
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Tipo</p>
              <div className="flex gap-2 mb-4">
                {['BARTER', 'DESCONTO'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFormTipo(t)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                      formTipo === t
                        ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                        : 'bg-zinc-900 border-white/5 text-zinc-400'
                    }`}
                  >
                    {t === 'BARTER' ? 'Barter' : 'Desconto'}
                  </button>
                ))}
              </div>

              {/* Título */}
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Título do Deal</p>
              <input
                type="text"
                value={formTitulo}
                onChange={e => setFormTitulo(e.target.value)}
                placeholder="Ex: Jantar para 2 no restaurante"
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 outline-none focus:border-[#FFD300]/30 mb-4"
              />

              {/* Obrigação barter */}
              {formTipo === 'BARTER' && (
                <>
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">
                    Obrigação do membro
                  </p>
                  <input
                    type="text"
                    value={formObrigacao}
                    onChange={e => setFormObrigacao(e.target.value)}
                    placeholder="Ex: 1 story + 1 post marcando @restaurante"
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 outline-none focus:border-[#FFD300]/30 mb-4"
                  />
                </>
              )}

              {/* Desconto */}
              {formTipo === 'DESCONTO' && (
                <>
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">
                    Percentual de desconto
                  </p>
                  <input
                    type="number"
                    value={formDesconto}
                    onChange={e => setFormDesconto(e.target.value)}
                    placeholder="Ex: 20"
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 outline-none focus:border-[#FFD300]/30 mb-4"
                  />
                </>
              )}

              {/* Vagas */}
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Vagas</p>
              <input
                type="number"
                value={formVagas}
                onChange={e => setFormVagas(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 outline-none focus:border-[#FFD300]/30 mb-4"
              />

              <p className="text-zinc-400 text-[10px] leading-relaxed mb-5">
                O deal será enviado pro master pra aprovação. Você será notificado quando for aprovado.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void handleSugerir()}
                  disabled={criando || !formTitulo.trim()}
                  className="flex-1 py-4 bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {criando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {criando ? 'Enviando...' : 'Sugerir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
