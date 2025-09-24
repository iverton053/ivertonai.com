import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { WidgetConfig, DashboardLayout, Position, Size, StorageKeys } from '../types';
import { storage } from '../services/storage';

interface WidgetStore {
  // State
  widgets: WidgetConfig[];
  layout: DashboardLayout | null;
  isLoading: boolean;
  error: string | null;
  selectedWidgetId: string | null;
  
  // Widget Actions
  addWidget: (widget: Omit<WidgetConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, position: Position) => void;
  resizeWidget: (id: string, size: Size) => void;
  toggleWidgetPin: (id: string) => void;
  toggleWidgetVisibility: (id: string) => void;
  duplicateWidget: (id: string) => void;
  
  // Selection
  selectWidget: (id: string | null) => void;
  getSelectedWidget: () => WidgetConfig | null;
  
  // Layout Actions
  createLayout: (name: string) => void;
  updateLayout: (updates: Partial<DashboardLayout>) => void;
  updateLayoutWidgets: (widgets: WidgetConfig[]) => void;
  resetLayout: () => void;
  setError: (error: string | null) => void;
  
  // Bulk Operations
  clearAllWidgets: () => void;
  resetWidgetPositions: () => void;
  optimizeLayout: () => void;
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
  exportLayout: () => string;
  importLayout: (layoutData: string) => boolean;
  
  // Utility
  getWidgetById: (id: string) => WidgetConfig | null;
  getWidgetsByType: (type: string) => WidgetConfig[];
  getVisibleWidgets: () => WidgetConfig[];
  getPinnedWidgets: () => WidgetConfig[];
  validateWidget: (widget: Partial<WidgetConfig>) => boolean;
}

