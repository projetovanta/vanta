import { describe, it, expect } from 'vitest';
import { profileToMembro, consumeSignInResolved } from '../../services/authService';

describe('profileToMembro — mapeamento de profile para Membro', () => {
  it('mapeia campos basicos corretamente', () => {
    const row = {
      id: 'user-123',
      nome: 'Dan Silva',
      email: 'dan@vanta.com',
      instagram: '@dansilva',
      instagram_followers: 5000,
      data_nascimento: '1990-05-15',
      telefone_ddd: '21',
      telefone_numero: '999887766',
      estado: 'RJ',
      cidade: 'Rio de Janeiro',
      genero: 'MASCULINO',
      biografia: 'CEO VANTA',
      avatar_url: 'https://example.com/foto.jpg',
      cpf: '12345678901',
      interesses: ['musica', 'festas'],
      album_urls: ['https://example.com/1.jpg'],
      privacidade: null,
      role: 'vanta_member',
      destaque_curadoria: true,
    };

    const membro = profileToMembro(row);
    expect(membro.id).toBe('user-123');
    expect(membro.nome).toBe('Dan Silva');
    expect(membro.email).toBe('dan@vanta.com');
    expect(membro.instagram).toBe('dansilva'); // remove @
    expect(membro.seguidoresInstagram).toBe(5000);
    expect(membro.telefone.ddd).toBe('21');
    expect(membro.telefone.numero).toBe('999887766');
    expect(membro.cidade).toBe('Rio de Janeiro');
    expect(membro.genero).toBe('MASCULINO');
    expect(membro.cpf).toBe('12345678901');
    expect(membro.interesses).toEqual(['musica', 'festas']);
    expect(membro.destaque).toBe(true);
  });

  it('usa nome padrao quando nome vazio', () => {
    const row = { id: 'user-1', nome: '', email: 'a@b.com' };
    const membro = profileToMembro(row);
    expect(membro.nome).toBe('Usuário VANTA');
  });

  it('remove @ do instagram', () => {
    const row = { id: 'user-1', nome: 'Test', instagram: '@test_user' };
    const membro = profileToMembro(row);
    expect(membro.instagram).toBe('test_user');
  });

  it('promove vanta_guest para vanta_member quando tem email', () => {
    const row = { id: 'user-1', nome: 'Test', email: 'a@b.com', role: 'vanta_guest' };
    const membro = profileToMembro(row);
    expect(membro.role).toBe('vanta_member');
  });

  it('mantem vanta_guest quando nao tem email', () => {
    const row = { id: 'user-1', nome: 'Test', role: 'vanta_guest' };
    const membro = profileToMembro(row);
    expect(membro.role).toBe('vanta_guest');
  });

  it('usa defaults seguros para campos ausentes', () => {
    const row = { id: 'user-1' };
    const membro = profileToMembro(row);
    expect(membro.nome).toBe('Usuário VANTA');
    expect(membro.email).toBe('');
    expect(membro.instagram).toBe('');
    expect(membro.telefone.ddd).toBe('11');
    expect(membro.telefone.numero).toBe('');
    expect(membro.estado).toBe('');
    expect(membro.cidade).toBe('');
    expect(membro.biografia).toBe('');
    expect(membro.interesses).toEqual([]);
    expect(membro.fotos).toEqual([]);
    expect(membro.destaque).toBe(false);
  });
});

describe('consumeSignInResolved — flag de login', () => {
  it('retorna false quando nao houve login', () => {
    // Consome qualquer flag residual
    consumeSignInResolved();
    // Agora deve ser false
    expect(consumeSignInResolved()).toBe(false);
  });

  it('retorna false em chamadas subsequentes', () => {
    expect(consumeSignInResolved()).toBe(false);
    expect(consumeSignInResolved()).toBe(false);
  });
});
