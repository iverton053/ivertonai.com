import Bull from 'bull';
import { logger } from '../utils/logger';
import CacheService from './cacheService';

export interface JobData {
  userId: string;
  type: string;
  payload: any;
  priority?: number;
  attempts?: number;
  delay?: number;
  metadata?: any;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

export class JobQueueService {
  private static instance: JobQueueService;
  private queues: Map<string, Bull.Queue> = new Map();
  private processors: Map<string, Function> = new Map();
  private redisConfig: any;

  constructor() {
    this.redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_QUEUE_DB || '1'),
    };
  }

  public static getInstance(): JobQueueService {
    if (!JobQueueService.instance) {
      JobQueueService.instance = new JobQueueService();
    }
    return JobQueueService.instance;
  }

  /**
   * Initialize job queue system
   */
  async initialize(): Promise<void> {
    try {
      // Create different queues for different job types
      const queueConfigs = [
        { name: 'email', concurrency: 5 },
        { name: 'data-processing', concurrency: 3 },
        { name: 'analytics', concurrency: 2 },
        { name: 'cleanup', concurrency: 1 },
        { name: 'export', concurrency: 2 },
        { name: 'import', concurrency: 2 },
        { name: 'audit', concurrency: 10 },
        { name: 'notifications', concurrency: 8 },
        { name: 'webhooks', concurrency: 5 }
      ];

      for (const config of queueConfigs) {
        const queue = new Bull(config.name, {
          redis: this.redisConfig,
          defaultJobOptions: {
            removeOnComplete: 100, // Keep last 100 completed jobs
            removeOnFail: 50,      // Keep last 50 failed jobs
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000
            }
          }
        });

        // Set up basic monitoring
        this.setupQueueMonitoring(queue, config.name);

        this.queues.set(config.name, queue);
        logger.info(`Initialized queue: ${config.name}`);
      }

      // Register job processors
      this.registerProcessors();

      logger.info('Job queue system initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize job queue system:', error);
      throw error;
    }
  }

  /**
   * Register job processors
   */
  private registerProcessors(): void {
    // Email processing
    this.registerProcessor('email', 'send-email', this.processSendEmail.bind(this));
    this.registerProcessor('email', 'bulk-email', this.processBulkEmail.bind(this));

    // Data processing
    this.registerProcessor('data-processing', 'contact-enrichment', this.processContactEnrichment.bind(this));
    this.registerProcessor('data-processing', 'lead-scoring', this.processLeadScoring.bind(this));
    this.registerProcessor('data-processing', 'data-cleanup', this.processDataCleanup.bind(this));

    // Analytics
    this.registerProcessor('analytics', 'generate-report', this.processGenerateReport.bind(this));
    this.registerProcessor('analytics', 'update-metrics', this.processUpdateMetrics.bind(this));

    // Export/Import
    this.registerProcessor('export', 'contact-export', this.processContactExport.bind(this));
    this.registerProcessor('import', 'contact-import', this.processContactImport.bind(this));

    // Cleanup
    this.registerProcessor('cleanup', 'audit-cleanup', this.processAuditCleanup.bind(this));
    this.registerProcessor('cleanup', 'cache-cleanup', this.processCacheCleanup.bind(this));

    // Audit logging
    this.registerProcessor('audit', 'log-action', this.processAuditLog.bind(this));

    // Notifications
    this.registerProcessor('notifications', 'send-notification', this.processSendNotification.bind(this));

    // Webhooks
    this.registerProcessor('webhooks', 'send-webhook', this.processSendWebhook.bind(this));
  }

  /**
   * Register a job processor
   */
  private registerProcessor(queueName: string, jobType: string, processor: Function): void {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const processorKey = `${queueName}:${jobType}`;
    this.processors.set(processorKey, processor);

    queue.process(jobType, async (job: Bull.Job) => {
      const startTime = Date.now();
      try {
        logger.debug(`Processing job ${job.id}: ${jobType}`, { data: job.data });

        const result = await processor(job.data);

        const duration = Date.now() - startTime;
        logger.info(`Job completed: ${job.id} (${duration}ms)`, { jobType, result });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Job failed: ${job.id} (${duration}ms)`, { jobType, error });
        throw error;
      }
    });
  }

  /**
   * Add job to queue
   */
  async addJob(
    queueName: string,
    jobType: string,
    data: JobData,
    options: Bull.JobOptions = {}
  ): Promise<Bull.Job> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const jobOptions: Bull.JobOptions = {
      priority: data.priority || 0,
      attempts: data.attempts || 3,
      delay: data.delay || 0,
      ...options
    };

    try {
      const job = await queue.add(jobType, data, jobOptions);
      logger.debug(`Job added: ${job.id} to queue ${queueName}`, { jobType, data });
      return job;
    } catch (error) {
      logger.error(`Failed to add job to queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Schedule recurring job
   */
  async scheduleRecurringJob(
    queueName: string,
    jobType: string,
    data: JobData,
    cronPattern: string
  ): Promise<Bull.Job> {
    return this.addJob(queueName, jobType, data, {
      repeat: { cron: cronPattern },
      removeOnComplete: 10,
      removeOnFail: 5
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName?: string): Promise<any> {
    const stats: any = {};

    const queuesToCheck = queueName ? [queueName] : Array.from(this.queues.keys());

    for (const name of queuesToCheck) {
      const queue = this.queues.get(name);
      if (!queue) continue;

      try {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaiting(),
          queue.getActive(),
          queue.getCompleted(),
          queue.getFailed(),
          queue.getDelayed()
        ]);

        stats[name] = {
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length,
          delayed: delayed.length,
          total: waiting.length + active.length + completed.length + failed.length + delayed.length
        };
      } catch (error) {
        logger.error(`Error getting stats for queue ${name}:`, error);
        stats[name] = { error: error.message };
      }
    }

    return stats;
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName: string, jobId: string): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    try {
      const job = await queue.getJob(jobId);
      if (!job) {
        return null;
      }

      return {
        id: job.id,
        data: job.data,
        opts: job.opts,
        progress: job.progress(),
        delay: job.delay,
        timestamp: job.timestamp,
        attemptsMade: job.attemptsMade,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace
      };
    } catch (error) {
      logger.error(`Error getting job ${jobId} from queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Remove job from queue
   */
  async removeJob(queueName: string, jobId: string): Promise<boolean> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    try {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error removing job ${jobId} from queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.pause();
    logger.info(`Queue ${queueName} paused`);
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.resume();
    logger.info(`Queue ${queueName} resumed`);
  }

  /**
   * Clean up old jobs
   */
  async cleanQueue(queueName: string, olderThan: number = 24 * 60 * 60 * 1000): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    try {
      const results = await queue.clean(olderThan, 'completed', 100);
      const failedResults = await queue.clean(olderThan, 'failed', 100);

      logger.info(`Cleaned queue ${queueName}:`, {
        completed: results.length,
        failed: failedResults.length
      });

      return {
        completed: results.length,
        failed: failedResults.length
      };
    } catch (error) {
      logger.error(`Error cleaning queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Set up queue monitoring
   */
  private setupQueueMonitoring(queue: Bull.Queue, queueName: string): void {
    queue.on('completed', (job: Bull.Job, result: any) => {
      logger.debug(`Job completed in queue ${queueName}:`, {
        jobId: job.id,
        duration: Date.now() - job.timestamp
      });
    });

    queue.on('failed', (job: Bull.Job, err: Error) => {
      logger.error(`Job failed in queue ${queueName}:`, {
        jobId: job.id,
        error: err.message,
        attempts: job.attemptsMade
      });
    });

    queue.on('stalled', (job: Bull.Job) => {
      logger.warn(`Job stalled in queue ${queueName}:`, { jobId: job.id });
    });

    queue.on('error', (error: Error) => {
      logger.error(`Queue error in ${queueName}:`, error);
    });
  }

  /**
   * Shutdown all queues
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down job queues...');

    const shutdownPromises = Array.from(this.queues.values()).map(async (queue) => {
      try {
        await queue.close();
      } catch (error) {
        logger.error('Error closing queue:', error);
      }
    });

    await Promise.all(shutdownPromises);
    this.queues.clear();
    this.processors.clear();

    logger.info('Job queues shut down successfully');
  }

  // ===============================
  // JOB PROCESSORS
  // ===============================

  private async processSendEmail(data: any): Promise<JobResult> {
    // Implement email sending logic
    logger.info('Processing send email job', { to: data.to, subject: data.subject });
    return { success: true, data: { messageId: 'fake-id' } };
  }

  private async processBulkEmail(data: any): Promise<JobResult> {
    // Implement bulk email sending logic
    logger.info('Processing bulk email job', { recipientCount: data.recipients?.length });
    return { success: true, data: { sent: data.recipients?.length || 0 } };
  }

  private async processContactEnrichment(data: any): Promise<JobResult> {
    // Implement contact enrichment logic
    logger.info('Processing contact enrichment job', { contactId: data.contactId });
    return { success: true, data: { enriched: true } };
  }

  private async processLeadScoring(data: any): Promise<JobResult> {
    // Implement lead scoring logic
    logger.info('Processing lead scoring job', { contactId: data.contactId });
    return { success: true, data: { score: Math.floor(Math.random() * 100) } };
  }

  private async processDataCleanup(data: any): Promise<JobResult> {
    // Implement data cleanup logic
    logger.info('Processing data cleanup job', { type: data.cleanupType });
    return { success: true, data: { cleaned: true } };
  }

  private async processGenerateReport(data: any): Promise<JobResult> {
    // Implement report generation logic
    logger.info('Processing generate report job', { reportType: data.reportType });
    return { success: true, data: { reportUrl: '/reports/fake-report.pdf' } };
  }

  private async processUpdateMetrics(data: any): Promise<JobResult> {
    // Implement metrics update logic
    logger.info('Processing update metrics job', { userId: data.userId });
    return { success: true, data: { updated: true } };
  }

  private async processContactExport(data: any): Promise<JobResult> {
    // Implement contact export logic
    logger.info('Processing contact export job', { userId: data.userId, format: data.format });
    return { success: true, data: { exportUrl: '/exports/contacts.csv' } };
  }

  private async processContactImport(data: any): Promise<JobResult> {
    // Implement contact import logic
    logger.info('Processing contact import job', { userId: data.userId, fileUrl: data.fileUrl });
    return { success: true, data: { imported: 100, skipped: 5 } };
  }

  private async processAuditCleanup(data: any): Promise<JobResult> {
    // Implement audit cleanup logic
    logger.info('Processing audit cleanup job');
    return { success: true, data: { deleted: 1000 } };
  }

  private async processCacheCleanup(data: any): Promise<JobResult> {
    // Implement cache cleanup logic
    logger.info('Processing cache cleanup job');
    return { success: true, data: { cleared: true } };
  }

  private async processAuditLog(data: any): Promise<JobResult> {
    // Implement audit logging logic
    logger.info('Processing audit log job', { action: data.action, resourceId: data.resourceId });
    return { success: true, data: { logged: true } };
  }

  private async processSendNotification(data: any): Promise<JobResult> {
    // Implement notification sending logic
    logger.info('Processing send notification job', { userId: data.userId, type: data.type });
    return { success: true, data: { sent: true } };
  }

  private async processSendWebhook(data: any): Promise<JobResult> {
    // Implement webhook sending logic
    logger.info('Processing send webhook job', { url: data.url, event: data.event });
    return { success: true, data: { sent: true, status: 200 } };
  }
}

export default JobQueueService;