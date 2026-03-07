import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MOOD_EMOJIS } from '../services/moodService';

interface MoodPickerProps {
  currentEmoji?: string | null;
  currentText?: string | null;
  onSave: (emoji: string, text?: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const MoodPicker: React.FC<MoodPickerProps> = ({ currentEmoji, currentText, onSave, onClear, onClose }) => {
  const [emoji, setEmoji] = useState(currentEmoji || '');
  const [text, setText] = useState(currentText || '');

  return (
    <div
      className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#111] rounded-t-3xl border-t border-white/10 p-6 space-y-5 animate-in slide-in-from-bottom-10 duration-300"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Seu mood</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10"
          >
            <X size={16} className="text-zinc-400" />
          </button>
        </div>

        <p className="text-[10px] text-zinc-500">Como você está hoje? Seus amigos vão ver.</p>

        {/* Emoji grid */}
        <div className="grid grid-cols-6 gap-2">
          {MOOD_EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                emoji === e ? 'bg-[#FFD300]/20 ring-2 ring-[#FFD300]/50 scale-110' : 'bg-zinc-900/60 active:scale-95'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Texto opcional */}
        <input
          value={text}
          onChange={e => setText(e.target.value.slice(0, 40))}
          placeholder="O que rola hoje? (opcional)"
          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
        />
        <p className="text-right text-[9px] text-zinc-700 -mt-3">{text.length}/40</p>

        {/* Actions */}
        <div className="flex gap-3">
          {currentEmoji && (
            <button
              onClick={() => {
                onClear();
                onClose();
              }}
              className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-xs font-bold active:scale-[0.97] transition-all"
            >
              Limpar
            </button>
          )}
          <button
            onClick={() => {
              if (emoji) {
                onSave(emoji, text || undefined);
                onClose();
              }
            }}
            disabled={!emoji}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-[0.97] transition-all ${
              emoji ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-600'
            }`}
          >
            Salvar
          </button>
        </div>

        <p className="text-[9px] text-zinc-700 text-center">Expira em 24h automaticamente</p>
      </div>
    </div>
  );
};
