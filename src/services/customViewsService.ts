export interface FilterCriteria {
  search: string;
  status: 'all' | 'fresh' | 'stale' | 'running' | 'completed' | 'failed' | 'paused';
  categories: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priority?: 'all' | 'high' | 'medium' | 'low';
  tags?: string[];
  performanceRange?: {
    cpuMin?: number;
    cpuMax?: number;
    memoryMin?: number;
    memoryMax?: number;
    executionTimeMin?: number;
    executionTimeMax?: number;
  };
}

export interface SortOptions {
  field: 'name' | 'status' | 'lastRun' | 'priority' | 'performance' | 'successRate' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface ViewLayout {
  type: 'grid' | 'list' | 'compact';
  columns?: number;
  showDetails: boolean;
  cardSize: 'small' | 'medium' | 'large';
}

export interface CustomView {
  id: string;
  name: string;
  description?: string;
  filters: FilterCriteria;
  sort: SortOptions;
  layout: ViewLayout;
  isDefault: boolean;
  isPinned: boolean;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

class CustomViewsService {
  private views: Map<string, CustomView> = new Map();
  private activeViewId: string | null = null;
  private listeners: Array<(views: CustomView[], activeView: CustomView | null) => void> = [];

  constructor() {
    this.loadViews();
    this.initializeDefaultViews();
  }

  private loadViews(): void {
    try {
      const saved = localStorage.getItem('ai-hub-custom-views');
      if (saved) {
        const viewsArray: CustomView[] = JSON.parse(saved);
        viewsArray.forEach(view => {
          this.views.set(view.id, view);
        });
      }
    } catch (error) {
      console.warn('Failed to load custom views:', error);
    }
  }

  private saveViews(): void {
    try {
      const viewsArray = Array.from(this.views.values());
      localStorage.setItem('ai-hub-custom-views', JSON.stringify(viewsArray));
    } catch (error) {
      console.warn('Failed to save custom views:', error);
    }
  }

  private initializeDefaultViews(): void {
    // Only create defaults if no views exist
    if (this.views.size === 0) {
      this.createDefaultViews();
    }

    // Set active view if none is set
    if (!this.activeViewId) {
      const defaultView = Array.from(this.views.values()).find(v => v.isDefault);
      if (defaultView) {
        this.activeViewId = defaultView.id;
      }
    }
  }

  private createDefaultViews(): void {
    const defaultViews: Omit<CustomView, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'All Automations',
        description: 'View all automations with default sorting',
        filters: {
          search: '',
          status: 'all',
          categories: []
        },
        sort: {
          field: 'lastRun',
          direction: 'desc'
        },
        layout: {
          type: 'grid',
          columns: 3,
          showDetails: true,
          cardSize: 'medium'
        },
        isDefault: true,
        isPinned: true,
        color: 'purple',
        icon: 'LayoutGrid',
        usageCount: 0
      },
      {
        name: 'Active Running',
        description: 'Currently running automations',
        filters: {
          search: '',
          status: 'running',
          categories: []
        },
        sort: {
          field: 'priority',
          direction: 'desc'
        },
        layout: {
          type: 'list',
          showDetails: true,
          cardSize: 'small'
        },
        isDefault: false,
        isPinned: true,
        color: 'green',
        icon: 'Play',
        usageCount: 0
      },
      {
        name: 'Needs Attention',
        description: 'Failed or stale automations requiring attention',
        filters: {
          search: '',
          status: 'stale',
          categories: []
        },
        sort: {
          field: 'lastRun',
          direction: 'asc'
        },
        layout: {
          type: 'list',
          showDetails: true,
          cardSize: 'medium'
        },
        isDefault: false,
        isPinned: true,
        color: 'orange',
        icon: 'AlertTriangle',
        usageCount: 0
      },
      {
        name: 'High Performance',
        description: 'Top performing automations',
        filters: {
          search: '',
          status: 'all',
          categories: [],
          performanceRange: {
            cpuMax: 50,
            memoryMax: 50
          }
        },
        sort: {
          field: 'performance',
          direction: 'desc'
        },
        layout: {
          type: 'grid',
          columns: 2,
          showDetails: true,
          cardSize: 'large'
        },
        isDefault: false,
        isPinned: false,
        color: 'blue',
        icon: 'TrendingUp',
        usageCount: 0
      },
      {
        name: 'Recent Activity',
        description: 'Recently updated automations',
        filters: {
          search: '',
          status: 'all',
          categories: []
        },
        sort: {
          field: 'lastRun',
          direction: 'desc'
        },
        layout: {
          type: 'compact',
          showDetails: false,
          cardSize: 'small'
        },
        isDefault: false,
        isPinned: false,
        color: 'cyan',
        icon: 'Clock',
        usageCount: 0
      }
    ];

