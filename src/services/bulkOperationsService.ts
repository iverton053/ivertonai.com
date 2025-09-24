import { realTimeService } from './realTimeService';

export type BulkAction = 
  | 'start' 
  | 'stop' 
  | 'pause' 
  | 'refresh' 
  | 'delete' 
  | 'export' 
  | 'archive' 
  | 'duplicate'
  | 'update_schedule'
  | 'change_category';

export interface BulkOperationResult {
  action: BulkAction;
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    automationId: string;
    error: string;
  }>;
  duration: number;
  timestamp: string;
}

export interface BulkOperationOptions {
  action: BulkAction;
  automationIds: string[];
  parameters?: {
    category?: string;
    schedule?: string;
    exportFormat?: 'json' | 'csv' | 'excel' | 'pdf';
    [key: string]: any;
  };
  confirmationRequired?: boolean;
  onProgress?: (completed: number, total: number) => void;
}

class BulkOperationsService {
  private activeOperation: BulkOperationOptions | null = null;
  private operationHistory: BulkOperationResult[] = [];

  async executeBulkOperation(options: BulkOperationOptions): Promise<BulkOperationResult> {
    if (this.activeOperation) {
      throw new Error('Another bulk operation is already in progress');
    }

    const startTime = Date.now();
    this.activeOperation = options;

    const result: BulkOperationResult = {
      action: options.action,
      total: options.automationIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Validate automation IDs
      if (!options.automationIds || options.automationIds.length === 0) {
        throw new Error('No automations selected for bulk operation');
      }

      // Execute the bulk operation
      switch (options.action) {
        case 'start':
          await this.executeBulkStart(options, result);
          break;
        case 'stop':
          await this.executeBulkStop(options, result);
          break;
        case 'pause':
          await this.executeBulkPause(options, result);
          break;
        case 'refresh':
          await this.executeBulkRefresh(options, result);
          break;
        case 'delete':
          await this.executeBulkDelete(options, result);
          break;
        case 'archive':
          await this.executeBulkArchive(options, result);
          break;
        case 'duplicate':
          await this.executeBulkDuplicate(options, result);
          break;
        case 'update_schedule':
          await this.executeBulkUpdateSchedule(options, result);
          break;
        case 'change_category':
          await this.executeBulkChangeCategory(options, result);
          break;
        case 'export':
          await this.executeBulkExport(options, result);
          break;
        default:
          throw new Error(`Unsupported bulk action: ${options.action}`);
      }

    } catch (error) {
      result.errors.push({
        automationId: 'global',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      result.failed = result.total;
    } finally {
      result.duration = Date.now() - startTime;
      this.activeOperation = null;
      this.operationHistory.unshift(result);
      
      // Keep history size manageable (last 100 operations)
      if (this.operationHistory.length > 100) {
        this.operationHistory = this.operationHistory.slice(0, 100);
      }
    }

    return result;
  }

  private async executeBulkStart(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    for (let i = 0; i < options.automationIds.length; i++) {
      const automationId = options.automationIds[i];
      
      try {
        await this.startAutomation(automationId);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          automationId,
          error: error instanceof Error ? error.message : 'Failed to start automation'
        });
      }

      // Report progress
      if (options.onProgress) {
        options.onProgress(i + 1, options.automationIds.length);
      }

      // Small delay to prevent overwhelming the system
      await this.delay(100);
    }
  }

  private async executeBulkStop(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    for (let i = 0; i < options.automationIds.length; i++) {
      const automationId = options.automationIds[i];
      
      try {
        await this.stopAutomation(automationId);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          automationId,
          error: error instanceof Error ? error.message : 'Failed to stop automation'
        });
      }

      if (options.onProgress) {
        options.onProgress(i + 1, options.automationIds.length);
      }

