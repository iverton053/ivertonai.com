import { EventEmitter } from 'events';
import ContentItem, { IContentItem } from '../models/ContentItem';
import ApprovalWorkflow, { IApprovalWorkflow } from '../models/ApprovalWorkflow';
import Team, { ITeam } from '../models/Team';
import AuditLog from '../models/AuditLog';
import { notificationService } from './notificationService';
import { websocketService } from './websocketService';

interface WorkflowRule {
  id: string;
  condition: {
    type: 'content_type' | 'priority' | 'assignee' | 'deadline' | 'custom';
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
    field?: string; // For custom conditions
  };
  action: {
    type: 'auto_approve' | 'auto_reject' | 'escalate' | 'reassign' | 'skip_stage' | 'notify' | 'set_priority';
    value?: any;
    target?: string; // User ID or stage ID
  };
}

interface WorkflowStage {
  id: string;
  name: string;
  type: 'review' | 'approval' | 'revision' | 'publish' | 'archive';
  assignees: string[];
  requirements: {
    min_approvals: number;
    require_all_approvals: boolean;
    allow_self_approval: boolean;
    auto_approve_after_hours?: number;
    escalation_hours?: number;
    escalation_target?: string;
  };
  rules?: WorkflowRule[];
  parallel: boolean; // Can this stage run in parallel with others
  optional: boolean; // Can this stage be skipped
}

interface WorkflowExecution {
  contentId: string;
  workflowId: string;
  currentStage: number;
  stageHistory: Array<{
    stageId: string;
    startedAt: Date;
    completedAt?: Date;
    assignees: string[];
    approvals: Array<{
      userId: string;
      action: 'approved' | 'rejected' | 'revision_requested';
      timestamp: Date;
      comments?: string;
    }>;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'escalated';
  }>;
  status: 'active' | 'completed' | 'cancelled' | 'error';
  startedAt: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

class WorkflowEngine extends EventEmitter {
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private workflows: Map<string, IApprovalWorkflow> = new Map();
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.initializeEngine();
  }

  private async initializeEngine() {
    // Load active workflows
    await this.loadWorkflows();

    // Restore active executions
    await this.restoreActiveExecutions();

    // Start monitoring tasks
    this.startMonitoring();

    console.log('Workflow Engine initialized');
  }

  private async loadWorkflows() {
    try {
      const workflows = await ApprovalWorkflow.find({ status: 'active' });
      workflows.forEach(workflow => {
        this.workflows.set(workflow.id, workflow);
      });
      console.log(`Loaded ${workflows.length} active workflows`);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  }

  private async restoreActiveExecutions() {
    try {
      // Find content items with active workflow executions
      const activeContent = await ContentItem.find({
        'workflow_execution.status': 'active'
      });

      for (const content of activeContent) {
        if (content.workflow_execution) {
          this.activeExecutions.set(content.id, content.workflow_execution as WorkflowExecution);

          // Restore any scheduled tasks (escalations, auto-approvals, etc.)
          await this.scheduleStageTimeouts(content.workflow_execution as WorkflowExecution);
        }
      }

      console.log(`Restored ${activeContent.length} active workflow executions`);
    } catch (error) {
      console.error('Failed to restore active executions:', error);
    }
  }

  // Main workflow execution methods
  async startWorkflow(contentId: string, workflowId?: string): Promise<WorkflowExecution> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Determine workflow if not specified
      if (!workflowId) {
        workflowId = await this.determineWorkflow(content);
      }

      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found or inactive');
      }

      // Create workflow execution
      const execution: WorkflowExecution = {
        contentId,
        workflowId,
        currentStage: 0,
        stageHistory: [],
        status: 'active',
        startedAt: new Date(),
        metadata: {}
      };

      // Start first stage
      await this.startStage(execution, workflow.stages[0]);

      // Save execution
      this.activeExecutions.set(contentId, execution);
      content.workflow_execution = execution;
      content.status = 'in_review';
      await content.save();

      // Create audit log
      await this.createAuditLog(contentId, 'workflow_started', {
        workflowId,
        workflowName: workflow.name,
        userId: content.created_by
      });

      // Emit event
      this.emit('workflowStarted', { contentId, workflowId, execution });

