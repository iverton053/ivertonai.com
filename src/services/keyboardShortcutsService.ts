export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string; // e.g., 'Ctrl+K', 'Shift+F', '/'
  category: 'navigation' | 'automation' | 'view' | 'search' | 'bulk' | 'export' | 'general';
  action: () => void;
  enabled: boolean;
  global?: boolean; // Whether shortcut works globally or only when widget is focused
}

export interface ShortcutConfig {
  shortcuts: Record<string, string>; // shortcutId -> keys
  enabled: boolean;
  showHints: boolean;
  customShortcuts: Record<string, string>;
}

class KeyboardShortcutsService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private config: ShortcutConfig;
  private listeners: Function[] = [];
  private isListening = false;
  private activeElement: HTMLElement | null = null;

  constructor() {
    this.config = this.loadConfig();
    this.initializeDefaultShortcuts();
    this.startListening();
  }

  private loadConfig(): ShortcutConfig {
    try {
      const saved = localStorage.getItem('ai-hub-shortcuts');
      if (saved) {
        return { ...this.getDefaultConfig(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load shortcuts config:', error);
    }
    return this.getDefaultConfig();
  }

  private getDefaultConfig(): ShortcutConfig {
    return {
      shortcuts: {},
      enabled: true,
      showHints: true,
      customShortcuts: {}
    };
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('ai-hub-shortcuts', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save shortcuts config:', error);
    }
  }

  private initializeDefaultShortcuts(): void {
    const defaultShortcuts: Omit<KeyboardShortcut, 'action'>[] = [
      // Navigation
      { id: 'focus_search', name: 'Focus Search', description: 'Focus the search input field', keys: '/', category: 'search', enabled: true, global: true },
      { id: 'toggle_bulk_mode', name: 'Toggle Bulk Mode', description: 'Enter or exit bulk selection mode', keys: 'Ctrl+B', category: 'bulk', enabled: true, global: true },
      { id: 'refresh_all', name: 'Refresh All', description: 'Refresh all automations', keys: 'F5', category: 'automation', enabled: true, global: true },
      { id: 'toggle_alerts', name: 'Toggle Alerts', description: 'Show or hide alerts panel', keys: 'Ctrl+Shift+A', category: 'view', enabled: true, global: true },
      
      // Views
      { id: 'next_view', name: 'Next View', description: 'Switch to next custom view', keys: 'Ctrl+]', category: 'view', enabled: true, global: true },
      { id: 'prev_view', name: 'Previous View', description: 'Switch to previous custom view', keys: 'Ctrl+[', category: 'view', enabled: true, global: true },
      { id: 'create_view', name: 'Create View', description: 'Create new view from current state', keys: 'Ctrl+Shift+V', category: 'view', enabled: true, global: true },
      { id: 'default_view', name: 'Default View', description: 'Switch to default view', keys: 'Ctrl+Home', category: 'view', enabled: true, global: true },
      
      // Search & Filters
      { id: 'clear_search', name: 'Clear Search', description: 'Clear search field and reset filters', keys: 'Escape', category: 'search', enabled: true, global: false },
      { id: 'filter_running', name: 'Filter Running', description: 'Show only running automations', keys: 'Ctrl+1', category: 'search', enabled: true, global: true },
      { id: 'filter_fresh', name: 'Filter Fresh', description: 'Show only fresh data', keys: 'Ctrl+2', category: 'search', enabled: true, global: true },
      { id: 'filter_stale', name: 'Filter Stale', description: 'Show only stale data', keys: 'Ctrl+3', category: 'search', enabled: true, global: true },
      { id: 'filter_all', name: 'Filter All', description: 'Show all automations', keys: 'Ctrl+0', category: 'search', enabled: true, global: true },
      
      // Bulk Operations
      { id: 'select_all', name: 'Select All', description: 'Select all visible automations', keys: 'Ctrl+A', category: 'bulk', enabled: true, global: false },
      { id: 'clear_selection', name: 'Clear Selection', description: 'Clear all selections', keys: 'Ctrl+D', category: 'bulk', enabled: true, global: false },
      { id: 'bulk_start', name: 'Bulk Start', description: 'Start selected automations', keys: 'Ctrl+Shift+S', category: 'bulk', enabled: true, global: false },
      { id: 'bulk_stop', name: 'Bulk Stop', description: 'Stop selected automations', keys: 'Ctrl+Shift+X', category: 'bulk', enabled: true, global: false },
      { id: 'bulk_pause', name: 'Bulk Pause', description: 'Pause selected automations', keys: 'Ctrl+Shift+P', category: 'bulk', enabled: true, global: false },
      
      // Export
      { id: 'quick_export_json', name: 'Export JSON', description: 'Quick export as JSON', keys: 'Ctrl+E', category: 'export', enabled: true, global: true },
      { id: 'quick_export_csv', name: 'Export CSV', description: 'Quick export as CSV', keys: 'Ctrl+Shift+E', category: 'export', enabled: true, global: true },
      { id: 'export_menu', name: 'Export Menu', description: 'Open export options menu', keys: 'Ctrl+Alt+E', category: 'export', enabled: true, global: true },
      
      // General
      { id: 'show_help', name: 'Show Help', description: 'Show keyboard shortcuts help', keys: 'Ctrl+/', category: 'general', enabled: true, global: true },
      { id: 'toggle_theme', name: 'Toggle Theme', description: 'Switch between light and dark theme', keys: 'Ctrl+Shift+T', category: 'general', enabled: true, global: true },
      { id: 'toggle_compact', name: 'Toggle Compact', description: 'Toggle compact mode', keys: 'Ctrl+Shift+C', category: 'general', enabled: true, global: true }
    ];

    // Initialize shortcuts without actions (will be set by components)
    defaultShortcuts.forEach(shortcut => {
      this.shortcuts.set(shortcut.id, {
        ...shortcut,
        action: () => console.log(`Shortcut ${shortcut.id} not implemented`)
      });
    });
  }

  private startListening(): void {
    if (this.isListening) return;

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.isListening = true;
  }

  private stopListening(): void {
    if (!this.isListening) return;

    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.isListening = false;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.config.enabled) return;

    // Don't trigger shortcuts when typing in inputs (unless it's a search shortcut)
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
    
    const keyCombo = this.getKeyCombo(event);
    const matchingShortcut = this.findShortcutByKeys(keyCombo);

    if (!matchingShortcut || !matchingShortcut.enabled) return;

    // Handle special cases for input fields
    if (isInputField) {
      if (matchingShortcut.id === 'focus_search' || matchingShortcut.id === 'clear_search' || matchingShortcut.id === 'show_help') {
        // Allow these shortcuts in input fields
      } else if (!matchingShortcut.global) {
        return; // Don't trigger non-global shortcuts in input fields
      }
    }

    // Check if shortcut should work globally or only when widget is focused
    if (!matchingShortcut.global && !this.isWidgetFocused()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    try {
      matchingShortcut.action();
    } catch (error) {
      console.error(`Error executing shortcut ${matchingShortcut.id}:`, error);
    }
  }

  private getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');

    // Handle special keys
    let key = event.key;
    if (key === ' ') key = 'Space';
    else if (key === 'ArrowUp') key = 'Up';
    else if (key === 'ArrowDown') key = 'Down';
    else if (key === 'ArrowLeft') key = 'Left';
    else if (key === 'ArrowRight') key = 'Right';
    else if (key.length === 1) key = key.toUpperCase();

    parts.push(key);
    return parts.join('+');
  }

  private findShortcutByKeys(keys: string): KeyboardShortcut | null {
    // First check custom shortcuts
    const customShortcutId = Object.entries(this.config.customShortcuts).find(([_, customKeys]) => customKeys === keys)?.[0];
    if (customShortcutId && this.shortcuts.has(customShortcutId)) {
      return this.shortcuts.get(customShortcutId)!;
    }

    // Then check configured shortcuts
    const configuredShortcutId = Object.entries(this.config.shortcuts).find(([_, configKeys]) => configKeys === keys)?.[0];
    if (configuredShortcutId && this.shortcuts.has(configuredShortcutId)) {
      return this.shortcuts.get(configuredShortcutId)!;
    }

    // Finally check default shortcuts
    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.keys === keys) {
        return shortcut;
      }
    }

    return null;
  }

  private isWidgetFocused(): boolean {
    const activeElement = document.activeElement;
    return activeElement?.closest('[data-ai-hub-widget]') !== null;
  }

  // Public API
  registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  updateShortcutAction(shortcutId: string, action: () => void): boolean {
    const shortcut = this.shortcuts.get(shortcutId);
    if (shortcut) {
      shortcut.action = action;
      this.shortcuts.set(shortcutId, shortcut);
      return true;
    }
    return false;
  }

  getShortcut(shortcutId: string): KeyboardShortcut | null {
    return this.shortcuts.get(shortcutId) || null;
  }

  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  getShortcutsByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category);
  }

  setShortcutKeys(shortcutId: string, keys: string): boolean {
    const shortcut = this.shortcuts.get(shortcutId);
    if (!shortcut) return false;

    // Check for conflicts
    if (this.findShortcutByKeys(keys)) {
      throw new Error(`Shortcut keys "${keys}" are already in use`);
    }

    this.config.shortcuts[shortcutId] = keys;
    this.saveConfig();
    return true;
  }

  resetShortcutKeys(shortcutId: string): boolean {
    const shortcut = this.shortcuts.get(shortcutId);
    if (!shortcut) return false;

    delete this.config.shortcuts[shortcutId];
    delete this.config.customShortcuts[shortcutId];
    this.saveConfig();
    return true;
  }

  enableShortcut(shortcutId: string, enabled: boolean = true): boolean {
    const shortcut = this.shortcuts.get(shortcutId);
    if (!shortcut) return false;

    shortcut.enabled = enabled;
    this.shortcuts.set(shortcutId, shortcut);
    return true;
  }

  // Configuration
  getConfig(): ShortcutConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ShortcutConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  setShowHints(show: boolean): void {
    this.config.showHints = show;
    this.saveConfig();
  }

  // Widget focus management
  setWidgetFocus(element: HTMLElement | null): void {
    this.activeElement = element;
    if (element) {
      element.setAttribute('data-ai-hub-widget', 'true');
    }
  }

  // Helper methods for common actions
  executeShortcut(shortcutId: string): boolean {
    const shortcut = this.shortcuts.get(shortcutId);
    if (shortcut && shortcut.enabled) {
      try {
        shortcut.action();
        return true;
      } catch (error) {
        console.error(`Error executing shortcut ${shortcutId}:`, error);
      }
    }
    return false;
  }

  getShortcutKeys(shortcutId: string): string | null {
    const shortcut = this.shortcuts.get(shortcutId);
    if (!shortcut) return null;

    // Return custom keys first, then configured keys, then default
    return this.config.customShortcuts[shortcutId] || 
           this.config.shortcuts[shortcutId] || 
           shortcut.keys;
  }

  formatKeys(keys: string): string {
    return keys.replace(/\+/g, ' + ').replace(/Ctrl/g, '⌘').replace(/Alt/g, '⌥').replace(/Shift/g, '⇧');
  }

  // Conflict detection
  getKeyConflicts(): Array<{ keys: string; shortcuts: KeyboardShortcut[] }> {
    const keyMap = new Map<string, KeyboardShortcut[]>();
    
    this.shortcuts.forEach(shortcut => {
      if (!shortcut.enabled) return;
      
      const keys = this.getShortcutKeys(shortcut.id);
      if (!keys) return;
      
      if (!keyMap.has(keys)) {
        keyMap.set(keys, []);
      }
      keyMap.get(keys)!.push(shortcut);
    });

    return Array.from(keyMap.entries())
      .filter(([_, shortcuts]) => shortcuts.length > 1)
      .map(([keys, shortcuts]) => ({ keys, shortcuts }));
  }

  // Import/Export
  exportShortcuts(): string {
    const exportData = {
      shortcuts: this.config.shortcuts,
      customShortcuts: this.config.customShortcuts,
      enabled: this.config.enabled,
      showHints: this.config.showHints
    };
    return JSON.stringify(exportData, null, 2);
  }

  importShortcuts(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      this.config = { ...this.config, ...imported };
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Failed to import shortcuts:', error);
      return false;
    }
  }

  // Reset
  resetToDefaults(): void {
    this.config = this.getDefaultConfig();
    this.saveConfig();
    
    // Reset shortcut states
    this.shortcuts.forEach(shortcut => {
      shortcut.enabled = true;
    });
  }

  // Event listeners
  onShortcutExecuted(callback: (shortcutId: string, shortcut: KeyboardShortcut) => void): () => void {
    // This would need to be implemented to track shortcut execution
    // For now, return a no-op unsubscribe function
    return () => {};
  }

  // Cleanup
  destroy(): void {
    this.stopListening();
    this.shortcuts.clear();
    this.listeners = [];
  }

  // Help system
  getShortcutHelp(): Array<{ category: string; shortcuts: Array<{ name: string; keys: string; description: string }> }> {
    const categories = ['navigation', 'automation', 'view', 'search', 'bulk', 'export', 'general'] as const;
    
    return categories.map(category => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      shortcuts: this.getShortcutsByCategory(category)
        .filter(s => s.enabled)
        .map(s => ({
          name: s.name,
          keys: this.formatKeys(this.getShortcutKeys(s.id) || s.keys),
          description: s.description
        }))
    })).filter(group => group.shortcuts.length > 0);
  }
}

// Export singleton instance
export const keyboardShortcutsService = new KeyboardShortcutsService();
export default keyboardShortcutsService;