import React from 'react';
import { TYPOGRAPHY } from '../../constants';

interface ProfilePreviewControlsProps {
  profilePreviewStatus: 'PUBLIC' | 'FRIENDS';
  setProfilePreviewStatus: (status: 'PUBLIC' | 'FRIENDS') => void;
}

export const ProfilePreviewControls: React.FC<ProfilePreviewControlsProps> = ({
  profilePreviewStatus,
  setProfilePreviewStatus,
}) => {
  return (
    <div className="flex justify-center gap-2 mb-4">
      <button
        onClick={() => setProfilePreviewStatus('PUBLIC')}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${profilePreviewStatus === 'PUBLIC' ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-400 hover-real:bg-zinc-700'}`}
      >
        Visualizar como Público
      </button>
      <button
        onClick={() => setProfilePreviewStatus('FRIENDS')}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${profilePreviewStatus === 'FRIENDS' ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-400 hover-real:bg-zinc-700'}`}
      >
        Visualizar como Amigo
      </button>
    </div>
  );
};
