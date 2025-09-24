import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Send,
  Eye,
  Edit3,
  Download,
  CreditCard,
  FileText,
  X,
  Timer,
  Building
} from 'lucide-react';
import { financialService } from '../../services/financialService';
import { Invoice, TimeEntry, Project, Client, Service, InvoiceItem } from '../../types/financial';
import { format, parseISO, differenceInDays } from 'date-fns';

interface InvoiceManagementProps {
  isOverview?: boolean;
}

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ isOverview = false }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTimeEntrySelection, setShowTimeEntrySelection] = useState(false);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<string[]>([]);
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    project_id: '',
    due_days: 30,
    notes: '',
    internal_notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, statusFilter, clientFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [invoiceData, timeEntryData, projectData, clientData, serviceData] = await Promise.all([
        financialService.getInvoices(),
        financialService.getTimeEntries(),
        financialService.getProjects(),
        financialService.getClients(),
        financialService.getServices()
      ]);

      setInvoices(invoiceData);
      setTimeEntries(timeEntryData.filter(entry => entry.billable && !entry.invoice_id));
      setProjects(projectData);
      setClients(clientData);
      setServices(serviceData);
    } catch (error) {
      console.error('Error loading invoice data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    if (searchQuery) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (clientFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.client_id === clientFilter);
    }

    setFilteredInvoices(filtered);
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'sent':
        return <Send className="w-4 h-4 text-blue-400" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-purple-400" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'sent':
        return 'text-blue-400 bg-blue-900/200/10 border-blue-500/20';
      case 'viewed':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'overdue':
        return 'text-red-400 bg-red-900/200/10 border-red-500/20';
      case 'cancelled':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateDaysOverdue = (dueDate: string): number => {
    return Math.max(0, differenceInDays(new Date(), parseISO(dueDate)));
  };

  const handleCreateFromTimeEntries = () => {
    setShowTimeEntrySelection(true);
  };

  const handleTimeEntrySelection = (entryId: string) => {
    setSelectedTimeEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const createInvoiceFromTimeEntries = async () => {
    if (selectedTimeEntries.length === 0 || !newInvoice.client_id) return;

    try {
      const selectedEntries = timeEntries.filter(entry => selectedTimeEntries.includes(entry.id));
      const projectId = selectedEntries[0]?.project_id || newInvoice.project_id;
      const project = projects.find(p => p.id === projectId);
      
      if (!project) return;

      const invoiceItems: InvoiceItem[] = selectedEntries.map(entry => ({
        id: `item_${entry.id}`,
        service_id: services[0]?.id || 'service_consulting',
        service: services[0] || {
          id: 'service_consulting',
          name: 'Consulting Services',
          description: 'Professional consulting services',
          category: 'consulting' as const,
          pricing_type: 'hourly' as const,
          base_price: entry.billable_rate || project.hourly_rate || 5000,
          currency: 'INR',
          tax_inclusive: false,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        description: entry.task_description,
        quantity: entry.hours,
        rate: entry.billable_rate || project.hourly_rate || 5000,
        amount: entry.hours * (entry.billable_rate || project.hourly_rate || 5000),
        tax_rate: 18
      }));

      const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = invoiceItems.reduce((sum, item) => sum + (item.amount * item.tax_rate / 100), 0);

      const client = clients.find(c => c.id === newInvoice.client_id);
      if (!client) return;

      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + newInvoice.due_days);

      const invoiceData = {
        client_id: newInvoice.client_id,
        client,
        issue_date: issueDate.toISOString(),
        due_date: dueDate.toISOString(),
        status: 'draft' as const,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: 0,
        total_amount: subtotal + taxAmount,
        paid_amount: 0,
        currency: 'INR',
        items: invoiceItems,
        payment_terms: client.payment_terms,
        notes: newInvoice.notes,
        internal_notes: newInvoice.internal_notes
      };

      const createdInvoice = await financialService.createInvoice(invoiceData);
      
      // Update time entries with invoice reference
      selectedEntries.forEach(entry => {
        entry.invoice_id = createdInvoice.id;
      });

      setInvoices(prev => [createdInvoice, ...prev]);
      setTimeEntries(prev => prev.filter(entry => !selectedTimeEntries.includes(entry.id)));
      
      // Reset form
      setSelectedTimeEntries([]);
      setShowTimeEntrySelection(false);
      setShowCreateModal(false);
      setNewInvoice({
        client_id: '',
        project_id: '',
        due_days: 30,
        notes: '',
        internal_notes: ''
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: Invoice['status']) => {
    try {
      const updatedInvoice = await financialService.updateInvoiceStatus(invoiceId, newStatus);
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice(updatedInvoice);
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  // Summary calculations
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0);
  const outstandingAmount = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);
  const unbilledHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

  // Display logic for overview vs full page
  const displayInvoices = isOverview ? filteredInvoices.slice(0, 5) : filteredInvoices;

  if (isOverview) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Invoices</h2>
            <p className="text-gray-400 text-sm">Latest invoice activity</p>
          </div>
        </div>

        {/* Invoice List */}
        <div className="glass-effect rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
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
          ) : displayInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No invoices found</h3>
              <p className="text-gray-400 mb-4">Get started by creating your first invoice</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {displayInvoices.map((invoice, index) => (
                <div
                  key={invoice.id}
                  className="p-4 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Invoice Info */}
                    <div className="flex items-center space-x-4 flex-1 pr-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{invoice.invoice_number}</h3>
                        <p className="text-sm text-gray-400">{invoice.client.name}</p>
                        <p className="text-xs text-gray-400">Due: {format(parseISO(invoice.due_date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="text-right space-y-2">
                      <p className="font-bold text-white">{formatCurrency(invoice.total_amount)}</p>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="capitalize">{invoice.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          {invoices.length > 5 && (
            <div className="p-4 border-t border-gray-700/50 text-center">
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                View All Invoices ({invoices.length})
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full page view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoice Management</h1>
          <p className="text-gray-400 mt-1">Create and manage client invoices</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCreateFromTimeEntries}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            disabled={timeEntries.length === 0}
          >
            <Timer className="w-5 h-5" />
            <span>Bill Time ({unbilledHours.toFixed(1)}h)</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Invoices</p>
              <p className="text-3xl font-bold text-white">{totalInvoices}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Paid</p>
              <p className="text-3xl font-bold text-white">{paidInvoices}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Overdue</p>
              <p className="text-3xl font-bold text-white">{overdueInvoices}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Outstanding</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(outstandingAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-effect rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Invoice</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredInvoices.map((invoice, index) => {
                  const daysOverdue = invoice.status === 'overdue' ? calculateDaysOverdue(invoice.due_date) : 0;
                  
                  return (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{invoice.invoice_number}</div>
                          <div className="text-sm text-gray-400">
                            {format(parseISO(invoice.issue_date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Building className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-white">{invoice.client.name}</div>
                            <div className="text-sm text-gray-400">{invoice.client.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{formatCurrency(invoice.total_amount)}</div>
                          {invoice.paid_amount > 0 && invoice.paid_amount < invoice.total_amount && (
                            <div className="text-sm text-gray-400">
                              {formatCurrency(invoice.paid_amount)} paid
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="capitalize">{invoice.status}</span>
                        </span>
                        {daysOverdue > 0 && (
                          <div className="text-xs text-red-400 mt-1">
                            {daysOverdue} days overdue
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {format(parseISO(invoice.due_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/200/10 rounded-lg transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          
                          {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No invoices found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' || clientFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first invoice to get started'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && clientFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Invoice</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Time Entry Selection Modal */}
      <AnimatePresence>
        {showTimeEntrySelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create Invoice from Time Entries</h3>
                <button
                  onClick={() => setShowTimeEntrySelection(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Client Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Client</label>
                <select
                  value={newInvoice.client_id}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              {/* Time Entries Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Select Time Entries ({selectedTimeEntries.length} selected)
                </h4>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {timeEntries.map(entry => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedTimeEntries.includes(entry.id)
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                      }`}
                      onClick={() => handleTimeEntrySelection(entry.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium text-white">{entry.project.name}</div>
                            <div className="text-sm text-gray-400">{entry.project.client.name}</div>
                          </div>
                          <div className="text-sm text-gray-300 mt-1">{entry.task_description}</div>
                          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                            <span>{entry.hours}h</span>
                            <span>{formatCurrency((entry.billable_rate || 5000) * entry.hours)}</span>
                            <span>{format(parseISO(entry.entry_date), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={selectedTimeEntries.includes(entry.id)}
                            onChange={() => handleTimeEntrySelection(entry.id)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {timeEntries.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No unbilled time entries available
                  </div>
                )}
              </div>

              {/* Invoice Details */}
              {selectedTimeEntries.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Due Days</label>
                    <input
                      type="number"
                      value={newInvoice.due_days}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, due_days: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <textarea
                      value={newInvoice.notes}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={2}
                      placeholder="Invoice notes for client..."
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedTimeEntries.length > 0 && (
                <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                  <h5 className="font-semibold text-white mb-2">Invoice Summary</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Hours:</span>
                      <div className="font-medium text-white">
                        {timeEntries
                          .filter(entry => selectedTimeEntries.includes(entry.id))
                          .reduce((sum, entry) => sum + entry.hours, 0)
                          .toFixed(1)
                        }h
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Subtotal:</span>
                      <div className="font-medium text-white">
                        {formatCurrency(
                          timeEntries
                            .filter(entry => selectedTimeEntries.includes(entry.id))
                            .reduce((sum, entry) => sum + (entry.hours * (entry.billable_rate || 5000)), 0)
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Tax (18%):</span>
                      <div className="font-medium text-white">
                        {formatCurrency(
                          timeEntries
                            .filter(entry => selectedTimeEntries.includes(entry.id))
                            .reduce((sum, entry) => sum + (entry.hours * (entry.billable_rate || 5000) * 0.18), 0)
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Total:</span>
                      <div className="font-medium text-white">
                        {formatCurrency(
                          timeEntries
                            .filter(entry => selectedTimeEntries.includes(entry.id))
                            .reduce((sum, entry) => sum + (entry.hours * (entry.billable_rate || 5000) * 1.18), 0)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTimeEntrySelection(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createInvoiceFromTimeEntries}
                  disabled={selectedTimeEntries.length === 0 || !newInvoice.client_id}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Create Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoiceManagement;