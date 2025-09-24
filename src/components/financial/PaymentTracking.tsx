import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFinancialStore } from '../../stores/financialStore';
import Icon from '../Icon';
import type { Payment } from '../../types/financial';

interface PaymentTrackingProps {
  isOverview?: boolean;
}

const PaymentTracking: React.FC<PaymentTrackingProps> = ({ isOverview = false }) => {
  const {
    payments,
    invoices,
    loading,
    fetchPayments,
    recordPayment,
  } = useFinancialStore();

  const [showRecordModal, setShowRecordModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: Payment['status']) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-900/200/20 text-red-400 border-red-500/30',
      refunded: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[status] || colors.pending;
  };

  const getPaymentMethodIcon = (method: Payment['payment_method']) => {
    const icons = {
      credit_card: 'DollarSign',
      bank_transfer: 'Activity',
      paypal: 'Globe',
      stripe: 'Zap',
      check: 'FileText',
      cash: 'DollarSign',
    };
    return icons[method] || 'DollarSign';
  };

  const displayPayments = isOverview ? payments.slice(0, 5) : payments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {isOverview ? 'Recent Payments' : 'Payment Tracking'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isOverview ? 'Latest payment activity' : 'Track and record client payments'}
          </p>
        </div>
        {!isOverview && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRecordModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center space-x-2 transition-colors"
          >
            <Icon name="Plus" className="w-4 h-4" />
            <span>Record Payment</span>
          </motion.button>
        )}
      </div>

      {/* Payment Statistics */}
      {!isOverview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Received',
              value: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
              icon: 'TrendingUp',
              color: 'green',
            },
            {
              label: 'Pending Payments',
              value: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
              icon: 'Clock',
              color: 'yellow',
            },
            {
              label: 'Failed Payments',
              value: payments.filter(p => p.status === 'failed').length,
              icon: 'AlertCircle',
              color: 'red',
              isCount: true,
            },
            {
              label: 'Refunded Amount',
              value: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0),
              icon: 'TrendingDown',
              color: 'orange',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                stat.color === 'green' ? 'bg-green-500/20 border-green-500/30' :
                stat.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/30' :
                stat.color === 'red' ? 'bg-red-900/200/20 border-red-500/30' :
                'bg-orange-500/20 border-orange-500/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon name={stat.icon} className="w-5 h-5 text-current" />
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="font-bold text-white">
                    {stat.isCount ? stat.value.toString() : formatCurrency(stat.value)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment List */}
      <div className="glass-effect rounded-xl border border-white/20 overflow-hidden">
        {loading.payments ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: isOverview ? 3 : 8 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-600 rounded w-32"></div>
                    <div className="h-3 bg-gray-600 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-20"></div>
                  <div className="h-3 bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayPayments.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="DollarSign" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No payments recorded</h3>
            <p className="text-gray-400 mb-4">Start by recording your first payment</p>
            {!isOverview && (
              <button
                onClick={() => setShowRecordModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Record Payment
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {displayPayments.map((payment, index) => {
              const relatedInvoice = invoices.find(inv => inv.id === payment.invoice_id);
              
              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Payment Info */}
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(payment.status)}`}>
                        <Icon name={getPaymentMethodIcon(payment.payment_method)} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {formatCurrency(payment.amount)}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {relatedInvoice ? `Invoice ${relatedInvoice.invoice_number}` : 'Unknown Invoice'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(payment.payment_date)} • {payment.payment_method.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="text-right space-y-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      {payment.reference_number && (
                        <p className="text-xs text-gray-400">
                          Ref: {payment.reference_number}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {payment.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <p className="text-sm text-gray-400">{payment.notes}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View All Button for Overview */}
        {isOverview && payments.length > 5 && (
          <div className="p-4 border-t border-gray-700/50 text-center">
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
              View All Payments ({payments.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTracking;