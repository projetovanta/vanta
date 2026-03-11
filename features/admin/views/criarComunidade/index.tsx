import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { comunidadesService } from '../../services/comunidadesService';
import { rbacService, CARGO_PERMISSOES } from '../../services/rbacService';
import { UnsavedChangesModal } from '../../../../components/UnsavedChangesModal';
import { Membro, HorarioSemanal } from '../../../../types';
import { DEFAULT_HORARIOS } from '../../../../components/HorarioFuncionamentoEditor';
import { Step1Identidade } from './Step1Identidade';
import { Step2Localizacao } from './Step2Localizacao';
import { Step3Fotos } from './Step3Fotos';

export const CriarComunidadeView: React.FC<{
  onBack: () => void;
  adminNome: string;
  adminId?: string;
}> = ({ onBack, adminId }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [criado, setCriado] = useState(false);
  const [erro, setErro] = useState('');

  // Step 1
  const [nome, setNome] = useState('');
  const [bio, setBio] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [taxaVantaStr, setTaxaVantaStr] = useState('');
  const [taxaProcStr, setTaxaProcStr] = useState('');
  const [taxaPortaStr, setTaxaPortaStr] = useState('');
  const [taxaMinimaStr, setTaxaMinimaStr] = useState('');
  const [cotaNomesStr, setCotaNomesStr] = useState('');
  const [taxaNomeExcStr, setTaxaNomeExcStr] = useState('');
  const [cotaCortesiasStr, setCotaCortesiasStr] = useState('');
  const [taxaCortExcStr, setTaxaCortExcStr] = useState('');
  const [horarios, setHorarios] = useState<HorarioSemanal[]>(DEFAULT_HORARIOS);
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [telefone, setTelefone] = useState('');

  // Step 2
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Step 3
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [fotoCapa, setFotoCapa] = useState('');
  const [produtores, setProdutores] = useState<Membro[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const hasChanges = useMemo(() => {
    return !!(nome.trim() || bio.trim() || capacidade || taxaVantaStr || rua.trim() || fotoPerfil || fotoCapa);
  }, [nome, bio, capacidade, taxaVantaStr, rua, fotoPerfil, fotoCapa]);

  const safeBack = () => {
    if (hasChanges) setShowExitConfirm(true);
    else onBack();
  };

  const STEP_LABELS = ['Identidade', 'Localização', 'Visual'];

  const validar1 = (): boolean => {
    if (!nome.trim()) {
      setErro('Nome da comunidade é obrigatório.');
      return false;
    }
    if (!bio.trim()) {
      setErro('Bio é obrigatória.');
      return false;
    }
    const cap = parseInt(capacidade);
    if (!capacidade || isNaN(cap) || cap <= 0) {
      setErro('Capacidade máxima inválida.');
      return false;
    }
    const taxa = parseFloat(taxaVantaStr);
    if (!taxaVantaStr || isNaN(taxa) || taxa < 0 || taxa > 100) {
      setErro('Taxa Vanta deve ser entre 0% e 100%.');
      return false;
    }
    return true;
  };

  const validar2 = (): boolean => {
    if (!rua.trim()) {
      setErro('Rua é obrigatória.');
      return false;
    }
    if (!numero.trim()) {
      setErro('Número é obrigatório.');
      return false;
    }
    if (!bairro.trim()) {
      setErro('Bairro é obrigatório.');
      return false;
    }
    if (!cidade.trim()) {
      setErro('Cidade é obrigatória.');
      return false;
    }
    if (!estado.trim()) {
      setErro('Estado é obrigatório.');
      return false;
    }
    return true;
  };

  const validar3 = (): boolean => {
    if (!fotoPerfil) {
      setErro('Foto de perfil é obrigatória.');
      return false;
    }
    if (!fotoCapa) {
      setErro('Foto de capa é obrigatória.');
      return false;
    }
    if (produtores.length === 0) {
      setErro('Adicione ao menos um produtor responsável.');
      return false;
    }
    return true;
  };

  const avancar = () => {
    setErro('');
    if (step === 1 && !validar1()) return;
    if (step === 2 && !validar2()) return;
    if (step === 3) {
      if (!validar3()) return;
      handleCriar();
      return;
    }
    setStep(s => (s + 1) as 1 | 2 | 3);
  };

  const handleCriar = async () => {
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
      });

      if (!novoId) {
        setErro('Erro ao criar comunidade. Tente novamente.');
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

      setCriado(true);
    } catch (err) {
      console.error('[CriarComunidade] erro:', err);
      setErro('Erro ao criar comunidade. Verifique os dados e tente novamente.');
    }
  };

  if (criado) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-10 gap-6">
        <div className="w-20 h-20 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/30 flex items-center justify-center">
          <Check size="2.25rem" className="text-[#FFD300]" />
        </div>
        <div className="text-center">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl italic mb-2">
            {nome}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Comunidade criada com sucesso.
            <br />
            Já aparece no painel e está pronta para receber eventos.
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full max-w-xs py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-2xl active:scale-[0.98] transition-all"
        >
          Voltar para Comunidades
        </button>
      </div>
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
          {([1, 2, 3] as const).map((s, i) => (
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
              {i < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-[#FFD300]/20' : 'bg-white/5'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {STEP_LABELS.map((l, i) => (
            <p
              key={l}
              className={`text-[0.4375rem] font-black uppercase tracking-widest ${step === i + 1 ? 'text-[#FFD300]' : 'text-zinc-700'}`}
              style={{ width: '33%', textAlign: i === 0 ? 'left' : i === 2 ? 'right' : 'center' }}
            >
              {l}
            </p>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">
        {step === 1 && (
          <Step1Identidade
            nome={nome}
            setNome={setNome}
            bio={bio}
            setBio={setBio}
            capacidade={capacidade}
            setCapacidade={setCapacidade}
            horarios={horarios}
            setHorarios={setHorarios}
            taxaVantaStr={taxaVantaStr}
            setTaxaVantaStr={setTaxaVantaStr}
            cnpj={cnpj}
            setCnpj={setCnpj}
            razaoSocial={razaoSocial}
            setRazaoSocial={setRazaoSocial}
            telefone={telefone}
            setTelefone={setTelefone}
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
          />
        )}
        {step === 3 && (
          <Step3Fotos
            fotoPerfil={fotoPerfil}
            setFotoPerfil={setFotoPerfil}
            fotoCapa={fotoCapa}
            setFotoCapa={setFotoCapa}
            produtores={produtores}
            setProdutores={setProdutores}
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
              setStep(s => (s - 1) as 1 | 2 | 3);
            }}
            className="flex-1 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Anterior
          </button>
        )}
        <button
          onClick={avancar}
          className="flex-1 py-3.5 bg-[#FFD300] text-black rounded-xl text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
        >
          {step === 3 ? 'Criar Comunidade' : 'Próximo'}
        </button>
      </div>

      {showExitConfirm && <UnsavedChangesModal onStay={() => setShowExitConfirm(false)} onLeave={onBack} />}
    </div>
  );
};
