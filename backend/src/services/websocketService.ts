import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import CacheService from './cacheService';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export interface WebSocketEvent {
  type: string;
  data: any;
  userId?: string;
  timestamp: Date;
  metadata?: any;
}

export interface RoomMembership {
  userId: string;
  socketId: string;
  joinedAt: Date;
  lastActivity: Date;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private io?: SocketIOServer;
  private authenticatedUsers: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId
  private roomMembers: Map<string, Map<string, RoomMembership>> = new Map(); // room -> userId -> membership
  private cacheService?: CacheService;

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  setCacheService(cacheService: CacheService): void {
    this.cacheService = cacheService;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupCleanupTasks();

    logger.info('WebSocket server initialized');
  }

  /**
   * Set up authentication middleware
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

        if (!decoded.userId) {
          return next(new Error('Invalid token payload'));
        }

        // Attach user info to socket
        socket.userId = decoded.userId;
        socket.user = decoded;

        logger.debug(`WebSocket authentication successful for user: ${decoded.userId}`);
        next();
      } catch (error) {
        logger.warn('WebSocket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * Handle new socket connection
   */
  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;
    const socketId = socket.id;

    logger.info(`WebSocket connection established: ${socketId} for user: ${userId}`);

    // Track authenticated user
    if (!this.authenticatedUsers.has(userId)) {
      this.authenticatedUsers.set(userId, new Set());
    }
    this.authenticatedUsers.get(userId)!.add(socketId);
    this.socketUsers.set(socketId, userId);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Set up event handlers for this socket
    this.setupSocketEventHandlers(socket);

    // Send initial connection acknowledgment
    socket.emit('connected', {
      socketId,
      userId,
      timestamp: new Date(),
      serverVersion: process.env.APP_VERSION || '1.0.0'
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Update user's last activity
    this.updateUserActivity(userId);
  }

  /**
   * Set up event handlers for a specific socket
   */
  private setupSocketEventHandlers(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;

    // CRM-specific event handlers
    socket.on('crm:subscribe', (data) => this.handleCRMSubscription(socket, data));
    socket.on('crm:unsubscribe', (data) => this.handleCRMUnsubscription(socket, data));

    // Contact events
    socket.on('contact:subscribe', (contactId) => this.subscribeToContact(socket, contactId));
    socket.on('contact:unsubscribe', (contactId) => this.unsubscribeFromContact(socket, contactId));

    // Deal events
    socket.on('deal:subscribe', (dealId) => this.subscribeToDeal(socket, dealId));
    socket.on('deal:unsubscribe', (dealId) => this.unsubscribeFromDeal(socket, dealId));

    // Pipeline events
    socket.on('pipeline:subscribe', (pipelineId) => this.subscribeToPipeline(socket, pipelineId));
    socket.on('pipeline:unsubscribe', (pipelineId) => this.unsubscribeFromPipeline(socket, pipelineId));

    // Bulk operation subscriptions
    socket.on('bulk:subscribe', (operationId) => this.subscribeToBulkOperation(socket, operationId));
    socket.on('bulk:unsubscribe', (operationId) => this.unsubscribeFromBulkOperation(socket, operationId));

    // Activity tracking
    socket.on('activity:heartbeat', () => this.updateUserActivity(userId));

    // Error handling
    socket.on('error', (error) => {
      logger.error(`WebSocket error for user ${userId}:`, error);
    });
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnection(socket: AuthenticatedSocket, reason: string): void {
    const userId = socket.userId!;
    const socketId = socket.id;

    logger.info(`WebSocket disconnected: ${socketId} for user: ${userId}, reason: ${reason}`);

    // Remove from tracking
    const userSockets = this.authenticatedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.authenticatedUsers.delete(userId);
      }
    }
    this.socketUsers.delete(socketId);

    // Clean up room memberships
    this.cleanupRoomMemberships(socketId, userId);
  }

  /**
   * CRM subscription handlers
   */
  private handleCRMSubscription(socket: AuthenticatedSocket, data: { type: string; id?: string }): void {
    const userId = socket.userId!;
    const { type, id } = data;

    logger.debug(`CRM subscription: ${userId} -> ${type}:${id || 'all'}`);

    switch (type) {
      case 'contacts':
        socket.join(`user:${userId}:contacts`);
        break;
      case 'deals':
        socket.join(`user:${userId}:deals`);
        break;
      case 'pipelines':
        socket.join(`user:${userId}:pipelines`);
        break;
      case 'analytics':
        socket.join(`user:${userId}:analytics`);
        break;
      default:
        socket.emit('error', { message: 'Invalid subscription type' });
        return;
    }

    socket.emit('crm:subscribed', { type, id, timestamp: new Date() });
  }

  private handleCRMUnsubscription(socket: AuthenticatedSocket, data: { type: string; id?: string }): void {
    const userId = socket.userId!;
    const { type, id } = data;

    logger.debug(`CRM unsubscription: ${userId} -> ${type}:${id || 'all'}`);

    switch (type) {
      case 'contacts':
        socket.leave(`user:${userId}:contacts`);
        break;
      case 'deals':
        socket.leave(`user:${userId}:deals`);
        break;
      case 'pipelines':
        socket.leave(`user:${userId}:pipelines`);
        break;
      case 'analytics':
        socket.leave(`user:${userId}:analytics`);
        break;
    }

    socket.emit('crm:unsubscribed', { type, id, timestamp: new Date() });
  }

  /**
   * Resource-specific subscription methods
   */
  private subscribeToContact(socket: AuthenticatedSocket, contactId: string): void {
    const userId = socket.userId!;
    const room = `contact:${contactId}`;

    socket.join(room);
    this.trackRoomMembership(room, userId, socket.id);

    socket.emit('contact:subscribed', { contactId, timestamp: new Date() });
    logger.debug(`User ${userId} subscribed to contact ${contactId}`);
  }

  private unsubscribeFromContact(socket: AuthenticatedSocket, contactId: string): void {
    const userId = socket.userId!;
    const room = `contact:${contactId}`;

    socket.leave(room);
    this.removeRoomMembership(room, userId);

    socket.emit('contact:unsubscribed', { contactId, timestamp: new Date() });
    logger.debug(`User ${userId} unsubscribed from contact ${contactId}`);
  }

  private subscribeToDeal(socket: AuthenticatedSocket, dealId: string): void {
    const userId = socket.userId!;
    const room = `deal:${dealId}`;

    socket.join(room);
    this.trackRoomMembership(room, userId, socket.id);

    socket.emit('deal:subscribed', { dealId, timestamp: new Date() });
    logger.debug(`User ${userId} subscribed to deal ${dealId}`);
  }

  private unsubscribeFromDeal(socket: AuthenticatedSocket, dealId: string): void {
    const userId = socket.userId!;
    const room = `deal:${dealId}`;

    socket.leave(room);
    this.removeRoomMembership(room, userId);

    socket.emit('deal:unsubscribed', { dealId, timestamp: new Date() });
    logger.debug(`User ${userId} unsubscribed from deal ${dealId}`);
  }

  private subscribeToPipeline(socket: AuthenticatedSocket, pipelineId: string): void {
    const userId = socket.userId!;
    const room = `pipeline:${pipelineId}`;

    socket.join(room);
    this.trackRoomMembership(room, userId, socket.id);

    socket.emit('pipeline:subscribed', { pipelineId, timestamp: new Date() });
    logger.debug(`User ${userId} subscribed to pipeline ${pipelineId}`);
  }

  private unsubscribeFromPipeline(socket: AuthenticatedSocket, pipelineId: string): void {
    const userId = socket.userId!;
    const room = `pipeline:${pipelineId}`;

    socket.leave(room);
    this.removeRoomMembership(room, userId);

    socket.emit('pipeline:unsubscribed', { pipelineId, timestamp: new Date() });
    logger.debug(`User ${userId} unsubscribed from pipeline ${pipelineId}`);
  }

