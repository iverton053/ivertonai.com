export type NoteType = 'text' | 'task' | 'reminder' | 'idea' | 'link' | 'sketch';

export type NoteCategory = 'personal' | 'work' | 'ideas' | 'reminders' | 'urgent' | 'archived';

export type NotePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface NotePosition {
  x: number;
  y: number;
  zIndex: number;
}

export interface StickyNote {
  id: string;
  type: NoteType;
  title?: string;
  content: string;
  category: NoteCategory;
  priority: NotePriority;
  color: string;
  position?: NotePosition;
  size: {
    width: number;
    height: number;
  };
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  reminderDate?: Date;
  tasks?: TaskItem[];
  linkUrl?: string;
  linkPreview?: {
    title: string;
    description: string;
    image?: string;
  };
  sketchData?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  sharedWith: string[];
  isShared: boolean;
  metadata: {
    wordCount?: number;
    lastEditedBy?: string;
    version: number;
  };
}

export interface NotesFilters {
  category?: NoteCategory[];
  type?: NoteType[];
  priority?: NotePriority[];
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  hasReminder?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export interface NotesSettings {
  defaultView: 'grid' | 'masonry' | 'list';
  autoSave: boolean;
  autoSaveInterval: number; // in milliseconds
  showCategories: boolean;
  enableCollaboration: boolean;
  enableReminders: boolean;
  enableNotifications: boolean;
  defaultNoteSize: {
    width: number;
    height: number;
  };
  gridSnapSize: number;
  maxNotesPerView: number;
  enableDragDrop: boolean;
  enableAutoBackup: boolean;
  theme: {
    colorPalette: string[];
    fontSize: 'small' | 'medium' | 'large';
    fontFamily: string;
  };
}

export interface NotesState {
  notes: StickyNote[];
  filters: NotesFilters;
  selectedNotes: string[];
  activeNote?: string;
  view: 'grid' | 'masonry' | 'list';
  isLoading: boolean;
  error?: string;
  settings: NotesSettings;
  draggedNote?: string;
  clipboard?: {
    notes: StickyNote[];
    operation: 'copy' | 'cut';
  };
  searchResults: StickyNote[];
  recentNotes: StickyNote[];
  pinnedNotes: StickyNote[];
  reminderNotes: StickyNote[];
}

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  type: NoteType;
  template: Partial<StickyNote>;
  category: string;
  isDefault: boolean;
}

export interface NotesAnalytics {
  totalNotes: number;
  notesByCategory: Record<NoteCategory, number>;
  notesByType: Record<NoteType, number>;
  completedTasks: number;
  totalTasks: number;
  dailyActivity: Array<{
    date: string;
    created: number;
    updated: number;
    completed: number;
  }>;
  mostUsedTags: Array<{
    tag: string;
    count: number;
  }>;
  averageNoteLength: number;
  collaborationStats: {
    sharedNotes: number;
    collaborators: number;
    commentsCount: number;
  };
}

// Color schemes for different categories
export const CATEGORY_COLORS: Record<NoteCategory, string> = {
  personal: '#8B5CF6', // Purple
  work: '#3B82F6', // Blue
  ideas: '#10B981', // Green
  reminders: '#F59E0B', // Yellow
  urgent: '#EF4444', // Red
  archived: '#6B7280', // Gray
};

// Note type icons
export const NOTE_TYPE_ICONS: Record<NoteType, string> = {
  text: 'FileText',
  task: 'CheckSquare',
  reminder: 'Bell',
  idea: 'Lightbulb',
  link: 'Link',
  sketch: 'Palette',
};

// Priority levels with colors
export const PRIORITY_COLORS: Record<NotePriority, string> = {
  low: '#10B981',
  medium: '#F59E0B', 
  high: '#F97316',
  urgent: '#EF4444',
};