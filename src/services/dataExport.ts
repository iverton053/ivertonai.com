import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { 
  DataExportOptions, 
  TimeSeriesData, 
  AnalyticsMetric, 
  GeneratedReport,
  HistoryEntry 
} from '../types';
import { dataTrackingService } from './dataTracking';

export class DataExportService {
  /**
   * Export data in the specified format
   */
  async exportData(
    options: DataExportOptions,
    data?: {
      timeSeries?: TimeSeriesData[];
      metrics?: AnalyticsMetric[];
      history?: HistoryEntry[];
    }
  ): Promise<void> {
    const exportData = data || await this.gatherExportData(options);
    const filename = options.filename || this.generateFilename(options.format);

    switch (options.format) {
      case 'csv':
        await this.exportCSV(exportData, filename);
        break;
      case 'json':
        await this.exportJSON(exportData, filename);
        break;
      case 'pdf':
        await this.exportPDF(exportData, filename, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export data as CSV
   */
  private async exportCSV(data: any, filename: string): Promise<void> {
    const csvData = this.prepareCSVData(data);
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  /**
   * Export data as JSON
   */
  private async exportJSON(data: any, filename: string): Promise<void> {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    saveAs(blob, filename);
  }

  /**
   * Export data as PDF report
   */
  private async exportPDF(
    data: any, 
    filename: string, 
    options: DataExportOptions
  ): Promise<void> {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.text('Dashboard Analytics Report', 20, yPosition);
    yPosition += 20;

    // Add date range
    pdf.setFontSize(12);
    pdf.text(
      `Date Range: ${format(new Date(options.dateRange.start), 'MMM dd, yyyy')} - ${format(new Date(options.dateRange.end), 'MMM dd, yyyy')}`,
      20,
      yPosition
    );
    yPosition += 15;

    // Add metrics summary
    if (data.metrics && data.metrics.length > 0) {
      pdf.setFontSize(16);
      pdf.text('Key Metrics', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      data.metrics.forEach((metric: AnalyticsMetric) => {
        pdf.text(`${metric.name}: ${metric.value} ${metric.unit || ''}`, 25, yPosition);
        if (metric.change !== undefined) {
          const changeText = `${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}%`;
          pdf.text(changeText, 120, yPosition);
        }
        yPosition += 8;

        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    }

    // Add charts if requested
    if (options.includeCharts && data.timeSeries) {
      await this.addChartsToPDF(pdf, data.timeSeries, yPosition);
    }

    // Add data tables
    if (data.timeSeries && data.timeSeries.length > 0) {
      this.addDataTablesToPDF(pdf, data.timeSeries, yPosition);
    }

    // Save PDF
    pdf.save(filename);
  }

  /**
   * Generate report from template
   */
  async generateReport(
    templateId: string,
    data: any,
    format: 'pdf' | 'html' = 'pdf'
  ): Promise<GeneratedReport> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filename = `report_${templateId}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.${format}`;
    
    let filePath: string;
    let size: number;

    if (format === 'pdf') {
      filePath = await this.generatePDFReport(templateId, data, filename);
      size = await this.getFileSize(filePath);
    } else {
      filePath = await this.generateHTMLReport(templateId, data, filename);
      size = await this.getFileSize(filePath);
    }

    return {
      id: reportId,
      configId: templateId,
      name: filename,
      format,
      filePath,
      size,
      generatedAt: Date.now(),
      downloadCount: 0,
      metadata: {
        template: templateId,
        dataPoints: this.countDataPoints(data)
      }
    };
  }

  /**
   * Capture dashboard screenshot for reports
   */
  async captureScreenshot(elementId: string): Promise<string> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#1a1a2e',
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * Export widget configuration
   */
  exportWidgetConfig(widgetId: string, format: 'json' | 'csv' = 'json'): void {
    // This would export widget configuration and data
    const widgetData = this.getWidgetData(widgetId);
    const filename = `widget_${widgetId}_config.${format}`;

    if (format === 'json') {
      const jsonString = JSON.stringify(widgetData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      saveAs(blob, filename);
    } else {
      const csvData = this.flattenObjectForCSV(widgetData);
      const csv = Papa.unparse([csvData]);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);
    }
  }

  // Private helper methods

  private async gatherExportData(options: DataExportOptions): Promise<any> {
    const data: any = {
      metadata: {
        exportedAt: new Date().toISOString(),
        dateRange: {
          start: format(new Date(options.dateRange.start), 'yyyy-MM-dd HH:mm:ss'),
          end: format(new Date(options.dateRange.end), 'yyyy-MM-dd HH:mm:ss')
        },
        metrics: options.metrics || []
      }
    };

    // Get time series data
    if (options.metrics) {
      data.timeSeries = [];
      for (const metric of options.metrics) {
        const timeSeriesData = dataTrackingService.getTimeSeriesData(
          metric,
          options.dateRange,
          'day'
        );
        data.timeSeries.push(timeSeriesData);
      }
    }

    // Get analytics metrics
    data.metrics = dataTrackingService.getAnalyticsMetrics(options.dateRange);

    // Get session analytics
    data.sessionAnalytics = dataTrackingService.getCurrentSessionAnalytics();

    return data;
  }

  private prepareCSVData(data: any): any[] {
    const csvData: any[] = [];

    // Add metrics data
    if (data.metrics) {
      csvData.push(['Metric', 'Value', 'Previous Value', 'Change (%)', 'Unit', 'Timestamp']);
      data.metrics.forEach((metric: AnalyticsMetric) => {
        csvData.push([
          metric.name,
          metric.value,
          metric.previousValue || '',
          metric.change || '',
          metric.unit || '',
          format(new Date(metric.timestamp), 'yyyy-MM-dd HH:mm:ss')
        ]);
      });
      csvData.push([]); // Empty row separator
    }

    // Add time series data
    if (data.timeSeries) {
      data.timeSeries.forEach((series: TimeSeriesData) => {
        csvData.push([`Time Series: ${series.metric}`]);
        csvData.push(['Timestamp', 'Value', 'Metadata']);
        series.data.forEach(point => {
          csvData.push([
            format(new Date(point.timestamp), 'yyyy-MM-dd HH:mm:ss'),
            point.value,
            point.metadata ? JSON.stringify(point.metadata) : ''
          ]);
        });
        csvData.push([]); // Empty row separator
      });
    }

    return csvData;
  }

  private generateFilename(format: string): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    return `dashboard_export_${timestamp}.${format}`;
  }

  private async addChartsToPDF(pdf: jsPDF, timeSeries: TimeSeriesData[], startY: number): Promise<void> {
    // This would capture chart images and add them to the PDF
    // For now, we'll add a placeholder
    pdf.setFontSize(16);
    pdf.text('Charts', 20, startY + 20);
    pdf.setFontSize(10);
    pdf.text('Chart visualizations would appear here in the full implementation', 20, startY + 35);
  }

  private addDataTablesToPDF(pdf: jsPDF, timeSeries: TimeSeriesData[], startY: number): void {
    let yPos = startY + 60;
    
    timeSeries.forEach((series, index) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(14);
      pdf.text(`Data Table: ${series.metric}`, 20, yPos);
      yPos += 15;

      pdf.setFontSize(8);
      
      // Add table headers
      pdf.text('Timestamp', 20, yPos);
      pdf.text('Value', 80, yPos);
      pdf.text('Metadata', 120, yPos);
      yPos += 10;

      // Add data rows (limit to prevent PDF bloat)
      const limitedData = series.data.slice(0, 20);
      limitedData.forEach(point => {
        pdf.text(format(new Date(point.timestamp), 'MM/dd HH:mm'), 20, yPos);
        pdf.text(point.value.toString(), 80, yPos);
        pdf.text(point.metadata ? JSON.stringify(point.metadata).substring(0, 30) + '...' : '', 120, yPos);
        yPos += 8;

        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
      });

      yPos += 15;
    });
  }

  private async generatePDFReport(templateId: string, data: any, filename: string): Promise<string> {
    // In a real implementation, this would use template engines
    const pdf = new jsPDF();
    
    pdf.setFontSize(20);
    pdf.text(`Report: ${templateId}`, 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Generated: ${format(new Date(), 'PPP')}`, 20, 40);
    
    // Add data summary
    pdf.text(`Data Points: ${this.countDataPoints(data)}`, 20, 60);
    
    pdf.save(filename);
    
    // Return file path (in a real app, this would be the actual path)
    return `reports/${filename}`;
  }

  private async generateHTMLReport(templateId: string, data: any, filename: string): Promise<string> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dashboard Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
          .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dashboard Report: ${templateId}</h1>
          <p>Generated: ${format(new Date(), 'PPP')}</p>
        </div>
        <div class="content">
          <h2>Summary</h2>
          <p>Data Points: ${this.countDataPoints(data)}</p>
          <!-- Data would be rendered here -->
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    saveAs(blob, filename);
    
    return `reports/${filename}`;
  }

  private async getFileSize(filePath: string): Promise<number> {
    // In a real implementation, this would get actual file size
    return Math.floor(Math.random() * 1000000) + 50000; // Mock size
  }

  private countDataPoints(data: any): number {
    let count = 0;
    if (data.metrics) count += data.metrics.length;
    if (data.timeSeries) {
      data.timeSeries.forEach((series: TimeSeriesData) => {
        count += series.data.length;
      });
    }
    return count;
  }

  private getWidgetData(widgetId: string): any {
    // This would get actual widget data from stores
    return {
      id: widgetId,
      type: 'stats',
      data: { mockData: 'Widget configuration would be here' },
      exportedAt: new Date().toISOString()
    };
  }

  private flattenObjectForCSV(obj: any, prefix: string = ''): any {
    const flattened: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObjectForCSV(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }
}

// Singleton instance
export const dataExportService = new DataExportService();