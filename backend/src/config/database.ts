import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected: boolean = false;

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database connection with optimized settings
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      const config = this.getDatabaseConfig();

      // Set up connection event handlers
      this.setupConnectionHandlers();

      // Connect to MongoDB
      await mongoose.connect(config.uri, config.options);

      this.isConnected = true;
      logger.info('Database connected successfully with optimized connection pooling');

      // Log connection pool stats periodically
      this.startConnectionMonitoring();

    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Get optimized database configuration
   */
  private getDatabaseConfig(): DatabaseConfig {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-dashboard';

    // Production-optimized connection options
    const options: mongoose.ConnectOptions = {
      // Connection Pool Settings
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '20'), // Maximum number of connections
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5'),  // Minimum number of connections
      maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME || '30000'), // 30 seconds

      // Server Selection Settings
      serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT || '10000'), // 10 seconds
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'), // 45 seconds
      connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000'), // 30 seconds

      // Monitoring and Heartbeat
      heartbeatFrequencyMS: parseInt(process.env.DB_HEARTBEAT_FREQUENCY || '10000'), // 10 seconds

      // Write Concern
      writeConcern: {
        w: process.env.DB_WRITE_CONCERN || 'majority',
        j: process.env.DB_JOURNAL === 'true', // Journal writes
        wtimeout: parseInt(process.env.DB_WRITE_TIMEOUT || '5000') // 5 seconds
      },

      // Read Preference
      readPreference: (process.env.DB_READ_PREFERENCE as any) || 'primary',

      // Buffer Settings
      bufferMaxEntries: parseInt(process.env.DB_BUFFER_MAX_ENTRIES || '0'), // Disable buffering in production
      bufferCommands: process.env.DB_BUFFER_COMMANDS !== 'false',

      // Compression (if supported by MongoDB version)
      compressors: process.env.DB_COMPRESSORS?.split(',') || ['snappy', 'zlib'],

      // Authentication (if needed)
      authSource: process.env.DB_AUTH_SOURCE || 'admin',

      // SSL/TLS Settings (for production)
      tls: process.env.DB_TLS === 'true',
      tlsInsecure: process.env.DB_TLS_INSECURE === 'true',

      // Retry Settings
      retryWrites: process.env.DB_RETRY_WRITES !== 'false',
      retryReads: process.env.DB_RETRY_READS !== 'false',
      maxStalenessSeconds: parseInt(process.env.DB_MAX_STALENESS_SECONDS || '90'),

      // Additional Performance Settings
      directConnection: process.env.DB_DIRECT_CONNECTION === 'true',
      localThresholdMS: parseInt(process.env.DB_LOCAL_THRESHOLD_MS || '15'), // 15ms

      // Family preference for dual-stack systems
      family: parseInt(process.env.DB_IP_FAMILY || '0') as 0 | 4 | 6, // 0 = auto, 4 = IPv4, 6 = IPv6
    };

    return { uri, options };
  }

  /**
   * Set up connection event handlers
   */
  private setupConnectionHandlers(): void {
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('close', () => {
      logger.info('Mongoose connection closed');
      this.isConnected = false;
    });

    mongoose.connection.on('fullsetup', () => {
      logger.info('Mongoose connected to replica set');
    });

    mongoose.connection.on('all', () => {
      logger.info('Mongoose connected to all replica set members');
    });

    // Handle process termination gracefully
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGUSR2', this.gracefulShutdown.bind(this)); // For nodemon
  }

  /**
   * Start monitoring connection pool statistics
   */
  private startConnectionMonitoring(): void {
    // Log connection stats every 5 minutes
    const monitoringInterval = parseInt(process.env.DB_MONITORING_INTERVAL || '300000'); // 5 minutes

    if (monitoringInterval > 0) {
      setInterval(() => {
        this.logConnectionStats();
      }, monitoringInterval);
    }
  }

  /**
   * Log current connection statistics
   */
  private logConnectionStats(): void {
    try {
      const db = mongoose.connection.db;
      if (db && this.isConnected) {
        // Get server status for connection pool info
        db.admin().serverStatus((err: any, result: any) => {
          if (!err && result) {
            const connections = result.connections || {};
            const network = result.network || {};

            logger.info('Database connection stats:', {
              current: connections.current || 0,
              available: connections.available || 0,
              totalCreated: connections.totalCreated || 0,
              active: connections.active || 0,
              networkBytesIn: network.bytesIn || 0,
              networkBytesOut: network.bytesOut || 0,
              networkRequests: network.numRequests || 0
            });
          }
        });
      }
    } catch (error) {
      logger.debug('Could not retrieve connection stats:', error.message);
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    readyState: number;
    host?: string;
    port?: number;
    name?: string;
  } {
    const connection = mongoose.connection;
    return {
      connected: this.isConnected && connection.readyState === 1,
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name
    };
  }

  /**
   * Get database health information
   */
  async getHealthInfo(): Promise<any> {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          connected: false
        };
      }

      const db = mongoose.connection.db;

      // Ping database
      const pingStart = Date.now();
      await db.admin().ping();
      const pingTime = Date.now() - pingStart;

      // Get server status
      const serverStatus = await db.admin().serverStatus();

      return {
        status: 'healthy',
        connected: true,
        pingTime,
        version: serverStatus.version,
        connections: serverStatus.connections,
        uptime: serverStatus.uptime,
        memory: serverStatus.mem,
        network: {
          bytesIn: serverStatus.network?.bytesIn || 0,
          bytesOut: serverStatus.network?.bytesOut || 0,
          numRequests: serverStatus.network?.numRequests || 0
        },
        repl: serverStatus.repl,
        sharding: serverStatus.sharding
      };
    } catch (error) {
      logger.error('Error getting database health info:', error);
      return {
        status: 'error',
        connected: this.isConnected,
        error: error.message
      };
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<any> {
    try {
      if (!this.isConnected) {
        return { error: 'Not connected to database' };
      }

      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const stats: any = {};

      for (const collection of collections) {
        try {
          const collStats = await db.collection(collection.name).stats();
          stats[collection.name] = {
            documents: collStats.count || 0,
            avgObjSize: collStats.avgObjSize || 0,
            dataSize: collStats.size || 0,
            storageSize: collStats.storageSize || 0,
            indexes: collStats.nindexes || 0,
            indexSize: collStats.totalIndexSize || 0
          };
        } catch (error) {
          stats[collection.name] = { error: error.message };
        }
      }

      return stats;
    } catch (error) {
      logger.error('Error getting collection stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Optimize database connections
   */
  async optimize(): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      logger.info('Running database optimizations...');

      // Update connection pool settings dynamically if needed
      const currentLoad = await this.getCurrentLoad();

      if (currentLoad.highLoad) {
        logger.info('High load detected, suggesting connection pool adjustments');
        // In a real implementation, you might adjust pool size dynamically
        // This would require reconnection in MongoDB/Mongoose
      }

      // Analyze and suggest index optimizations
      const indexSuggestions = await this.analyzeIndexes();
      if (indexSuggestions.length > 0) {
        logger.info('Index optimization suggestions:', indexSuggestions);
      }

      logger.info('Database optimization completed');
    } catch (error) {
      logger.error('Error during database optimization:', error);
      throw error;
    }
  }

  /**
   * Analyze current database load
   */
  private async getCurrentLoad(): Promise<{ highLoad: boolean; metrics: any }> {
    try {
      const db = mongoose.connection.db;
      const serverStatus = await db.admin().serverStatus();

      const connections = serverStatus.connections || {};
      const network = serverStatus.network || {};

      // Define high load thresholds
      const connectionUtilization = connections.current / (connections.current + connections.available);
      const highLoad = connectionUtilization > 0.8; // 80% utilization threshold

      return {
        highLoad,
        metrics: {
          connectionUtilization,
          currentConnections: connections.current,
          availableConnections: connections.available,
          networkRequests: network.numRequests,
          memoryUsage: serverStatus.mem
        }
      };
    } catch (error) {
      logger.error('Error analyzing database load:', error);
      return { highLoad: false, metrics: {} };
    }
  }

  /**
   * Analyze database indexes and suggest optimizations
   */
  private async analyzeIndexes(): Promise<string[]> {
    const suggestions: string[] = [];

    try {
      const db = mongoose.connection.db;
      const collections = ['contacts', 'deals', 'pipelines', 'auditlogs'];

      for (const collectionName of collections) {
        try {
          const collection = db.collection(collectionName);
          const indexes = await collection.indexes();
          const stats = await collection.stats();

          // Check if collection has basic indexes
          const hasUserIdIndex = indexes.some((idx: any) =>
            Object.keys(idx.key).includes('userId')
          );

          if (!hasUserIdIndex && stats.count > 1000) {
            suggestions.push(`Add userId index to ${collectionName} collection`);
          }

          // Check for unused indexes (requires MongoDB 4.2+)
          // This is a simplified check - in production you'd use $indexStats aggregation
          if (indexes.length > 10) {
            suggestions.push(`Review indexes in ${collectionName} - too many indexes may impact write performance`);
          }

        } catch (collError) {
          logger.debug(`Could not analyze ${collectionName}:`, collError.message);
        }
      }
    } catch (error) {
      logger.error('Error analyzing indexes:', error);
    }

    return suggestions;
  }

  /**
   * Graceful shutdown
   */
  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}. Closing database connection...`);

    try {
      await mongoose.connection.close();
      logger.info('Database connection closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during database shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        logger.info('Database disconnected successfully');
      }
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  isReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export default DatabaseManager;