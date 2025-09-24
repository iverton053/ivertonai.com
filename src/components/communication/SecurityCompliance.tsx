import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Download,
  Settings,
  Key,
  Database,
  Activity,
  Bell,
  Search,
  Filter,
  BarChart3,
  Zap,
  Globe,
  Server,
  Wifi,
  UserCheck,
  Ban,
  Archive,
  Trash2,
  AlertCircle,
  Info,
  RefreshCw,
  ExternalLink,
  Copy,
  Plus,
  X
} from 'lucide-react';
import { EnhancedBadge, StatusIndicator, PriorityIndicator } from '../ui/EnhancedVisualHierarchy';

interface SecurityEvent {
  id: string;
  type: 'login' | 'access' | 'data_export' | 'permission_change' | 'encryption' | 'breach_attempt' | 'compliance_check';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  timestamp: Date;
  details: string;
  ipAddress: string;
  userAgent: string;
  resource?: string;
  action: string;
  status: 'success' | 'failed' | 'pending' | 'blocked';
}

interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'hipaa' | 'sox' | 'iso27001' | 'ccpa';
  status: 'compliant' | 'non_compliant' | 'pending_review';
  lastAudit: Date;
  nextAudit: Date;
  findings: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    remediation: string;
    status: 'open' | 'in_progress' | 'resolved';
  }>;
  score: number;
}

interface SecurityPolicy {
  id: string;
  name: string;
  category: 'access' | 'data' | 'communication' | 'retention' | 'encryption';
  description: string;
  isActive: boolean;
  lastModified: Date;
  modifiedBy: string;
  enforcement: 'strict' | 'moderate' | 'advisory';
  applicableTo: string[];
}

interface SecurityComplianceProps {
  onSecurityAlert?: (alert: SecurityEvent) => void;
}

