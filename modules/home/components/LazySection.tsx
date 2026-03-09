import React, { useRef, useEffect, useState, type ReactNode } from 'react';

/** Renderiza children somente quando o elemento entra no viewport (margin 200px). */
export const LazySection: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (visible) return <>{children}</>;
  return <div ref={ref} style={{ minHeight: 80 }} />;
};
