import React from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * Renderiza children no #vanta-app via portal.
 * Usar quando um modal com `absolute inset-0` está dentro de um scroll container
 * e precisa cobrir a tela inteira.
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const target = document.getElementById('vanta-app');
  if (!target) return <>{children}</>;
  return createPortal(children, target);
};
