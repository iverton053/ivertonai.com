import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCustomAuthStore } from '../../stores/customAuthStore';
import { ValidationUtils } from '../../utils/validation';
import Icon from '../Icon';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { signIn, isLoading, error, clearError } = useCustomAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field errors
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear auth errors when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const rules = {
      username: { required: true, minLength: 3, maxLength: 30 },
      password: { required: true },
    };
    
    const result = ValidationUtils.validateForm(formData, rules);
    setFormErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await signIn({
      username: formData.username,
      password: formData.password,
    });

    if (success) {
      // User will be redirected automatically via the auth state change
      console.log('Sign in successful');
    }
  };

  const getFieldError = (field: string) => {
    return formErrors[field]?.[0] || null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
          Username
        </label>
        <div className="relative">
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
              getFieldError('username')
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
            }`}
            placeholder="Enter your username"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Icon name="User" className="w-5 h-5 text-gray-500" />
          </div>
        </div>
        {getFieldError('username') && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {getFieldError('username')}
          </motion.p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors pr-12 ${
              getFieldError('password')
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
            }`}
            placeholder="Enter your password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
          </button>
        </div>
        {getFieldError('password') && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {getFieldError('password')}
          </motion.p>
        )}
      </div>

      {/* Auth Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-900/50 border border-red-700 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Signing In...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Icon name="LogIn" className="w-5 h-5" />
            <span>Sign In</span>
          </div>
        )}
      </motion.button>

    </form>
  );
};

export default LoginForm;