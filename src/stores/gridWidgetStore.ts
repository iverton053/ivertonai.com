import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WidgetData, WidgetContent } from '../types/widget.types';
import { getDefaultWidgetContent } from '../utils/widgetDefaults';

export interface GridWidget extends WidgetData {}

interface GridWidgetStore {
  // State
  widgets: GridWidget[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  addWidget: (widget: Omit<GridWidget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addMultipleWidgets: (widgetTypes: string[]) => void;
  updateWidget: (id: string, updates: Partial<GridWidget>) => void;
  removeWidget: (id: string) => void;
  resizeWidget: (id: string, size: 'standard' | 'expanded') => void;
  toggleWidgetVisibility: (id: string) => void;
  clearAllWidgets: () => void;
  initializeDefaultWidgets: () => void;
  
  // Utility
  getWidgetById: (id: string) => GridWidget | null;
  getVisibleWidgets: () => GridWidget[];
}

const createSampleWidget = (type: string, title: string): Omit<GridWidget, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    type,
    title,
    size: 'standard' as const,
    isVisible: true,
    content: getDefaultWidgetContent(type)
  };
};

export const useGridWidgetStore = create<GridWidgetStore>()(
  persist(
    (set, get) => ({
      // Initial state
      widgets: [],
      isLoading: false,
      error: null,
      isInitialized: false,

      // Actions
      addWidget: (widgetData) => {
        const now = Date.now();
        const newWidget: GridWidget = {
          id: `widget_${now}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
          ...widgetData,
        };

        set(state => ({
          widgets: [...state.widgets, newWidget],
          error: null
        }));
      },

      addMultipleWidgets: (widgetTypes) => {
        const now = Date.now();
        const newWidgets: GridWidget[] = widgetTypes.map((type, index) => ({
          id: `widget_${now + index}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          title: type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          size: 'standard' as const,
          isVisible: true,
          content: getDefaultWidgetContent(type),
          createdAt: now + index,
          updatedAt: now + index,
        }));

        set(state => ({
          widgets: [...state.widgets, ...newWidgets],
          error: null
        }));
      },

      updateWidget: (id, updates) => {
        set(state => ({
          widgets: state.widgets.map(widget =>
            widget.id === id
              ? { ...widget, ...updates, updatedAt: Date.now() }
              : widget
          ),
          error: null
        }));
      },

      removeWidget: (id) => {
        set(state => ({
          widgets: state.widgets.filter(widget => widget.id !== id),
          error: null
        }));
      },

      resizeWidget: (id, size) => {
        get().updateWidget(id, { size });
      },

      toggleWidgetVisibility: (id) => {
        const widget = get().getWidgetById(id);
        if (widget) {
          get().updateWidget(id, { isVisible: !widget.isVisible });
        }
      },

      clearAllWidgets: () => {
        set({ widgets: [], error: null });
      },

      initializeDefaultWidgets: () => {
        const state = get();
        if (state.isInitialized) return;

        // Remove any existing AI Hub widgets (cleanup from previous versions)
        const filteredWidgets = state.widgets.filter(widget => widget.type !== 'AI Hub');

        // Initialize without default widgets - let users add what they need
        set(state => ({
          ...state,
          widgets: filteredWidgets,
          isInitialized: true,
          error: null
        }));
      },

      // Utility functions
      getWidgetById: (id) => {
        return get().widgets.find(widget => widget.id === id) || null;
      },

      getVisibleWidgets: () => {
        return get().widgets.filter(widget => widget.isVisible);
      },
    }),
    {
      name: 'grid-widget-storage',
      partialize: (state) => ({
        widgets: state.widgets,
        isInitialized: state.isInitialized,
      }),
    }
  )
);