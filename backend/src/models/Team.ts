import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  id: string;
  name: string;
  description?: string;
  type: 'content_team' | 'marketing_team' | 'design_team' | 'client_team' | 'review_team' | 'custom';
  status: 'active' | 'inactive' | 'archived';

  // Team Structure
  members: Array<{
    user_id: string;
    role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer' | 'guest';
    permissions: {
      can_create_content: boolean;
      can_approve_content: boolean;
      can_reject_content: boolean;
      can_edit_content: boolean;
      can_delete_content: boolean;
      can_manage_workflows: boolean;
      can_manage_members: boolean;
      can_view_analytics: boolean;
      can_export_data: boolean;
      can_manage_integrations: boolean;
    };
    joined_at: Date;
    invited_by?: string;
    last_active_at?: Date;
  }>;

  // Team Settings
  settings: {
    default_workflow_id?: string;
    auto_assign_content: boolean;
    assignment_strategy: 'round_robin' | 'workload_based' | 'skill_based' | 'manual';
    approval_requirements: {
      min_approvals: number;
      require_manager_approval: boolean;
      allow_self_approval: boolean;
      escalation_hours: number;
    };
    notification_preferences: {
      new_content: boolean;
      approval_requests: boolean;
      deadline_reminders: boolean;
      workflow_updates: boolean;
      member_activities: boolean;
    };
    working_hours?: {
      timezone: string;
      monday: { start: string; end: string; enabled: boolean; };
      tuesday: { start: string; end: string; enabled: boolean; };
      wednesday: { start: string; end: string; enabled: boolean; };
      thursday: { start: string; end: string; enabled: boolean; };
      friday: { start: string; end: string; enabled: boolean; };
      saturday: { start: string; end: string; enabled: boolean; };
      sunday: { start: string; end: string; enabled: boolean; };
    };
    content_guidelines?: string;
    brand_guidelines?: string;
    approval_templates?: Array<{
      id: string;
      name: string;
      template: string;
      type: 'approval' | 'rejection' | 'revision';
    }>;
  };

  // Performance Metrics
  metrics: {
    total_content_created: number;
    total_content_approved: number;
    total_content_rejected: number;
    total_content_published: number;
    avg_approval_time_hours: number;
    avg_content_quality_score: number;
    current_workload: number;
    productivity_score: number;
    collaboration_score: number;
    last_calculated_at?: Date;
  };

  // Workload Management
  workload: {
    current_assignments: number;
    pending_approvals: number;
    overdue_items: number;
    capacity: {
      max_concurrent_assignments: number;
      max_daily_assignments: number;
      max_weekly_assignments: number;
    };
    availability: Array<{
      user_id: string;
      status: 'available' | 'busy' | 'unavailable' | 'vacation';
      until?: Date;
      reason?: string;
    }>;
  };

  // Client & Project Association
  clients: string[]; // Client IDs
  projects: string[]; // Project IDs
  campaigns: string[]; // Campaign IDs

  // Hierarchy & Relationships
  parent_team_id?: string;
  child_teams: string[]; // Team IDs
  reporting_structure: {
    reports_to?: string; // Team ID or User ID
    manages_teams: string[]; // Team IDs
  };

  // Access Control & Security
  permissions: {
    content_access: 'all' | 'assigned_only' | 'team_only';
    workflow_access: 'all' | 'assigned_only' | 'team_only';
    analytics_access: 'full' | 'team_only' | 'limited';
    integration_access: 'full' | 'team_only' | 'none';
    client_portal_access: boolean;
  };

  // Audit & Activity
  activity_log: Array<{
    timestamp: Date;
    user_id: string;
    action: 'member_added' | 'member_removed' | 'role_changed' | 'settings_updated' | 'workflow_assigned' | 'content_created' | 'content_approved';
    details: any;
    ip_address?: string;
  }>;

  created_by: string; // User ID
  created_at: Date;
  updated_at: Date;
}

const TeamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    index: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['content_team', 'marketing_team', 'design_team', 'client_team', 'review_team', 'custom'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
    index: true
  },

  members: [{
    user_id: {
      type: String,
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'member', 'viewer', 'guest'],
      required: true,
      index: true
    },
    permissions: {
      can_create_content: { type: Boolean, default: true },
      can_approve_content: { type: Boolean, default: false },
      can_reject_content: { type: Boolean, default: false },
      can_edit_content: { type: Boolean, default: true },
      can_delete_content: { type: Boolean, default: false },
      can_manage_workflows: { type: Boolean, default: false },
      can_manage_members: { type: Boolean, default: false },
      can_view_analytics: { type: Boolean, default: true },
      can_export_data: { type: Boolean, default: false },
      can_manage_integrations: { type: Boolean, default: false }
    },
    joined_at: { type: Date, default: Date.now },
    invited_by: String,
    last_active_at: Date
  }],

  settings: {
    default_workflow_id: String,
    auto_assign_content: { type: Boolean, default: false },
    assignment_strategy: {
      type: String,
      enum: ['round_robin', 'workload_based', 'skill_based', 'manual'],
      default: 'manual'
    },
    approval_requirements: {
      min_approvals: { type: Number, default: 1, min: 1 },
      require_manager_approval: { type: Boolean, default: false },
      allow_self_approval: { type: Boolean, default: false },
      escalation_hours: { type: Number, default: 24 }
    },
    notification_preferences: {
      new_content: { type: Boolean, default: true },
      approval_requests: { type: Boolean, default: true },
      deadline_reminders: { type: Boolean, default: true },
      workflow_updates: { type: Boolean, default: true },
      member_activities: { type: Boolean, default: false }
    },
    working_hours: {
      timezone: { type: String, default: 'UTC' },
      monday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        enabled: { type: Boolean, default: true }
      },
      tuesday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        enabled: { type: Boolean, default: true }
      },
      wednesday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        enabled: { type: Boolean, default: true }
      },
      thursday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        enabled: { type: Boolean, default: true }
      },
      friday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        enabled: { type: Boolean, default: true }
      },
      saturday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        enabled: { type: Boolean, default: false }
      },
      sunday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        enabled: { type: Boolean, default: false }
      }
    },
    content_guidelines: String,
    brand_guidelines: String,
    approval_templates: [{
      id: String,
      name: String,
      template: String,
      type: {
        type: String,
        enum: ['approval', 'rejection', 'revision']
      }
    }]
  },

  metrics: {
    total_content_created: { type: Number, default: 0 },
    total_content_approved: { type: Number, default: 0 },
    total_content_rejected: { type: Number, default: 0 },
    total_content_published: { type: Number, default: 0 },
    avg_approval_time_hours: { type: Number, default: 0 },
    avg_content_quality_score: { type: Number, default: 0 },
    current_workload: { type: Number, default: 0 },
    productivity_score: { type: Number, default: 0 },
    collaboration_score: { type: Number, default: 0 },
    last_calculated_at: Date
  },

  workload: {
    current_assignments: { type: Number, default: 0 },
    pending_approvals: { type: Number, default: 0 },
    overdue_items: { type: Number, default: 0 },
    capacity: {
      max_concurrent_assignments: { type: Number, default: 10 },
      max_daily_assignments: { type: Number, default: 5 },
      max_weekly_assignments: { type: Number, default: 25 }
    },
    availability: [{
      user_id: String,
      status: {
        type: String,
        enum: ['available', 'busy', 'unavailable', 'vacation']
      },
      until: Date,
      reason: String
    }]
  },

  clients: [String],
  projects: [String],
  campaigns: [String],

  parent_team_id: {
    type: String,
    index: true
  },
  child_teams: [String],
  reporting_structure: {
    reports_to: String,
    manages_teams: [String]
  },

  permissions: {
    content_access: {
      type: String,
      enum: ['all', 'assigned_only', 'team_only'],
      default: 'team_only'
    },
    workflow_access: {
      type: String,
      enum: ['all', 'assigned_only', 'team_only'],
      default: 'team_only'
    },
    analytics_access: {
      type: String,
      enum: ['full', 'team_only', 'limited'],
      default: 'team_only'
    },
    integration_access: {
      type: String,
      enum: ['full', 'team_only', 'none'],
      default: 'team_only'
    },
    client_portal_access: { type: Boolean, default: false }
  },

  activity_log: [{
    timestamp: { type: Date, default: Date.now },
    user_id: String,
    action: {
      type: String,
      enum: ['member_added', 'member_removed', 'role_changed', 'settings_updated', 'workflow_assigned', 'content_created', 'content_approved']
    },
    details: Schema.Types.Mixed,
    ip_address: String
  }],

  created_by: {
    type: String,
    required: true,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
TeamSchema.index({ created_by: 1, status: 1 });
TeamSchema.index({ type: 1, status: 1 });
TeamSchema.index({ 'members.user_id': 1 });
TeamSchema.index({ parent_team_id: 1 });
TeamSchema.index({ clients: 1 });
TeamSchema.index({ projects: 1 });

// Static methods
TeamSchema.statics.findByUser = function(
  userId: string,
  options: {
    role?: string;
    status?: string;
    type?: string;
  } = {}
) {
  const query: any = { 'members.user_id': userId };

  if (options.role) query['members.role'] = options.role;
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;

  return this.find(query)
    .sort({ created_at: -1 })
    .populate('created_by', 'name email')
    .lean();
};

TeamSchema.statics.findByClient = function(clientId: string) {
  return this.find({ clients: clientId, status: 'active' }).lean();
};

TeamSchema.statics.getTeamHierarchy = function(teamId: string) {
  return this.aggregate([
    { $match: { $or: [{ _id: teamId }, { parent_team_id: teamId }] } },
    {
      $graphLookup: {
        from: 'teams',
        startWith: '$child_teams',
        connectFromField: 'child_teams',
        connectToField: '_id',
        as: 'hierarchy'
      }
    }
  ]);
};

TeamSchema.statics.getWorkloadStats = function(teamIds?: string[]) {
  const matchStage: any = { status: 'active' };
  if (teamIds && teamIds.length > 0) {
    matchStage._id = { $in: teamIds };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTeams: { $sum: 1 },
        totalMembers: { $sum: { $size: '$members' } },
        totalAssignments: { $sum: '$workload.current_assignments' },
        totalPendingApprovals: { $sum: '$workload.pending_approvals' },
        totalOverdueItems: { $sum: '$workload.overdue_items' },
        avgProductivityScore: { $avg: '$metrics.productivity_score' },
        avgCollaborationScore: { $avg: '$metrics.collaboration_score' }
      }
    }
  ]);
};

