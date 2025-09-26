import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Smartphone,
  Mail,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  X,
  QrCode,
  Key
} from 'lucide-react';
import { clientPortalService } from '../../services/clientPortalService';

interface TwoFactorAuthProps {
  userId: string;
  portalId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  isEnabled: boolean;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  userId,
  portalId,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'overview' | 'setup' | 'verify' | 'success' | 'disable'>('overview');
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCode, setCopiedBackupCode] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUserTwoFactorStatus();
  }, [userId]);

  const loadUserTwoFactorStatus = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would check current 2FA status
      const mockUser = {
        id: userId,
        two_factor_enabled: false,
        two_factor_method: null,
        backup_codes_generated: false
      };
      setCurrentUser(mockUser);

      if (mockUser.two_factor_enabled) {
        setStep('overview');
      }
    } catch (err) {
      setError('Failed to load 2FA status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateTwoFactorSetup = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would generate TOTP secret and QR code
      const mockSetup: TwoFactorSetup = {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          `otpauth://totp/Portal:${userId}?secret=JBSWY3DPEHPK3PXP&issuer=Client Portal`
        )}`,
        backupCodes: [
          'a1b2c3d4',
          'e5f6g7h8',
          'i9j0k1l2',
          'm3n4o5p6',
          'q7r8s9t0',
          'u1v2w3x4',
          'y5z6a7b8',
          'c9d0e1f2'
        ],
        isEnabled: false
      };

      setSetupData(mockSetup);
      setStep('setup');
    } catch (err) {
      setError('Failed to generate 2FA setup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!verificationCode || verificationCode.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }

      // In a real implementation, this would verify the TOTP code
      if (verificationCode !== '123456') {
        setError('Invalid verification code. Please try again.');
        return;
      }

      // Save 2FA settings
      // await clientPortalService.enableTwoFactor(userId, setupData.secret, setupData.backupCodes);

      setCurrentUser(prev => ({
        ...prev,
        two_factor_enabled: true,
        two_factor_method: 'totp',
        backup_codes_generated: true
      }));

      setStep('success');
      onSuccess?.();
    } catch (err) {
      setError('Failed to enable 2FA');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!verificationCode || verificationCode.length !== 6) {
        setError('Please enter a valid 6-digit code to disable 2FA');
        return;
      }

      // In a real implementation, verify code and disable 2FA
      // await clientPortalService.disableTwoFactor(userId, verificationCode);

      setCurrentUser(prev => ({
        ...prev,
        two_factor_enabled: false,
        two_factor_method: null
      }));

      setStep('overview');
    } catch (err) {
      setError('Failed to disable 2FA');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackupCode(text);
        setTimeout(() => setCopiedBackupCode(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const renderOverview = () => (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
          <p className="text-gray-600">Add an extra layer of security to your account</p>
        </div>
      </div>

      {currentUser?.two_factor_enabled ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">2FA is currently enabled</span>
          </div>
          <p className="text-green-700 mt-1">Your account is protected with two-factor authentication</p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">2FA is not enabled</span>
          </div>
          <p className="text-yellow-700 mt-1">Your account could be more secure with two-factor authentication</p>
        </div>
      )}

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <Smartphone className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900">Authenticator App</h3>
            <p className="text-gray-600">Use apps like Google Authenticator, Authy, or 1Password</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Key className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900">Backup Codes</h3>
            <p className="text-gray-600">Get backup codes in case you lose access to your authenticator</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900">Recovery Options</h3>
            <p className="text-gray-600">Multiple recovery methods to regain access to your account</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {!currentUser?.two_factor_enabled ? (
          <button
            onClick={generateTwoFactorSetup}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
            Enable 2FA
          </button>
        ) : (
          <button
            onClick={() => setStep('disable')}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <X className="h-5 w-5" />
            Disable 2FA
          </button>
        )}
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <QrCode className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Set up Two-Factor Authentication</h2>
          <p className="text-gray-600">Scan the QR code with your authenticator app</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* QR Code */}
        <div className="text-center">
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
            <img
              src={setupData?.qrCodeUrl}
              alt="2FA QR Code"
              className="w-48 h-48"
            />
          </div>
          <p className="text-sm text-gray-600 mt-4">Scan with your authenticator app</p>
        </div>

        {/* Manual Setup */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Can't scan? Enter manually:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key:
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-3 py-2 border rounded font-mono text-sm">
                {setupData?.secret}
              </code>
              <button
                onClick={() => copyToClipboard(setupData?.secret || '', 'secret')}
                className="p-2 text-gray-500 hover:text-gray-700 border rounded"
              >
                {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Setup Instructions:</h4>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. Install an authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>2. Scan the QR code or enter the secret key manually</li>
              <li>3. Enter the 6-digit code from your app below</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Backup Codes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-3">⚠️ Save Your Backup Codes</h3>
        <p className="text-yellow-700 text-sm mb-4">
          These codes can be used to access your account if you lose your authenticator device.
          Save them in a secure location.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {setupData?.backupCodes.map((code, index) => (
            <div key={index} className="flex items-center gap-1">
              <code className="bg-white px-2 py-1 rounded text-sm font-mono flex-1">
                {code}
              </code>
              <button
                onClick={() => copyToClipboard(code, code)}
                className="p-1 text-yellow-700 hover:text-yellow-900"
              >
                {copiedBackupCode === code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Verification */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter verification code from your authenticator app:
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-center text-2xl tracking-widest"
          maxLength={6}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={verifyAndEnable2FA}
          disabled={loading || verificationCode.length !== 6}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Check className="h-5 w-5" />
          )}
          Enable 2FA
        </button>
        <button
          onClick={() => setStep('overview')}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="p-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">2FA Successfully Enabled!</h2>
      <p className="text-gray-600 mb-6">
        Your account is now protected with two-factor authentication.
        You'll need your authenticator app to sign in.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Important Reminders:</h3>
        <ul className="text-blue-700 text-sm space-y-1 text-left">
          <li>• Keep your backup codes in a safe place</li>
          <li>• Don't lose access to your authenticator app</li>
          <li>• You can disable 2FA anytime from your security settings</li>
        </ul>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
      >
        Done
      </button>
    </div>
  );

  const renderDisable = () => (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Disable Two-Factor Authentication</h2>
          <p className="text-gray-600">This will make your account less secure</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-red-800 mb-2">⚠️ Security Warning</h3>
        <p className="text-red-700 text-sm">
          Disabling 2FA will remove an important security layer from your account.
          Only do this if absolutely necessary.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter code from your authenticator app to confirm:
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-center text-2xl tracking-widest"
          maxLength={6}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={disable2FA}
          disabled={loading || verificationCode.length !== 6}
          className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <X className="h-5 w-5" />
          )}
          Disable 2FA
        </button>
        <button
          onClick={() => setStep('overview')}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (loading && !setupData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading 2FA settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Security Settings</h1>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Content */}
        <div className="min-h-0">
          {step === 'overview' && renderOverview()}
          {step === 'setup' && renderSetup()}
          {step === 'verify' && renderSetup()}
          {step === 'success' && renderSuccess()}
          {step === 'disable' && renderDisable()}
        </div>
      </motion.div>
    </div>
  );
};