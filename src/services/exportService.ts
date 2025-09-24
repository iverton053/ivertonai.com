import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface ExportData {
  automations: any[];
  stats: any;
  alerts?: any[];
  timeRange?: string;
  generatedAt: string;
  userInfo?: any;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeStats?: boolean;
  includeAlerts?: boolean;
  includeCharts?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filename?: string;
}

class ExportService {
  
  async exportData(data: ExportData, options: ExportOptions): Promise<void> {
    const filename = options.filename || this.generateFilename(options.format);
    
    switch (options.format) {
      case 'json':
        this.exportAsJSON(data, filename);
        break;
      case 'csv':
        this.exportAsCSV(data, filename);
        break;
      case 'excel':
        await this.exportAsExcel(data, filename, options);
        break;
      case 'pdf':
        await this.exportAsPDF(data, filename, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private generateFilename(format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `ai-hub-export-${timestamp}.${format}`;
  }

  // JSON Export
  private exportAsJSON(data: ExportData, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    this.downloadBlob(jsonString, filename, 'application/json');
  }

  // CSV Export
  private exportAsCSV(data: ExportData, filename: string): void {
    const headers = [
      'ID',
      'Title',
      'Status',
      'Progress',
      'Last Run',
      'Success Rate',
      'Execution Time (ms)',
      'CPU Usage (%)',
      'Memory Usage (%)',
      'Error Message'
    ];

    const rows = data.automations.map(automation => [
      automation.id || '',
      automation.title || automation.name || '',
      automation.status || '',
      automation.progress || '',
      automation.timestamp || automation.lastRun || '',
      automation.successRate || '',
      automation.performance?.executionTime || '',
      automation.performance?.cpuUsage || '',
      automation.performance?.memoryUsage || '',
      automation.error || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    this.downloadBlob(csvContent, filename, 'text/csv');
  }

  // Excel Export
  private async exportAsExcel(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Automations sheet
    const automationsData = data.automations.map(automation => ({
      'ID': automation.id,
      'Title': automation.title || automation.name,
      'Status': automation.status,
      'Progress': automation.progress,
      'Last Run': automation.timestamp || automation.lastRun,
      'Success Rate': automation.successRate,
      'Execution Time (ms)': automation.performance?.executionTime,
      'CPU Usage (%)': automation.performance?.cpuUsage,
      'Memory Usage (%)': automation.performance?.memoryUsage,
      'Error Message': automation.error,
      'Refresh Interval': automation.refreshInterval,
      'Category': automation.category,
      'Created At': automation.createdAt,
      'Updated At': automation.updatedAt
    }));

    const automationsSheet = XLSX.utils.json_to_sheet(automationsData);
    XLSX.utils.book_append_sheet(workbook, automationsSheet, 'Automations');

    // Stats sheet
    if (options.includeStats && data.stats) {
      const statsData = [
        { 'Metric': 'Total Automations', 'Value': data.stats.total },
        { 'Metric': 'Fresh Data', 'Value': data.stats.fresh },
        { 'Metric': 'Stale Data', 'Value': data.stats.stale },
        { 'Metric': 'Average Success Rate', 'Value': `${data.stats.avgSuccessRate || 0}%` },
        { 'Metric': 'Total Execution Time', 'Value': `${data.stats.totalExecutionTime || 0}ms` },
        { 'Metric': 'Average CPU Usage', 'Value': `${data.stats.avgCpuUsage || 0}%` },
        { 'Metric': 'Average Memory Usage', 'Value': `${data.stats.avgMemoryUsage || 0}%` }
      ];
      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
    }

    // Alerts sheet
    if (options.includeAlerts && data.alerts) {
      const alertsData = data.alerts.map(alert => ({
        'ID': alert.id,
        'Type': alert.type,
        'Title': alert.title,
        'Message': alert.message,
        'Severity': alert.severity,
        'Automation ID': alert.automationId,
        'Timestamp': alert.timestamp,
        'Acknowledged': alert.acknowledged ? 'Yes' : 'No'
      }));
      const alertsSheet = XLSX.utils.json_to_sheet(alertsData);
      XLSX.utils.book_append_sheet(workbook, alertsSheet, 'Alerts');
    }

    // Generate and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.downloadBlob(excelBuffer, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  // PDF Export
  private async exportAsPDF(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, size: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(size);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        if (yPosition > pdf.internal.pageSize.height - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin, yPosition);
        yPosition += size * 0.6;
      });
      yPosition += 5; // Extra space after text
    };

    // Header
    addText('AI Automation Hub Export Report', 18, true);
    addText(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, 10);
    
    if (options.dateRange) {
      addText(`Date Range: ${options.dateRange.start} to ${options.dateRange.end}`, 10);
    }
    
    yPosition += 10;

    // Statistics Summary
    if (options.includeStats && data.stats) {
      addText('OVERVIEW', 14, true);
      addText(`Total Automations: ${data.stats.total}`);
      addText(`Fresh Data: ${data.stats.fresh}`);
      addText(`Stale Data: ${data.stats.stale}`);
      if (data.stats.avgSuccessRate !== undefined) {
        addText(`Average Success Rate: ${data.stats.avgSuccessRate}%`);
      }
      yPosition += 10;
    }

    // Automations Detail
    addText('AUTOMATION DETAILS', 14, true);
    
    data.automations.forEach((automation, index) => {
      if (yPosition > pdf.internal.pageSize.height - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      addText(`${index + 1}. ${automation.title || automation.name || automation.id}`, 12, true);
      addText(`   Status: ${automation.status}`);
      addText(`   Progress: ${automation.progress || 0}%`);
      addText(`   Last Run: ${automation.timestamp || automation.lastRun || 'Never'}`);
      
      if (automation.performance) {
        if (automation.performance.executionTime) {
          addText(`   Execution Time: ${automation.performance.executionTime}ms`);
        }
        if (automation.performance.cpuUsage !== undefined) {
          addText(`   CPU Usage: ${automation.performance.cpuUsage}%`);
        }
        if (automation.performance.memoryUsage !== undefined) {
          addText(`   Memory Usage: ${automation.performance.memoryUsage}%`);
        }
      }
      
      if (automation.error) {
        addText(`   Error: ${automation.error}`);
      }
      
      yPosition += 5;
    });

    // Alerts Section
    if (options.includeAlerts && data.alerts && data.alerts.length > 0) {
      if (yPosition > pdf.internal.pageSize.height - 100) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 10;
      addText('ALERTS', 14, true);
      
      data.alerts.forEach((alert, index) => {
        if (yPosition > pdf.internal.pageSize.height - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        addText(`${index + 1}. ${alert.title} (${alert.severity.toUpperCase()})`, 12, true);
        addText(`   ${alert.message}`);
        addText(`   Time: ${new Date(alert.timestamp).toLocaleString()}`);
        addText(`   Status: ${alert.acknowledged ? 'Acknowledged' : 'Active'}`);
        yPosition += 5;
      });
    }

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pdf.internal.pageSize.height - 10);
      pdf.text('AI Automation Hub - Confidential', margin, pdf.internal.pageSize.height - 10);
    }

    // Save the PDF
    pdf.save(filename);
  }

  // Utility method to download blob
  private downloadBlob(content: string | ArrayBuffer, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate comprehensive export data
  generateExportData(
    automations: any[], 
    stats: any, 
    alerts?: any[], 
    userInfo?: any
  ): ExportData {
    // Calculate additional statistics
    const enhancedStats = {
      ...stats,
      avgSuccessRate: this.calculateAverageSuccessRate(automations),
      totalExecutionTime: this.calculateTotalExecutionTime(automations),
      avgCpuUsage: this.calculateAverageCpuUsage(automations),
      avgMemoryUsage: this.calculateAverageMemoryUsage(automations),
      automationsByStatus: this.groupAutomationsByStatus(automations),
      performanceMetrics: this.calculatePerformanceMetrics(automations)
    };

    return {
      automations: automations.map(automation => ({
        ...automation,
        // Ensure consistent data structure
        id: automation.id,
        title: automation.title || automation.name,
        status: automation.status,
        progress: automation.progress || 0,
        timestamp: automation.timestamp || automation.lastRun,
        performance: automation.performance || {},
        error: automation.error || null,
        refreshInterval: automation.refreshInterval || 0,
        category: automation.category || 'General',
        createdAt: automation.createdAt || new Date().toISOString(),
        updatedAt: automation.updatedAt || new Date().toISOString()
      })),
      stats: enhancedStats,
      alerts: alerts || [],
      generatedAt: new Date().toISOString(),
      userInfo
    };
  }

  // Helper calculation methods
  private calculateAverageSuccessRate(automations: any[]): number {
    const rates = automations
      .map(a => a.successRate)
      .filter(rate => rate !== undefined && rate !== null);
    
    return rates.length > 0 ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : 0;
  }

  private calculateTotalExecutionTime(automations: any[]): number {
    return automations.reduce((total, automation) => {
      return total + (automation.performance?.executionTime || 0);
    }, 0);
  }

  private calculateAverageCpuUsage(automations: any[]): number {
    const cpuUsages = automations
      .map(a => a.performance?.cpuUsage)
      .filter(usage => usage !== undefined && usage !== null);
    
    return cpuUsages.length > 0 ? Math.round(cpuUsages.reduce((sum, usage) => sum + usage, 0) / cpuUsages.length) : 0;
  }

  private calculateAverageMemoryUsage(automations: any[]): number {
    const memoryUsages = automations
      .map(a => a.performance?.memoryUsage)
      .filter(usage => usage !== undefined && usage !== null);
    
    return memoryUsages.length > 0 ? Math.round(memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length) : 0;
  }

  private groupAutomationsByStatus(automations: any[]): Record<string, number> {
    return automations.reduce((acc, automation) => {
      const status = automation.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }

  private calculatePerformanceMetrics(automations: any[]) {
    const runningAutomations = automations.filter(a => a.status === 'running');
    const completedAutomations = automations.filter(a => a.status === 'completed');
    const failedAutomations = automations.filter(a => a.status === 'failed');

    return {
      runningCount: runningAutomations.length,
      completedCount: completedAutomations.length,
      failedCount: failedAutomations.length,
      successRate: automations.length > 0 ? Math.round(((completedAutomations.length) / automations.length) * 100) : 0,
      failureRate: automations.length > 0 ? Math.round((failedAutomations.length / automations.length) * 100) : 0
    };
  }

  // Quick export methods
  async quickExportJSON(automations: any[], stats: any): Promise<void> {
    const data = this.generateExportData(automations, stats);
    await this.exportData(data, { format: 'json' });
  }

  async quickExportCSV(automations: any[], stats: any): Promise<void> {
    const data = this.generateExportData(automations, stats);
    await this.exportData(data, { format: 'csv' });
  }

  async quickExportExcel(automations: any[], stats: any, includeAlerts?: any[]): Promise<void> {
    const data = this.generateExportData(automations, stats, includeAlerts);
    await this.exportData(data, { 
      format: 'excel', 
      includeStats: true, 
      includeAlerts: !!includeAlerts 
    });
  }

  async quickExportPDF(automations: any[], stats: any, includeAlerts?: any[]): Promise<void> {
    const data = this.generateExportData(automations, stats, includeAlerts);
    await this.exportData(data, { 
      format: 'pdf', 
      includeStats: true, 
      includeAlerts: !!includeAlerts 
    });
  }
}

// Export singleton instance
export const exportService = new ExportService();
export default exportService;