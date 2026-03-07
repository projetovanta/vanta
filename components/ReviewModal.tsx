import React, { useState, useEffect } from 'react';
import { X, Star, Send } from 'lucide-react';
import { reviewsService } from '../features/admin/services/reviewsService';

interface ReviewModalProps {
  eventoId: string;
  eventoNome: string;
  userId: string;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ eventoId, eventoNome, userId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comentario, setComentario] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Carrega review existente
  useEffect(() => {
    reviewsService.getExisting(eventoId, userId).then(existing => {
      if (existing) {
        setRating(existing.rating);
        setComentario(existing.comentario ?? '');
      }
    });
  }, [eventoId, userId]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSending(true);
    const ok = await reviewsService.submit(eventoId, userId, rating, comentario || undefined);
    setSending(false);
    if (ok) {
      setSent(true);
      setTimeout(onClose, 1200);
    }
  };

  const displayRating = hoveredStar || rating;

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center bg-black/70"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-900 rounded-t-3xl p-6 pb-[env(safe-area-inset-bottom,16px)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base truncate flex-1 mr-2">Avaliar Evento</h3>
          <button onClick={onClose} className="text-zinc-500 active:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <p className="text-zinc-400 text-sm truncate mb-5">{eventoNome}</p>

        {sent ? (
          <div className="text-center py-8">
            <p className="text-emerald-400 font-bold text-lg">Avaliação enviada!</p>
            <p className="text-zinc-500 text-sm mt-1">Obrigado pelo feedback</p>
          </div>
        ) : (
          <>
            {/* Estrelas */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onPointerEnter={() => setHoveredStar(n)}
                  onPointerLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(n)}
                  className="p-1 active:scale-110 transition-transform"
                >
                  <Star
                    size={36}
                    fill={n <= displayRating ? '#FFD300' : 'transparent'}
                    stroke={n <= displayRating ? '#FFD300' : '#52525b'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-zinc-500 text-xs mb-4">
                {rating === 1 && 'Péssimo'}
                {rating === 2 && 'Ruim'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bom'}
                {rating === 5 && 'Excelente!'}
              </p>
            )}

            {/* Comentário */}
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Deixe um comentário (opcional)"
              rows={3}
              maxLength={500}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm placeholder:text-zinc-600 resize-none focus:outline-none focus:border-zinc-500 mb-4"
            />

            {/* Botão enviar */}
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || sending}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-xl disabled:opacity-30 active:bg-zinc-200 transition-all shrink-0"
            >
              <Send size={16} />
              {sending ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