  private subscribeToBulkOperation(socket: AuthenticatedSocket, operationId: string): void {
    const userId = socket.userId!;
    const room = `bulk:${operationId}`;

    socket.join(room);
    this.trackRoomMembership(room, userId, socket.id);

    socket.emit('bulk:subscribed', { operationId, timestamp: new Date() });
    logger.debug(`User ${userId} subscribed to bulk operation ${operationId}`);
  }

  private unsubscribeFromBulkOperation(socket: AuthenticatedSocket, operationId: string): void {
    const userId = socket.userId!;
    const room = `bulk:${operationId}`;

    socket.leave(room);
    this.removeRoomMembership(room, userId);

    socket.emit('bulk:unsubscribed', { operationId, timestamp: new Date() });
    logger.debug(`User ${userId} unsubscribed from bulk operation ${operationId}`);
  }

  /**
   * Public methods for emitting CRM events
   */

  // Contact events
  emitContactCreated(userId: string, contact: any): void {
    this.emitToUser(userId, 'contact:created', contact);
    this.emitToRoom(`user:${userId}:contacts`, 'contact:created', contact);
  }

  emitContactUpdated(userId: string, contactId: string, contact: any, changes?: any): void {
    this.emitToUser(userId, 'contact:updated', { contact, changes });
    this.emitToRoom(`contact:${contactId}`, 'contact:updated', { contact, changes });
    this.emitToRoom(`user:${userId}:contacts`, 'contact:updated', { contact, changes });
  }

  emitContactDeleted(userId: string, contactId: string): void {
    this.emitToUser(userId, 'contact:deleted', { contactId });
    this.emitToRoom(`contact:${contactId}`, 'contact:deleted', { contactId });
    this.emitToRoom(`user:${userId}:contacts`, 'contact:deleted', { contactId });
  }

  // Deal events
  emitDealCreated(userId: string, deal: any): void {
    this.emitToUser(userId, 'deal:created', deal);
    this.emitToRoom(`user:${userId}:deals`, 'deal:created', deal);
    if (deal.pipelineId) {
      this.emitToRoom(`pipeline:${deal.pipelineId}`, 'deal:created', deal);
    }
  }

  emitDealUpdated(userId: string, dealId: string, deal: any, changes?: any): void {
    this.emitToUser(userId, 'deal:updated', { deal, changes });
    this.emitToRoom(`deal:${dealId}`, 'deal:updated', { deal, changes });
    this.emitToRoom(`user:${userId}:deals`, 'deal:updated', { deal, changes });
    if (deal.pipelineId) {
      this.emitToRoom(`pipeline:${deal.pipelineId}`, 'deal:updated', { deal, changes });
    }
  }

  emitDealStageChanged(userId: string, dealId: string, deal: any, fromStage: string, toStage: string): void {
    const event = { deal, fromStage, toStage, timestamp: new Date() };
    this.emitToUser(userId, 'deal:stage_changed', event);
    this.emitToRoom(`deal:${dealId}`, 'deal:stage_changed', event);
    this.emitToRoom(`user:${userId}:deals`, 'deal:stage_changed', event);
    if (deal.pipelineId) {
      this.emitToRoom(`pipeline:${deal.pipelineId}`, 'deal:stage_changed', event);
    }
  }

  emitDealDeleted(userId: string, dealId: string, pipelineId?: string): void {
    this.emitToUser(userId, 'deal:deleted', { dealId });
    this.emitToRoom(`deal:${dealId}`, 'deal:deleted', { dealId });
    this.emitToRoom(`user:${userId}:deals`, 'deal:deleted', { dealId });
    if (pipelineId) {
      this.emitToRoom(`pipeline:${pipelineId}`, 'deal:deleted', { dealId });
    }
  }

  // Pipeline events
  emitPipelineUpdated(userId: string, pipelineId: string, pipeline: any): void {
    this.emitToUser(userId, 'pipeline:updated', pipeline);
    this.emitToRoom(`pipeline:${pipelineId}`, 'pipeline:updated', pipeline);
    this.emitToRoom(`user:${userId}:pipelines`, 'pipeline:updated', pipeline);
  }