// Instance methods
TeamSchema.methods.isMember = function(userId: string) {
  return this.members.some(member => member.user_id === userId);
};

TeamSchema.methods.getMember = function(userId: string) {
  return this.members.find(member => member.user_id === userId);
};

TeamSchema.methods.hasPermission = function(userId: string, permission: string) {
  const member = this.getMember(userId);
  if (!member) return false;

  // Owner and admin have all permissions
  if (['owner', 'admin'].includes(member.role)) return true;

  return member.permissions[permission] === true;
};

TeamSchema.methods.addMember = function(
  userId: string,
  role: string = 'member',
  invitedBy?: string,
  customPermissions?: any
) {
  // Check if user is already a member
  if (this.isMember(userId)) {
    throw new Error('User is already a member of this team');
  }

  // Set default permissions based on role
  let permissions: any = {
    can_create_content: true,
    can_approve_content: false,
    can_reject_content: false,
    can_edit_content: true,
    can_delete_content: false,
    can_manage_workflows: false,
    can_manage_members: false,
    can_view_analytics: true,
    can_export_data: false,
    can_manage_integrations: false
  };

  // Role-based permission overrides
  if (['owner', 'admin'].includes(role)) {
    Object.keys(permissions).forEach(key => permissions[key] = true);
  } else if (role === 'manager') {
    permissions.can_approve_content = true;
    permissions.can_reject_content = true;
    permissions.can_manage_workflows = true;
    permissions.can_export_data = true;
  } else if (role === 'viewer') {
    permissions.can_create_content = false;
    permissions.can_edit_content = false;
  }

  // Apply custom permissions if provided
  if (customPermissions) {
    permissions = { ...permissions, ...customPermissions };
  }

  const newMember = {
    user_id: userId,
    role,
    permissions,
    joined_at: new Date(),
    invited_by: invitedBy
  };

  this.members.push(newMember);

  // Log activity
  this.activity_log.push({
    timestamp: new Date(),
    user_id: invitedBy || userId,
    action: 'member_added',
    details: { added_user: userId, role }
  });

  return this.save();
};

