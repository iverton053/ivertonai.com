import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCustomAuthStore } from '../../stores/customAuthStore';
import { ValidationUtils } from '../../utils/validation';
import Icon from '../Icon';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { createUser, isLoading, error, clearError } = useCustomAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: '',
    company: '',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

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

    // Check password strength for password field
    if (field === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length < 8) {
      feedback.push('At least 8 characters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('One uppercase letter');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('One lowercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('One number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
      feedback.push('One special character');
    } else {
      score += 1;
    }

    return { score, feedback };
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    if (passwordStrength.score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 3) return 'Fair';
    if (passwordStrength.score <= 4) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    const rules = {
      email: { required: true, email: true },
      password: { required: true, minLength: 8 },
      username: { required: true, minLength: 3, maxLength: 30, pattern: /^[a-zA-Z0-9_-]+$/ },
      full_name: { required: true },
    };
    
    const result = ValidationUtils.validateForm(formData, rules);
    
    // Additional validation for confirm password
    if (formData.password !== formData.confirmPassword) {
      result.errors.confirmPassword = ['Passwords do not match'];
      result.isValid = false;
    }
    
    setFormErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await createUser({
      email: formData.email,
      password: formData.password,
      username: formData.username,
      full_name: formData.full_name,
      company: formData.company || undefined,
    });

    if (success) {
      // User will be redirected automatically via the auth state change
      console.log('Sign up successful');
    }
  };

  const getFieldError = (field: string) => {
    return formErrors[field]?.[0] || null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email Address *
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
              getFieldError('email')
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
            }`}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Icon name="Mail" className="w-5 h-5 text-gray-500" />
          </div>
        </div>
        {getFieldError('email') && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {getFieldError('email')}
          </motion.p>
        )}
      </div>

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
          Username *
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
            placeholder="Choose a username"
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

      {/* Full Name Field */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-1">
          Full Name *
        </label>
        <input
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
            getFieldError('full_name')
              ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
              : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
          }`}
          placeholder="Enter your full name"
          disabled={isLoading}
        />
        {getFieldError('full_name') && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {getFieldError('full_name')}
          </motion.p>
        )}
      </div>

      {/* Company Field (Optional) */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
          Company
        </label>
        <input
          id="company"
          type="text"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
          placeholder="Your company (optional)"
          disabled={isLoading}
        />
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Password *
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
            placeholder="Create a password"
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
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${
                passwordStrength.score <= 2 ? 'text-red-400' :
                passwordStrength.score <= 3 ? 'text-yellow-400' :
                passwordStrength.score <= 4 ? 'text-blue-400' :
                'text-green-400'
              }`}>
                {getPasswordStrengthText()}
              </span>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <div className="mt-1 text-xs text-gray-400">
                Missing: {passwordStrength.feedback.join(', ')}
              </div>
            )}
          </div>
        )}
        
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

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors pr-12 ${
              getFieldError('confirmPassword')
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
            }`}
            placeholder="Confirm your password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
          </button>
        </div>
        {getFieldError('confirmPassword') && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {getFieldError('confirmPassword')}
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
            <span>Creating Account...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Icon name="UserPlus" className="w-5 h-5" />
            <span>Create Account</span>
          </div>
        )}
      </motion.button>

    </form>
  );
};

export default SignupForm;