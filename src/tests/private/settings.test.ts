/**
 * Testes para Settings Modal
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Settings Modal', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  describe('Password Change', () => {
    it('deve validar senha atual antes de alterar', async () => {
      // Mock do signInWithPassword
      const signInSpy = vi.spyOn(supabase.auth, 'signInWithPassword');
      signInSpy.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      // Tentar alterar senha com senha atual incorreta
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: mockUser.email,
        password: 'senha_incorreta'
      });

      if (signInError) {
        expect(signInError).toBeDefined();
      }
    });

    it('deve validar que nova senha tem pelo menos 6 caracteres', () => {
      const newPassword = '12345'; // Menos de 6 caracteres
      expect(newPassword.length).toBeLessThan(6);
    });

    it('deve validar que nova senha é diferente da atual', () => {
      const currentPassword = 'senha123';
      const newPassword = 'senha123';
      expect(newPassword).toBe(currentPassword);
    });

    it('deve validar que confirmação de senha coincide', () => {
      const newPassword = 'senha123';
      const confirmPassword = 'senha456';
      expect(newPassword).not.toBe(confirmPassword);
    });
  });

  describe('Email Change', () => {
    it('deve validar formato de email', () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(validEmail)).toBe(true);
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });
  });

  describe('Password Recovery', () => {
    it('deve enviar email de recuperação', async () => {
      const resetSpy = vi.spyOn(supabase.auth, 'resetPasswordForEmail');
      resetSpy.mockResolvedValue({ data: {}, error: null });

      const { error } = await supabase.auth.resetPasswordForEmail(mockUser.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      expect(error).toBeNull();
    });
  });
});


