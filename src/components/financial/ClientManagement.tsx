import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFinancialStore } from '../../stores/financialStore';
import Icon from '../Icon';

const ClientManagement: React.FC = () => {
  const {
    clients,
    invoices,
    payments,
    loading,
    selectedClient,
    fetchClients,
    createClient,
    updateClient,
    selectClient,
  } = useFinancialStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Client Management</h2>
          <p className="text-gray-400 text-sm">Manage your client relationships and billing information</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center space-x-2 transition-colors"
        >
          <Icon name="Plus" className="w-4 h-4" />
          <span>Add Client</span>
        </motion.button>
      </div>

      {/* Empty State */}
      <div className="glass-effect rounded-xl border border-white/20 overflow-hidden">
        <div className="p-12 text-center">
          <Icon name="Users" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No clients found</h3>
          <p className="text-gray-400 mb-4">Add your first client to get started with billing and invoicing</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Add Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientManagement;