import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { StepIndicator } from './StepIndicator';
import type { StepIndicatorStep } from './StepIndicator';

export interface FormWizardProps {
  steps: StepIndicatorStep[];
  currentStep: number; // 0-based
  onNext: () => void;
  onBack: () => void;
  canAdvance: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  draftKey?: string;
  children: React.ReactNode;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  currentStep,
  onNext,
  onBack,
  canAdvance,
  isSubmitting = false,
  submitLabel = 'Publicar',
  nextLabel = 'Próximo',
  backLabel = 'Anterior',
  title,
  subtitle,
  onClose,
  children,
}) => {
  const isLastStep = currentStep >= steps.length - 1;
  const completedSteps = Array.from({ length: currentStep }, (_, i) => i);

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-4 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              {title}
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic truncate">
              {subtitle || steps[currentStep]?.label || ''}
            </h1>
          </div>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-1"
          >
            <X size="1.125rem" className="text-zinc-400" />
          </button>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">{children}</div>

      {/* Footer */}
      <div className="shrink-0 px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] border-t border-white/5 bg-[#0A0A0A] flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={onBack}
            className="flex-1 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <span className="flex items-center justify-center gap-1.5">
              <ArrowLeft size={14} />
              {backLabel}
            </span>
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canAdvance || isSubmitting}
          className={`flex-1 py-3.5 rounded-xl text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all ${
            !canAdvance || isSubmitting ? 'bg-[#FFD300]/50 text-black/50 cursor-not-allowed' : 'bg-[#FFD300] text-black'
          }`}
        >
          {isLastStep ? (isSubmitting ? 'Publicando...' : submitLabel) : nextLabel}
        </button>
      </div>
    </div>
  );
};
