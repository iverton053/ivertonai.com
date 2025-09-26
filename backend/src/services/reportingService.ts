import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import Report, { IReport } from '../models/Report';
import ContentItem from '../models/ContentItem';
import Team from '../models/Team';
import AuditLog from '../models/AuditLog';
import { notificationService } from './notificationService';
import { cacheService } from './cacheService';

interface ReportData {
  summary: {
    totalContent: number;
    approvedContent: number;
    rejectedContent: number;
    pendingContent: number;
    averageApprovalTime: number;
    topPerformers: Array<{ name: string; count: number; }>;
    contentByType: Array<{ type: string; count: number; }>;
    contentByPlatform: Array<{ platform: string; count: number; }>;
  };
  trends: {
    dailyContent: Array<{ date: string; count: number; }>;
    approvalRates: Array<{ date: string; approved: number; rejected: number; }>;
    averageApprovalTime: Array<{ date: string; hours: number; }>;
  };
  details: Array<{
    id: string;
    title: string;
    type: string;
    platform: string;
    status: string;
    created_at: string;
    approved_at?: string;
    created_by: string;
    assignees: string[];
  }>;
  charts?: {
    [key: string]: Buffer; // Chart images as buffers
  };
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: any;
  options?: any;
  width?: number;
  height?: number;
}

class ReportingService extends EventEmitter {
  private chartRenderer: ChartJSNodeCanvas;
  private reportsPath: string;
  private templatePath: string;

  constructor() {
    super();

    // Initialize chart renderer
    this.chartRenderer = new ChartJSNodeCanvas({
      width: 800,
      height: 400,
      backgroundColour: 'white'
    });

    // Set up paths
    this.reportsPath = path.join(process.cwd(), 'storage', 'reports');
    this.templatePath = path.join(process.cwd(), 'templates', 'reports');

    // Ensure directories exist
    this.ensureDirectoriesExist();

    console.log('Reporting Service initialized');
  }

  private ensureDirectoriesExist() {
    if (!fs.existsSync(this.reportsPath)) {
      fs.mkdirSync(this.reportsPath, { recursive: true });
    }
    if (!fs.existsSync(this.templatePath)) {
      fs.mkdirSync(this.templatePath, { recursive: true });
    }
  }