  // Bulk operation events
  emitBulkOperationProgress(userId: string, operationIdOrProgress: string | any, progress?: any): void {
    // Support both signatures: (userId, operationId, progress) and (userId, progressData)
    if (typeof operationIdOrProgress === 'string' && progress) {
      // Original signature with separate operationId and progress
      const operationId = operationIdOrProgress;
      this.emitToUser(userId, 'bulk:progress', { operationId, ...progress });
      this.emitToRoom(`bulk:${operationId}`, 'bulk:progress', { operationId, ...progress });
    } else {
      // New simplified signature with progress data only
      const progressData = operationIdOrProgress;
      const operationId = progressData.operation + '_' + Date.now();
      this.emitToUser(userId, 'bulk:progress', { operationId, ...progressData });
      this.emitToRoom(`bulk:${operationId}`, 'bulk:progress', { operationId, ...progressData });
    }
  }

  emitBulkOperationCompleted(userId: string, operationId: string, results: any): void {
    this.emitToUser(userId, 'bulk:completed', { operationId, results });
    this.emitToRoom(`bulk:${operationId}`, 'bulk:completed', { operationId, results });
  }

  emitBulkOperationFailed(userId: string, operationId: string, error: any): void {
    this.emitToUser(userId, 'bulk:failed', { operationId, error });
    this.emitToRoom(`bulk:${operationId}`, 'bulk:failed', { operationId, error });
  }

  // Analytics events
  emitAnalyticsUpdated(userId: string, analytics: any): void {
    this.emitToRoom(`user:${userId}:analytics`, 'analytics:updated', analytics);
  }

  // System events
  emitSystemNotification(userId: string, notification: any): void {
    this.emitToUser(userId, 'system:notification', notification);
  }

  // Content Approval events
  emitContentCreated(userId: string, content: any): void {
    this.emitToUser(userId, 'content:created', content);
    this.emitToRoom(`user:${userId}:content`, 'content:created', content);

    // Notify assignees
    if (content.assignedTo && content.assignedTo.length > 0) {
      content.assignedTo.forEach((assigneeId: string) => {
        this.emitToUser(assigneeId, 'content:assignment', {
          contentId: content._id,
          content,
          assignedBy: userId
        });
      });
    }
  }

  emitContentUpdated(userId: string, contentId: string, content: any, changes?: any): void {
    this.emitToUser(userId, 'content:updated', { content, changes });
    this.emitToRoom(`content:${contentId}`, 'content:updated', { content, changes });
    this.emitToRoom(`user:${userId}:content`, 'content:updated', { content, changes });

    // Notify all stakeholders
    const stakeholders = [
      ...(content.assignedTo || []),
      ...(content.approvedBy || []),
      content.createdBy
    ].filter((id: string) => id !== userId);

    stakeholders.forEach((stakeholderId: string) => {
      this.emitToUser(stakeholderId, 'content:updated', { content, changes, updatedBy: userId });
    });
  }

  emitContentDeleted(userId: string, contentId: string): void {
    this.emitToUser(userId, 'content:deleted', { contentId });
    this.emitToRoom(`content:${contentId}`, 'content:deleted', { contentId });
    this.emitToRoom(`user:${userId}:content`, 'content:deleted', { contentId });
  }

  emitContentApproved(userId: string, contentId: string, content: any): void {
    const event = { contentId, content, approvedBy: userId, timestamp: new Date() };

    this.emitToUser(userId, 'content:approved', event);
    this.emitToRoom(`content:${contentId}`, 'content:approved', event);

    // Notify content creator
    this.emitToUser(content.createdBy, 'content:approval_received', {
      ...event,
      message: 'Your content has been approved'
    });
  }

  emitContentRejected(userId: string, contentId: string, content: any, reason: string): void {
    const event = { contentId, content, rejectedBy: userId, reason, timestamp: new Date() };

    this.emitToUser(userId, 'content:rejected', event);
    this.emitToRoom(`content:${contentId}`, 'content:rejected', event);

    // Notify content creator
    this.emitToUser(content.createdBy, 'content:rejection_received', {
      ...event,
      message: 'Your content has been rejected'
    });
  }

