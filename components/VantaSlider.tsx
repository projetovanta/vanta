import React from 'react';

interface VantaSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
}

/**
 * VantaSlider — slider estilizado com visual VANTA.
 * Track escuro, thumb amarelo #FFD300, fill progressivo.
 */
export const VantaSlider: React.FC<VantaSliderProps> = ({ value, onChange, min, max, step = 1, className = '' }) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className={`vanta-slider w-full ${className}`}
      style={{
        background: `linear-gradient(to right, #FFD300 0%, #FFD300 ${pct}%, #27272a ${pct}%, #27272a 100%)`,
      }}
    />
  );
};