  // Main report generation method
  async generateReport(reportId: string): Promise<IReport> {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    try {
      // Update status to generating
      await report.updateStatus('generating');

      const startTime = Date.now();

      // Generate data based on report configuration
      const reportData = await this.generateReportData(report);

      // Generate charts if needed
      if (report.config.includeCharts) {
        reportData.charts = await this.generateCharts(reportData);
      }

      // Generate file based on format
      let filePath: string;
      let fileSize: number;

      switch (report.format) {
        case 'pdf':
          filePath = await this.generatePDFReport(report, reportData);
          break;
        case 'excel':
          filePath = await this.generateExcelReport(report, reportData);
          break;
        case 'csv':
          filePath = await this.generateCSVReport(report, reportData);
          break;
        case 'json':
          filePath = await this.generateJSONReport(report, reportData);
          break;
        default:
          throw new Error(`Unsupported report format: ${report.format}`);
      }

      // Get file size
      const stats = fs.statSync(filePath);
      fileSize = stats.size;

      // Generate download URL
      const fileName = path.basename(filePath);
      const downloadUrl = `/api/reports/${reportId}/download/${fileName}`;

      // Calculate generation time
      const generationTime = Date.now() - startTime;

      // Update report with completion data
      await report.updateStatus('completed', {
        generation_time_ms: generationTime,
        file_path: filePath,
        file_size: fileSize,
        download_url: downloadUrl,
        data: report.config.includeRawData ? reportData : undefined,
        summary: this.generateSummary(reportData)
      });

      // Send notification to requester
      await notificationService.sendNotification({
        userId: report.generated_by,
        type: 'system',
        title: 'Report Generated',
        message: `Your report "${report.name}" has been generated successfully.`,
        data: { reportId, downloadUrl }
      });

      // Send to scheduled recipients if applicable
      if (report.schedule?.enabled && report.schedule.recipients.length > 0) {
        await this.deliverScheduledReport(report);
      }

      this.emit('reportGenerated', { reportId, filePath, downloadUrl });

      return report;

    } catch (error) {
      console.error('Report generation failed:', error);

      await report.updateStatus('failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      // Send error notification
      await notificationService.sendNotification({
        userId: report.generated_by,
        type: 'system',
        title: 'Report Generation Failed',
        message: `Failed to generate report "${report.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { reportId }
      });

      this.emit('reportFailed', { reportId, error: error instanceof Error ? error.message : 'Unknown error' });

      throw error;
    }
  }

  // Data generation methods
  private async generateReportData(report: IReport): Promise<ReportData> {
    const { config } = report;
    const { date_range, filters, metrics } = config;

    // Build base query
    const query: any = {
      created_at: {
        $gte: date_range.start_date,
        $lte: date_range.end_date
      }
    };

    // Apply filters
    if (filters.content_types && filters.content_types.length > 0) {
      query.content_type = { $in: filters.content_types };
    }
    if (filters.platforms && filters.platforms.length > 0) {
      query.platform = { $in: filters.platforms };
    }
    if (filters.statuses && filters.statuses.length > 0) {
      query.status = { $in: filters.statuses };
    }
    if (filters.priorities && filters.priorities.length > 0) {
      query.priority = { $in: filters.priorities };
    }
    if (filters.assignees && filters.assignees.length > 0) {
      query.assignees = { $in: filters.assignees };
    }
    if (filters.campaigns && filters.campaigns.length > 0) {
      query.campaign_id = { $in: filters.campaigns };
    }

    // Get content data
    const contentItems = await ContentItem.find(query).lean();

    // Generate summary metrics
    const summary = await this.generateSummaryMetrics(contentItems, metrics);

    // Generate trend data
    const trends = await this.generateTrendData(contentItems, date_range);

    // Prepare details data
    const details = contentItems.map(item => ({
      id: item._id.toString(),
      title: item.title,
      type: item.content_type,
      platform: item.platform,
      status: item.status,
      created_at: item.created_at.toISOString(),
      approved_at: item.approved_at?.toISOString(),
      created_by: item.created_by,
      assignees: item.assignees || []
    }));

    return { summary, trends, details };
  }

  private async generateSummaryMetrics(contentItems: any[], metrics: string[]): Promise<ReportData['summary']> {
    const totalContent = contentItems.length;
    const approvedContent = contentItems.filter(item => item.status === 'approved').length;
    const rejectedContent = contentItems.filter(item => item.status === 'rejected').length;
    const pendingContent = contentItems.filter(item => ['draft', 'in_review', 'pending_approval'].includes(item.status)).length;

    // Calculate average approval time
    const approvedItems = contentItems.filter(item => item.status === 'approved' && item.approved_at);
    const averageApprovalTime = approvedItems.length > 0
      ? approvedItems.reduce((sum, item) => {
          const diffMs = new Date(item.approved_at).getTime() - new Date(item.created_at).getTime();
          return sum + diffMs;
        }, 0) / approvedItems.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Top performers (by content created)
    const performerCounts = contentItems.reduce((acc, item) => {
      acc[item.created_by] = (acc[item.created_by] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPerformers = Object.entries(performerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => ({ name: userId, count })); // In real app, resolve user names

    // Content by type
    const typeCounts = contentItems.reduce((acc, item) => {
      acc[item.content_type] = (acc[item.content_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const contentByType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    // Content by platform
    const platformCounts = contentItems.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const contentByPlatform = Object.entries(platformCounts).map(([platform, count]) => ({ platform, count }));

    return {
      totalContent,
      approvedContent,
      rejectedContent,
      pendingContent,
      averageApprovalTime,
      topPerformers,
      contentByType,
      contentByPlatform
    };
  }

  private async generateTrendData(contentItems: any[], dateRange: any): Promise<ReportData['trends']> {
    const startDate = new Date(dateRange.start_date);
    const endDate = new Date(dateRange.end_date);

    // Generate daily buckets
    const dailyBuckets: Record<string, any[]> = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyBuckets[dateKey] = [];
    }

    // Distribute content items into daily buckets
    contentItems.forEach(item => {
      const dateKey = new Date(item.created_at).toISOString().split('T')[0];
      if (dailyBuckets[dateKey]) {
        dailyBuckets[dateKey].push(item);
      }
    });

    // Generate trend data
    const dailyContent = Object.entries(dailyBuckets).map(([date, items]) => ({
      date,
      count: items.length
    }));

    const approvalRates = Object.entries(dailyBuckets).map(([date, items]) => ({
      date,
      approved: items.filter(item => item.status === 'approved').length,
      rejected: items.filter(item => item.status === 'rejected').length
    }));

    const averageApprovalTime = Object.entries(dailyBuckets).map(([date, items]) => {
      const approvedItems = items.filter(item => item.status === 'approved' && item.approved_at);
      const avgHours = approvedItems.length > 0
        ? approvedItems.reduce((sum, item) => {
            const diffMs = new Date(item.approved_at).getTime() - new Date(item.created_at).getTime();
            return sum + diffMs;
          }, 0) / approvedItems.length / (1000 * 60 * 60)
        : 0;

      return { date, hours: avgHours };
    });

    return { dailyContent, approvalRates, averageApprovalTime };
  }

  // Chart generation methods
  private async generateCharts(reportData: ReportData): Promise<Record<string, Buffer>> {
    const charts: Record<string, Buffer> = {};

    try {
      // Content by Type Pie Chart
      if (reportData.summary.contentByType.length > 0) {
        const pieConfig: ChartConfig = {
          type: 'pie',
          data: {
            labels: reportData.summary.contentByType.map(item => item.type),
            datasets: [{
              data: reportData.summary.contentByType.map(item => item.count),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Content Distribution by Type'
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        };
        charts['contentByType'] = await this.renderChart(pieConfig);
      }

      // Daily Content Trend Line Chart
      if (reportData.trends.dailyContent.length > 0) {
        const lineConfig: ChartConfig = {
          type: 'line',
          data: {
            labels: reportData.trends.dailyContent.map(item => item.date),
            datasets: [{
              label: 'Content Created',
              data: reportData.trends.dailyContent.map(item => item.count),
              borderColor: '#36A2EB',
              backgroundColor: 'rgba(54, 162, 235, 0.1)',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Daily Content Creation Trend'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        };
        charts['dailyContentTrend'] = await this.renderChart(lineConfig);
      }

      // Approval vs Rejection Bar Chart
      if (reportData.trends.approvalRates.length > 0) {
        const barConfig: ChartConfig = {
          type: 'bar',
          data: {
            labels: reportData.trends.approvalRates.map(item => item.date),
            datasets: [
              {
                label: 'Approved',
                data: reportData.trends.approvalRates.map(item => item.approved),
                backgroundColor: '#4BC0C0'
              },
              {
                label: 'Rejected',
                data: reportData.trends.approvalRates.map(item => item.rejected),
                backgroundColor: '#FF6384'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Daily Approval vs Rejection Rates'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        };
        charts['approvalRates'] = await this.renderChart(barConfig);
      }

      // Platform Distribution Doughnut Chart
      if (reportData.summary.contentByPlatform.length > 0) {
        const doughnutConfig: ChartConfig = {
          type: 'doughnut',
          data: {
            labels: reportData.summary.contentByPlatform.map(item => item.platform),
            datasets: [{
              data: reportData.summary.contentByPlatform.map(item => item.count),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Content Distribution by Platform'
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        };
        charts['contentByPlatform'] = await this.renderChart(doughnutConfig);
      }

    } catch (error) {
      console.error('Chart generation error:', error);
    }

    return charts;
  }

  private async renderChart(config: ChartConfig): Promise<Buffer> {
    const configuration = {
      type: config.type,
      data: config.data,
      options: config.options || {}
    };

    return await this.chartRenderer.renderToBuffer(configuration);
  }

  // File generation methods
  private async generatePDFReport(report: IReport, data: ReportData): Promise<string> {
    const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsPath, fileName);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(24).text(report.name, 50, 50);
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 90);
    doc.fontSize(12).text(`Report Period: ${new Date(report.config.date_range.start_date).toLocaleDateString()} - ${new Date(report.config.date_range.end_date).toLocaleDateString()}`, 50, 110);

    // Summary Section
    doc.fontSize(18).text('Summary', 50, 150);
    doc.fontSize(12);
    let yPos = 180;

    const summaryData = [
      ['Total Content', data.summary.totalContent],
      ['Approved Content', data.summary.approvedContent],
      ['Rejected Content', data.summary.rejectedContent],
      ['Pending Content', data.summary.pendingContent],
      ['Average Approval Time', `${data.summary.averageApprovalTime.toFixed(1)} hours`]
    ];

    summaryData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 50, yPos);
      yPos += 20;
    });

    // Charts Section
    if (data.charts && Object.keys(data.charts).length > 0) {
      doc.addPage();
      doc.fontSize(18).text('Analytics', 50, 50);
      yPos = 80;

      for (const [chartName, chartBuffer] of Object.entries(data.charts)) {
        if (yPos > 600) {
          doc.addPage();
          yPos = 50;
        }

        try {
          doc.image(chartBuffer, 50, yPos, { width: 500 });
          yPos += 300;
        } catch (error) {
          console.error(`Error adding chart ${chartName} to PDF:`, error);
        }
      }
    }

    // Top Performers Section
    if (data.summary.topPerformers.length > 0) {
      doc.addPage();
      doc.fontSize(18).text('Top Performers', 50, 50);
      yPos = 80;

      data.summary.topPerformers.forEach((performer, index) => {
        doc.fontSize(12).text(`${index + 1}. ${performer.name}: ${performer.count} content items`, 50, yPos);
        yPos += 20;
      });
    }

    // Details Section (if requested)
    if (report.config.includeTables && data.details.length > 0) {
      doc.addPage();
      doc.fontSize(18).text('Content Details', 50, 50);

      // Table headers
      const headers = ['Title', 'Type', 'Platform', 'Status', 'Created'];
      const colWidths = [150, 80, 80, 80, 100];
      let startX = 50;
      yPos = 80;

      doc.fontSize(10);
      headers.forEach((header, i) => {
        doc.text(header, startX, yPos, { width: colWidths[i] });
        startX += colWidths[i];
      });

      yPos += 20;
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
      yPos += 10;

      // Table data
      data.details.slice(0, 50).forEach((item) => { // Limit to first 50 items
        if (yPos > 750) {
          doc.addPage();
          yPos = 50;
        }

        startX = 50;
        const rowData = [
          item.title.substring(0, 25),
          item.type,
          item.platform,
          item.status,
          new Date(item.created_at).toLocaleDateString()
        ];

        rowData.forEach((data, i) => {
          doc.text(data, startX, yPos, { width: colWidths[i] });
          startX += colWidths[i];
        });

        yPos += 15;
      });
    }

    doc.end();

    return filePath;
  }

  private async generateExcelReport(report: IReport, data: ReportData): Promise<string> {
    const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
    const filePath = path.join(this.reportsPath, fileName);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Content Approval System';
    workbook.created = new Date();

    // Summary Worksheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 15 }
    ];

    const summaryRows = [
      { metric: 'Report Name', value: report.name },
      { metric: 'Generated On', value: new Date().toLocaleDateString() },
      { metric: 'Period Start', value: new Date(report.config.date_range.start_date).toLocaleDateString() },
      { metric: 'Period End', value: new Date(report.config.date_range.end_date).toLocaleDateString() },
      { metric: '', value: '' }, // Empty row
      { metric: 'Total Content', value: data.summary.totalContent },
      { metric: 'Approved Content', value: data.summary.approvedContent },
      { metric: 'Rejected Content', value: data.summary.rejectedContent },
      { metric: 'Pending Content', value: data.summary.pendingContent },
      { metric: 'Average Approval Time (hours)', value: data.summary.averageApprovalTime.toFixed(1) }
    ];

    summarySheet.addRows(summaryRows);

    // Style the header row
    summarySheet.getRow(6).font = { bold: true };
    summarySheet.getRow(1).font = { bold: true };

    // Content Details Worksheet
    if (report.config.includeTables && data.details.length > 0) {
      const detailsSheet = workbook.addWorksheet('Content Details');
      detailsSheet.columns = [
        { header: 'ID', key: 'id', width: 25 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Platform', key: 'platform', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Created At', key: 'created_at', width: 20 },
        { header: 'Approved At', key: 'approved_at', width: 20 },
        { header: 'Created By', key: 'created_by', width: 25 }
      ];

      detailsSheet.addRows(data.details);

      // Style the header row
      detailsSheet.getRow(1).font = { bold: true };
      detailsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }

    // Content by Type Worksheet
    if (data.summary.contentByType.length > 0) {
      const typeSheet = workbook.addWorksheet('Content by Type');
      typeSheet.columns = [
        { header: 'Content Type', key: 'type', width: 20 },
        { header: 'Count', key: 'count', width: 10 }
      ];

      typeSheet.addRows(data.summary.contentByType);
      typeSheet.getRow(1).font = { bold: true };
    }

    // Content by Platform Worksheet
    if (data.summary.contentByPlatform.length > 0) {
      const platformSheet = workbook.addWorksheet('Content by Platform');
      platformSheet.columns = [
        { header: 'Platform', key: 'platform', width: 20 },
        { header: 'Count', key: 'count', width: 10 }
      ];

      platformSheet.addRows(data.summary.contentByPlatform);
      platformSheet.getRow(1).font = { bold: true };
    }

    // Trends Worksheet
    if (data.trends.dailyContent.length > 0) {
      const trendsSheet = workbook.addWorksheet('Daily Trends');
      trendsSheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Content Created', key: 'created', width: 15 },
        { header: 'Approved', key: 'approved', width: 15 },
        { header: 'Rejected', key: 'rejected', width: 15 },
        { header: 'Avg Approval Time (hrs)', key: 'approval_time', width: 20 }
      ];

      const trendsData = data.trends.dailyContent.map(item => {
        const approvals = data.trends.approvalRates.find(a => a.date === item.date);
        const avgTime = data.trends.averageApprovalTime.find(a => a.date === item.date);

        return {
          date: item.date,
          created: item.count,
          approved: approvals?.approved || 0,
          rejected: approvals?.rejected || 0,
          approval_time: avgTime?.hours.toFixed(1) || 0
        };
      });

      trendsSheet.addRows(trendsData);
      trendsSheet.getRow(1).font = { bold: true };
    }

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  private async generateCSVReport(report: IReport, data: ReportData): Promise<string> {
    const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;
    const filePath = path.join(this.reportsPath, fileName);

    const csvRows: string[] = [];

    // Header
    csvRows.push(`Report Name,${report.name}`);
    csvRows.push(`Generated On,${new Date().toLocaleDateString()}`);
    csvRows.push(`Period,${new Date(report.config.date_range.start_date).toLocaleDateString()} - ${new Date(report.config.date_range.end_date).toLocaleDateString()}`);
    csvRows.push('');

    // Summary
    csvRows.push('SUMMARY');
    csvRows.push('Metric,Value');
    csvRows.push(`Total Content,${data.summary.totalContent}`);
    csvRows.push(`Approved Content,${data.summary.approvedContent}`);
    csvRows.push(`Rejected Content,${data.summary.rejectedContent}`);
    csvRows.push(`Pending Content,${data.summary.pendingContent}`);
    csvRows.push(`Average Approval Time (hours),${data.summary.averageApprovalTime.toFixed(1)}`);
    csvRows.push('');

    // Content Details
    if (report.config.includeTables && data.details.length > 0) {
      csvRows.push('CONTENT DETAILS');
      csvRows.push('ID,Title,Type,Platform,Status,Created At,Approved At,Created By');

      data.details.forEach(item => {
        const row = [
          item.id,
          `"${item.title.replace(/"/g, '""')}"`, // Escape quotes
          item.type,
          item.platform,
          item.status,
          item.created_at,
          item.approved_at || '',
          item.created_by
        ];
        csvRows.push(row.join(','));
      });
    }

    const csvContent = csvRows.join('\n');
    fs.writeFileSync(filePath, csvContent, 'utf8');

    return filePath;
  }

  private async generateJSONReport(report: IReport, data: ReportData): Promise<string> {
    const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
    const filePath = path.join(this.reportsPath, fileName);

    const jsonReport = {
      metadata: {
        reportId: report.id,
        name: report.name,
        type: report.type,
        generatedAt: new Date().toISOString(),
        generatedBy: report.generated_by,
        period: {
          start: report.config.date_range.start_date,
          end: report.config.date_range.end_date
        },
        filters: report.config.filters,
        metrics: report.config.metrics
      },
      data
    };

    fs.writeFileSync(filePath, JSON.stringify(jsonReport, null, 2), 'utf8');
    return filePath;
  }

  // Utility methods
  private generateSummary(data: ReportData): any {
    return {
      total_records: data.details.length,
      key_metrics: {
        total_content: data.summary.totalContent,
        approval_rate: data.summary.totalContent > 0
          ? ((data.summary.approvedContent / data.summary.totalContent) * 100).toFixed(1) + '%'
          : '0%',
        avg_approval_time: data.summary.averageApprovalTime.toFixed(1) + ' hours',
        top_content_type: data.summary.contentByType.length > 0
          ? data.summary.contentByType.reduce((a, b) => a.count > b.count ? a : b).type
          : 'N/A'
      },
      insights: this.generateInsights(data),
      recommendations: this.generateRecommendations(data)
    };
  }

  private generateInsights(data: ReportData): string[] {
    const insights: string[] = [];

    // Approval rate insight
    if (data.summary.totalContent > 0) {
      const approvalRate = (data.summary.approvedContent / data.summary.totalContent) * 100;
      if (approvalRate > 80) {
        insights.push(`High approval rate of ${approvalRate.toFixed(1)}% indicates strong content quality.`);
      } else if (approvalRate < 60) {
        insights.push(`Low approval rate of ${approvalRate.toFixed(1)}% may indicate content quality issues.`);
      }
    }

    // Performance insight
    if (data.summary.topPerformers.length > 0) {
      const topPerformer = data.summary.topPerformers[0];
      insights.push(`${topPerformer.name} is the top content creator with ${topPerformer.count} items.`);
    }

    // Platform insight
    if (data.summary.contentByPlatform.length > 0) {
      const topPlatform = data.summary.contentByPlatform.reduce((a, b) => a.count > b.count ? a : b);
      insights.push(`${topPlatform.platform} is the most used platform with ${topPlatform.count} content items.`);
    }

    return insights;
  }

  private generateRecommendations(data: ReportData): string[] {
    const recommendations: string[] = [];

    // Approval time recommendation
    if (data.summary.averageApprovalTime > 48) {
      recommendations.push('Consider streamlining the approval process to reduce average approval time.');
    }

    // Content distribution recommendation
    if (data.summary.contentByType.length > 0) {
      const totalContent = data.summary.contentByType.reduce((sum, item) => sum + item.count, 0);
      const dominant = data.summary.contentByType.find(item => (item.count / totalContent) > 0.7);
      if (dominant) {
        recommendations.push(`Consider diversifying content types beyond ${dominant.type}.`);
      }
    }

    return recommendations;
  }

  // Scheduled report delivery
  private async deliverScheduledReport(report: IReport) {
    if (!report.schedule?.recipients || report.schedule.recipients.length === 0) return;

    const { delivery_method, recipients } = report.schedule;

    for (const recipientId of recipients) {
      if (delivery_method === 'email' || delivery_method === 'both') {
        await notificationService.sendNotification({
          userId: recipientId,
          type: 'system',
          title: `Scheduled Report: ${report.name}`,
          message: `Your scheduled report "${report.name}" is ready for download.`,
          templateId: 'scheduled_report',
          templateVariables: {
            reportName: report.name,
            downloadUrl: report.download_url
          }
        });
      }
    }
  }

  // Scheduled report processing
  async processScheduledReports(): Promise<void> {
    try {
      const scheduledReports = await Report.findScheduledReports();

      for (const report of scheduledReports) {
        try {
          await this.generateReport(report._id.toString());

          // Schedule next run
          await report.scheduleNext();
        } catch (error) {
          console.error(`Failed to generate scheduled report ${report._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to process scheduled reports:', error);
    }
  }

  // Public utility methods
  async getReportFile(reportId: string): Promise<string | null> {
    const report = await Report.findById(reportId);
    return report?.file_path || null;
  }

  async deleteReportFile(reportId: string): Promise<void> {
    const report = await Report.findById(reportId);
    if (report?.file_path && fs.existsSync(report.file_path)) {
      fs.unlinkSync(report.file_path);
    }
  }

  // Cleanup methods
  async cleanupExpiredReports(): Promise<void> {
    try {
      // Find expired reports
      const expiredReports = await Report.find({
        expires_at: { $lt: new Date() },
        status: 'completed'
      });

      for (const report of expiredReports) {
        // Delete file
        if (report.file_path && fs.existsSync(report.file_path)) {
          fs.unlinkSync(report.file_path);
        }

        // Delete record
        await report.deleteOne();
      }

      console.log(`Cleaned up ${expiredReports.length} expired reports`);
    } catch (error) {
      console.error('Failed to cleanup expired reports:', error);
    }
  }
}

export const reportingService = new ReportingService();
export default reportingService;