  emitRevisionRequested(userId: string, contentId: string, content: any, feedback: string): void {
    const event = { contentId, content, requestedBy: userId, feedback, timestamp: new Date() };

    this.emitToUser(userId, 'content:revision_requested', event);
    this.emitToRoom(`content:${contentId}`, 'content:revision_requested', event);

    // Notify content creator
    this.emitToUser(content.createdBy, 'content:revision_needed', {
      ...event,
      message: 'Revision requested for your content'
    });
  }

  emitCommentAdded(userId: string, contentId: string, content: any): void {
    const latestComment = content.comments[content.comments.length - 1];
    const event = {
      contentId,
      comment: latestComment,
      addedBy: userId,
      timestamp: new Date()
    };

    this.emitToRoom(`content:${contentId}`, 'content:comment_added', event);

    // Notify mentioned users
    if (latestComment.mentions && latestComment.mentions.length > 0) {
      latestComment.mentions.forEach((mentionedUserId: string) => {
        this.emitToUser(mentionedUserId, 'content:mention', {
          ...event,
          message: `You were mentioned in a comment`
        });
      });
    }

    // Notify all stakeholders except the commenter
    const stakeholders = [
      ...(content.assignedTo || []),
      ...(content.approvedBy || []),
      content.createdBy
    ].filter((id: string) => id !== userId);

    stakeholders.forEach((stakeholderId: string) => {
      this.emitToUser(stakeholderId, 'content:comment_notification', event);
    });
  }

  emitWorkflowStageAdvanced(userId: string, contentId: string, content: any, fromStage: string, toStage: string): void {
    const event = {
      contentId,
      content,
      fromStage,
      toStage,
      advancedBy: userId,
      timestamp: new Date()
    };

    this.emitToRoom(`content:${contentId}`, 'content:workflow_advanced', event);

    // Notify new stage assignees
    if (content.assignedTo && content.assignedTo.length > 0) {
      content.assignedTo.forEach((assigneeId: string) => {
        this.emitToUser(assigneeId, 'content:new_stage_assignment', {
          ...event,
          message: `Content has moved to ${toStage} stage - your review is needed`
        });
      });
    }
  }

  emitContentDeadlineApproaching(contentId: string, content: any, hoursRemaining: number): void {
    const event = {
      contentId,
      content,
      hoursRemaining,
      dueDate: content.dueDate,
      timestamp: new Date()
    };

    // Notify assignees about approaching deadline
    if (content.assignedTo && content.assignedTo.length > 0) {
      content.assignedTo.forEach((assigneeId: string) => {
        this.emitToUser(assigneeId, 'content:deadline_approaching', {
          ...event,
          message: `Content deadline approaching in ${hoursRemaining} hours`
        });
      });
    }

    // Notify content creator
    this.emitToUser(content.createdBy, 'content:deadline_reminder', {
      ...event,
      message: `Your content deadline is approaching in ${hoursRemaining} hours`
    });
  }

  emitContentOverdue(contentId: string, content: any): void {
    const event = {
      contentId,
      content,
      overdueSince: content.dueDate,
      timestamp: new Date()
    };

    // Notify all stakeholders about overdue content
    const stakeholders = [
      ...(content.assignedTo || []),
      content.createdBy
    ];

    stakeholders.forEach((stakeholderId: string) => {
      this.emitToUser(stakeholderId, 'content:overdue', {
        ...event,
        message: `Content is now overdue`
      });
    });
  }