      return execution;
    } catch (error) {
      console.error('Failed to start workflow:', error);
      throw error;
    }
  }

  private async determineWorkflow(content: IContentItem): Promise<string> {
    // Try to find workflow based on content characteristics
    const workflows = Array.from(this.workflows.values());

    for (const workflow of workflows) {
      if (await this.matchesWorkflowCriteria(content, workflow)) {
        return workflow.id;
      }
    }

    // Return default workflow if available
    const defaultWorkflow = workflows.find(w => w.is_default);
    if (defaultWorkflow) {
      return defaultWorkflow.id;
    }

    throw new Error('No suitable workflow found for content');
  }

  private async matchesWorkflowCriteria(content: IContentItem, workflow: IApprovalWorkflow): Promise<boolean> {
    const criteria = workflow.criteria;
    if (!criteria || Object.keys(criteria).length === 0) {
      return workflow.is_default || false;
    }

    // Check content types
    if (criteria.content_types && criteria.content_types.length > 0) {
      if (!criteria.content_types.includes(content.content_type)) {
        return false;
      }
    }

    // Check priorities
    if (criteria.priorities && criteria.priorities.length > 0) {
      if (!criteria.priorities.includes(content.priority)) {
        return false;
      }
    }

    // Check platforms
    if (criteria.platforms && criteria.platforms.length > 0) {
      if (!criteria.platforms.includes(content.platform)) {
        return false;
      }
    }

    // Check team assignment
    if (criteria.teams && criteria.teams.length > 0) {
      const contentTeams = content.assignees; // Assuming assignees are team members
      if (!criteria.teams.some(teamId => contentTeams.includes(teamId))) {
        return false;
      }
    }

    return true;
  }

  private async startStage(execution: WorkflowExecution, stage: any) {
    const stageExecution = {
      stageId: stage.id,
      startedAt: new Date(),
      assignees: stage.assignees || [],
      approvals: [],
      status: 'in_progress' as const
    };

    execution.stageHistory.push(stageExecution);

    // Apply any stage rules
    if (stage.rules) {
      await this.applyStageRules(execution, stage, stageExecution);
    }

    // Assign to users
    await this.assignStageToUsers(execution, stage, stageExecution);

    // Schedule timeouts (escalation, auto-approval)
    await this.scheduleStageTimeouts(execution);

    // Send notifications
    await this.notifyStageAssignees(execution, stage, stageExecution);

    this.emit('stageStarted', {
      contentId: execution.contentId,
      stageId: stage.id,
      assignees: stage.assignees
    });
  }

  private async applyStageRules(execution: WorkflowExecution, stage: any, stageExecution: any) {
    if (!stage.rules) return;

    const content = await ContentItem.findById(execution.contentId);
    if (!content) return;

    for (const rule of stage.rules) {
      if (await this.evaluateRuleCondition(content, rule.condition)) {
        await this.executeRuleAction(execution, stage, stageExecution, rule.action);
      }
    }
  }

  private async evaluateRuleCondition(content: IContentItem, condition: any): Promise<boolean> {
    const { type, operator, value, field } = condition;

    let contentValue: any;
    switch (type) {
      case 'content_type':
        contentValue = content.content_type;
        break;
      case 'priority':
        contentValue = content.priority;
        break;
      case 'deadline':
        contentValue = new Date(content.deadline);
        break;
      case 'custom':
        contentValue = field ? content.metadata[field] : null;
        break;
      default:
        return false;
    }

    switch (operator) {
      case 'equals':
        return contentValue === value;
      case 'not_equals':
        return contentValue !== value;
      case 'contains':
        return String(contentValue).includes(value);
      case 'greater_than':
        return contentValue > value;
      case 'less_than':
        return contentValue < value;
      case 'in':
        return Array.isArray(value) && value.includes(contentValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(contentValue);
      default:
        return false;
    }
  }

  private async executeRuleAction(execution: WorkflowExecution, stage: any, stageExecution: any, action: any) {
    switch (action.type) {
      case 'auto_approve':
        await this.autoApproveStage(execution, stage, action.value || 'System auto-approved');
        break;
      case 'auto_reject':
        await this.autoRejectStage(execution, stage, action.value || 'System auto-rejected');
        break;
      case 'escalate':
        await this.escalateStage(execution, stage, action.target);
        break;
      case 'reassign':
        await this.reassignStage(execution, stage, action.target);
        break;
      case 'skip_stage':
        stageExecution.status = 'skipped';
        await this.completeStage(execution, stage);
        break;
      case 'set_priority':
        const content = await ContentItem.findById(execution.contentId);
        if (content) {
          content.priority = action.value;
          await content.save();
        }
        break;
    }
  }

  // Stage assignment and user management
  private async assignStageToUsers(execution: WorkflowExecution, stage: any, stageExecution: any) {
    const assignees = await this.resolveAssignees(stage.assignees);
    stageExecution.assignees = assignees.map(a => a.id);

    // Update content assignees
    const content = await ContentItem.findById(execution.contentId);
    if (content) {
      content.assignees = assignees.map(a => a.id);
      await content.save();
    }
  }

  private async resolveAssignees(assigneeReferences: string[]): Promise<any[]> {
    const assignees = [];

    for (const ref of assigneeReferences) {
      if (ref.startsWith('team:')) {
        // Team assignment
        const teamId = ref.replace('team:', '');
        const team = await Team.findById(teamId);
        if (team) {
          const availableMembers = team.members.filter(member =>
            member.permissions.can_approve_content &&
            this.isMemberAvailable(team, member.user_id)
          );
          assignees.push(...availableMembers.map(m => ({ id: m.user_id, type: 'user' })));
        }
      } else if (ref.startsWith('role:')) {
        // Role-based assignment
        const role = ref.replace('role:', '');
        // Find users with specific role (implement based on your user system)
        // assignees.push(...usersWithRole);
      } else {
        // Direct user assignment
        assignees.push({ id: ref, type: 'user' });
      }
    }

    return assignees;
  }

  private isMemberAvailable(team: ITeam, userId: string): boolean {
    const availability = team.workload.availability.find(a => a.user_id === userId);
    if (!availability) return true; // Assume available if not specified

    const now = new Date();
    return availability.status === 'available' ||
           (availability.until && now > availability.until);
  }

  // Stage progression and completion
  async processStageAction(contentId: string, stageId: string, userId: string, action: {
    type: 'approve' | 'reject' | 'revision_request';
    comments?: string;
    data?: any;
  }): Promise<void> {
    const execution = this.activeExecutions.get(contentId);
    if (!execution) {
      throw new Error('No active workflow execution found');
    }

    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const currentStageIndex = execution.currentStage;
    const stage = workflow.stages[currentStageIndex];
    const stageExecution = execution.stageHistory[execution.stageHistory.length - 1];

    if (stageExecution.stageId !== stageId) {
      throw new Error('Stage mismatch');
    }

    // Check if user is authorized
    if (!stageExecution.assignees.includes(userId)) {
      throw new Error('User not authorized for this stage');
    }

    // Check if user already approved
    const existingApproval = stageExecution.approvals.find(a => a.userId === userId);
    if (existingApproval) {
      throw new Error('User has already provided approval for this stage');
    }

    // Record the approval/rejection
    stageExecution.approvals.push({
      userId,
      action: action.type,
      timestamp: new Date(),
      comments: action.comments
    });

    // Create audit log
    await this.createAuditLog(contentId, `stage_${action.type}`, {
      stageId,
      stageName: stage.name,
      userId,
      comments: action.comments
    });

    // Send notifications
    await this.notifyStageAction(execution, stage, userId, action);

    // Check if stage is complete
    if (await this.isStageComplete(execution, stage, stageExecution)) {
      await this.completeStage(execution, stage);
    }

    // Update execution
    await this.saveExecution(execution);

    this.emit('stageActionProcessed', {
      contentId,
      stageId,
      userId,
      action: action.type
    });
  }

  private async isStageComplete(execution: WorkflowExecution, stage: any, stageExecution: any): Promise<boolean> {
    const requirements = stage.requirements;
    const approvals = stageExecution.approvals.filter(a => a.action === 'approved');
    const rejections = stageExecution.approvals.filter(a => a.action === 'rejected');
    const revisionRequests = stageExecution.approvals.filter(a => a.action === 'revision_request');

    // If anyone rejected, stage fails
    if (rejections.length > 0) {
      stageExecution.status = 'completed';
      execution.status = 'cancelled'; // Or move to revision stage
      return true;
    }

    // If revision requested, move to revision
    if (revisionRequests.length > 0) {
      stageExecution.status = 'completed';
      // Handle revision workflow
      return true;
    }

    // Check approval requirements
    if (requirements.require_all_approvals) {
      return approvals.length === stageExecution.assignees.length;
    } else {
      return approvals.length >= (requirements.min_approvals || 1);
    }
  }

  private async completeStage(execution: WorkflowExecution, stage: any) {
    const stageExecution = execution.stageHistory[execution.stageHistory.length - 1];
    stageExecution.completedAt = new Date();
    stageExecution.status = 'completed';

    // Clear any scheduled timeouts for this stage
    const timeoutKey = `${execution.contentId}_${stage.id}`;
    const timeout = this.scheduledTasks.get(timeoutKey);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledTasks.delete(timeoutKey);
    }

    // Move to next stage
    const workflow = this.workflows.get(execution.workflowId);
    if (workflow && execution.currentStage < workflow.stages.length - 1) {
      execution.currentStage += 1;
      const nextStage = workflow.stages[execution.currentStage];
      await this.startStage(execution, nextStage);
    } else {
      // Workflow complete
      await this.completeWorkflow(execution);
    }

    this.emit('stageCompleted', {
      contentId: execution.contentId,
      stageId: stage.id,
      nextStage: workflow?.stages[execution.currentStage]?.id
    });
  }

  private async completeWorkflow(execution: WorkflowExecution) {
    execution.status = 'completed';
    execution.completedAt = new Date();

    // Update content status
    const content = await ContentItem.findById(execution.contentId);
    if (content) {
      content.status = 'approved';
      content.approved_at = new Date();
      await content.save();
    }

    // Remove from active executions
    this.activeExecutions.delete(execution.contentId);

    // Create audit log
    await this.createAuditLog(execution.contentId, 'workflow_completed', {
      workflowId: execution.workflowId,
      duration: execution.completedAt.getTime() - execution.startedAt.getTime()
    });

    // Send completion notifications
    await this.notifyWorkflowCompletion(execution);

    this.emit('workflowCompleted', {
      contentId: execution.contentId,
      workflowId: execution.workflowId
    });
  }

  // Scheduling and timeouts
  private async scheduleStageTimeouts(execution: WorkflowExecution) {
    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return;

    const currentStage = workflow.stages[execution.currentStage];
    const requirements = currentStage.requirements;

    // Schedule auto-approval timeout
    if (requirements.auto_approve_after_hours) {
      const timeoutKey = `${execution.contentId}_${currentStage.id}_auto_approve`;
      const timeout = setTimeout(async () => {
        await this.autoApproveStage(execution, currentStage, 'Auto-approved due to timeout');
        this.scheduledTasks.delete(timeoutKey);
      }, requirements.auto_approve_after_hours * 60 * 60 * 1000);

      this.scheduledTasks.set(timeoutKey, timeout);
    }

    // Schedule escalation timeout
    if (requirements.escalation_hours && requirements.escalation_target) {
      const timeoutKey = `${execution.contentId}_${currentStage.id}_escalation`;
      const timeout = setTimeout(async () => {
        await this.escalateStage(execution, currentStage, requirements.escalation_target!);
        this.scheduledTasks.delete(timeoutKey);
      }, requirements.escalation_hours * 60 * 60 * 1000);

      this.scheduledTasks.set(timeoutKey, timeout);
    }
  }

  private async autoApproveStage(execution: WorkflowExecution, stage: any, reason: string) {
    const stageExecution = execution.stageHistory[execution.stageHistory.length - 1];

    stageExecution.approvals.push({
      userId: 'system',
      action: 'approved',
      timestamp: new Date(),
      comments: reason
    });

    await this.createAuditLog(execution.contentId, 'stage_auto_approved', {
      stageId: stage.id,
      reason
    });

    await this.completeStage(execution, stage);
    await this.saveExecution(execution);
  }

  private async escalateStage(execution: WorkflowExecution, stage: any, targetUserId: string) {
    const stageExecution = execution.stageHistory[execution.stageHistory.length - 1];

    // Add escalation target to assignees
    if (!stageExecution.assignees.includes(targetUserId)) {
      stageExecution.assignees.push(targetUserId);
    }

    // Update content assignees
    const content = await ContentItem.findById(execution.contentId);
    if (content && !content.assignees.includes(targetUserId)) {
      content.assignees.push(targetUserId);
      await content.save();
    }

    // Create audit log
    await this.createAuditLog(execution.contentId, 'stage_escalated', {
      stageId: stage.id,
      escalatedTo: targetUserId,
      originalAssignees: stageExecution.assignees.filter(a => a !== targetUserId)
    });

    // Send escalation notification
    await notificationService.sendNotification({
      userId: targetUserId,
      type: 'workflow',
      title: 'Content Escalated for Review',
      message: `Content "${(await ContentItem.findById(execution.contentId))?.title}" has been escalated to you for urgent review.`,
      templateId: 'content_escalated',
      urgent: true
    });

    await this.saveExecution(execution);

    this.emit('stageEscalated', {
      contentId: execution.contentId,
      stageId: stage.id,
      escalatedTo: targetUserId
    });
  }

  private async reassignStage(execution: WorkflowExecution, stage: any, newAssignees: string | string[]) {
    const stageExecution = execution.stageHistory[execution.stageHistory.length - 1];
    const oldAssignees = [...stageExecution.assignees];

    stageExecution.assignees = Array.isArray(newAssignees) ? newAssignees : [newAssignees];

    // Update content assignees
    const content = await ContentItem.findById(execution.contentId);
    if (content) {
      content.assignees = stageExecution.assignees;
      await content.save();
    }

    // Create audit log
    await this.createAuditLog(execution.contentId, 'stage_reassigned', {
      stageId: stage.id,
      oldAssignees,
      newAssignees: stageExecution.assignees
    });

    // Send notifications to new assignees
    for (const assignee of stageExecution.assignees) {
      await notificationService.sendNotification({
        userId: assignee,
        type: 'assignment',
        title: 'Content Reassigned for Review',
        message: `You have been assigned to review content: "${content?.title}"`,
        templateId: 'content_assigned'
      });
    }

    await this.saveExecution(execution);

    this.emit('stageReassigned', {
      contentId: execution.contentId,
      stageId: stage.id,
      oldAssignees,
      newAssignees: stageExecution.assignees
    });
  }

  // Notification methods
  private async notifyStageAssignees(execution: WorkflowExecution, stage: any, stageExecution: any) {
    const content = await ContentItem.findById(execution.contentId);
    if (!content) return;

    for (const assigneeId of stageExecution.assignees) {
      await notificationService.sendNotification({
        userId: assigneeId,
        type: 'assignment',
        title: `New ${stage.type} Assignment`,
        message: `You have been assigned to ${stage.type}: "${content.title}"`,
        templateId: 'content_assigned',
        templateVariables: {
          assignee_name: '', // Would be resolved from user data
          title: content.title,
          content_type: content.content_type,
          platform: content.platform,
          priority: content.priority,
          deadline: content.deadline,
          content_url: `/content/${content.id}`
        }
      });
    }
  }

  private async notifyStageAction(execution: WorkflowExecution, stage: any, userId: string, action: any) {
    const content = await ContentItem.findById(execution.contentId);
    if (!content) return;

    // Notify content creator
    if (content.created_by !== userId) {
      const templateId = action.type === 'approved' ? 'content_approved' :
                        action.type === 'rejected' ? 'content_rejected' : 'revision_request';

      await notificationService.sendNotification({
        userId: content.created_by,
        type: 'approval',
        title: `Content ${action.type}`,
        message: `Your content "${content.title}" has been ${action.type}`,
        templateId,
        templateVariables: {
          creator_name: '', // Would be resolved from user data
          title: content.title,
          [action.type === 'approved' ? 'approver_name' : 'reviewer_name']: '', // Would be resolved
          comments: action.comments || '',
          content_url: `/content/${content.id}`
        }
      });
    }
  }

  private async notifyWorkflowCompletion(execution: WorkflowExecution) {
    const content = await ContentItem.findById(execution.contentId);
    if (!content) return;

    await notificationService.sendNotification({
      userId: content.created_by,
      type: 'workflow',
      title: 'Workflow Completed',
      message: `The approval workflow for "${content.title}" has been completed successfully.`,
      templateId: 'workflow_completed',
      templateVariables: {
        creator_name: '', // Would be resolved from user data
        title: content.title,
        content_url: `/content/${content.id}`
      }
    });
  }

  // Monitoring and maintenance
  private startMonitoring() {
    // Check for stalled workflows every 5 minutes
    setInterval(async () => {
      await this.checkStalledWorkflows();
    }, 5 * 60 * 1000);

    // Clean up completed executions every hour
    setInterval(async () => {
      await this.cleanupCompletedExecutions();
    }, 60 * 60 * 1000);
  }

  private async checkStalledWorkflows() {
    const now = new Date();
    const stalledThreshold = 24 * 60 * 60 * 1000; // 24 hours

    for (const [contentId, execution] of this.activeExecutions.entries()) {
      const lastActivity = execution.stageHistory[execution.stageHistory.length - 1]?.startedAt;
      if (lastActivity && (now.getTime() - lastActivity.getTime()) > stalledThreshold) {
        console.warn(`Workflow stalled for content ${contentId}`);

        // Emit stalled event for handling
        this.emit('workflowStalled', { contentId, execution });
      }
    }
  }

  private async cleanupCompletedExecutions() {
    try {
      // Remove old completed executions from database
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

      await ContentItem.updateMany(
        {
          'workflow_execution.status': { $in: ['completed', 'cancelled'] },
          'workflow_execution.completedAt': { $lt: cutoffDate }
        },
        {
          $unset: { workflow_execution: 1 }
        }
      );
    } catch (error) {
      console.error('Failed to cleanup completed executions:', error);
    }
  }

  // Utility methods
  private async saveExecution(execution: WorkflowExecution) {
    const content = await ContentItem.findById(execution.contentId);
    if (content) {
      content.workflow_execution = execution;
      await content.save();
    }
  }

  private async createAuditLog(contentId: string, action: string, details: any) {
    try {
      await AuditLog.create({
        resource_type: 'content',
        resource_id: contentId,
        action,
        user_id: details.userId || 'system',
        details,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // Public API methods
  async getWorkflowExecution(contentId: string): Promise<WorkflowExecution | null> {
    return this.activeExecutions.get(contentId) || null;
  }

  async cancelWorkflow(contentId: string, reason?: string): Promise<void> {
    const execution = this.activeExecutions.get(contentId);
    if (!execution) {
      throw new Error('No active workflow execution found');
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date();

    // Clear any scheduled timeouts
    for (const [key, timeout] of this.scheduledTasks.entries()) {
      if (key.startsWith(`${contentId}_`)) {
        clearTimeout(timeout);
        this.scheduledTasks.delete(key);
      }
    }

    // Update content status
    const content = await ContentItem.findById(contentId);
    if (content) {
      content.status = 'cancelled';
      await content.save();
    }

    // Remove from active executions
    this.activeExecutions.delete(contentId);

    // Create audit log
    await this.createAuditLog(contentId, 'workflow_cancelled', {
      reason,
      workflowId: execution.workflowId
    });

    this.emit('workflowCancelled', { contentId, reason });
  }

  async getWorkflowStats(workflowId?: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchStage: any = {
      'workflow_execution.startedAt': { $gte: startDate }
    };

    if (workflowId) {
      matchStage['workflow_execution.workflowId'] = workflowId;
    }

    return await ContentItem.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$workflow_execution.workflowId',
          totalExecutions: { $sum: 1 },
          completedExecutions: {
            $sum: {
              $cond: [{ $eq: ['$workflow_execution.status', 'completed'] }, 1, 0]
            }
          },
          cancelledExecutions: {
            $sum: {
              $cond: [{ $eq: ['$workflow_execution.status', 'cancelled'] }, 1, 0]
            }
          },
          avgCompletionTime: {
            $avg: {
              $cond: [
                { $eq: ['$workflow_execution.status', 'completed'] },
                {
                  $subtract: [
                    '$workflow_execution.completedAt',
                    '$workflow_execution.startedAt'
                  ]
                },
                null
              ]
            }
          }
        }
      }
    ]);
  }

  // Cleanup method
  async shutdown() {
    // Clear all scheduled tasks
    for (const timeout of this.scheduledTasks.values()) {
      clearTimeout(timeout);
    }
    this.scheduledTasks.clear();

    // Save all active executions
    for (const execution of this.activeExecutions.values()) {
      await this.saveExecution(execution);
    }

    this.removeAllListeners();
    console.log('Workflow Engine shutdown completed');
  }
}

export const workflowEngine = new WorkflowEngine();
export default workflowEngine;