import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  User,
  Shield,
  Send,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { clientPortalService } from '../../services/clientPortalService';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalId: string;
  portalName: string;
  onUserInvited?: (user: any) => void;
}

interface InvitationData {
  email: string;
  full_name: string;
  role: 'owner' | 'manager' | 'viewer';
  title?: string;
  message?: string;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  portalId,
  portalName,
  onUserInvited
}) => {
  const [formData, setFormData] = useState<InvitationData>({
    email: '',
    full_name: '',
    role: 'viewer',
    title: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create portal user
      const user = await clientPortalService.createPortalUser(portalId, {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        title: formData.title
      });

      // Send invitation email
      await sendInvitationEmail(formData);

      // Create notification for portal activity
      await clientPortalService.logPortalActivity(portalId, {
        activity_type: 'user_invited',
        activity_description: `User ${formData.full_name} (${formData.email}) invited to portal with ${formData.role} role`,
        metadata: {
          invited_user_email: formData.email,
          invited_user_role: formData.role
        }
      });

      setSuccess(true);
      onUserInvited?.(user);

      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (err: any) {
      console.error('Error inviting user:', err);
      setError(err.message || 'Failed to invite user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvitationEmail = async (invitationData: InvitationData) => {
    // In production, this would integrate with your email service
    // For now, we'll simulate the email sending
    const inviteUrl = `${window.location.origin}/portal/${portalId}/accept-invite`;

    console.log('Email invitation would be sent:', {
      to: invitationData.email,
      subject: `You're invited to join ${portalName}`,
      body: `
        Hi ${invitationData.full_name},

        You've been invited to access ${portalName} with ${invitationData.role} permissions.

        ${invitationData.message ? `Message from the team: ${invitationData.message}` : ''}

        Click here to accept your invitation: ${inviteUrl}

        Best regards,
        The ${portalName} Team
      `,
      inviteUrl
    });

    // Simulate email API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'viewer',
      title: '',
      message: ''
    });
    setSuccess(false);
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  const roleDescriptions = {
    owner: 'Full access to all portal features and settings',
    manager: 'Can view all data and manage most features',
    viewer: 'Can view assigned data and reports'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Invite User</h2>
                  <p className="text-sm text-gray-500">Add a new user to {portalName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Invitation Sent!</h3>
                  <p className="text-gray-600 mb-4">
                    An invitation has been sent to {formData.email}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      The user will receive an email with instructions to access the portal.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="user@company.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Smith"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="manager">Manager</option>
                        <option value="owner">Owner</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {roleDescriptions[formData.role]}
                    </p>
                  </div>

                  {/* Title (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Marketing Manager"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Personal Message (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Welcome to the team! You now have access to our client portal..."
                      disabled={isLoading}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-800 text-sm">{error}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Invitation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InviteUserModal;