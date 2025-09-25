import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Eye, EyeOff, Mail, Lock, User, Building,
  LogIn, UserPlus, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials, SignupData } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { login, signup, isLoading, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: 'demo@example.com',
    password: 'demo123',
    rememberMe: false
  });

  const [signupForm, setSignupForm] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
    organizationName: ''
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateLoginForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!loginForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!loginForm.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!signupForm.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!signupForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!signupForm.password) {
      errors.password = 'Password is required';
    } else if (signupForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!signupForm.organizationName.trim()) {
      errors.organizationName = 'Organization name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateLoginForm()) return;

    const success = await login({
      ...loginForm,
      rememberMe
    });

    if (success) {
      onClose();
      resetForms();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateSignupForm()) return;

    const success = await signup(signupForm);

    if (success) {
      onClose();
      resetForms();
    }
  };

  const resetForms = () => {
    setLoginForm({
      email: 'demo@example.com',
      password: 'demo123',
      rememberMe: false
    });
    setSignupForm({
      name: '',
      email: '',
      password: '',
      organizationName: ''
    });
    setValidationErrors({});
    setShowPassword(false);
    setRememberMe(false);
  };

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    clearError();
    setValidationErrors({});
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              {mode === 'login' ? (
                <>
                  <LogIn className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Sign In</h2>
                </>
              ) : (
                <>
                  <UserPlus className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Create Account</h2>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Demo Notice */}
            {mode === 'login' && (
              <div className="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-blue-300 text-sm">
                    <div className="font-medium mb-1">Demo Credentials</div>
                    <div className="text-blue-400">
                      Email: <span className="font-mono">demo@example.com</span><br />
                      Password: <span className="font-mono">demo123</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400 ${
                        validationErrors.email
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/10 focus:border-blue-500'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {validationErrors.email && (
                    <div className="text-red-400 text-sm mt-1">{validationErrors.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400 ${
                        validationErrors.password
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/10 focus:border-blue-500'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <div className="text-red-400 text-sm mt-1">{validationErrors.password}</div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-300">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg transition-colors text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400 ${
                        validationErrors.name
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/10 focus:border-green-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {validationErrors.name && (
                    <div className="text-red-400 text-sm mt-1">{validationErrors.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400 ${
                        validationErrors.email
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/10 focus:border-green-500'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {validationErrors.email && (
                    <div className="text-red-400 text-sm mt-1">{validationErrors.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organization Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={signupForm.organizationName}
                      onChange={(e) => setSignupForm({ ...signupForm, organizationName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400 ${
                        validationErrors.organizationName
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/10 focus:border-green-500'
                      }`}
                      placeholder="Enter your organization name"
                    />
                  </div>
                  {validationErrors.organizationName && (
                    <div className="text-red-400 text-sm mt-1">{validationErrors.organizationName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400 ${
                        validationErrors.password
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/10 focus:border-green-500'
                      }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <div className="text-red-400 text-sm mt-1">{validationErrors.password}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Password must be at least 8 characters long
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed rounded-lg transition-colors text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 text-center">
            {mode === 'login' ? (
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-green-400 hover:text-green-300 transition-colors font-medium"
                >
                  Sign up here
                </button>
              </p>
            ) : (
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;