import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ArrowLeft, Check, FileText } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { comunidadesService } from '../../services/comunidadesService';
import { rbacService, CARGO_PERMISSOES } from '../../services/rbacService';
import { UnsavedChangesModal } from '../../../../components/UnsavedChangesModal';
import { useToast, ToastContainer } from '../../../../components/Toast';
import { Membro, HorarioSemanal } from '../../../../types';
import { DEFAULT_HORARIOS } from '../../../../components/HorarioFuncionamentoEditor';
import CelebrationScreen from '../../../../components/CelebrationScreen';
import { useDraft } from '../../../../hooks/useDraft';
import { Step1Identidade } from './Step1Identidade';
import { Step2Localizacao } from './Step2Localizacao';
import { Step3Operacao } from './Step3Operacao';
import { Step4ProdutoresTaxas } from './Step4ProdutoresTaxas';

export const CriarComunidadeView: React.FC<{
  onBack: () => void;
  adminNome: string;
  adminId?: string;
}> = ({ onBack, adminId }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [criado, setCriado] = useState(false);
  const [erro, setErro] = useState('');
  const [isCriando, setIsCriando] = useState(false);
  const { toasts, dismiss, toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Step 1 — Identidade
  const [nome, setNome] = useState('');
  const [bio, setBio] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [fotoCapa, setFotoCapa] = useState('');

  // Step 2 — Localização
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [capacidade, setCapacidade] = useState('');

  // Step 3 — Operação
  const [horarios, setHorarios] = useState<HorarioSemanal[]>(DEFAULT_HORARIOS);
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [site, setSite] = useState('');

  // Step 4 — Produtores + Taxas
  const [produtores, setProdutores] = useState<Membro[]>([]);
  const [taxaVantaStr, setTaxaVantaStr] = useState('');
  const [taxaProcStr, setTaxaProcStr] = useState('');
  const [taxaPortaStr, setTaxaPortaStr] = useState('');
  const [taxaMinimaStr, setTaxaMinimaStr] = useState('');
  const [cotaNomesStr, setCotaNomesStr] = useState('');
  const [taxaNomeExcStr, setTaxaNomeExcStr] = useState('');
  const [cotaCortesiasStr, setCotaCortesiasStr] = useState('');
  const [taxaCortExcStr, setTaxaCortExcStr] = useState('');

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // ── Draft auto-save ──
  const { draftLoaded, hasDraft, draftData, saveDraft, discardDraft } = useDraft('COMUNIDADE');

  const allDraftData = useMemo(
    () => ({
      nome,
      bio,
      capacidade,
      fotoPerfil,
      fotoCapa,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cnpj,
      razaoSocial,
      telefone,
      instagram,
      whatsapp,
      tiktok,
      site,
      taxaVantaStr,
      taxaProcStr,
      taxaPortaStr,
      taxaMinimaStr,
      cotaNomesStr,
      taxaNomeExcStr,
      cotaCortesiasStr,
      taxaCortExcStr,
      horarios,
    }),
    [
      nome,
      bio,
      capacidade,
      fotoPerfil,
      fotoCapa,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cnpj,
      razaoSocial,
      telefone,
      instagram,
      whatsapp,
      tiktok,
      site,
      taxaVantaStr,
      taxaProcStr,
      taxaPortaStr,
      taxaMinimaStr,
      cotaNomesStr,
      taxaNomeExcStr,
      cotaCortesiasStr,
      taxaCortExcStr,
      horarios,
    ],
  );

  const hasChanges = useMemo(() => {
    return !!(nome.trim() || bio.trim() || capacidade || taxaVantaStr || rua.trim() || fotoPerfil || fotoCapa);
  }, [nome, bio, capacidade, taxaVantaStr, rua, fotoPerfil, fotoCapa]);

  // Auto-save draft quando dados mudam (só após carregar draft existente)
  useEffect(() => {
    if (!draftLoaded || !hasChanges) return;
    saveDraft(allDraftData, step);
  }, [draftLoaded, hasChanges, allDraftData, step, saveDraft]);

  const handleRestoreDraft = () => {
    if (!draftData) return;
    const d = draftData.dados as typeof allDraftData;
    setNome(d.nome || '');
    setBio(d.bio || '');
    setCapacidade(d.capacidade || '');
    setFotoPerfil(d.fotoPerfil || '');
    setFotoCapa(d.fotoCapa || '');
    setCep(d.cep || '');
    setRua(d.rua || '');
    setNumero(d.numero || '');
    setComplemento(d.complemento || '');
    setBairro(d.bairro || '');
    setCidade(d.cidade || '');
    setEstado(d.estado || '');
    setCnpj(d.cnpj || '');
    setRazaoSocial(d.razaoSocial || '');
    setTelefone(d.telefone || '');
    setInstagram(d.instagram || '');
    setWhatsapp(d.whatsapp || '');
    setTiktok(d.tiktok || '');
    setSite(d.site || '');
    setTaxaVantaStr(d.taxaVantaStr || '');
    setTaxaProcStr(d.taxaProcStr || '');
    setTaxaPortaStr(d.taxaPortaStr || '');
    setTaxaMinimaStr(d.taxaMinimaStr || '');
    setCotaNomesStr(d.cotaNomesStr || '');
    setTaxaNomeExcStr(d.taxaNomeExcStr || '');
    setCotaCortesiasStr(d.cotaCortesiasStr || '');
    setTaxaCortExcStr(d.taxaCortExcStr || '');
    if (d.horarios) setHorarios(d.horarios as HorarioSemanal[]);
    setStep(draftData.step_atual as 1 | 2 | 3 | 4);
  };

  const safeBack = () => {
    if (hasChanges) setShowExitConfirm(true);
    else onBack();
  };

  const STEP_LABELS = ['Identidade', 'Localização', 'Operação', 'Produtores'];
  const TOTAL_STEPS = 4;

  const setErroScroll = (msg: string) => {
    setErro(msg);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validar1 = (): boolean => {
    if (!nome.trim()) {
      setErroScroll('Nome da comunidade é obrigatório.');
      return false;
    }
    if (!bio.trim()) {
      setErroScroll('Bio é obrigatória.');
      return false;
    }
    if (!fotoPerfil) {
      setErroScroll('Foto de perfil é obrigatória.');
      return false;
    }
    if (!fotoCapa) {
      setErroScroll('Foto de capa é obrigatória.');
      return false;
    }
    return true;
  };

  const validar2 = (): boolean => {
    if (!rua.trim()) {
      setErroScroll('Rua é obrigatória.');
      return false;
    }
    if (!numero.trim()) {
      setErroScroll('Número é obrigatório.');
      return false;
    }
    if (!bairro.trim()) {
      setErroScroll('Bairro é obrigatório.');
      return false;
    }
    if (!cidade.trim()) {
      setErroScroll('Cidade é obrigatória.');
      return false;
    }
    if (!estado.trim()) {
      setErroScroll('Estado é obrigatório.');
      return false;
    }
    const cap = parseInt(capacidade);
    if (!capacidade || isNaN(cap) || cap <= 0) {
      setErroScroll('Capacidade máxima inválida.');
      return false;
    }
    return true;
  };

  const validar3 = (): boolean => {
    // Step 3 (Operação) não tem campos obrigatórios — todos opcionais
    return true;
  };

  const validar4 = (): boolean => {
    if (produtores.length === 0) {
      setErroScroll('Adicione ao menos um produtor responsável.');
      return false;
    }
    const taxa = parseFloat(taxaVantaStr);
    if (!taxaVantaStr || isNaN(taxa) || taxa < 0 || taxa > 100) {
      setErroScroll('Taxa Vanta deve ser entre 0% e 100%.');
      return false;
    }
    return true;
  };

  const avancar = () => {
    setErro('');
    if (step === 1 && !validar1()) return;
    if (step === 2 && !validar2()) return;
    if (step === 3 && !validar3()) return;
    if (step === 4) {
      if (!validar4()) return;
      handleCriar();
      return;
    }
    setStep(s => (s + 1) as 1 | 2 | 3 | 4);
  };

  const handleCriar = async () => {
    if (isCriando) return;
    setIsCriando(true);
    setErro('');
    try {
      const enderecoCompleto = [rua, numero, complemento, bairro].filter(Boolean).join(', ');
      const finalCoords = coords;

      // Criar comunidade com placeholder de foto (será atualizado após upload)
      const novoId = await comunidadesService.criar({
        nome: nome.trim(),
        descricao: bio.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        cep: cep.trim() || undefined,
        endereco: enderecoCompleto,
        foto: '',
        fotoCapa: '',
        coords: finalCoords ?? undefined,
        capacidadeMax: parseInt(capacidade),
        horarioFuncionamento: horarios,
        createdBy: adminId || undefined,
        donoId: adminId || undefined,
        cnpj: cnpj.trim() || undefined,
        razaoSocial: razaoSocial.trim() || undefined,
        telefone: telefone.trim() || undefined,
        instagram: instagram.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
        site: site.trim() || undefined,
      });

      if (!novoId) {
        setErroScroll('Erro ao criar comunidade. Tente novamente.');
        return;
      }

      // Upload fotos para Storage e atualizar URLs
      const [fotoUrl, capaUrl] = await Promise.all([
        comunidadesService.uploadFoto(novoId, 'perfil', fotoPerfil),
        comunidadesService.uploadFoto(novoId, 'capa', fotoCapa),
      ]);
      await comunidadesService.atualizar(novoId, { foto: fotoUrl, fotoCapa: capaUrl });

      const taxaNum = parseFloat(taxaVantaStr);
      if (!isNaN(taxaNum)) {
        const taxasUpdate: Record<string, number> = { vanta_fee_percent: taxaNum / 100 };
        const tp = parseFloat(taxaProcStr);
        if (!isNaN(tp)) taxasUpdate.taxa_processamento_percent = tp / 100;
        const tpo = parseFloat(taxaPortaStr);
        if (!isNaN(tpo)) taxasUpdate.taxa_porta_percent = tpo / 100;
        const tm = parseFloat(taxaMinimaStr);
        if (!isNaN(tm)) taxasUpdate.taxa_minima = tm;
        const cn = parseInt(cotaNomesStr);
        if (!isNaN(cn)) taxasUpdate.cota_nomes_lista = cn;
        const tne = parseFloat(taxaNomeExcStr);
        if (!isNaN(tne)) taxasUpdate.taxa_nome_excedente = tne;
        const cc = parseInt(cotaCortesiasStr);
        if (!isNaN(cc)) taxasUpdate.cota_cortesias = cc;
        const tce = parseFloat(taxaCortExcStr);
        if (!isNaN(tce)) taxasUpdate.taxa_cortesia_excedente_pct = tce / 100;
        await comunidadesService.atualizar(novoId, taxasUpdate);
      }

      // Atribuir produtores como GERENTE da comunidade via RBAC
      if (produtores.length > 0) {
        await Promise.all(
          produtores.map(p =>
            rbacService.atribuir({
              userId: p.id,
              tenant: { tipo: 'COMUNIDADE', id: novoId, nome: nome.trim(), foto: fotoUrl },
              cargo: 'GERENTE',
              permissoes: CARGO_PERMISSOES.GERENTE,
              atribuidoPor: adminId || '',
              ativo: true,
            }),
          ),
        );
      }

      toast({ title: 'Comunidade criada!', variant: 'success' });
      await discardDraft();
      setCriado(true);
    } catch (err) {
      console.error('[CriarComunidade] erro:', err);
      setErroScroll('Erro ao criar comunidade. Verifique os dados e tente novamente.');
      toast({ title: 'Erro ao criar comunidade', variant: 'error' });
    } finally {
      setIsCriando(false);
    }
  };

  if (criado) {
    return (
      <CelebrationScreen
        title={nome}
        subtitle="Comunidade criada com sucesso. Já aparece no painel e está pronta para receber eventos."
        icon="check"
        actions={[{ label: 'Voltar para Comunidades', onClick: onBack, variant: 'primary' }]}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Nova Comunidade
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              {STEP_LABELS[step - 1]}
            </h1>
          </div>
          <button
            aria-label="Voltar"
            onClick={safeBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-1"
          >
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1">
          {([1, 2, 3, 4] as const).map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.5625rem] font-black border transition-all shrink-0 ${
                  step === s
                    ? 'bg-[#FFD300] border-[#FFD300] text-black'
                    : step > s
                      ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                      : 'bg-zinc-900 border-white/10 text-zinc-400'
                }`}
              >
                {step > s ? <Check size="0.625rem" /> : s}
              </div>
              {i < TOTAL_STEPS - 1 && <div className={`flex-1 h-px ${step > s ? 'bg-[#FFD300]/20' : 'bg-white/5'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {STEP_LABELS.map((l, i) => (
            <p
              key={l}
              className={`text-[0.625rem] font-black uppercase tracking-widest ${step === i + 1 ? 'text-[#FFD300]' : 'text-zinc-700'}`}
              style={{
                width: `${100 / TOTAL_STEPS}%`,
                textAlign: i === 0 ? 'left' : i === TOTAL_STEPS - 1 ? 'right' : 'center',
              }}
            >
              {l}
            </p>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">
        {hasDraft && draftData && (
          <div className="bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-[#FFD300] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-snug">Você tem um rascunho não finalizado.</p>
                {draftData.updated_at && (
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Salvo em{' '}
                    {new Date(draftData.updated_at).toLocaleString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleRestoreDraft}
                    className="px-4 py-2 bg-[#FFD300] text-black text-[0.625rem] font-black uppercase tracking-widest rounded-lg active:scale-95 transition-all"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={() => void discardDraft()}
                    className="px-4 py-2 text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest rounded-lg hover:text-zinc-300 active:scale-95 transition-all"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <Step1Identidade
            nome={nome}
            setNome={setNome}
            bio={bio}
            setBio={setBio}
            fotoPerfil={fotoPerfil}
            setFotoPerfil={setFotoPerfil}
            fotoCapa={fotoCapa}
            setFotoCapa={setFotoCapa}
          />
        )}
        {step === 2 && (
          <Step2Localizacao
            cep={cep}
            setCep={setCep}
            rua={rua}
            setRua={setRua}
            numero={numero}
            setNumero={setNumero}
            complemento={complemento}
            setComplemento={setComplemento}
            bairro={bairro}
            setBairro={setBairro}
            cidade={cidade}
            setCidade={setCidade}
            estado={estado}
            setEstado={setEstado}
            coords={coords}
            setCoords={setCoords}
            capacidade={capacidade}
            setCapacidade={setCapacidade}
          />
        )}
        {step === 3 && (
          <Step3Operacao
            horarios={horarios}
            setHorarios={setHorarios}
            cnpj={cnpj}
            setCnpj={setCnpj}
            razaoSocial={razaoSocial}
            setRazaoSocial={setRazaoSocial}
            telefone={telefone}
            setTelefone={setTelefone}
            instagram={instagram}
            setInstagram={setInstagram}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            tiktok={tiktok}
            setTiktok={setTiktok}
            site={site}
            setSite={setSite}
          />
        )}
        {step === 4 && (
          <Step4ProdutoresTaxas
            produtores={produtores}
            setProdutores={setProdutores}
            taxaVantaStr={taxaVantaStr}
            setTaxaVantaStr={setTaxaVantaStr}
            taxaProcStr={taxaProcStr}
            setTaxaProcStr={setTaxaProcStr}
            taxaPortaStr={taxaPortaStr}
            setTaxaPortaStr={setTaxaPortaStr}
            taxaMinimaStr={taxaMinimaStr}
            setTaxaMinimaStr={setTaxaMinimaStr}
            cotaNomesStr={cotaNomesStr}
            setCotaNomesStr={setCotaNomesStr}
            taxaNomeExcStr={taxaNomeExcStr}
            setTaxaNomeExcStr={setTaxaNomeExcStr}
            cotaCortesiasStr={cotaCortesiasStr}
            setCotaCortesiasStr={setCotaCortesiasStr}
            taxaCortExcStr={taxaCortExcStr}
            setTaxaCortExcStr={setTaxaCortExcStr}
          />
        )}
        {erro && <p className="mt-4 text-red-400 text-[0.625rem] font-black uppercase tracking-widest">{erro}</p>}
      </div>

      {/* Nav */}
      <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-[#0A0A0A] flex gap-3">
        {step > 1 && (
          <button
            onClick={() => {
              setErro('');
              setStep(s => (s - 1) as 1 | 2 | 3 | 4);
            }}
            className="flex-1 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Anterior
          </button>
        )}
        <button
          onClick={avancar}
          disabled={isCriando}
          className={`flex-1 py-3.5 rounded-xl text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all ${isCriando ? 'bg-[#FFD300]/50 text-black/50' : 'bg-[#FFD300] text-black'}`}
        >
          {step === 4 ? (isCriando ? 'Criando...' : 'Criar Comunidade') : 'Próximo'}
        </button>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {showExitConfirm && <UnsavedChangesModal onStay={() => setShowExitConfirm(false)} onLeave={onBack} />}
    </div>
  );
};
