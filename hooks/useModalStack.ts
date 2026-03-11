/**
 * useModalStack — Hook centralizado para gerenciar modais com browser back + Escape.
 *
 * Arquitetura: usa uma ÚNICA entrada no history para toda a stack de modais.
 * - Ao abrir o PRIMEIRO modal: pushState({ modalStack: true })
 * - Modais subsequentes: replaceState — sem novo push
 * - Browser back: popstate dispara → fecha o modal do topo
 * - Ao fechar todos os modais por código: agenda remoção da entry via microtask
 *   (garante que register/unregister no mesmo ciclo de render não colidam)
 * - Tecla Escape: fecha o modal do topo
 */

import { useEffect, useRef, useCallback } from 'react';
import { devLogger } from '../services/devLogger';

// ── Stack global (singleton) ─────────────────────────────────────────────────

interface ModalEntry {
  id: string;
  close: () => void;
}

const stack: ModalEntry[] = [];
let listenerAttached = false;
let ignoreNextPop = false;
let cleanupScheduled = false;

function handlePopState() {
  if (ignoreNextPop) {
    ignoreNextPop = false;
    return;
  }
  // Browser back com modais abertos → fecha o do topo
  const top = stack.pop();
  if (top) {
    top.close();
  }
  // Se ainda tem modais, re-push uma entry para proteger o próximo back
  if (stack.length > 0) {
    window.history.pushState({ modalStack: true }, '');
  } else {
    detachListeners();
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && stack.length > 0) {
    e.preventDefault();
    e.stopPropagation();
    const top = stack.pop();
    if (top) {
      top.close();
    }
    if (stack.length > 0) {
      window.history.replaceState({ modalStack: true }, '');
    } else {
      // Era o último — remover a entry do history
      ignoreNextPop = true;
      window.history.back();
      detachListeners();
    }
  }
}

function attachListeners() {
  if (listenerAttached) return;
  listenerAttached = true;
  window.addEventListener('popstate', handlePopState);
  window.addEventListener('keydown', handleKeyDown, { capture: true });
}

function detachListeners() {
  if (!listenerAttached) return;
  listenerAttached = false;
  window.removeEventListener('popstate', handlePopState);
  window.removeEventListener('keydown', handleKeyDown, { capture: true });
}

/**
 * Agenda a limpeza da history entry para o próximo microtask.
 * Se entre o schedule e a execução algum modal for registrado,
 * a limpeza é cancelada (stack não está mais vazia).
 */
function scheduleHistoryCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  queueMicrotask(() => {
    cleanupScheduled = false;
    // Só limpa se a stack continua vazia após todos os register/unregister
    if (stack.length === 0 && window.history.state?.modalStack) {
      ignoreNextPop = true;
      window.history.back();
      detachListeners();
    }
  });
}

// ── API pública ──────────────────────────────────────────────────────────────

function registerModal(id: string, close: () => void) {
  const existing = stack.findIndex(e => e.id === id);
  if (existing !== -1) return;

  const wasEmpty = stack.length === 0;
  stack.push({ id, close });

  if (wasEmpty) {
    attachListeners();
    window.history.pushState({ modalStack: true }, '');
  } else {
    window.history.replaceState({ modalStack: true }, '');
  }
}

function unregisterModal(id: string) {
  const idx = stack.findIndex(e => e.id === id);
  if (idx === -1) return;

  stack.splice(idx, 1);

  if (stack.length > 0) {
    // Ainda tem modais — manter a entry
    window.history.replaceState({ modalStack: true }, '');
  } else {
    // Stack vazia — agendar limpeza (não executar imediatamente!)
    // Isso permite que register() de outro modal no mesmo ciclo de render
    // cancele a limpeza automaticamente.
    scheduleHistoryCleanup();
  }
}

// ── Hooks React ──────────────────────────────────────────────────────────────

export function useModalStack() {
  return { register: registerModal, unregister: unregisterModal };
}

/**
 * Hook simplificado — abre/fecha automaticamente baseado em `isOpen`.
 */
export function useModalBack(isOpen: boolean, onClose: () => void, id: string) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const registeredRef = useRef(false);

  const stableClose = useCallback(() => {
    closeRef.current();
  }, []);

  useEffect(() => {
    if (isOpen && !registeredRef.current) {
      registeredRef.current = true;
      registerModal(id, stableClose);
      devLogger.modal(`abriu ${id}`);
    } else if (!isOpen && registeredRef.current) {
      registeredRef.current = false;
      unregisterModal(id);
      devLogger.modal(`fechou ${id}`);
    }

    return () => {
      if (registeredRef.current) {
        registeredRef.current = false;
        unregisterModal(id);
      }
    };
  }, [isOpen, id, stableClose]);
}