    defaultViews.forEach(viewData => {
      const view: CustomView = {
        ...viewData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.views.set(view.id, view);
    });

    this.saveViews();
  }

  private generateId(): string {
    return `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyListeners(): void {
    const viewsArray = Array.from(this.views.values());
    const activeView = this.activeViewId ? this.views.get(this.activeViewId) || null : null;
    
    this.listeners.forEach(listener => {
      try {
        listener(viewsArray, activeView);
      } catch (error) {
        console.error('Error in custom views listener:', error);
      }
    });
  }

  // Public API
  getAllViews(): CustomView[] {
    return Array.from(this.views.values()).sort((a, b) => {
      // Pinned views first, then by usage count, then by name
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      return a.name.localeCompare(b.name);
    });
  }

  getPinnedViews(): CustomView[] {
    return this.getAllViews().filter(view => view.isPinned);
  }

  getActiveView(): CustomView | null {
    return this.activeViewId ? this.views.get(this.activeViewId) || null : null;
  }

  setActiveView(viewId: string): boolean {
    if (this.views.has(viewId)) {
      this.activeViewId = viewId;
      
      // Increment usage count
      const view = this.views.get(viewId)!;
      view.usageCount += 1;
      view.updatedAt = new Date().toISOString();
      this.views.set(viewId, view);
      
      this.saveViews();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  createView(viewData: Omit<CustomView, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): string {
    const view: CustomView = {
      ...viewData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };

    // If this is set as default, unset other defaults
    if (view.isDefault) {
      this.views.forEach(existingView => {
        if (existingView.isDefault) {
          existingView.isDefault = false;
          this.views.set(existingView.id, existingView);
        }
      });
    }

    this.views.set(view.id, view);
    this.saveViews();
    this.notifyListeners();
    return view.id;
  }

  updateView(viewId: string, updates: Partial<Omit<CustomView, 'id' | 'createdAt' | 'usageCount'>>): boolean {
    const view = this.views.get(viewId);
    if (!view) return false;

    const updatedView: CustomView = {
      ...view,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Handle default view logic
    if (updates.isDefault === true) {
      this.views.forEach(existingView => {
        if (existingView.id !== viewId && existingView.isDefault) {
          existingView.isDefault = false;
          this.views.set(existingView.id, existingView);
        }
      });
    }

    this.views.set(viewId, updatedView);
    this.saveViews();
    this.notifyListeners();
    return true;
  }

  deleteView(viewId: string): boolean {
    const view = this.views.get(viewId);
    if (!view) return false;

    // Can't delete the last view
    if (this.views.size <= 1) return false;

    // If deleting the active view, switch to default or first available
    if (this.activeViewId === viewId) {
      const defaultView = Array.from(this.views.values()).find(v => v.isDefault && v.id !== viewId);
      if (defaultView) {
        this.activeViewId = defaultView.id;
      } else {
        const firstView = Array.from(this.views.values()).find(v => v.id !== viewId);
        this.activeViewId = firstView ? firstView.id : null;
      }
    }

    this.views.delete(viewId);
    this.saveViews();
    this.notifyListeners();
    return true;
  }

  duplicateView(viewId: string, newName?: string): string | null {
    const sourceView = this.views.get(viewId);
    if (!sourceView) return null;

    const duplicatedView = {
      ...sourceView,
      name: newName || `${sourceView.name} (Copy)`,
      isDefault: false, // Copies are never default
      usageCount: 0
    };

    return this.createView(duplicatedView);
  }

  // Quick view creation from current state
  createViewFromCurrentState(
    name: string,
    currentFilters: FilterCriteria,
    currentSort: SortOptions,
    currentLayout: ViewLayout,
    options?: {
      description?: string;
      color?: string;
      icon?: string;
      isPinned?: boolean;
    }
  ): string {
    return this.createView({
      name,
      description: options?.description,
      filters: currentFilters,
      sort: currentSort,
      layout: currentLayout,
      isDefault: false,
      isPinned: options?.isPinned || false,
      color: options?.color || 'purple',
      icon: options?.icon || 'Bookmark'
    });
  }

  // View management
  togglePin(viewId: string): boolean {
    const view = this.views.get(viewId);
    if (!view) return false;

    view.isPinned = !view.isPinned;
    view.updatedAt = new Date().toISOString();
    this.views.set(viewId, view);
    this.saveViews();
    this.notifyListeners();
    return true;
  }

  setAsDefault(viewId: string): boolean {
    const view = this.views.get(viewId);
    if (!view) return false;

    // Unset current default
    this.views.forEach(existingView => {
      if (existingView.isDefault) {
        existingView.isDefault = false;
        this.views.set(existingView.id, existingView);
      }
    });

    // Set new default
    view.isDefault = true;
    view.updatedAt = new Date().toISOString();
    this.views.set(viewId, view);
    
    this.saveViews();
    this.notifyListeners();
    return true;
  }

  // Search and filtering
  searchViews(query: string): CustomView[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllViews().filter(view =>
      view.name.toLowerCase().includes(lowerQuery) ||
      (view.description && view.description.toLowerCase().includes(lowerQuery))
    );
  }

  getViewsByCategory(category: string): CustomView[] {
    return this.getAllViews().filter(view =>
      view.filters.categories.includes(category)
    );
  }

  // Event listeners
  onViewsChange(callback: (views: CustomView[], activeView: CustomView | null) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Statistics
  getViewStats() {
    const views = this.getAllViews();
    const totalViews = views.length;
    const pinnedViews = views.filter(v => v.isPinned).length;
    const totalUsage = views.reduce((sum, view) => sum + view.usageCount, 0);
    const mostUsedView = views.reduce((max, view) => 
      view.usageCount > max.usageCount ? view : max, views[0]);

    return {
      totalViews,
      pinnedViews,
      totalUsage,
      mostUsedView: mostUsedView ? mostUsedView.name : 'None',
      activeViewName: this.getActiveView()?.name || 'None'
    };
  }

  // Import/Export
  exportViews(): string {
    const views = Array.from(this.views.values());
    return JSON.stringify(views, null, 2);
  }

  importViews(viewsJson: string, options?: { merge?: boolean; replaceActive?: boolean }): boolean {
    try {
      const imported: CustomView[] = JSON.parse(viewsJson);
      
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format: expected array of views');
      }

      if (!options?.merge) {
        this.views.clear();
      }

      let newDefaultView: CustomView | null = null;

      imported.forEach(view => {
        // Ensure unique IDs
        if (this.views.has(view.id) || !options?.merge) {
          view.id = this.generateId();
        }

        // Handle default view conflicts
        if (view.isDefault) {
          if (newDefaultView) {
            view.isDefault = false; // Only keep the first default
          } else {
            newDefaultView = view;
          }
        }

        this.views.set(view.id, view);
      });

      // If we imported a new default and merge is enabled, handle conflicts
      if (newDefaultView && options?.merge) {
        this.views.forEach(existingView => {
          if (existingView.id !== newDefaultView!.id && existingView.isDefault) {
            existingView.isDefault = false;
            this.views.set(existingView.id, existingView);
          }
        });
      }

      // Update active view if requested
      if (options?.replaceActive && newDefaultView) {
        this.activeViewId = newDefaultView.id;
      } else if (!this.activeViewId || !this.views.has(this.activeViewId)) {
        // Set active view to default or first available
        const defaultView = Array.from(this.views.values()).find(v => v.isDefault);
        this.activeViewId = defaultView ? defaultView.id : Array.from(this.views.keys())[0];
      }

      this.saveViews();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to import views:', error);
      return false;
    }
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.views.clear();
    this.activeViewId = null;
    this.createDefaultViews();
    this.initializeDefaultViews();
    this.notifyListeners();
  }
}

// Export singleton instance
export const customViewsService = new CustomViewsService();
export default customViewsService;