      await this.delay(100);
    }
  }

  private async executeBulkPause(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    for (let i = 0; i < options.automationIds.length; i++) {
      const automationId = options.automationIds[i];
      
      try {
        await this.pauseAutomation(automationId);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          automationId,
          error: error instanceof Error ? error.message : 'Failed to pause automation'
        });
      }

      if (options.onProgress) {
        options.onProgress(i + 1, options.automationIds.length);
      }

      await this.delay(100);
    }
  }

  private async executeBulkRefresh(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    for (let i = 0; i < options.automationIds.length; i++) {
      const automationId = options.automationIds[i];
      
      try {
        await this.refreshAutomation(automationId);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          automationId,
          error: error instanceof Error ? error.message : 'Failed to refresh automation'
        });
      }

      if (options.onProgress) {
        options.onProgress(i + 1, options.automationIds.length);
      }

      await this.delay(200); // Longer delay for refresh operations
    }
  }

  private async executeBulkDelete(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    for (let i = 0; i < options.automationIds.length; i++) {
      const automationId = options.automationIds[i];
      
      try {
        await this.deleteAutomation(automationId);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          automationId,
          error: error instanceof Error ? error.message : 'Failed to delete automation'
        });
      }

      if (options.onProgress) {
        options.onProgress(i + 1, options.automationIds.length);
      }

      await this.delay(150);
    }
  }

  private async executeBulkArchive(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    for (let i = 0; i < options.automationIds.length; i++) {
      const automationId = options.automationIds[i];
      
      try {
        await this.archiveAutomation(automationId);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          automationId,
          error: error instanceof Error ? error.message : 'Failed to archive automation'
        });
      }

      if (options.onProgress) {
        options.onProgress(i + 1, options.automationIds.length);
      }

      await this.delay(100);
    }
  }

  private async executeBulkDuplicate(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    for (let i = 0; i < options.automationIds.length; i++) {
      const automationId = options.automationIds[i];
      
      try {
        await this.duplicateAutomation(automationId);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          automationId,
          error: error instanceof Error ? error.message : 'Failed to duplicate automation'
        });
      }

      if (options.onProgress) {
        options.onProgress(i + 1, options.automationIds.length);
      }

      await this.delay(200);
    }
  }

  private async executeBulkUpdateSchedule(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    const schedule = options.parameters?.schedule;
    if (!schedule) {
      throw new Error('Schedule parameter is required for update_schedule action');
    }

    for (let i = 0; i < options.automationIds.length; i++) {
      const automationId = options.automationIds[i];
      
      try {
        await this.updateAutomationSchedule(automationId, schedule);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          automationId,
          error: error instanceof Error ? error.message : 'Failed to update schedule'
        });
      }

      if (options.onProgress) {
        options.onProgress(i + 1, options.automationIds.length);
      }

      await this.delay(100);
    }
  }

  private async executeBulkChangeCategory(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    const category = options.parameters?.category;
    if (!category) {
      throw new Error('Category parameter is required for change_category action');
    }

    for (let i = 0; i < options.automationIds.length; i++) {
      const automationId = options.automationIds[i];
      
      try {
        await this.changeAutomationCategory(automationId, category);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          automationId,
          error: error instanceof Error ? error.message : 'Failed to change category'
        });
      }

      if (options.onProgress) {
        options.onProgress(i + 1, options.automationIds.length);
      }

      await this.delay(100);
    }
  }

  private async executeBulkExport(options: BulkOperationOptions, result: BulkOperationResult): Promise<void> {
    try {
      // This is handled differently as it's a single operation on multiple automations
      const exportFormat = options.parameters?.exportFormat || 'json';
      await this.exportAutomations(options.automationIds, exportFormat);
      result.successful = options.automationIds.length;
    } catch (error) {
      result.failed = options.automationIds.length;
      result.errors.push({
        automationId: 'bulk_export',
        error: error instanceof Error ? error.message : 'Failed to export automations'
      });
    }

    if (options.onProgress) {
      options.onProgress(1, 1);
    }
  }

  // Individual automation operations (mock implementations)
  private async startAutomation(automationId: string): Promise<void> {
    realTimeService.startAutomation(automationId);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Automation failed to start'));
        }
      }, Math.random() * 1000 + 500);
    });
  }

  private async stopAutomation(automationId: string): Promise<void> {
    realTimeService.stopAutomation(automationId);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.05) { // 95% success rate
          resolve();
        } else {
          reject(new Error('Automation failed to stop'));
        }
      }, Math.random() * 800 + 300);
    });
  }

  private async pauseAutomation(automationId: string): Promise<void> {
    realTimeService.pauseAutomation(automationId);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.05) { // 95% success rate
          resolve();
        } else {
          reject(new Error('Automation failed to pause'));
        }
      }, Math.random() * 600 + 200);
    });
  }

  private async refreshAutomation(automationId: string): Promise<void> {
    realTimeService.refreshAutomation(automationId);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.15) { // 85% success rate (refresh can be flaky)
          resolve();
        } else {
          reject(new Error('Automation failed to refresh'));
        }
      }, Math.random() * 2000 + 1000);
    });
  }

  private async deleteAutomation(automationId: string): Promise<void> {
    // Send command via real-time service
    realTimeService.sendCommand('delete_automation', { automationId });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.08) { // 92% success rate
          resolve();
        } else {
          reject(new Error('Automation failed to delete'));
        }
      }, Math.random() * 1500 + 500);
    });
  }

  private async archiveAutomation(automationId: string): Promise<void> {
    realTimeService.sendCommand('archive_automation', { automationId });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.03) { // 97% success rate
          resolve();
        } else {
          reject(new Error('Automation failed to archive'));
        }
      }, Math.random() * 1000 + 300);
    });
  }

  private async duplicateAutomation(automationId: string): Promise<void> {
    realTimeService.sendCommand('duplicate_automation', { automationId });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.12) { // 88% success rate
          resolve();
        } else {
          reject(new Error('Automation failed to duplicate'));
        }
      }, Math.random() * 2500 + 1000);
    });
  }

  private async updateAutomationSchedule(automationId: string, schedule: string): Promise<void> {
    realTimeService.sendCommand('update_schedule', { automationId, schedule });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.07) { // 93% success rate
          resolve();
        } else {
          reject(new Error('Failed to update automation schedule'));
        }
      }, Math.random() * 1200 + 400);
    });
  }

  private async changeAutomationCategory(automationId: string, category: string): Promise<void> {
    realTimeService.sendCommand('change_category', { automationId, category });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.04) { // 96% success rate
          resolve();
        } else {
          reject(new Error('Failed to change automation category'));
        }
      }, Math.random() * 800 + 200);
    });
  }

  private async exportAutomations(automationIds: string[], format: string): Promise<void> {
    // This would typically integrate with the export service
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.02) { // 98% success rate
          console.log(`Exported ${automationIds.length} automations as ${format}`);
          resolve();
        } else {
          reject(new Error('Export operation failed'));
        }
      }, Math.random() * 3000 + 1000);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  isOperationInProgress(): boolean {
    return this.activeOperation !== null;
  }

  getCurrentOperation(): BulkOperationOptions | null {
    return this.activeOperation;
  }

  getOperationHistory(): BulkOperationResult[] {
    return [...this.operationHistory];
  }

  getLastOperation(): BulkOperationResult | null {
    return this.operationHistory.length > 0 ? this.operationHistory[0] : null;
  }

  cancelCurrentOperation(): void {
    if (this.activeOperation) {
      console.log('Cancelling current bulk operation...');
      this.activeOperation = null;
    }
  }

  // Validation helpers
  validateBulkOperation(options: BulkOperationOptions): { valid: boolean; error?: string } {
    if (!options.automationIds || options.automationIds.length === 0) {
      return { valid: false, error: 'No automations selected' };
    }

    if (options.automationIds.length > 100) {
      return { valid: false, error: 'Too many automations selected (max 100)' };
    }

    switch (options.action) {
      case 'update_schedule':
        if (!options.parameters?.schedule) {
          return { valid: false, error: 'Schedule parameter is required' };
        }
        break;
      case 'change_category':
        if (!options.parameters?.category) {
          return { valid: false, error: 'Category parameter is required' };
        }
        break;
      case 'export':
        const validFormats = ['json', 'csv', 'excel', 'pdf'];
        if (options.parameters?.exportFormat && !validFormats.includes(options.parameters.exportFormat)) {
          return { valid: false, error: 'Invalid export format' };
        }
        break;
    }

    return { valid: true };
  }

  // Statistics
  getOperationStats() {
    const history = this.getOperationHistory();
    const totalOperations = history.length;
    const successfulOperations = history.filter(op => op.failed === 0).length;
    const averageDuration = history.length > 0 
      ? Math.round(history.reduce((sum, op) => sum + op.duration, 0) / history.length)
      : 0;

    const actionCounts = history.reduce((acc, op) => {
      acc[op.action] = (acc[op.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOperations,
      successfulOperations,
      successRate: totalOperations > 0 ? Math.round((successfulOperations / totalOperations) * 100) : 0,
      averageDuration,
      actionCounts,
      isOperationInProgress: this.isOperationInProgress()
    };
  }
}

// Export singleton instance
export const bulkOperationsService = new BulkOperationsService();
export default bulkOperationsService;