const createDefaultLayout = (): DashboardLayout => ({
  id: `layout_${Date.now()}`,
  name: 'Default Layout',
  widgets: [],
  settings: {
    theme: 'dark',
    columns: 12,
    snapToGrid: true,
    gridSize: 20,
    autoSave: true,
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useWidgetStore = create<WidgetStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    widgets: [],
    layout: createDefaultLayout(),
    isLoading: false,
    error: null,
    selectedWidgetId: null,

    // Widget Actions
    addWidget: (widgetData) => {
      const now = Date.now();
      const newWidget: WidgetConfig = {
        id: `widget_${now}_${Math.random()}`,
        createdAt: now,
        updatedAt: now,
        ...widgetData,
      };

      // Validate widget before adding
      if (!get().validateWidget(newWidget)) {
        get().setError('Invalid widget configuration');
        return;
      }

      const { widgets } = get();
      const updatedWidgets = [...widgets, newWidget];
      
      set({ 
        widgets: updatedWidgets,
        error: null 
      });
      
      get().updateLayoutWidgets(updatedWidgets);
      get().saveToStorage();
    },

    updateWidget: (id, updates) => {
      const { widgets } = get();
      const widgetIndex = widgets.findIndex(w => w.id === id);
      
      if (widgetIndex === -1) {
        get().setError(`Widget ${id} not found`);
        return;
      }

      const updatedWidget = {
        ...widgets[widgetIndex],
        ...updates,
        updatedAt: Date.now(),
      };

      // Validate updated widget
      if (!get().validateWidget(updatedWidget)) {
        get().setError('Invalid widget update');
        return;
      }

      const updatedWidgets = [...widgets];
      updatedWidgets[widgetIndex] = updatedWidget;
      
      set({ 
        widgets: updatedWidgets,
        error: null 
      });
      
      get().updateLayoutWidgets(updatedWidgets);
      get().saveToStorage();
    },

    removeWidget: (id) => {
      const { widgets, selectedWidgetId } = get();
      const updatedWidgets = widgets.filter(w => w.id !== id);
      
      set({ 
        widgets: updatedWidgets,
        selectedWidgetId: selectedWidgetId === id ? null : selectedWidgetId,
        error: null 
      });
      
      get().updateLayoutWidgets(updatedWidgets);
      get().saveToStorage();
    },

    moveWidget: (id, position) => {
      get().updateWidget(id, { position });
    },

    resizeWidget: (id, size) => {
      get().updateWidget(id, { size });
    },

    toggleWidgetPin: (id) => {
      const widget = get().getWidgetById(id);
      if (widget) {
        get().updateWidget(id, { isPinned: !widget.isPinned });
      }
    },

    toggleWidgetVisibility: (id) => {
      const widget = get().getWidgetById(id);
      if (widget) {
        get().updateWidget(id, { isVisible: !widget.isVisible });
      }
    },

    duplicateWidget: (id) => {
      const widget = get().getWidgetById(id);
      if (widget) {
        const duplicate = {
          ...widget,
          title: `${widget.title} (Copy)`,
          position: {
            x: widget.position.x + 20,
            y: widget.position.y + 20,
          },
          isPinned: false,
        };
        
        // Remove id and timestamps for addWidget to generate new ones
        const { id: _, createdAt, updatedAt, ...duplicateData } = duplicate;
        get().addWidget(duplicateData);
      }
    },

    // Selection
    selectWidget: (selectedWidgetId) => {
      set({ selectedWidgetId });
    },

    getSelectedWidget: () => {
      const { selectedWidgetId, widgets } = get();
      return selectedWidgetId ? widgets.find(w => w.id === selectedWidgetId) || null : null;
    },

    // Layout Actions
    createLayout: (name) => {
      const newLayout = createDefaultLayout();
      newLayout.name = name;
      newLayout.widgets = [...get().widgets];
      
      set({ layout: newLayout });
      get().saveToStorage();
    },

    updateLayout: (updates) => {
      const { layout } = get();
      if (!layout) return;

      const updatedLayout: DashboardLayout = {
        ...layout,
        ...updates,
        updatedAt: Date.now(),
      };

      set({ layout: updatedLayout });
      get().saveToStorage();
    },

    updateLayoutWidgets: (widgets) => {
      const { layout } = get();
      if (!layout) return;

      const updatedLayout: DashboardLayout = {
        ...layout,
        widgets: widgets,
        updatedAt: Date.now(),
      };

      set({ layout: updatedLayout });
    },

    setError: (error) => {
      set({ error });
    },

    resetLayout: () => {
      const newLayout = createDefaultLayout();
      set({ 
        layout: newLayout,
        widgets: [],
        selectedWidgetId: null 
      });
      get().saveToStorage();
    },

    // Bulk Operations
    clearAllWidgets: () => {
      set({ 
        widgets: [],
        selectedWidgetId: null 
      });
      get().updateLayoutWidgets([]);
      get().saveToStorage();
    },

    resetWidgetPositions: () => {
      const { widgets } = get();
      let x = 20;
      let y = 20;
      const spacing = 20;
      const maxWidth = 800;

      const updatedWidgets = widgets.map((widget, index) => {
        const newWidget = {
          ...widget,
          position: { x, y },
          updatedAt: Date.now(),
        };

        // Calculate next position
        x += widget.size.width + spacing;
        if (x + widget.size.width > maxWidth) {
          x = 20;
          y += widget.size.height + spacing;
        }

        return newWidget;
      });

      set({ widgets: updatedWidgets });
      get().updateLayoutWidgets(updatedWidgets);
      get().saveToStorage();
    },

    optimizeLayout: () => {
      // Simple grid-based optimization
      const { widgets, layout } = get();
      if (!layout) return;

      const gridSize = layout.settings.gridSize;
      const optimizedWidgets = widgets.map(widget => ({
        ...widget,
        position: {
          x: Math.round(widget.position.x / gridSize) * gridSize,
          y: Math.round(widget.position.y / gridSize) * gridSize,
        },
        size: {
          width: Math.round(widget.size.width / gridSize) * gridSize,
          height: Math.round(widget.size.height / gridSize) * gridSize,
        },
        updatedAt: Date.now(),
      }));

      set({ widgets: optimizedWidgets });
      get().updateLayoutWidgets(optimizedWidgets);
      get().saveToStorage();
    },

    // Persistence
    loadFromStorage: () => {
      set({ isLoading: true, error: null });
      
      try {
        // Load layout
        const savedLayout = storage.get<DashboardLayout>(StorageKeys.DASHBOARD_LAYOUT);
        const layout = savedLayout || createDefaultLayout();

        // Load widgets
        const savedWidgets = storage.get<WidgetConfig[]>(StorageKeys.WIDGET_CONFIGS, []);
        
        // Validate and filter widgets
        const validWidgets = (savedWidgets || []).filter(widget => get().validateWidget(widget));

        set({ 
          layout,
          widgets: validWidgets,
          isLoading: false 
        });
      } catch (error) {
        console.error('Failed to load widget data:', error);
        set({ 
          error: 'Failed to load widgets',
          isLoading: false,
          layout: createDefaultLayout(),
          widgets: []
        });
      }
    },

    saveToStorage: () => {
      const { widgets, layout } = get();
      
      if (layout) {
        storage.set(StorageKeys.DASHBOARD_LAYOUT, {
          ...layout,
          widgets,
          updatedAt: Date.now(),
        });
      }
      
      storage.set(StorageKeys.WIDGET_CONFIGS, widgets);
    },

    exportLayout: () => {
      const { layout, widgets } = get();
      const exportData = {
        layout,
        widgets,
        timestamp: Date.now(),
        version: '1.0.0',
      };
      
      return JSON.stringify(exportData, null, 2);
    },

    importLayout: (layoutData) => {
      try {
        const parsed = JSON.parse(layoutData);
        
        if (!parsed.layout || !Array.isArray(parsed.widgets)) {
          throw new Error('Invalid layout format');
        }

        // Validate widgets
        const validWidgets = parsed.widgets.filter((widget: any) => 
          get().validateWidget(widget)
        );

        set({
          layout: parsed.layout,
          widgets: validWidgets,
          selectedWidgetId: null,
          error: null,
        });

        get().saveToStorage();
        return true;
      } catch (error) {
        console.error('Import failed:', error);
        get().setError('Failed to import layout');
        return false;
      }
    },

    // Utility functions
    getWidgetById: (id) => {
      const { widgets } = get();
      return widgets.find(w => w.id === id) || null;
    },

    getWidgetsByType: (type) => {
      const { widgets } = get();
      return widgets.filter(w => w.type === type);
    },

    getVisibleWidgets: () => {
      const { widgets } = get();
      return widgets.filter(w => w.isVisible);
    },

    getPinnedWidgets: () => {
      const { widgets } = get();
      return widgets.filter(w => w.isPinned);
    },

    validateWidget: (widget) => {
      // Basic validation
      return !!(
        widget &&
        typeof widget.title === 'string' &&
        widget.title.length > 0 &&
        widget.type &&
        widget.position &&
        typeof widget.position.x === 'number' &&
        typeof widget.position.y === 'number' &&
        widget.size &&
        typeof widget.size.width === 'number' &&
        typeof widget.size.height === 'number' &&
        widget.size.width > 0 &&
        widget.size.height > 0
      );
    },

  }))
);

// Auto-save on widget changes
useWidgetStore.subscribe(
  (state) => state.widgets,
  () => {
    useWidgetStore.getState().saveToStorage();
  },
  { fireImmediately: false }
);

// Load widgets on store creation
useWidgetStore.getState().loadFromStorage();