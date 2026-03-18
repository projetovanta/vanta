import React, { useState, useMemo } from 'react';
import { ArrowLeft, Bell, Check, Loader2, Smartphone, AlertTriangle } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';

export const PreferencesView: React.FC<{ onBack: () => void; onSave: (d: any) => void }> = ({ onBack, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [settings, setSettings] = useState({ pushNotifs: true, emailNotifs: false, eventReminders: true });

  const ToggleRow = ({ icon: Icon, label, description, active, onClick }: any) => (
    <div className="flex items-center justify-between p-5 bg-zinc-900/40 border border-white/5 rounded-2xl">
      <div className="flex items-start gap-4">
        <div
          className={`p-2 rounded-xl border ${active ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]' : 'bg-black border-white/5 text-zinc-400'}`}
        >
          <Icon size="1.125rem" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white leading-none mb-1.5">{label}</h4>
          <p className="text-[0.625rem] text-zinc-400 italic">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`w-12 h-6 rounded-full relative transition-all ${active ? 'bg-[#FFD300]' : 'bg-zinc-800'}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full transition-all ${active ? 'left-7 bg-black' : 'left-1 bg-zinc-600'}`}
        />
      </button>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      <div
        className="shrink-0 bg-[#0a0a0a] border-b border-white/5 px-6 pb-4 flex items-center justify-between"
        style={{ paddingTop: '1rem' }}
      >
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center"
        >
          <ArrowLeft size="1.125rem" />
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-lg">
          Preferências
        </h1>
        <div className="w-10" />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        <h3 style={TYPOGRAPHY.uiLabel}>Notificações</h3>
        <div className="space-y-3">
          <ToggleRow
            icon={Smartphone}
            label="Push"
            description="Alertas no dispositivo."
            active={settings.pushNotifs}
            onClick={() => setSettings(s => ({ ...s, pushNotifs: !s.pushNotifs }))}
          />
          <ToggleRow
            icon={Bell}
            label="Lembretes"
            description="Avisos 1h antes."
            active={settings.eventReminders}
            onClick={() => setSettings(s => ({ ...s, eventReminders: !s.eventReminders }))}
          />
        </div>
      </div>
      <div className="shrink-0 px-6 pt-4" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={async () => {
            setIsSaving(true);
            await new Promise(r => setTimeout(r, 800));
            onSave({ preferences: settings });
          }}
          disabled={isSaving}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.35em] rounded-xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {isSaving ? <Loader2 size="0.875rem" className="animate-spin" /> : <Check size="0.875rem" />}Salvar
        </button>
      </div>
    </div>
  );
};
