import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** Fallback quando src é undefined ou falha ao carregar */
  fallback?: React.ReactNode;
  /** Override de loading strategy (default: lazy) */
  loading?: 'lazy' | 'eager';
  /** Resolução máxima em px (default: 1200). Evita servir imagens enormes em telas @2x/@3x */
  maxPx?: number;
}

/** URL base do Supabase Storage (para aplicar transforms) */
const SUPABASE_STORAGE_PREFIX = 'supabase.co/storage/v1/object/public/';

const DEFAULT_MAX_PX = 1200;

function getOptimizedSrc(src: string, width?: number, maxPx = DEFAULT_MAX_PX): string {
  // Supabase Storage: usar image transforms
  if (src.includes(SUPABASE_STORAGE_PREFIX) && width) {
    const capped = Math.min(width, maxPx);
    const sep = src.includes('?') ? '&' : '?';
    return `${src}${sep}width=${capped}&quality=75`;
  }
  return src;
}

function getSrcSet(src: string, baseWidth?: number, maxPx = DEFAULT_MAX_PX): string | undefined {
  if (!baseWidth || !src.includes(SUPABASE_STORAGE_PREFIX)) return undefined;
  const w1 = Math.min(baseWidth, maxPx);
  const w2 = Math.min(baseWidth * 2, maxPx);
  if (w1 === w2) return undefined; // Ambos no cap, srcSet desnecessário
  return `${getOptimizedSrc(src, w1, maxPx)} 1x, ${getOptimizedSrc(src, w2, maxPx)} 2x`;
}

/**
 * Componente de imagem otimizado:
 * - loading="lazy" nativo
 * - Supabase Storage transforms (resize + quality)
 * - srcSet para @2x
 * - Fallback placeholder
 * - Fade-in ao carregar
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallback,
  loading = 'lazy',
  maxPx = DEFAULT_MAX_PX,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset quando src muda
    setLoaded(false);
    setErrored(false);
  }, [src]);

  useEffect(() => {
    // Imagem pode já ter carregado (cache do browser / preload) antes do React montar
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  if (!src || errored) {
    return fallback ?? <div className={`bg-zinc-900 ${className}`} style={{ width, height }} aria-label={alt} />;
  }

  const optimizedSrc = getOptimizedSrc(src, width, maxPx);
  const srcSet = getSrcSet(src, width, maxPx);

  return (
    <img
      ref={imgRef}
      src={optimizedSrc}
      srcSet={srcSet}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setErrored(true)}
      className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
};
