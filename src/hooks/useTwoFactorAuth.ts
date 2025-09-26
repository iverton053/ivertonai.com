import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface TwoFactorStatus {
  enabled: boolean;
  method?: 'totp' | 'sms' | 'email';
  backupCodesRemaining?: number;
  lastUsed?: string;
}

interface UseTwoFactorAuthOptions {
  userId: string;
  onError?: (error: string) => void;
}

export const useTwoFactorAuth = ({ userId, onError }: UseTwoFactorAuthOptions) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TwoFactorStatus>({ enabled: false });

  // Get current 2FA status
  const getTwoFactorStatus = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('client_portal_users')
        .select('two_factor_enabled, two_factor_method, two_factor_backup_codes, two_factor_last_used')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setStatus({
        enabled: data.two_factor_enabled || false,
        method: data.two_factor_method,
        backupCodesRemaining: data.two_factor_backup_codes?.length || 0,
        lastUsed: data.two_factor_last_used
      });

      return {
        enabled: data.two_factor_enabled || false,
        method: data.two_factor_method,
        backupCodesRemaining: data.two_factor_backup_codes?.length || 0,
        lastUsed: data.two_factor_last_used
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get 2FA status';
      onError?.(errorMessage);
      console.error('Error getting 2FA status:', err);
      return { enabled: false };
    } finally {
      setLoading(false);
    }
  }, [userId, onError]);

  // Generate TOTP secret and QR code
  const generateTwoFactorSetup = useCallback(async (userEmail: string): Promise<TwoFactorSetup | null> => {
    try {
      setLoading(true);

      // Generate a secure random secret (base32)
      const secret = generateTOTPSecret();

      // Generate backup codes
      const backupCodes = generateBackupCodes();

      // Create QR code URL for authenticator apps
      const qrCodeUrl = generateQRCodeUrl(userEmail, secret);

      return {
        secret,
        qrCodeUrl,
        backupCodes
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate 2FA setup';
      onError?.(errorMessage);
      console.error('Error generating 2FA setup:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onError]);

  // Verify TOTP code and enable 2FA
  const enableTwoFactor = useCallback(async (secret: string, verificationCode: string, backupCodes: string[]) => {
    try {
      setLoading(true);

      // Verify the TOTP code
      const isValid = await verifyTOTPCode(secret, verificationCode);
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Save 2FA settings to database
      const { error } = await supabase
        .from('client_portal_users')
        .update({
          two_factor_enabled: true,
          two_factor_method: 'totp',
          two_factor_secret: secret,
          two_factor_backup_codes: backupCodes,
          two_factor_enabled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setStatus({
        enabled: true,
        method: 'totp',
        backupCodesRemaining: backupCodes.length
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable 2FA';
      onError?.(errorMessage);
      console.error('Error enabling 2FA:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, onError]);

  // Disable 2FA
  const disableTwoFactor = useCallback(async (verificationCode: string) => {
    try {
      setLoading(true);

      // Get current secret to verify code
      const { data: userData, error: getUserError } = await supabase
        .from('client_portal_users')
        .select('two_factor_secret, two_factor_backup_codes')
        .eq('id', userId)
        .single();

      if (getUserError) throw getUserError;

      // Verify code (either TOTP or backup code)
      const isValidTOTP = await verifyTOTPCode(userData.two_factor_secret, verificationCode);
      const isValidBackup = userData.two_factor_backup_codes?.includes(verificationCode);

      if (!isValidTOTP && !isValidBackup) {
        throw new Error('Invalid verification code');
      }

      // Disable 2FA
      const { error } = await supabase
        .from('client_portal_users')
        .update({
          two_factor_enabled: false,
          two_factor_method: null,
          two_factor_secret: null,
          two_factor_backup_codes: null,
          two_factor_disabled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setStatus({ enabled: false });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable 2FA';
      onError?.(errorMessage);
      console.error('Error disabling 2FA:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, onError]);

  // Verify 2FA code during login
  const verifyTwoFactor = useCallback(async (code: string) => {
    try {
      setLoading(true);

      // Get user's 2FA settings
      const { data: userData, error: getUserError } = await supabase
        .from('client_portal_users')
        .select('two_factor_secret, two_factor_backup_codes')
        .eq('id', userId)
        .single();

      if (getUserError) throw getUserError;

      // Try TOTP verification first
      const isValidTOTP = await verifyTOTPCode(userData.two_factor_secret, code);

      if (isValidTOTP) {
        // Update last used timestamp
        await supabase
          .from('client_portal_users')
          .update({
            two_factor_last_used: new Date().toISOString()
          })
          .eq('id', userId);

        return { success: true, method: 'totp' };
      }

      // Try backup code verification
      const backupCodes = userData.two_factor_backup_codes || [];
      const isValidBackup = backupCodes.includes(code);

      if (isValidBackup) {
        // Remove used backup code
        const remainingCodes = backupCodes.filter(c => c !== code);

        await supabase
          .from('client_portal_users')
          .update({
            two_factor_backup_codes: remainingCodes,
            two_factor_last_used: new Date().toISOString()
          })
          .eq('id', userId);

        setStatus(prev => ({
          ...prev,
          backupCodesRemaining: remainingCodes.length
        }));

        return { success: true, method: 'backup', backupCodesRemaining: remainingCodes.length };
      }

      return { success: false, error: 'Invalid verification code' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify 2FA code';
      console.error('Error verifying 2FA:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Generate new backup codes
  const regenerateBackupCodes = useCallback(async (verificationCode: string) => {
    try {
      setLoading(true);

      // Verify current code first
      const verification = await verifyTwoFactor(verificationCode);
      if (!verification.success) {
        throw new Error('Invalid verification code');
      }

      // Generate new backup codes
      const newBackupCodes = generateBackupCodes();

      // Update database
      const { error } = await supabase
        .from('client_portal_users')
        .update({
          two_factor_backup_codes: newBackupCodes,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setStatus(prev => ({
        ...prev,
        backupCodesRemaining: newBackupCodes.length
      }));

      return newBackupCodes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate backup codes';
      onError?.(errorMessage);
      console.error('Error regenerating backup codes:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, onError, verifyTwoFactor]);

  return {
    loading,
    status,
    getTwoFactorStatus,
    generateTwoFactorSetup,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    regenerateBackupCodes
  };
};

// Helper functions
function generateTOTPSecret(): string {
  // Generate a 32-character base32 secret
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function generateBackupCodes(): string[] {
  // Generate 8 backup codes (8 characters each, alphanumeric)
  const codes: string[] = [];
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 8; i++) {
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    codes.push(code);
  }

  return codes;
}

function generateQRCodeUrl(userEmail: string, secret: string): string {
  const issuer = 'Client Portal';
  const label = `${issuer}:${userEmail}`;
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
}

async function verifyTOTPCode(secret: string, code: string): Promise<boolean> {
  // In a real implementation, this would use a proper TOTP library like `otplib`
  // For demo purposes, we'll accept any 6-digit code
  return code.length === 6 && /^\d{6}$/.test(code);
}

// Additional utility functions for production implementation
export const twoFactorUtils = {
  // Check if 2FA is required for login
  isRequired: (userSecurityLevel: 'basic' | 'enhanced' | 'enterprise') => {
    return userSecurityLevel === 'enterprise';
  },

  // Get recommended 2FA methods based on user type
  getRecommendedMethods: (userRole: string) => {
    const methods = ['totp'];
    if (userRole === 'owner' || userRole === 'admin') {
      methods.push('backup_codes');
    }
    return methods;
  },

  // Check backup code strength
  validateBackupCode: (code: string) => {
    return code.length === 8 && /^[a-z0-9]+$/.test(code);
  },

  // Generate QR code for different authenticator apps
  getAuthenticatorAppLinks: (secret: string, userEmail: string) => {
    const otpauthUrl = `otpauth://totp/Client Portal:${userEmail}?secret=${secret}&issuer=Client Portal`;

    return {
      googleAuth: `https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2`,
      authy: `https://authy.com/download/`,
      microsoftAuth: `https://www.microsoft.com/en-us/account/authenticator`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(otpauthUrl)}`
    };
  }
};