const STORAGE_BASE = 'https://daldttuibmxwkpbqtebm.supabase.co/storage/v1/object/public/avatars/defaults';

export const DEFAULT_AVATARS: Record<string, string> = {
  MASCULINO: `${STORAGE_BASE}/avatar_male.jpg`,
  FEMININO: `${STORAGE_BASE}/avatar_female.jpg`,
  NEUTRO: `${STORAGE_BASE}/avatar_neutral.jpg`,
  PREFIRO_NAO_DIZER: `${STORAGE_BASE}/avatar_neutral.jpg`,
};
