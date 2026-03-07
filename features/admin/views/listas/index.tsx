import React, { useState } from 'react';
import type { ListaEvento } from '../../../../types';
import { ListaEventoView } from './ListaEventoView';
import { PainelEventos } from './PainelEventos';

export type { RoleListaNova } from './listasUtils';

interface ListasViewProps {
  onBack: () => void;
  role: 'gerente' | 'promoter' | 'portaria_lista' | 'portaria_antecipado';
  userId: string;
  userNome: string;
  comunidadeId?: string;
}

export const ListasView: React.FC<ListasViewProps> = ({ onBack, role, userId, userNome, comunidadeId }) => {
  const [listaSelecionada, setListaSelecionada] = useState<ListaEvento | null>(null);

  if (listaSelecionada) {
    return (
      <ListaEventoView
        lista={listaSelecionada}
        role={role}
        userId={userId}
        userNome={userNome}
        onBack={() => setListaSelecionada(null)}
      />
    );
  }

  return (
    <PainelEventos
      role={role}
      userId={userId}
      onSelect={setListaSelecionada}
      onBack={onBack}
      comunidadeId={comunidadeId}
    />
  );
};