TeamSchema.methods.removeMember = function(userId: string, removedBy?: string) {
  const memberIndex = this.members.findIndex(member => member.user_id === userId);
  if (memberIndex === -1) {
    throw new Error('User is not a member of this team');
  }

  // Prevent removing the last owner
  const owners = this.members.filter(member => member.role === 'owner');
  if (owners.length === 1 && owners[0].user_id === userId) {
    throw new Error('Cannot remove the last owner of the team');
  }

  const removedMember = this.members[memberIndex];
  this.members.splice(memberIndex, 1);

  // Log activity
  this.activity_log.push({
    timestamp: new Date(),
    user_id: removedBy || userId,
    action: 'member_removed',
    details: { removed_user: userId, role: removedMember.role }
  });

  return this.save();
};

TeamSchema.methods.updateMemberRole = function(userId: string, newRole: string, updatedBy?: string) {
  const member = this.getMember(userId);
  if (!member) {
    throw new Error('User is not a member of this team');
  }

  const oldRole = member.role;
  member.role = newRole;

  // Update permissions based on new role
  if (['owner', 'admin'].includes(newRole)) {
    Object.keys(member.permissions).forEach(key => member.permissions[key] = true);
  }

  // Log activity
  this.activity_log.push({
    timestamp: new Date(),
    user_id: updatedBy || userId,
    action: 'role_changed',
    details: { user_id: userId, old_role: oldRole, new_role: newRole }
  });

  return this.save();
};

TeamSchema.methods.updateWorkload = function(assignments: number, approvals: number, overdue: number) {
  this.workload.current_assignments = assignments;
  this.workload.pending_approvals = approvals;
  this.workload.overdue_items = overdue;
  return this.save();
};

TeamSchema.methods.calculateMetrics = function() {
  // This would typically involve complex calculations based on team activity
  // For now, we'll update the timestamp
  this.metrics.last_calculated_at = new Date();
  return this.save();
};

TeamSchema.methods.setMemberAvailability = function(
  userId: string,
  status: 'available' | 'busy' | 'unavailable' | 'vacation',
  until?: Date,
  reason?: string
) {
  const existingIndex = this.workload.availability.findIndex(a => a.user_id === userId);

  const availability = {
    user_id: userId,
    status,
    until,
    reason
  };

  if (existingIndex >= 0) {
    this.workload.availability[existingIndex] = availability;
  } else {
    this.workload.availability.push(availability);
  }

  return this.save();
};

TeamSchema.methods.isWithinWorkingHours = function(date?: Date) {
  if (!this.settings.working_hours) return true;

  const checkDate = date || new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[checkDate.getDay()];
  const daySettings = this.settings.working_hours[dayName];

  if (!daySettings.enabled) return false;

  const currentTime = checkDate.toTimeString().slice(0, 5); // HH:MM format
  return currentTime >= daySettings.start && currentTime <= daySettings.end;
};

// Middleware
TeamSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add creator as owner
    if (!this.members.some(member => member.user_id === this.created_by)) {
      this.members.push({
        user_id: this.created_by,
        role: 'owner',
        permissions: {
          can_create_content: true,
          can_approve_content: true,
          can_reject_content: true,
          can_edit_content: true,
          can_delete_content: true,
          can_manage_workflows: true,
          can_manage_members: true,
          can_view_analytics: true,
          can_export_data: true,
          can_manage_integrations: true
        },
        joined_at: new Date()
      });
    }

    // Initialize metrics
    if (!this.metrics) {
      this.metrics = {
        total_content_created: 0,
        total_content_approved: 0,
        total_content_rejected: 0,
        total_content_published: 0,
        avg_approval_time_hours: 0,
        avg_content_quality_score: 0,
        current_workload: 0,
        productivity_score: 0,
        collaboration_score: 0
      };
    }
  }

  // Limit activity log to 100 entries
  if (this.activity_log.length > 100) {
    this.activity_log = this.activity_log.slice(-100);
  }

  next();
});

export default mongoose.model<ITeam>('Team', TeamSchema);