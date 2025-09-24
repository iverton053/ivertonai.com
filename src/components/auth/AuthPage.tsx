import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

type AuthMode = 'login' | 'signup';

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const switchToSignup = () => setAuthMode('signup');
  const switchToLogin = () => setAuthMode('login');

  const authConfig = {
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to access your premium dashboard',
      component: <LoginForm onSwitchToSignup={switchToSignup} />,
    },
    signup: {
      title: 'Create Account',
      subtitle: 'Join Iverton AI and unlock premium features',
      component: <SignupForm onSwitchToLogin={switchToLogin} />,
    },
  };

  const currentConfig = authConfig[authMode];

  return (
    <AuthLayout 
      title={currentConfig.title} 
      subtitle={currentConfig.subtitle}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={authMode}
          initial={{ opacity: 0, x: authMode === 'signup' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: authMode === 'signup' ? -20 : 20 }}
          transition={{ duration: 0.3 }}
        >
          {currentConfig.component}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
};

export default AuthPage;