  // Content subscription management
  subscribeToContent(userId: string, contentId: string): void {
    if (!this.authenticatedUsers.has(userId)) return;

    const userSockets = this.authenticatedUsers.get(userId)!;
    userSockets.forEach(socketId => {
      const socket = this.io?.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(`content:${contentId}`);
        logger.debug(`User ${userId} subscribed to content ${contentId}`);
      }
    });
  }

  unsubscribeFromContent(userId: string, contentId: string): void {
    if (!this.authenticatedUsers.has(userId)) return;

    const userSockets = this.authenticatedUsers.get(userId)!;
    userSockets.forEach(socketId => {
      const socket = this.io?.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(`content:${contentId}`);
        logger.debug(`User ${userId} unsubscribed from content ${contentId}`);
      }
    });
  }

  /**
   * Private helper methods
   */
  private emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, { ...data, timestamp: new Date() });
  }

  private emitToRoom(room: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(room).emit(event, { ...data, timestamp: new Date() });
  }

  private trackRoomMembership(room: string, userId: string, socketId: string): void {
    if (!this.roomMembers.has(room)) {
      this.roomMembers.set(room, new Map());
    }

    this.roomMembers.get(room)!.set(userId, {
      userId,
      socketId,
      joinedAt: new Date(),
      lastActivity: new Date()
    });
  }

  private removeRoomMembership(room: string, userId: string): void {
    const roomData = this.roomMembers.get(room);
    if (roomData) {
      roomData.delete(userId);
      if (roomData.size === 0) {
        this.roomMembers.delete(room);
      }
    }
  }

  private cleanupRoomMemberships(socketId: string, userId: string): void {
    for (const [room, members] of this.roomMembers.entries()) {
      const membership = members.get(userId);
      if (membership && membership.socketId === socketId) {
        members.delete(userId);
        if (members.size === 0) {
          this.roomMembers.delete(room);
        }
      }
    }
  }

  private updateUserActivity(userId: string): void {
    if (this.cacheService) {
      this.cacheService.set(`user_activity:${userId}`, new Date(), 3600); // 1 hour TTL
    }
  }

  /**
   * Setup cleanup tasks
   */
  private setupCleanupTasks(): void {
    // Clean up inactive room memberships every 5 minutes
    setInterval(() => {
      this.cleanupInactiveRooms();
    }, 5 * 60 * 1000);

    // Log connection statistics every 10 minutes
    setInterval(() => {
      this.logConnectionStats();
    }, 10 * 60 * 1000);
  }

  private cleanupInactiveRooms(): void {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    for (const [room, members] of this.roomMembers.entries()) {
      for (const [userId, membership] of members.entries()) {
        if (membership.lastActivity < fiveMinutesAgo) {
          members.delete(userId);
          logger.debug(`Cleaned up inactive room membership: ${userId} from ${room}`);
        }
      }

      if (members.size === 0) {
        this.roomMembers.delete(room);
        logger.debug(`Removed empty room: ${room}`);
      }
    }
  }

  private logConnectionStats(): void {
    const totalConnections = this.authenticatedUsers.size;
    const totalSockets = Array.from(this.authenticatedUsers.values())
      .reduce((sum, sockets) => sum + sockets.size, 0);
    const totalRooms = this.roomMembers.size;

    logger.info('WebSocket connection stats:', {
      totalUsers: totalConnections,
      totalSockets,
      totalRooms,
      avgSocketsPerUser: totalConnections > 0 ? (totalSockets / totalConnections).toFixed(2) : 0
    });
  }

  /**
   * Public utility methods
   */
  getConnectionStats(): any {
    return {
      totalUsers: this.authenticatedUsers.size,
      totalSockets: Array.from(this.authenticatedUsers.values())
        .reduce((sum, sockets) => sum + sockets.size, 0),
      totalRooms: this.roomMembers.size,
      activeRooms: Array.from(this.roomMembers.keys()),
      connectedUsers: Array.from(this.authenticatedUsers.keys())
    };
  }

  isUserConnected(userId: string): boolean {
    return this.authenticatedUsers.has(userId);
  }

  getUserSocketCount(userId: string): number {
    return this.authenticatedUsers.get(userId)?.size || 0;
  }

  getRoomMemberCount(room: string): number {
    return this.roomMembers.get(room)?.size || 0;
  }

  /**
   * Shutdown WebSocket server
   */
  shutdown(): void {
    if (this.io) {
      this.io.close();
      logger.info('WebSocket server shut down');
    }

    // Clear tracking data
    this.authenticatedUsers.clear();
    this.socketUsers.clear();
    this.roomMembers.clear();
  }
}

export default WebSocketService;