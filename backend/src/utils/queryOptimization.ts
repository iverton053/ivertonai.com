import mongoose from 'mongoose';
import { logger } from './logger';

export interface QueryAnalytics {
  executionTimeMs: number;
  documentsExamined: number;
  documentsReturned: number;
  indexUsed: boolean;
  indexName?: string;
  stage: string;
  query: any;
  collection: string;
  timestamp: Date;
}

export class QueryOptimizer {
  private static instance: QueryOptimizer;
  private queryStats: Map<string, QueryAnalytics[]> = new Map();
  private slowQueryThreshold: number = 100; // ms
  private enableProfiling: boolean = false;

  public static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  /**
   * Initialize query profiling
   */
  async initialize(options: {
    enableProfiling?: boolean;
    slowQueryThreshold?: number;
    enableDatabaseProfiling?: boolean;
  } = {}): Promise<void> {
    this.enableProfiling = options.enableProfiling ?? process.env.NODE_ENV === 'development';
    this.slowQueryThreshold = options.slowQueryThreshold ?? 100;

    if (options.enableDatabaseProfiling && this.enableProfiling) {
      try {
        // Enable MongoDB profiling for slow operations
        await mongoose.connection.db.admin().command({
          profile: 2, // Profile all operations
          slowms: this.slowQueryThreshold
        });
        logger.info('MongoDB query profiling enabled');
      } catch (error) {
        logger.warn('Failed to enable MongoDB profiling:', error);
      }
    }

    // Set up mongoose query middleware for profiling
    this.setupQueryMiddleware();
  }

  /**
   * Set up Mongoose query middleware to track performance
   */
  private setupQueryMiddleware(): void {
    if (!this.enableProfiling) return;

    // Track query execution time
    mongoose.plugin((schema, options) => {
      schema.pre(/^find/, function() {
        this._startTime = Date.now();
      });

      schema.post(/^find/, function(result) {
        if (this._startTime) {
          const executionTime = Date.now() - this._startTime;

          if (executionTime > this.slowQueryThreshold) {
            const queryInfo = {
              executionTimeMs: executionTime,
              query: this.getQuery(),
              options: this.getOptions(),
              collection: this.model.collection.name,
              operation: this.op,
              timestamp: new Date()
            };

            logger.warn('Slow query detected:', queryInfo);
            this.recordSlowQuery(queryInfo);
          }
        }
      });
    });
  }

  /**
   * Create optimized aggregation pipelines
   */
  createOptimizedAggregation(pipeline: any[]): any[] {
    const optimized = [...pipeline];

    // Move $match stages as early as possible
    optimized.sort((a, b) => {
      if (a.$match && !b.$match) return -1;
      if (!a.$match && b.$match) return 1;
      if (a.$sort && !b.$sort) return 1;
      if (!a.$sort && b.$sort) return -1;
      return 0;
    });

    // Add $limit after $match to reduce documents processed
    const hasLimit = optimized.some(stage => stage.$limit);
    if (!hasLimit && optimized.some(stage => stage.$match)) {
      const matchIndex = optimized.findIndex(stage => stage.$match);
      if (matchIndex !== -1 && optimized.length > matchIndex + 1) {
        // Add reasonable limit for intermediate stages
        optimized.splice(matchIndex + 1, 0, { $limit: 10000 });
      }
    }

    return optimized;
  }

  /**
   * Optimize query filters
   */
  optimizeQuery(query: any, options: any = {}): { query: any; options: any } {
    const optimizedQuery = { ...query };
    const optimizedOptions = { ...options };

    // Add index hints for complex queries
    if (query.userId && query.$or && !options.hint) {
      optimizedOptions.hint = { userId: 1 };
    }

    // Use lean() for read-only operations
    if (!optimizedOptions.lean && !optimizedOptions.populate) {
      optimizedOptions.lean = true;
    }

    // Optimize text search
    if (query.$text) {
      // Use projection to return only necessary fields for text search
      if (!optimizedOptions.select) {
        optimizedOptions.select = {
          firstName: 1,
          lastName: 1,
          email: 1,
          company: 1,
          score: { $meta: 'textScore' }
        };
      }
      // Sort by text score
      optimizedOptions.sort = { score: { $meta: 'textScore' } };
    }

    // Limit large result sets
    if (!optimizedOptions.limit || optimizedOptions.limit > 1000) {
      optimizedOptions.limit = Math.min(optimizedOptions.limit || 100, 1000);
    }

    return {
      query: optimizedQuery,
      options: optimizedOptions
    };
  }

