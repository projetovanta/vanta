// JWT para QR codes de tickets — sign/verify via Supabase RPC (SECURITY DEFINER)
// Secret fica APENAS no servidor. Zero secrets no bundle do cliente.

import { supabase } from '../../../services/supabaseClient';

/** Gera um JWT HMAC-SHA256 server-side com expiração de 15 segundos. */
export const signTicketToken = async (ticketId: string): Promise<string> => {
  const { data, error } = await supabase.rpc('sign_ticket_token', { p_ticket_id: ticketId });
  if (error || !data) {
    console.error('[jwtService] sign_ticket_token error:', error?.message);
    return '';
  }
  return data as string;
};

/** Verifica assinatura e expiração server-side. Retorna `{ tid }` se válido, `null` se inválido/expirado. */
export const verifyTicketToken = async (token: string): Promise<{ tid: string } | null> => {
  const { data, error } = await supabase.rpc('verify_ticket_token', { p_token: token });
  if (error || !data) return null;
  return { tid: data as string };
};
