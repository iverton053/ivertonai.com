import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Send, Clock, Check, Calendar, User, 
  MessageSquare, FileText, Link, Zap, Settings,
  CheckCircle2, Bell, Heart, Star, Gift
} from 'lucide-react';

interface WelcomeEmail {
  id: string;
  subject: string;
  trigger: 'immediate' | 'delay' | 'conditional';
  delay?: number; // hours
  recipient: 'client' | 'team' | 'both';
  template: string;
  attachments?: string[];
  personalizations: string[];
}

interface WelcomeSequence {
  id: string;
  name: string;
  description: string;
  emails: WelcomeEmail[];
  totalDuration: number; // days
  automation: boolean;
}

interface WelcomeSequenceAutomationProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
  teamAssignments: any[];
  portalUrl?: string;
  onSequenceCreated: (sequence: WelcomeSequence) => void;
}

const WelcomeSequenceAutomation: React.FC<WelcomeSequenceAutomationProps> = ({
  clientId,
  clientName,
  clientEmail,
  teamAssignments,
  portalUrl,
  onSequenceCreated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [welcomeSequence, setWelcomeSequence] = useState<WelcomeSequence | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [sequenceActive, setSequenceActive] = useState(false);

  const generateWelcomeSequence = async () => {
    setIsGenerating(true);
    setProgress(0);

    const steps = [
      'Analyzing client profile...',
      'Creating welcome templates...',
      'Personalizing content...',
      'Setting up automation triggers...',
      'Configuring team notifications...',
      'Preparing portal access...',
      'Finalizing sequence...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 700));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Generate the welcome sequence
    const sequence: WelcomeSequence = {
      id: `welcome_${clientId}`,
      name: `${clientName} Welcome Sequence`,
      description: 'Automated welcome sequence for new client onboarding',
      totalDuration: 7,
      automation: true,
      emails: [
        {
          id: 'welcome_immediate',
          subject: `Welcome to ${clientName} - Your Marketing Journey Begins! 🚀`,
          trigger: 'immediate',
          recipient: 'client',
          template: 'client_welcome',
          personalizations: ['client_name', 'account_manager', 'portal_link'],
          attachments: ['welcome_guide.pdf', 'brand_questionnaire.pdf']
        },
        {
          id: 'team_notification',
          subject: `New Client Alert: ${clientName} Onboarded Successfully`,
          trigger: 'immediate',
          recipient: 'team',
          template: 'team_notification',
          personalizations: ['client_name', 'client_industry', 'assigned_roles']
        },
        {
          id: 'portal_access',
          subject: `Your Client Portal is Ready - Access Your Dashboard`,
          trigger: 'delay',
          delay: 2,
          recipient: 'client',
          template: 'portal_access',
          personalizations: ['portal_url', 'login_instructions', 'support_contact']
        },
        {
          id: 'first_week_checkin',
          subject: `How are we doing? Quick check-in from your team`,
          trigger: 'delay',
          delay: 24 * 3, // 3 days
          recipient: 'client',
          template: 'first_checkin',
          personalizations: ['account_manager', 'initial_goals', 'next_steps']
        },
        {
          id: 'onboarding_complete',
          subject: `🎉 Onboarding Complete - What's Next for ${clientName}`,
          trigger: 'delay',
          delay: 24 * 7, // 1 week
          recipient: 'both',
          template: 'onboarding_complete',
          personalizations: ['achievements', 'upcoming_campaigns', 'team_intro']
        }
      ]
    };

    setWelcomeSequence(sequence);
    setIsGenerating(false);
    onSequenceCreated(sequence);
  };

  const activateSequence = async () => {
    setIsActivating(true);
    
    // Simulate activation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSequenceActive(true);
    setIsActivating(false);
  };

  const getEmailIcon = (recipient: string) => {
    switch (recipient) {
      case 'client': return User;
      case 'team': return MessageSquare;
      case 'both': return Bell;
      default: return Mail;
    }
  };

  const getEmailColor = (recipient: string) => {
    switch (recipient) {
      case 'client': return 'from-blue-600 to-indigo-600';
      case 'team': return 'from-purple-600 to-pink-600';
      case 'both': return 'from-green-600 to-emerald-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getTriggerText = (email: WelcomeEmail) => {
    if (email.trigger === 'immediate') return 'Sent immediately';
    if (email.trigger === 'delay' && email.delay) {
      const days = Math.floor(email.delay / 24);
      const hours = email.delay % 24;
      if (days > 0) return `Sent in ${days}d ${hours}h`;
      return `Sent in ${hours}h`;
    }
    return 'Conditional trigger';
  };

  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Client</span>
          </div>
          <p className="text-gray-300">{clientName}</p>
          <p className="text-gray-400 text-sm">{clientEmail}</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Team Members</span>
          </div>
          <p className="text-gray-300">{teamAssignments.length} assigned</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Link className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Portal</span>
          </div>
          <p className="text-gray-300">{portalUrl ? 'Ready' : 'Not configured'}</p>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
              />
              <span className="text-white font-medium">Creating Welcome Sequence...</span>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                />
              </div>
              <p className="text-purple-400 text-sm">{generationStep}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Welcome Sequence Preview */}
      {welcomeSequence && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <span>Welcome Sequence ({welcomeSequence.emails.length} emails)</span>
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{welcomeSequence.totalDuration} day sequence</span>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {welcomeSequence.emails.map((email, index) => {
                const EmailIcon = getEmailIcon(email.recipient);
                
                return (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getEmailColor(email.recipient)} flex items-center justify-center`}>
                          <EmailIcon className="w-5 h-5 text-white" />
                        </div>
                        {index < welcomeSequence.emails.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-600 mt-2" />
                        )}
                      </div>

                      {/* Email Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-semibold text-white">{email.subject}</h5>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs text-gray-400 capitalize">
                                To: {email.recipient}
                              </span>
                              <span className="text-xs text-purple-400">
                                {getTriggerText(email)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Template</div>
                            <div className="text-xs text-white">{email.template}</div>
                          </div>
                        </div>

                        {/* Personalizations */}
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {email.personalizations.map(personalization => (
                              <span
                                key={personalization}
                                className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs"
                              >
                                {personalization.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Attachments */}
                        {email.attachments && email.attachments.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-2">
                        {sequenceActive ? (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">Queued</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Sequence Actions */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="text-white font-medium">Automation Ready</p>
                <p className="text-gray-400">All emails will be sent automatically</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span>Customize</span>
              </button>

              {!sequenceActive && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={activateSequence}
                  disabled={isActivating}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isActivating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Activate Sequence</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Success State */}
          {sequenceActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-lg"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    Welcome Sequence Activated! 🎉
                  </h4>
                  <p className="text-gray-400">
                    Your client and team will receive perfectly timed welcome emails over the next 7 days.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-sm text-white font-medium">First email sent</p>
                    <p className="text-xs text-gray-400">Welcome message delivered</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Bell className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-sm text-white font-medium">Team notified</p>
                    <p className="text-xs text-gray-400">All members informed</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-sm text-white font-medium">Automation active</p>
                    <p className="text-xs text-gray-400">Sequence running</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Generate Button */}
      {!isGenerating && !welcomeSequence && (
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateWelcomeSequence}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-colors mx-auto"
          >
            <Zap className="w-5 h-5" />
            <span>Generate Welcome Sequence</span>
          </motion.button>
          <p className="text-gray-400 text-sm mt-2">
            Personalized email sequence with automated triggers
          </p>
        </div>
      )}
    </div>
  );
};

export default WelcomeSequenceAutomation;