  /**
   * Create efficient bulk operations
   */
  createBulkOperation(model: any, operations: any[]): any {
    const bulk = model.collection.initializeUnorderedBulkOp();

    // Group operations by type for better performance
    const grouped = operations.reduce((acc, op) => {
      const type = Object.keys(op)[0];
      if (!acc[type]) acc[type] = [];
      acc[type].push(op[type]);
      return acc;
    }, {});

    // Execute operations in optimal order
    const order = ['insertOne', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany'];

    for (const opType of order) {
      if (grouped[opType]) {
        grouped[opType].forEach((op: any) => {
          bulk[opType](op);
        });
      }
    }

    return bulk;
  }

  /**
   * Record slow query for analysis
   */
  private recordSlowQuery(queryInfo: any): void {
    const key = `${queryInfo.collection}_${queryInfo.operation}`;
    if (!this.queryStats.has(key)) {
      this.queryStats.set(key, []);
    }

    const stats = this.queryStats.get(key)!;
    stats.push({
      executionTimeMs: queryInfo.executionTimeMs,
      documentsExamined: queryInfo.docsExamined || 0,
      documentsReturned: queryInfo.docsReturned || 0,
      indexUsed: !!queryInfo.indexUsed,
      indexName: queryInfo.indexName,
      stage: queryInfo.operation,
      query: queryInfo.query,
      collection: queryInfo.collection,
      timestamp: queryInfo.timestamp
    });

    // Keep only recent stats (last 1000 queries per type)
    if (stats.length > 1000) {
      stats.splice(0, stats.length - 1000);
    }
  }

  /**
   * Get query performance statistics
   */
  getQueryStats(): any {
    const summary: any = {};

    this.queryStats.forEach((stats, key) => {
      const recent = stats.slice(-100); // Last 100 queries
      const avgExecTime = recent.reduce((sum, stat) => sum + stat.executionTimeMs, 0) / recent.length;
      const slowQueries = recent.filter(stat => stat.executionTimeMs > this.slowQueryThreshold).length;
      const indexUsage = recent.filter(stat => stat.indexUsed).length / recent.length;

      summary[key] = {
        totalQueries: stats.length,
        recentQueries: recent.length,
        avgExecutionTimeMs: Math.round(avgExecTime),
        slowQueriesCount: slowQueries,
        indexUsageRate: Math.round(indexUsage * 100),
        lastQuery: recent[recent.length - 1]?.timestamp
      };
    });

    return summary;
  }

  /**
   * Get slow query recommendations
   */
  getOptimizationRecommendations(): Array<{
    collection: string;
    issue: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations: any[] = [];

    this.queryStats.forEach((stats, key) => {
      const [collection, operation] = key.split('_');
      const recent = stats.slice(-50);

      // Check average execution time
      const avgTime = recent.reduce((sum, stat) => sum + stat.executionTimeMs, 0) / recent.length;
      if (avgTime > this.slowQueryThreshold * 2) {
        recommendations.push({
          collection,
          issue: `Average query time is ${Math.round(avgTime)}ms`,
          recommendation: 'Consider adding indexes or optimizing query structure',
          priority: 'high'
        });
      }

      // Check index usage
      const indexUsage = recent.filter(stat => stat.indexUsed).length / recent.length;
      if (indexUsage < 0.8) {
        recommendations.push({
          collection,
          issue: `Only ${Math.round(indexUsage * 100)}% of queries use indexes`,
          recommendation: 'Add missing indexes for frequently queried fields',
          priority: 'high'
        });
      }

      // Check for table scans
      const tableScans = recent.filter(stat =>
        stat.documentsExamined > stat.documentsReturned * 10
      ).length;

      if (tableScans > recent.length * 0.3) {
        recommendations.push({
          collection,
          issue: 'High ratio of documents examined vs returned',
          recommendation: 'Queries are scanning too many documents - add selective indexes',
          priority: 'medium'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Analyze MongoDB profiler data
   */
  async analyzeProfilerData(): Promise<any> {
    if (!this.enableProfiling) {
      return { enabled: false };
    }

    try {
      const profilerData = await mongoose.connection.db
        .collection('system.profile')
        .find({ ts: { $gte: new Date(Date.now() - 3600000) } }) // Last hour
        .sort({ ts: -1 })
        .limit(100)
        .toArray();

      const analysis = {
        totalQueries: profilerData.length,
        slowQueries: profilerData.filter(q => q.millis > this.slowQueryThreshold).length,
        avgExecutionTime: profilerData.reduce((sum, q) => sum + (q.millis || 0), 0) / profilerData.length,
        commonSlowOperations: this.analyzeCommonSlowOps(profilerData),
        indexMisses: profilerData.filter(q => q.planSummary && q.planSummary.includes('COLLSCAN')).length
      };

      return analysis;
    } catch (error) {
      logger.error('Error analyzing profiler data:', error);
      return { error: error.message };
    }
  }

  /**
   * Analyze common slow operations
   */
  private analyzeCommonSlowOps(profilerData: any[]): any[] {
    const operations = profilerData
      .filter(q => q.millis > this.slowQueryThreshold)
      .map(q => ({
        collection: q.ns?.split('.')[1] || 'unknown',
        operation: q.op || q.command?.constructor?.name || 'unknown',
        avgTime: q.millis,
        query: q.command
      }));

    // Group by collection + operation
    const grouped = operations.reduce((acc, op) => {
      const key = `${op.collection}_${op.operation}`;
      if (!acc[key]) {
        acc[key] = { collection: op.collection, operation: op.operation, count: 0, totalTime: 0, queries: [] };
      }
      acc[key].count++;
      acc[key].totalTime += op.avgTime;
      acc[key].queries.push(op.query);
      return acc;
    }, {} as any);

    return Object.values(grouped)
      .map((group: any) => ({
        ...group,
        avgTime: Math.round(group.totalTime / group.count)
      }))
      .sort((a: any, b: any) => b.totalTime - a.totalTime)
      .slice(0, 10);
  }

  /**
   * Clear query statistics
   */
  clearStats(): void {
    this.queryStats.clear();
    logger.info('Query statistics cleared');
  }

  /**
   * Explain query plan
   */
  async explainQuery(model: any, query: any, options: any = {}): Promise<any> {
    try {
      const explanation = await model.find(query, null, options).explain('executionStats');

      return {
        indexUsed: explanation.executionStats?.executionSuccess,
        executionTimeMs: explanation.executionStats?.executionTimeMillis,
        documentsExamined: explanation.executionStats?.totalDocsExamined,
        documentsReturned: explanation.executionStats?.totalDocsReturned,
        indexName: explanation.executionStats?.inputStage?.indexName,
        stage: explanation.executionStats?.inputStage?.stage,
        winningPlan: explanation.queryPlanner?.winningPlan
      };
    } catch (error) {
      logger.error('Error explaining query:', error);
      throw error;
    }
  }

  /**
   * Suggest indexes based on query patterns
   */
  suggestIndexes(): Array<{
    collection: string;
    fields: any;
    reason: string;
  }> {
    const suggestions: any[] = [];

    this.queryStats.forEach((stats, key) => {
      const [collection] = key.split('_');
      const recent = stats.slice(-100);
      const lowIndexUsage = recent.filter(stat => !stat.indexUsed);

      if (lowIndexUsage.length > recent.length * 0.3) {
        // Analyze query patterns
        const fieldUsage = new Map<string, number>();

        lowIndexUsage.forEach(stat => {
          if (stat.query) {
            Object.keys(stat.query).forEach(field => {
              fieldUsage.set(field, (fieldUsage.get(field) || 0) + 1);
            });
          }
        });

        // Suggest compound indexes for frequently used field combinations
        const frequentFields = Array.from(fieldUsage.entries())
          .filter(([_, count]) => count > lowIndexUsage.length * 0.2)
          .sort(([_, a], [__, b]) => b - a)
          .slice(0, 3)
          .map(([field, _]) => field);

        if (frequentFields.length > 1) {
          suggestions.push({
            collection,
            fields: frequentFields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {}),
            reason: `Compound index for frequently queried fields: ${frequentFields.join(', ')}`
          });
        } else if (frequentFields.length === 1) {
          suggestions.push({
            collection,
            fields: { [frequentFields[0]]: 1 },
            reason: `Single field index for frequently queried field: ${frequentFields[0]}`
          });
        }
      }
    });

    return suggestions;
  }
}

export default QueryOptimizer;