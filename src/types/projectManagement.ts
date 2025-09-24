// ================ CORE PROJECT TYPES ================

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectType = 'seo' | 'content' | 'website' | 'social_media' | 'ppc' | 'consulting' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
export type ProjectRole = 'project_manager' | 'developer' | 'designer' | 'content_writer' | 'seo_specialist' | 'analyst';

export interface Project {
  id: string;
  client_id: string;
  client?: any; // Will reference Client from financial types
  name: string;
  description: string;
  project_type: ProjectType;
  status: ProjectStatus;
  priority: Priority;
  budget: number;
  currency: string;
  start_date: string;
  end_date: string;
  estimated_hours: number;
  actual_hours: number;
  completion_percentage: number;
  created_by: string;
  assigned_pm: string; // Project Manager user ID
  tags: string[];
  is_billable: boolean;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  project?: Project;
  parent_task_id?: string;
  parent_task?: Task;
  subtasks?: Task[];
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigned_to?: string;
  assigned_user?: any; // Will reference User
  created_by: string;
  estimated_hours: number;
  actual_hours: number;
  start_date?: string;
  due_date: string;
  completed_at?: string;
  tags: string[];
  is_billable: boolean;
  is_client_visible: boolean;
  dependencies: string[]; // Task IDs this task depends on
  created_at: string;
  updated_at: string;
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  created_at: string;
}

// ================ TIME TRACKING ================

export interface TimeLog {
  id: string;
  task_id: string;
  task?: Task;
  user_id: string;
  user?: any; // Will reference User
  hours_worked: number;
  work_date: string;
  description: string;
  is_billable: boolean;
  hourly_rate: number;
  total_amount: number;
  created_at: string;
}

export interface ProjectTimeTracking {
  project_id: string;
  total_logged_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  total_cost: number;
  by_user: Array<{
    user_id: string;
    user_name: string;
    hours: number;
    cost: number;
  }>;
  by_task: Array<{
    task_id: string;
    task_name: string;
    hours: number;
    cost: number;
  }>;
}

// ================ COLLABORATION ================

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user?: any; // Will reference User
  comment: string;
  is_internal: boolean; // Internal team comments vs client-visible
  mentioned_users: string[]; // User IDs mentioned in comment
  attachments: ProjectFile[];
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  task_id?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  uploader?: any; // Will reference User
  is_client_visible: boolean;
  version: number;
  description?: string;
  created_at: string;
}

// ================ MILESTONES & TEMPLATES ================

export interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  description: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  completion_percentage: number;
  requires_client_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  tasks: string[]; // Task IDs included in this milestone
  created_at: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  project_type: ProjectType;
  estimated_duration_days: number;
  estimated_budget: number;
  estimated_hours: number;
  template_data: {
    tasks: Array<{
      title: string;
      description: string;
      estimated_hours: number;
      dependencies: string[];
      role_required: ProjectRole;
      is_client_visible: boolean;
    }>;
    milestones: Array<{
      name: string;
      description: string;
      days_from_start: number;
      requires_approval: boolean;
    }>;
  };
  created_by: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// ================ TEAM & RESOURCES ================

export interface ProjectTeamMember {
  id: string;
  project_id: string;
  user_id: string;
  user?: any; // Will reference User
  role: ProjectRole;
  hourly_rate: number;
  allocated_hours: number;
  actual_hours: number;
  allocation_percentage: number; // 0-100, percentage of time allocated to project
  joined_at: string;
  left_at?: string;
}

export interface ResourceAllocation {
  id: string;
  user_id: string;
  project_id: string;
  allocation_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface UserWorkload {
  user_id: string;
  user_name: string;
  total_allocated_hours: number;
  available_hours: number;
  utilization_percentage: number;
  current_projects: Array<{
    project_id: string;
    project_name: string;
    allocated_hours: number;
    role: ProjectRole;
  }>;
  upcoming_deadlines: Array<{
    task_id: string;
    task_name: string;
    project_name: string;
    due_date: string;
    priority: Priority;
  }>;
}

// ================ DASHBOARD & ANALYTICS ================

export interface ProjectMetrics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  overdue_projects: number;
  total_budget: number;
  total_spent: number;
  average_completion_time: number;
  team_utilization: number;
  client_satisfaction: number;
  profit_margin: number;
}