const SecurityCompliance: React.FC<SecurityComplianceProps> = ({ onSecurityAlert }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'audit' | 'compliance' | 'policies' | 'settings'>('dashboard');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  // Mock data initialization
  useEffect(() => {
    const mockSecurityEvents: SecurityEvent[] = [
      {
        id: 'se1',
        type: 'login',
        severity: 'low',
        user: { id: 'u1', name: 'John Smith', email: 'john@agency.com', role: 'Admin' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        details: 'Successful admin login from recognized device',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/119.0.0.0',
        action: 'Admin Dashboard Access',
        status: 'success'
      },
      {
        id: 'se2',
        type: 'breach_attempt',
        severity: 'critical',
        user: { id: 'unknown', name: 'Unknown User', email: 'unknown', role: 'None' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        details: 'Multiple failed login attempts detected from suspicious IP',
        ipAddress: '185.220.101.42',
        userAgent: 'curl/7.68.0',
        action: 'Brute Force Attack',
        status: 'blocked'
      },
      {
        id: 'se3',
        type: 'data_export',
        severity: 'high',
        user: { id: 'u2', name: 'Sarah Wilson', email: 'sarah@agency.com', role: 'Manager' },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        details: 'Large client data export requested',
        ipAddress: '192.168.1.105',
        userAgent: 'Chrome/119.0.0.0',
        resource: 'Client Database',
        action: 'Bulk Export',
        status: 'pending'
      },
      {
        id: 'se4',
        type: 'compliance_check',
        severity: 'medium',
        user: { id: 'system', name: 'System', email: 'system@agency.com', role: 'System' },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        details: 'Automated GDPR compliance scan completed',
        ipAddress: '127.0.0.1',
        userAgent: 'ComplianceBot/1.0',
        action: 'GDPR Audit',
        status: 'success'
      },
      {
        id: 'se5',
        type: 'encryption',
        severity: 'low',
        user: { id: 'u3', name: 'Mike Chen', email: 'mike@agency.com', role: 'Developer' },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        details: 'Message encryption key rotated',
        ipAddress: '192.168.1.110',
        userAgent: 'Chrome/119.0.0.0',
        action: 'Key Rotation',
        status: 'success'
      }
    ];

    const mockComplianceReports: ComplianceReport[] = [
      {
        id: 'cr1',
        type: 'gdpr',
        status: 'compliant',
        lastAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextAudit: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        score: 94,
        findings: [
          {
            id: 'f1',
            severity: 'low',
            description: 'Data retention period documentation needs update',
            remediation: 'Update retention policy documentation',
            status: 'in_progress'
          }
        ]
      },
      {
        id: 'cr2',
        type: 'iso27001',
        status: 'compliant',
        lastAudit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        nextAudit: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        score: 88,
        findings: [
          {
            id: 'f2',
            severity: 'medium',
            description: 'Access control review needed for terminated employees',
            remediation: 'Implement automated account deactivation',
            status: 'open'
          }
        ]
      },
      {
        id: 'cr3',
        type: 'sox',
        status: 'pending_review',
        lastAudit: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        nextAudit: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        score: 76,
        findings: [
          {
            id: 'f3',
            severity: 'high',
            description: 'Financial data access logging insufficient',
            remediation: 'Enhance audit trail for financial data access',
            status: 'open'
          }
        ]
      }
    ];

    const mockSecurityPolicies: SecurityPolicy[] = [
      {
        id: 'sp1',
        name: 'Multi-Factor Authentication',
        category: 'access',
        description: 'Require MFA for all admin accounts and sensitive operations',
        isActive: true,
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        modifiedBy: 'Security Team',
        enforcement: 'strict',
        applicableTo: ['Admin', 'Manager']
      },
      {
        id: 'sp2',
        name: 'End-to-End Encryption',
        category: 'communication',
        description: 'All messages must be encrypted using AES-256 encryption',
        isActive: true,
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        modifiedBy: 'IT Security',
        enforcement: 'strict',
        applicableTo: ['All Users']
      },
      {
        id: 'sp3',
        name: 'Data Retention Policy',
        category: 'data',
        description: 'Client data must be retained for 7 years, communications for 3 years',
        isActive: true,
        lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        modifiedBy: 'Compliance Officer',
        enforcement: 'strict',
        applicableTo: ['All Users']
      },
      {
        id: 'sp4',
        name: 'Access Control Review',
        category: 'access',
        description: 'Quarterly review of user access permissions',
        isActive: true,
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        modifiedBy: 'HR Security',
        enforcement: 'moderate',
        applicableTo: ['Admin', 'Manager']
      }
    ];

    setSecurityEvents(mockSecurityEvents);
    setComplianceReports(mockComplianceReports);
    setSecurityPolicies(mockSecurityPolicies);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="w-4 h-4" />;
      case 'access': return <Key className="w-4 h-4" />;
      case 'data_export': return <Download className="w-4 h-4" />;
      case 'permission_change': return <Settings className="w-4 h-4" />;
      case 'encryption': return <Lock className="w-4 h-4" />;
      case 'breach_attempt': return <Ban className="w-4 h-4" />;
      case 'compliance_check': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'non_compliant': return 'error';
      case 'pending_review': return 'warning';
      default: return 'default';
    }
  };

  const getComplianceIcon = (type: string) => {
    switch (type) {
      case 'gdpr': return <Globe className="w-4 h-4" />;
      case 'hipaa': return <Shield className="w-4 h-4" />;
      case 'sox': return <FileText className="w-4 h-4" />;
      case 'iso27001': return <Server className="w-4 h-4" />;
      case 'ccpa': return <Database className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
    if (filterType !== 'all' && event.type !== filterType) return false;
    return true;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSecurityScore = () => {
    const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length;
    const highEvents = securityEvents.filter(e => e.severity === 'high').length;
    const totalEvents = securityEvents.length;

    const baseScore = 100;
    const criticalPenalty = criticalEvents * 20;
    const highPenalty = highEvents * 10;

    return Math.max(0, baseScore - criticalPenalty - highPenalty);
  };

  const handleExportAuditLog = () => {
    alert('Exporting security audit log...\n\n• Date range: Last 30 days\n• Format: CSV with encrypted sensitive data\n• Records: ' + securityEvents.length + ' events\n• Compliance: GDPR/SOX compliant format');
  };

  const handleTriggerAudit = (type: string) => {
    alert(`Triggering ${type.toUpperCase()} compliance audit...\n\n• Automated scan initiated\n• Expected completion: 2-4 hours\n• Report will be available in Compliance tab\n• Notifications sent to compliance team`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security & Compliance</h1>
          <p className="text-gray-400">Enterprise-grade security monitoring and compliance management</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">Security Score: {calculateSecurityScore()}/100</span>
          </div>
          <StatusIndicator status="active" label="Protected" />
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
              <Shield className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="success" size="sm">Active</EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{calculateSecurityScore()}</h3>
          <p className="text-gray-400 text-sm">Security Score</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="info" size="sm">{complianceReports.length}</EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {complianceReports.filter(r => r.status === 'compliant').length}
          </h3>
          <p className="text-gray-400 text-sm">Compliant Standards</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="warning" size="sm">
              {securityEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length}
            </EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {securityEvents.filter(e => e.severity === 'critical').length}
          </h3>
          <p className="text-gray-400 text-sm">Critical Alerts</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
              <Lock className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="success" size="sm">AES-256</EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">100%</h3>
          <p className="text-gray-400 text-sm">Encrypted Traffic</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {[
            { id: 'dashboard', label: 'Security Dashboard', icon: BarChart3 },
            { id: 'audit', label: 'Audit Log', icon: FileText },
            { id: 'compliance', label: 'Compliance', icon: CheckCircle },
            { id: 'policies', label: 'Policies', icon: Settings },
            { id: 'settings', label: 'Settings', icon: Shield }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportAuditLog}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log</span>
        </motion.button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Security Events */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Security Events</h3>
                  <EnhancedBadge variant="info" size="sm">Live</EnhancedBadge>
                </div>
                <div className="space-y-3">
                  {securityEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className={`p-2 rounded-lg bg-${getSeverityColor(event.severity)}-500/20 text-${getSeverityColor(event.severity)}-400`}>
                        {getTypeIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium text-sm">{event.action}</h4>
                          <span className="text-xs text-gray-400">{formatDate(event.timestamp)}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{event.user.name} • {event.ipAddress}</p>
                      </div>
                      <EnhancedBadge variant={getSeverityColor(event.severity)} size="sm">
                        {event.severity}
                      </EnhancedBadge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Status */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Compliance Status</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTriggerAudit('comprehensive')}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="text-xs">Audit</span>
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {complianceReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${getComplianceColor(report.status) === 'success' ? 'green' : getComplianceColor(report.status) === 'error' ? 'red' : 'yellow'}-500/20 text-${getComplianceColor(report.status) === 'success' ? 'green' : getComplianceColor(report.status) === 'error' ? 'red' : 'yellow'}-400`}>
                          {getComplianceIcon(report.type)}
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm uppercase">{report.type}</h4>
                          <p className="text-gray-400 text-xs">Score: {report.score}/100</p>
                        </div>
                      </div>
                      <EnhancedBadge variant={getComplianceColor(report.status)} size="sm">
                        {report.status.replace('_', ' ')}
                      </EnhancedBadge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Security Audit Log</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="login">Login</option>
                    <option value="access">Access</option>
                    <option value="data_export">Data Export</option>
                    <option value="breach_attempt">Breach Attempt</option>
                    <option value="compliance_check">Compliance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg bg-${getSeverityColor(event.severity)}-500/20 text-${getSeverityColor(event.severity)}-400`}>
                          {getTypeIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-white font-medium">{event.action}</h4>
                            <EnhancedBadge variant={getSeverityColor(event.severity)} size="sm">
                              {event.severity}
                            </EnhancedBadge>
                            <EnhancedBadge
                              variant={event.status === 'success' ? 'success' : event.status === 'failed' ? 'error' : event.status === 'blocked' ? 'warning' : 'info'}
                              size="sm"
                            >
                              {event.status}
                            </EnhancedBadge>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{event.details}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>{event.user.name} ({event.user.role})</span>
                            <span>•</span>
                            <span>{event.ipAddress}</span>
                            <span>•</span>
                            <span>{formatDate(event.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {complianceReports.map((report) => (
                <div key={report.id} className="glass-effect rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg bg-${getComplianceColor(report.status) === 'success' ? 'green' : getComplianceColor(report.status) === 'error' ? 'red' : 'yellow'}-500/20 text-${getComplianceColor(report.status) === 'success' ? 'green' : getComplianceColor(report.status) === 'error' ? 'red' : 'yellow'}-400`}>
                        {getComplianceIcon(report.type)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white uppercase">{report.type}</h3>
                        <p className="text-gray-400 text-sm">
                          Last audit: {formatDate(report.lastAudit)} • Next: {formatDate(report.nextAudit)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white mb-1">{report.score}/100</div>
                      <EnhancedBadge variant={getComplianceColor(report.status)} size="sm">
                        {report.status.replace('_', ' ')}
                      </EnhancedBadge>
                    </div>
                  </div>

                  {report.findings.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Findings & Remediation</h4>
                      {report.findings.map((finding) => (
                        <div key={finding.id} className="p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <EnhancedBadge variant={getSeverityColor(finding.severity)} size="sm">
                                  {finding.severity}
                                </EnhancedBadge>
                                <EnhancedBadge
                                  variant={finding.status === 'resolved' ? 'success' : finding.status === 'in_progress' ? 'warning' : 'error'}
                                  size="sm"
                                >
                                  {finding.status.replace('_', ' ')}
                                </EnhancedBadge>
                              </div>
                              <p className="text-white text-sm mb-1">{finding.description}</p>
                              <p className="text-gray-400 text-xs">{finding.remediation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Security Policies</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPolicyModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Policy</span>
                </motion.button>
              </div>

              <div className="space-y-4">
                {securityPolicies.map((policy) => (
                  <div key={policy.id} className="p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-medium">{policy.name}</h4>
                          <EnhancedBadge
                            variant={policy.category === 'access' ? 'blue' : policy.category === 'data' ? 'green' : policy.category === 'communication' ? 'purple' : 'orange'}
                            size="sm"
                          >
                            {policy.category}
                          </EnhancedBadge>
                          <EnhancedBadge
                            variant={policy.enforcement === 'strict' ? 'error' : policy.enforcement === 'moderate' ? 'warning' : 'info'}
                            size="sm"
                          >
                            {policy.enforcement}
                          </EnhancedBadge>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{policy.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>Modified: {formatDate(policy.lastModified)}</span>
                          <span>•</span>
                          <span>By: {policy.modifiedBy}</span>
                          <span>•</span>
                          <span>Applies to: {policy.applicableTo.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIndicator
                          status={policy.isActive ? 'active' : 'inactive'}
                          size="sm"
                        />
                        <button
                          onClick={() => {
                            setSecurityPolicies(prev => prev.map(p =>
                              p.id === policy.id ? { ...p, isActive: !p.isActive } : p
                            ));
                          }}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SecurityCompliance;