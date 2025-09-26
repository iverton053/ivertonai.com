import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Lock,
  Users,
  Database,
  Globe,
  Clock,
  RefreshCw,
  ExternalLink,
  Trash2,
  Settings
} from 'lucide-react';

interface ComplianceCheck {
  id: string;
  category: string;
  requirement: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'in-progress';
  severity: 'critical' | 'high' | 'medium' | 'low';
  evidence?: string[];
  remediation?: string;
  last_checked: string;
  next_check: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  ip_address: string;
  user_agent: string;
  details?: Record<string, any>;
}

interface DataMapping {
  id: string;
  data_type: string;
  collection_purpose: string;
  legal_basis: string;
  retention_period: string;
  processing_activities: string[];
  third_party_sharing: boolean;
  security_measures: string[];
}

interface ComplianceManagerProps {
  portalId: string;
  onClose: () => void;
}

export const ComplianceManager: React.FC<ComplianceManagerProps> = ({ portalId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gdpr' | 'soc2' | 'audit' | 'data-mapping'>('overview');
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComplianceData();
  }, [portalId]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);

      // Mock compliance data
      const mockChecks: ComplianceCheck[] = [
        {
          id: '1',
          category: 'GDPR',
          requirement: 'Right to be Forgotten',
          description: 'Users can request deletion of their personal data',
          status: 'compliant',
          severity: 'critical',
          evidence: ['Data deletion API implemented', 'User request form available'],
          last_checked: new Date().toISOString(),
          next_check: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          category: 'GDPR',
          requirement: 'Data Processing Consent',
          description: 'Explicit consent for data processing activities',
          status: 'partial',
          severity: 'high',
          evidence: ['Cookie consent implemented'],
          remediation: 'Add explicit consent for analytics tracking',
          last_checked: new Date().toISOString(),
          next_check: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          category: 'SOC2',
          requirement: 'Access Controls',
          description: 'Role-based access control implementation',
          status: 'compliant',
          severity: 'critical',
          evidence: ['RBAC system active', 'Regular access reviews'],
          last_checked: new Date().toISOString(),
          next_check: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          category: 'SOC2',
          requirement: 'Data Encryption',
          description: 'Data encrypted in transit and at rest',
          status: 'compliant',
          severity: 'critical',
          evidence: ['TLS 1.3 enforced', 'Database encryption enabled'],
          last_checked: new Date().toISOString(),
          next_check: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          category: 'SOC2',
          requirement: 'Incident Response',
          description: 'Security incident response procedures',
          status: 'non-compliant',
          severity: 'high',
          remediation: 'Create formal incident response plan and test procedures',
          last_checked: new Date().toISOString(),
          next_check: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const mockAuditLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          user_id: 'user123',
          user_name: 'John Doe',
          action: 'user.login',
          resource: 'client_portal',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { portal_id: portalId, method: 'sso' }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user_id: 'user123',
          user_name: 'John Doe',
          action: 'data.export',
          resource: 'analytics_data',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { data_type: 'user_analytics', record_count: 150 }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user_id: 'admin456',
          user_name: 'Jane Admin',
          action: 'settings.update',
          resource: 'portal_configuration',
          ip_address: '10.0.0.5',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          details: { setting: 'two_factor_required', old_value: false, new_value: true }
        }
      ];

      const mockDataMappings: DataMapping[] = [
        {
          id: '1',
          data_type: 'User Account Information',
          collection_purpose: 'User authentication and account management',
          legal_basis: 'Legitimate Interest',
          retention_period: '7 years after account closure',
          processing_activities: ['Authentication', 'Authorization', 'Support'],
          third_party_sharing: false,
          security_measures: ['Encryption at rest', 'Access controls', 'Audit logging']
        },
        {
          id: '2',
          data_type: 'Analytics Data',
          collection_purpose: 'Service improvement and usage analytics',
          legal_basis: 'Consent',
          retention_period: '2 years',
          processing_activities: ['Analytics', 'Reporting', 'Performance monitoring'],
          third_party_sharing: true,
          security_measures: ['Anonymization', 'Aggregation', 'Access controls']
        },
        {
          id: '3',
          data_type: 'Communication Logs',
          collection_purpose: 'Customer support and communication history',
          legal_basis: 'Legitimate Interest',
          retention_period: '3 years',
          processing_activities: ['Support', 'Communication', 'Issue resolution'],
          third_party_sharing: false,
          security_measures: ['Encryption', 'Access logging', 'Regular deletion']
        }
      ];

      setComplianceChecks(mockChecks);
      setAuditLogs(mockAuditLogs);
      setDataMappings(mockDataMappings);
    } catch (err) {
      setError('Failed to load compliance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runComplianceScan = async () => {
    try {
      setScanning(true);
      setError(null);

      // Simulate compliance scan
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update some compliance statuses
      setComplianceChecks(prev => prev.map(check => ({
        ...check,
        last_checked: new Date().toISOString(),
        status: Math.random() > 0.3 ? check.status : 'compliant' as const
      })));

    } catch (err) {
      setError('Compliance scan failed');
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const exportComplianceReport = (format: 'pdf' | 'json' | 'csv') => {
    const data = {
      portal_id: portalId,
      generated_at: new Date().toISOString(),
      compliance_checks: complianceChecks,
      audit_summary: {
        total_logs: auditLogs.length,
        recent_activities: auditLogs.slice(0, 10)
      },
      data_mappings: dataMappings
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${portalId}-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'non-compliant':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'partial':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'in-progress':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'non-compliant':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityColor = (severity: ComplianceCheck['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  const compliantCount = complianceChecks.filter(c => c.status === 'compliant').length;
  const totalChecks = complianceChecks.length;
  const compliancePercentage = totalChecks > 0 ? Math.round((compliantCount / totalChecks) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Security Compliance Manager
            </h2>
            <p className="text-gray-600 mt-1">SOC2, GDPR, and security compliance monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{compliancePercentage}%</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'gdpr', label: 'GDPR', icon: Globe },
            { id: 'soc2', label: 'SOC2', icon: Lock },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
            { id: 'data-mapping', label: 'Data Mapping', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Compliant</p>
                      <p className="text-2xl font-bold text-green-900">
                        {complianceChecks.filter(c => c.status === 'compliant').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">Non-Compliant</p>
                      <p className="text-2xl font-bold text-red-900">
                        {complianceChecks.filter(c => c.status === 'non-compliant').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Partial</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {complianceChecks.filter(c => c.status === 'partial').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">In Progress</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {complianceChecks.filter(c => c.status === 'in-progress').length}
                      </p>
                    </div>
                    <RefreshCw className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
                <div className="flex gap-3">
                  <button
                    onClick={runComplianceScan}
                    disabled={scanning}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {scanning ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    {scanning ? 'Scanning...' : 'Run Scan'}
                  </button>
                  <div className="relative">
                    <select
                      onChange={(e) => exportComplianceReport(e.target.value as any)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 hover:border-gray-400"
                      value=""
                    >
                      <option value="" disabled>Export Report</option>
                      <option value="pdf">Export as PDF</option>
                      <option value="json">Export as JSON</option>
                      <option value="csv">Export as CSV</option>
                    </select>
                    <Download className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {complianceChecks.map(check => (
                  <div
                    key={check.id}
                    className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(check.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{check.requirement}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(check.severity)}`}>
                              {check.severity}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {check.category}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{check.description}</p>

                          {check.evidence && check.evidence.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium mb-1">Evidence:</p>
                              <ul className="text-xs space-y-1">
                                {check.evidence.map((evidence, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    {evidence}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {check.remediation && (
                            <div className="bg-white bg-opacity-50 rounded p-2 text-xs">
                              <strong>Remediation:</strong> {check.remediation}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-right">
                        <p>Last checked: {new Date(check.last_checked).toLocaleDateString()}</p>
                        <p>Next check: {new Date(check.next_check).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gdpr' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GDPR Compliance Status</h3>
                <p className="text-gray-600">General Data Protection Regulation requirements and controls</p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-900">Data Subject Rights</p>
                      <p className="text-sm text-blue-700">Access, rectification, erasure</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium text-green-900">Data Protection</p>
                      <p className="text-sm text-green-700">Encryption, anonymization</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="font-medium text-purple-900">Documentation</p>
                      <p className="text-sm text-purple-700">Policies, procedures, records</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Data Subject Rights Implementation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <span>Right of Access</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <span>Right to Rectification</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <span>Right to Erasure</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                      <span>Right to Data Portability</span>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Consent Management</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Cookie Consent</p>
                        <p className="text-sm text-gray-600">Explicit consent for non-essential cookies</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Analytics Consent</p>
                        <p className="text-sm text-gray-600">User consent for analytics tracking</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Marketing Consent</p>
                        <p className="text-sm text-gray-600">Opt-in for marketing communications</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'soc2' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SOC2 Type II Compliance</h3>
                <p className="text-gray-600">Service Organization Control 2 security framework compliance</p>
              </div>

              <div className="grid grid-cols-5 gap-4 mb-8">
                {[
                  { name: 'Security', status: 'compliant', description: 'Access controls, encryption' },
                  { name: 'Availability', status: 'compliant', description: 'System uptime, monitoring' },
                  { name: 'Processing Integrity', status: 'partial', description: 'Data processing accuracy' },
                  { name: 'Confidentiality', status: 'compliant', description: 'Data protection measures' },
                  { name: 'Privacy', status: 'in-progress', description: 'Personal information handling' }
                ].map(category => (
                  <div key={category.name} className={`border rounded-lg p-4 ${getStatusColor(category.status as any)}`}>
                    <div className="text-center">
                      {getStatusIcon(category.status as any)}
                      <h4 className="font-medium mt-2">{category.name}</h4>
                      <p className="text-xs mt-1">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                {complianceChecks.filter(check => check.category === 'SOC2').map(check => (
                  <div
                    key={check.id}
                    className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(check.status)}
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{check.requirement}</h4>
                          <p className="text-sm mb-2">{check.description}</p>

                          {check.evidence && check.evidence.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium mb-1">Control Evidence:</p>
                              <ul className="text-xs space-y-1">
                                {check.evidence.map((evidence, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    {evidence}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {check.remediation && (
                            <div className="bg-white bg-opacity-50 rounded p-2 text-xs">
                              <strong>Required Action:</strong> {check.remediation}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(check.severity)}`}>
                        {check.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Security Audit Logs</h3>
                  <p className="text-gray-600">Comprehensive audit trail of user activities and system events</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Logs
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.user_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.ip_address}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {log.details && (
                              <details className="cursor-pointer">
                                <summary>View details</summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data-mapping' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Processing Inventory</h3>
                <p className="text-gray-600">Comprehensive mapping of personal data processing activities</p>
              </div>

              <div className="space-y-6">
                {dataMappings.map(mapping => (
                  <div key={mapping.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{mapping.data_type}</h4>
                      <div className="flex items-center gap-2">
                        {mapping.third_party_sharing && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Third-party sharing
                          </span>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Collection Purpose
                          </label>
                          <p className="text-sm text-gray-900">{mapping.collection_purpose}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Legal Basis
                          </label>
                          <p className="text-sm text-gray-900">{mapping.legal_basis}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Retention Period
                          </label>
                          <p className="text-sm text-gray-900">{mapping.retention_period}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Processing Activities
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {mapping.processing_activities.map(activity => (
                              <span
                                key={activity}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Security Measures
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {mapping.security_measures.map(measure => (
                              <span
                                key={measure}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {measure}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};