export interface ProjectStatusSummary {
  project_id: string;
  project_name: string;
  client_name: string;
  completion_percentage: number;
  days_remaining: number;
  budget_used_percentage: number;
  team_members_count: number;
  overdue_tasks: number;
  upcoming_deadlines: number;
  status: ProjectStatus;
  health_score: number; // 0-100 calculated score
  last_activity: string;
}

export interface TaskBoard {
  project_id: string;
  columns: Array<{
    status: TaskStatus;
    title: string;
    tasks: Task[];
    task_count: number;
  }>;
}

export interface GanttChartData {
  project_id: string;
  timeline: {
    start_date: string;
    end_date: string;
    total_days: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    completion_percentage: number;
    dependencies: string[];
    assigned_to: string;
    is_milestone: boolean;
    color: string;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    date: string;
    completed: boolean;
  }>;
}

// ================ CLIENT PORTAL INTEGRATION ================

export interface ClientProjectView {
  project: Project;
  visible_tasks: Task[];
  milestones: ProjectMilestone[];
  recent_updates: TaskComment[];
  files: ProjectFile[];
  progress_summary: {
    completion_percentage: number;
    tasks_completed: number;
    tasks_total: number;
    next_milestone: ProjectMilestone;
    estimated_completion: string;
  };
  budget_summary: {
    total_budget: number;
    spent_amount: number;
    remaining_budget: number;
    budget_used_percentage: number;
  };
}

// ================ REPORTING ================

export interface ProjectReport {
  id: string;
  project_id: string;
  report_type: 'status' | 'time_tracking' | 'budget' | 'team_performance' | 'client_summary';
  generated_by: string;
  generated_at: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  data: any; // Flexible data structure based on report type
  recipients: string[]; // Email addresses for automated reports
}

export interface TeamProductivityReport {
  date_range: {
    start_date: string;
    end_date: string;
  };
  team_metrics: Array<{
    user_id: string;
    user_name: string;
    total_hours: number;
    billable_hours: number;
    utilization_rate: number;
    projects_worked_on: number;
    tasks_completed: number;
    average_task_completion_time: number;
  }>;
  project_metrics: Array<{
    project_id: string;
    project_name: string;
    total_hours: number;
    budget_utilization: number;
    completion_percentage: number;
    team_members: number;
  }>;
}

// ================ NOTIFICATIONS ================

export interface ProjectNotification {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  type: 'task_assigned' | 'deadline_approaching' | 'task_completed' | 'comment_mention' | 'project_status_changed';
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// ================ FORM DATA TYPES ================

export interface CreateProjectData {
  client_id: string;
  name: string;
  description: string;
  project_type: ProjectType;
  priority: Priority;
  budget: number;
  start_date: string;
  end_date: string;
  estimated_hours: number;
  tags: string[];
  template_id?: string;
  team_members: Array<{
    user_id: string;
    role: ProjectRole;
    hourly_rate: number;
    allocation_percentage: number;
  }>;
}

export interface CreateTaskData {
  project_id: string;
  title: string;
  description: string;
  priority: Priority;
  assigned_to?: string;
  estimated_hours: number;
  due_date: string;
  tags: string[];
  is_client_visible: boolean;
  dependencies: string[];
}

export interface UpdateTaskStatusData {
  status: TaskStatus;
  completion_notes?: string;
  actual_hours?: number;
  next_assignee?: string;
}

// ================ API RESPONSE TYPES ================

export interface ProjectListResponse {
  projects: Project[];
  total_count: number;
  active_count: number;
  completed_count: number;
  overdue_count: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total_count: number;
  by_status: Record<TaskStatus, number>;
  overdue_count: number;
}

export interface ProjectDashboardData {
  metrics: ProjectMetrics;
  recent_projects: Project[];
  upcoming_deadlines: Array<{
    task: Task;
    project: Project;
    days_until_due: number;
  }>;
  team_workload: UserWorkload[];
  recent_activities: Array<{
    type: 'task_created' | 'task_completed' | 'project_started' | 'milestone_reached';
    description: string;
    project_name: string;
    user_name: string;
    timestamp: string;
  }>;
}