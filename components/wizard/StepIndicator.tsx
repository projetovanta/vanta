import React from 'react';

export interface StepIndicatorStep {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: string | number; className?: string }>;
}

export interface StepIndicatorProps {
  steps: StepIndicatorStep[];
  currentStep: number; // 0-based
  completedSteps: number[]; // indices dos steps completados
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, completedSteps }) => {
  const total = steps.length;
  const progressPercent = ((currentStep + 1) / total) * 100;

  return (
    <div className="w-full">
      {/* Barra de progresso */}
      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FFD300] rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Labels — tela >= 360px */}
      <div className="hidden min-[360px]:flex items-center justify-between mt-2.5 gap-1">
        {steps.map((step, i) => {
          const isCurrent = i === currentStep;
          const isCompleted = completedSteps.includes(i);
          const isFuture = !isCurrent && !isCompleted;
          const Icon = step.icon;

          const colorCls = isCurrent ? 'text-[#FFD300]' : isCompleted ? 'text-[#FFD300]/60' : 'text-zinc-600';

          return (
            <div key={step.id} className={`flex items-center gap-1 ${colorCls}`}>
              {Icon && <Icon size={16} className={colorCls} />}
              <span
                className={`text-[0.625rem] uppercase tracking-widest ${
                  isCurrent ? 'font-black' : isFuture ? 'font-medium' : 'font-bold'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Fallback — tela < 360px */}
      <p className="min-[360px]:hidden text-[0.625rem] text-[#FFD300] font-black uppercase tracking-widest mt-2 text-center">
        Step {currentStep + 1} de {total}
      </p>
    </div>
  );
};
