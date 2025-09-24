export interface DragItem {
  id: string;
  type: string;
  data: any;
}

export interface DropTarget {
  id: string;
  type: string;
  accepts: string[];
  onDrop: (item: DragItem, position?: DropPosition) => void;
  onDragEnter?: (item: DragItem) => void;
  onDragLeave?: (item: DragItem) => void;
  onDragOver?: (item: DragItem) => boolean; // Return false to reject drop
}

export interface DropPosition {
  x: number;
  y: number;
  index?: number;
  position?: 'before' | 'after' | 'inside';
}

export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dragPreview: HTMLElement | null;
  dropTarget: string | null;
  dropPosition: DropPosition | null;
}

class DragDropService {
  private dragState: DragState = {
    isDragging: false,
    dragItem: null,
    dragPreview: null,
    dropTarget: null,
    dropPosition: null
  };

  private dropTargets: Map<string, DropTarget> = new Map();
  private listeners: Array<(state: DragState) => void> = [];
  private dragStartPosition = { x: 0, y: 0 };
  private dragThreshold = 5; // Minimum distance to start drag

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.dragState.isDragging && this.dragState.dragItem) {
      // Check if we've moved far enough to start dragging
      const distance = Math.sqrt(
        Math.pow(event.clientX - this.dragStartPosition.x, 2) +
        Math.pow(event.clientY - this.dragStartPosition.y, 2)
      );

      if (distance > this.dragThreshold) {
        this.startDrag(event);
      }
    }

    if (this.dragState.isDragging) {
      this.updateDrag(event);
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.dragState.isDragging) {
      this.endDrag(event);
    } else if (this.dragState.dragItem) {
      // Cancel potential drag
      this.cancelDrag();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.dragState.isDragging) {
      this.cancelDrag();
    }
  }

  private startDrag(event: MouseEvent): void {
    if (!this.dragState.dragItem) return;

    this.dragState.isDragging = true;
    this.dragState.dropPosition = { x: event.clientX, y: event.clientY };

    // Create drag preview
    this.createDragPreview(event);

    // Add visual feedback
    document.body.classList.add('dragging');
    document.body.style.cursor = 'grabbing';

    this.notifyListeners();
  }

  private updateDrag(event: MouseEvent): void {
    if (!this.dragState.isDragging || !this.dragState.dragPreview) return;

    // Update preview position
    this.dragState.dragPreview.style.left = `${event.clientX - 50}px`;
    this.dragState.dragPreview.style.top = `${event.clientY - 25}px`;

    // Update drop position
    this.dragState.dropPosition = { x: event.clientX, y: event.clientY };

    // Check for drop targets
    const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);
    const dropTargetElement = elementUnderCursor?.closest('[data-drop-target]');

    if (dropTargetElement) {
      const targetId = dropTargetElement.getAttribute('data-drop-target');
      const dropTarget = targetId ? this.dropTargets.get(targetId) : null;

      if (dropTarget && this.canDrop(this.dragState.dragItem!, dropTarget)) {
        if (this.dragState.dropTarget !== targetId) {
          // Leaving previous target
          if (this.dragState.dropTarget) {
            const prevTarget = this.dropTargets.get(this.dragState.dropTarget);
            if (prevTarget?.onDragLeave) {
              prevTarget.onDragLeave(this.dragState.dragItem!);
            }
            this.removeDragOverClass(this.dragState.dropTarget);
          }

          // Entering new target
          this.dragState.dropTarget = targetId;
          if (dropTarget.onDragEnter) {
            dropTarget.onDragEnter(this.dragState.dragItem!);
          }
          this.addDragOverClass(targetId);
        }

        // Update drop position within target
        const rect = dropTargetElement.getBoundingClientRect();
        const relativePosition = this.calculateRelativePosition(event, rect, dropTargetElement);
        this.dragState.dropPosition = {
          ...this.dragState.dropPosition,
          ...relativePosition
        };
      } else if (this.dragState.dropTarget) {
        // Invalid drop target, clear current target
        this.clearDropTarget();
      }
    } else if (this.dragState.dropTarget) {
      // No drop target under cursor
      this.clearDropTarget();
    }

    this.notifyListeners();
  }

  private endDrag(event: MouseEvent): void {
    if (!this.dragState.isDragging) return;

    let dropSuccessful = false;

    if (this.dragState.dropTarget) {
      const dropTarget = this.dropTargets.get(this.dragState.dropTarget);
      if (dropTarget && this.canDrop(this.dragState.dragItem!, dropTarget)) {
        try {
          dropTarget.onDrop(this.dragState.dragItem!, this.dragState.dropPosition || undefined);
          dropSuccessful = true;
        } catch (error) {
          console.error('Drop operation failed:', error);
        }
      }
    }

    this.cleanupDrag(dropSuccessful);
  }

  private cancelDrag(): void {
    this.cleanupDrag(false);
  }

  private cleanupDrag(successful: boolean): void {
    // Remove visual feedback
    document.body.classList.remove('dragging');
    document.body.style.cursor = '';

    // Clean up drop target classes
    if (this.dragState.dropTarget) {
      this.removeDragOverClass(this.dragState.dropTarget);
    }

    // Remove drag preview
    if (this.dragState.dragPreview) {
      this.dragState.dragPreview.remove();
    }

    // Reset state
    this.dragState = {
      isDragging: false,
      dragItem: null,
      dragPreview: null,
      dropTarget: null,
      dropPosition: null
    };

    this.notifyListeners();
  }

  private createDragPreview(event: MouseEvent): void {
    if (!this.dragState.dragItem) return;

    const preview = document.createElement('div');
    preview.className = 'drag-preview';
    preview.style.cssText = `
      position: fixed;
      left: ${event.clientX - 50}px;
      top: ${event.clientY - 25}px;
      width: 200px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
      z-index: 9999;
      pointer-events: none;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      transform: rotate(-5deg);
      animation: dragPulse 1s ease-in-out infinite alternate;
    `;

    const text = this.getDragPreviewText(this.dragState.dragItem);
    preview.textContent = text;

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes dragPulse {
        0% { transform: rotate(-5deg) scale(1); }
        100% { transform: rotate(-5deg) scale(1.05); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(preview);
    this.dragState.dragPreview = preview;
  }

  private getDragPreviewText(item: DragItem): string {
    switch (item.type) {
      case 'automation':
        return `📋 ${item.data.title || item.data.name || 'Automation'}`;
      case 'view':
        return `👁️ ${item.data.name || 'Custom View'}`;
      default:
        return `📦 ${item.type}`;
    }
  }

  private calculateRelativePosition(event: MouseEvent, rect: DOMRect, element: Element): Partial<DropPosition> {
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;
    const centerY = rect.height / 2;

    // For list items, determine if we're dropping before or after
    if (element.hasAttribute('data-list-item')) {
      const position = relativeY < centerY ? 'before' : 'after';
      const index = parseInt(element.getAttribute('data-index') || '0');
      
      return {
        position,
        index: position === 'before' ? index : index + 1
      };
    }

    // For grid items, just return the index
    if (element.hasAttribute('data-grid-item')) {
      const index = parseInt(element.getAttribute('data-index') || '0');
      return { index };
    }

    return {};
  }

  private canDrop(item: DragItem, target: DropTarget): boolean {
    if (!target.accepts.includes(item.type)) return false;
    
    if (target.onDragOver) {
      return target.onDragOver(item);
    }
    
    return true;
  }

  private clearDropTarget(): void {
    if (this.dragState.dropTarget) {
      const prevTarget = this.dropTargets.get(this.dragState.dropTarget);
      if (prevTarget?.onDragLeave) {
        prevTarget.onDragLeave(this.dragState.dragItem!);
      }
      this.removeDragOverClass(this.dragState.dropTarget);
      this.dragState.dropTarget = null;
    }
  }

  private addDragOverClass(targetId: string): void {
    const element = document.querySelector(`[data-drop-target="${targetId}"]`);
    element?.classList.add('drag-over');
  }

  private removeDragOverClass(targetId: string): void {
    const element = document.querySelector(`[data-drop-target="${targetId}"]`);
    element?.classList.remove('drag-over');
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.dragState);
      } catch (error) {
        console.error('Error in drag drop listener:', error);
      }
    });
  }

  // Public API
  startDragOperation(item: DragItem, event: MouseEvent): void {
    this.dragState.dragItem = item;
    this.dragStartPosition = { x: event.clientX, y: event.clientY };
    
    // Don't start dragging immediately, wait for movement
    // This allows for clicks without triggering drag
  }

  registerDropTarget(target: DropTarget): void {
    this.dropTargets.set(target.id, target);
    
    // Add data attribute to DOM element if it exists
    const element = document.querySelector(`[data-drop-target-id="${target.id}"]`);
    if (element) {
      element.setAttribute('data-drop-target', target.id);
    }
  }

  unregisterDropTarget(targetId: string): void {
    this.dropTargets.delete(targetId);
    
    // Remove data attribute from DOM element
    const element = document.querySelector(`[data-drop-target="${targetId}"]`);
    if (element) {
      element.removeAttribute('data-drop-target');
    }
  }

  getDragState(): DragState {
    return { ...this.dragState };
  }

  isDragging(): boolean {
    return this.dragState.isDragging;
  }

  // Event listeners
  onDragStateChange(callback: (state: DragState) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Helper methods for automation reordering
  createAutomationDragItem(automation: any): DragItem {
    return {
      id: automation.id,
      type: 'automation',
      data: automation
    };
  }

  createAutomationListDropTarget(
    containerId: string,
    onReorder: (draggedId: string, targetIndex: number, position: 'before' | 'after') => void
  ): DropTarget {
    return {
      id: containerId,
      type: 'automation-list',
      accepts: ['automation'],
      onDrop: (item, position) => {
        if (position?.index !== undefined && position?.position) {
          onReorder(item.id, position.index, position.position);
        }
      },
      onDragEnter: (item) => {
        console.log('Drag entered automation list with:', item.data.title);
      },
      onDragLeave: () => {
        console.log('Drag left automation list');
      },
      onDragOver: (item) => {
        // Allow reordering automations within the same list
        return item.type === 'automation';
      }
    };
  }

  // Keyboard accessibility for drag and drop
  enableKeyboardDragDrop(): void {
    document.addEventListener('keydown', (event) => {
      const focusedElement = document.activeElement as HTMLElement;
      
      if (!focusedElement?.hasAttribute('data-draggable')) return;
      
      switch (event.key) {
        case ' ':
          event.preventDefault();
          this.toggleKeyboardDragMode(focusedElement);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          if (this.isKeyboardDragActive()) {
            event.preventDefault();
            this.moveKeyboardDragItem(event.key === 'ArrowUp' ? -1 : 1);
          }
          break;
        case 'Escape':
          if (this.isKeyboardDragActive()) {
            event.preventDefault();
            this.cancelKeyboardDrag();
          }
          break;
        case 'Enter':
          if (this.isKeyboardDragActive()) {
            event.preventDefault();
            this.confirmKeyboardDrag();
          }
          break;
      }
    });
  }

  private keyboardDragState: {
    active: boolean;
    element: HTMLElement | null;
    originalIndex: number;
    currentIndex: number;
  } = {
    active: false,
    element: null,
    originalIndex: -1,
    currentIndex: -1
  };

  private toggleKeyboardDragMode(element: HTMLElement): void {
    if (this.keyboardDragState.active) {
      this.confirmKeyboardDrag();
    } else {
      this.startKeyboardDrag(element);
    }
  }

  private startKeyboardDrag(element: HTMLElement): void {
    const index = parseInt(element.getAttribute('data-index') || '0');
    
    this.keyboardDragState = {
      active: true,
      element,
      originalIndex: index,
      currentIndex: index
    };
    
    element.classList.add('keyboard-drag-active');
    this.announceKeyboardDrag('started');
  }

  private moveKeyboardDragItem(direction: number): void {
    if (!this.keyboardDragState.active || !this.keyboardDragState.element) return;
    
    const container = this.keyboardDragState.element.parentElement;
    if (!container) return;
    
    const items = Array.from(container.children);
    const newIndex = Math.max(0, Math.min(items.length - 1, this.keyboardDragState.currentIndex + direction));
    
    if (newIndex !== this.keyboardDragState.currentIndex) {
      this.keyboardDragState.currentIndex = newIndex;
      
      // Visual feedback
      items.forEach(item => item.classList.remove('keyboard-drag-target'));
      items[newIndex]?.classList.add('keyboard-drag-target');
      
      this.announceKeyboardDrag('moved', newIndex);
    }
  }

  private confirmKeyboardDrag(): void {
    if (!this.keyboardDragState.active) return;
    
    const { element, originalIndex, currentIndex } = this.keyboardDragState;
    
    if (element && originalIndex !== currentIndex) {
      // Trigger the drop operation
      const dragItem = this.createAutomationDragItem({
        id: element.getAttribute('data-automation-id'),
        title: element.textContent?.trim()
      });
      
      // Find the drop target and execute reorder
      const container = element.closest('[data-drop-target]');
      if (container) {
        const targetId = container.getAttribute('data-drop-target');
        const dropTarget = targetId ? this.dropTargets.get(targetId) : null;
        
        if (dropTarget) {
          dropTarget.onDrop(dragItem, {
            x: 0,
            y: 0,
            index: currentIndex,
            position: currentIndex > originalIndex ? 'after' : 'before'
          });
        }
      }
    }
    
    this.cancelKeyboardDrag();
    this.announceKeyboardDrag('completed');
  }

  private cancelKeyboardDrag(): void {
    if (this.keyboardDragState.element) {
      this.keyboardDragState.element.classList.remove('keyboard-drag-active');
    }
    
    // Remove all target indicators
    document.querySelectorAll('.keyboard-drag-target').forEach(el => {
      el.classList.remove('keyboard-drag-target');
    });
    
    this.keyboardDragState = {
      active: false,
      element: null,
      originalIndex: -1,
      currentIndex: -1
    };
    
    this.announceKeyboardDrag('cancelled');
  }

  private isKeyboardDragActive(): boolean {
    return this.keyboardDragState.active;
  }

  private announceKeyboardDrag(action: string, position?: number): void {
    // Screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    
    let message = '';
    switch (action) {
      case 'started':
        message = 'Drag mode activated. Use arrow keys to move, Enter to confirm, Escape to cancel.';
        break;
      case 'moved':
        message = `Moved to position ${(position || 0) + 1}`;
        break;
      case 'completed':
        message = 'Item reordered successfully';
        break;
      case 'cancelled':
        message = 'Drag cancelled';
        break;
    }
    
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Cleanup
  destroy(): void {
    this.listeners = [];
    this.dropTargets.clear();
    this.cleanupDrag(false);
  }
}

// Export singleton instance
export const dragDropService = new DragDropService();

// Enable keyboard drag drop by default
dragDropService.enableKeyboardDragDrop();

export default dragDropService;