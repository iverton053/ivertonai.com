import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  StickyNote, 
  NotesState, 
  NotesFilters, 
  NotesSettings, 
  NoteType, 
  NoteCategory,
  NotePriority,
  TaskItem,
  NotesAnalytics,
  CATEGORY_COLORS 
} from '../types/notes';

interface NotesActions {
  setNotes: (notes: StickyNote[]) => void;
  addNote: (note: Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>) => void;
  updateNote: (id: string, updates: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
  deleteNotes: (ids: string[]) => void;
  duplicateNote: (id: string) => void;
  
  setSelectedNotes: (noteIds: string[]) => void;
  toggleNoteSelection: (noteId: string) => void;
  selectAllNotes: () => void;
  clearSelection: () => void;
  
  setActiveNote: (noteId?: string) => void;
  
  setFilters: (filters: Partial<NotesFilters>) => void;
  clearFilters: () => void;
  
  setView: (view: 'grid' | 'masonry' | 'list') => void;
  
  pinNote: (noteId: string) => void;
  unpinNote: (noteId: string) => void;
  archiveNote: (noteId: string) => void;
  unarchiveNote: (noteId: string) => void;
  
  addTask: (noteId: string, taskText: string) => void;
  updateTask: (noteId: string, taskId: string, updates: Partial<TaskItem>) => void;
  deleteTask: (noteId: string, taskId: string) => void;
  toggleTask: (noteId: string, taskId: string) => void;
  
  updateNotePosition: (noteId: string, x: number, y: number) => void;
  updateNoteSize: (noteId: string, width: number, height: number) => void;
  
  searchNotes: (query: string) => void;
  filterNotes: (filters: NotesFilters) => StickyNote[];
  
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  
  updateSettings: (settings: Partial<NotesSettings>) => void;
  
  shareNote: (noteId: string, userIds: string[]) => void;
  unshareNote: (noteId: string, userIds: string[]) => void;
  
  copyNotes: (noteIds: string[]) => void;
  cutNotes: (noteIds: string[]) => void;
  pasteNotes: () => void;
  
  exportNotes: (noteIds: string[], format: 'json' | 'md' | 'txt') => string;
  importNotes: (data: string, format: 'json') => void;
  
  getRecentNotes: (limit?: number) => StickyNote[];
  getPinnedNotes: () => StickyNote[];
  getNotesWithReminders: () => StickyNote[];
  getNotesByCategory: (category: NoteCategory) => StickyNote[];
  getNotesByType: (type: NoteType) => StickyNote[];
  getAnalytics: () => NotesAnalytics;
  
  createQuickNote: (content: string, type?: NoteType) => void;
  createNoteFromTemplate: (templateId: string) => void;
}

const defaultSettings: NotesSettings = {
  defaultView: 'masonry',
  autoSave: true,
  autoSaveInterval: 2000,
  showCategories: true,
  enableCollaboration: true,
  enableReminders: true,
  enableNotifications: true,
  defaultNoteSize: {
    width: 280,
    height: 200,
  },
  gridSnapSize: 20,
  maxNotesPerView: 100,
  enableDragDrop: true,
  enableAutoBackup: true,
  theme: {
    colorPalette: Object.values(CATEGORY_COLORS),
    fontSize: 'medium',
    fontFamily: 'Inter, sans-serif',
  },
};

// Limits and validation
export const LIMITS = {
  maxNoteLength: 5000, // characters
  maxTitleLength: 100, // characters
  maxTagsPerNote: 10,
  maxTagLength: 30,
  maxNotesTotal: 500, // per user
  maxTasksPerNote: 50,
};

const generateId = () => `note_${Date.now()}_${Math.random().toString(36).substring(7)}`;

export const useNotesStore = create<NotesState & NotesActions>()(
  persist(
    (set, get) => ({
      notes: [],
      filters: {},
      selectedNotes: [],
      activeNote: undefined,
      view: 'masonry',
      isLoading: false,
      error: undefined,
      settings: defaultSettings,
      draggedNote: undefined,
      clipboard: undefined,
      searchResults: [],
      recentNotes: [],
      pinnedNotes: [],
      reminderNotes: [],

      setNotes: (notes) => set({ notes }),

      addNote: (noteData) => {
        const { notes } = get();
        
        // Check limits
        if (notes.length >= LIMITS.maxNotesTotal) {
          set({ error: `Maximum ${LIMITS.maxNotesTotal} notes allowed. Please delete some notes first.` });
          return;
        }

        // Validate content
        const content = noteData.content.slice(0, LIMITS.maxNoteLength);
        const title = noteData.title?.slice(0, LIMITS.maxTitleLength);
        const tags = noteData.tags.slice(0, LIMITS.maxTagsPerNote).map(tag => 
          tag.slice(0, LIMITS.maxTagLength)
        );

        const newNote: StickyNote = {
          ...noteData,
          content,
          title,
          tags,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            version: 1,
            wordCount: content.split(' ').length,
          },
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
          recentNotes: [newNote, ...state.recentNotes.slice(0, 9)],
          error: undefined, // Clear any previous errors
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...updates,
                  updatedAt: new Date(),
                  metadata: {
                    ...note.metadata,
                    version: note.metadata.version + 1,
                    wordCount: updates.content
                      ? updates.content.split(' ').length
                      : note.metadata.wordCount,
                  },
                }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          selectedNotes: state.selectedNotes.filter((noteId) => noteId !== id),
          activeNote: state.activeNote === id ? undefined : state.activeNote,
        }));
      },

      deleteNotes: (ids) => {
        set((state) => ({
          notes: state.notes.filter((note) => !ids.includes(note.id)),
          selectedNotes: state.selectedNotes.filter((noteId) => !ids.includes(noteId)),
          activeNote: ids.includes(state.activeNote || '') ? undefined : state.activeNote,
        }));
      },

      duplicateNote: (id) => {
        const { notes } = get();
        const note = notes.find((n) => n.id === id);
        if (note) {
          const duplicatedNote: StickyNote = {
            ...note,
            id: generateId(),
            title: note.title ? `${note.title} (Copy)` : undefined,
            position: note.position
              ? { ...note.position, x: note.position.x + 20, y: note.position.y + 20 }
              : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              ...note.metadata,
              version: 1,
            },
          };

          set((state) => ({
            notes: [duplicatedNote, ...state.notes],
          }));
        }
      },

      setSelectedNotes: (noteIds) => set({ selectedNotes: noteIds }),

      toggleNoteSelection: (noteId) => {
        set((state) => ({
          selectedNotes: state.selectedNotes.includes(noteId)
            ? state.selectedNotes.filter((id) => id !== noteId)
            : [...state.selectedNotes, noteId],
        }));
      },

      selectAllNotes: () => {
        const { notes } = get();
        set({ selectedNotes: notes.map((note) => note.id) });
      },

      clearSelection: () => set({ selectedNotes: [] }),

      setActiveNote: (noteId) => set({ activeNote: noteId }),

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => set({ filters: {} }),

      setView: (view) => set({ view }),

      pinNote: (noteId) => {
        const { updateNote } = get();
        updateNote(noteId, { isPinned: true });
      },

      unpinNote: (noteId) => {
        const { updateNote } = get();
        updateNote(noteId, { isPinned: false });
      },

      archiveNote: (noteId) => {
        const { updateNote } = get();
        updateNote(noteId, { isArchived: true });
      },

      unarchiveNote: (noteId) => {
        const { updateNote } = get();
        updateNote(noteId, { isArchived: false });
      },

      addTask: (noteId, taskText) => {
        const { notes, updateNote } = get();
        const note = notes.find((n) => n.id === noteId);
        if (note) {
          // Check task limits
          if ((note.tasks || []).length >= LIMITS.maxTasksPerNote) {
            set({ error: `Maximum ${LIMITS.maxTasksPerNote} tasks per note allowed.` });
            return;
          }

          const newTask: TaskItem = {
            id: generateId(),
            text: taskText.slice(0, LIMITS.maxNoteLength), // Limit task text length
            completed: false,
            createdAt: new Date(),
          };
          updateNote(noteId, {
            tasks: [...(note.tasks || []), newTask],
          });
          set({ error: undefined }); // Clear errors on success
        }
      },

      updateTask: (noteId, taskId, updates) => {
        const { notes, updateNote } = get();
        const note = notes.find((n) => n.id === noteId);
        if (note && note.tasks) {
          const updatedTasks = note.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          );
          updateNote(noteId, { tasks: updatedTasks });
        }
      },

      deleteTask: (noteId, taskId) => {
        const { notes, updateNote } = get();
        const note = notes.find((n) => n.id === noteId);
        if (note && note.tasks) {
          const updatedTasks = note.tasks.filter((task) => task.id !== taskId);
          updateNote(noteId, { tasks: updatedTasks });
        }
      },

      toggleTask: (noteId, taskId) => {
        const { notes, updateTask } = get();
        const note = notes.find((n) => n.id === noteId);
        const task = note?.tasks?.find((t) => t.id === taskId);
        if (task) {
          updateTask(noteId, taskId, { completed: !task.completed });
        }
      },

      updateNotePosition: (noteId, x, y) => {
        const { updateNote } = get();
        updateNote(noteId, {
          position: { x, y, zIndex: Date.now() },
        });
      },

      updateNoteSize: (noteId, width, height) => {
        const { updateNote } = get();
        updateNote(noteId, {
          size: { width, height },
        });
      },

      searchNotes: (query) => {
        const { notes } = get();
        const searchResults = notes.filter(
          (note) =>
            note.content.toLowerCase().includes(query.toLowerCase()) ||
            note.title?.toLowerCase().includes(query.toLowerCase()) ||
            note.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
        );
        set({ searchResults });
      },

      filterNotes: (filters) => {
        const { notes } = get();
        return notes.filter((note) => {
          if (filters.category && !filters.category.includes(note.category)) return false;
          if (filters.type && !filters.type.includes(note.type)) return false;
          if (filters.priority && !filters.priority.includes(note.priority)) return false;
          if (filters.isPinned !== undefined && note.isPinned !== filters.isPinned) return false;
          if (filters.isArchived !== undefined && note.isArchived !== filters.isArchived) return false;
          if (filters.hasReminder !== undefined) {
            const hasReminder = !!note.reminderDate;
            if (hasReminder !== filters.hasReminder) return false;
          }
          if (filters.tags && filters.tags.length > 0) {
            const hasMatchingTag = filters.tags.some((tag) => note.tags.includes(tag));
            if (!hasMatchingTag) return false;
          }
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matches =
              note.content.toLowerCase().includes(query) ||
              note.title?.toLowerCase().includes(query) ||
              note.tags.some((tag) => tag.toLowerCase().includes(query));
            if (!matches) return false;
          }
          if (filters.dateRange) {
            const noteDate = note.createdAt;
            if (noteDate < filters.dateRange.start || noteDate > filters.dateRange.end) {
              return false;
            }
          }
          return true;
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      shareNote: (noteId, userIds) => {
        const { updateNote } = get();
        updateNote(noteId, {
          sharedWith: userIds,
          isShared: userIds.length > 0,
        });
      },

      unshareNote: (noteId, userIds) => {
        const { notes, updateNote } = get();
        const note = notes.find((n) => n.id === noteId);
        if (note) {
          const updatedSharedWith = note.sharedWith.filter((id) => !userIds.includes(id));
          updateNote(noteId, {
            sharedWith: updatedSharedWith,
            isShared: updatedSharedWith.length > 0,
          });
        }
      },

      copyNotes: (noteIds) => {
        const { notes } = get();
        const notesToCopy = notes.filter((note) => noteIds.includes(note.id));
        set({
          clipboard: {
            notes: notesToCopy,
            operation: 'copy',
          },
        });
      },

      cutNotes: (noteIds) => {
        const { notes } = get();
        const notesToCut = notes.filter((note) => noteIds.includes(note.id));
        set({
          clipboard: {
            notes: notesToCut,
            operation: 'cut',
          },
        });
      },

      pasteNotes: () => {
        const { clipboard, addNote, deleteNotes } = get();
        if (clipboard) {
          clipboard.notes.forEach((note) => {
            const { id, createdAt, updatedAt, metadata, ...noteData } = note;
            addNote({
              ...noteData,
              position: note.position
                ? { ...note.position, x: note.position.x + 20, y: note.position.y + 20 }
                : undefined,
            });
          });

          if (clipboard.operation === 'cut') {
            deleteNotes(clipboard.notes.map((note) => note.id));
          }

          set({ clipboard: undefined });
        }
      },

      exportNotes: (noteIds, format) => {
        const { notes } = get();
        const notesToExport = notes.filter((note) => noteIds.includes(note.id));

        switch (format) {
          case 'json':
            return JSON.stringify(notesToExport, null, 2);
          case 'md':
            return notesToExport
              .map((note) => {
                let content = `# ${note.title || 'Untitled Note'}\n\n`;
                content += `**Category:** ${note.category}\n`;
                content += `**Created:** ${note.createdAt.toDateString()}\n\n`;
                content += `${note.content}\n\n`;
                if (note.tags.length > 0) {
                  content += `**Tags:** ${note.tags.join(', ')}\n\n`;
                }
                return content;
              })
              .join('---\n\n');
          case 'txt':
            return notesToExport
              .map((note) => `${note.title || 'Untitled Note'}\n${note.content}`)
              .join('\n\n---\n\n');
          default:
            return '';
        }
      },

      importNotes: (data, format) => {
        try {
          if (format === 'json') {
            const importedNotes = JSON.parse(data) as StickyNote[];
            importedNotes.forEach((note) => {
              const { id, createdAt, updatedAt, metadata, ...noteData } = note;
              get().addNote(noteData);
            });
          }
        } catch (error) {
          console.error('Failed to import notes:', error);
          set({ error: 'Failed to import notes. Please check the file format.' });
        }
      },

      getRecentNotes: (limit = 10) => {
        const { notes } = get();
        return notes
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },

      getPinnedNotes: () => {
        const { notes } = get();
        return notes.filter((note) => note.isPinned && !note.isArchived);
      },

      getNotesWithReminders: () => {
        const { notes } = get();
        return notes.filter((note) => note.reminderDate && !note.isArchived);
      },

      getNotesByCategory: (category) => {
        const { notes } = get();
        return notes.filter((note) => note.category === category && !note.isArchived);
      },

      getNotesByType: (type) => {
        const { notes } = get();
        return notes.filter((note) => note.type === type && !note.isArchived);
      },

      getAnalytics: () => {
        const { notes } = get();
        const analytics: NotesAnalytics = {
          totalNotes: notes.length,
          notesByCategory: Object.fromEntries(
            Object.keys(CATEGORY_COLORS).map((category) => [
              category,
              notes.filter((note) => note.category === category).length,
            ])
          ) as Record<NoteCategory, number>,
          notesByType: notes.reduce((acc, note) => {
            acc[note.type] = (acc[note.type] || 0) + 1;
            return acc;
          }, {} as Record<NoteType, number>),
          completedTasks: notes.reduce(
            (total, note) => total + (note.tasks?.filter((task) => task.completed).length || 0),
            0
          ),
          totalTasks: notes.reduce((total, note) => total + (note.tasks?.length || 0), 0),
          dailyActivity: [],
          mostUsedTags: [],
          averageNoteLength: notes.reduce((total, note) => total + note.content.length, 0) / notes.length || 0,
          collaborationStats: {
            sharedNotes: notes.filter((note) => note.isShared).length,
            collaborators: 0,
            commentsCount: 0,
          },
        };
        return analytics;
      },

      createQuickNote: (content, type = 'text') => {
        const { addNote, settings } = get();
        addNote({
          type,
          content,
          category: 'personal',
          priority: 'medium',
          color: CATEGORY_COLORS.personal,
          size: settings.defaultNoteSize,
          tags: [],
          isPinned: false,
          isArchived: false,
          createdBy: 'current_user',
          sharedWith: [],
          isShared: false,
        });
      },

      createNoteFromTemplate: (templateId) => {
        // TODO: Implement template system
        console.log('Creating note from template:', templateId);
      },
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({
        notes: state.notes,
        settings: state.settings,
        pinnedNotes: state.pinnedNotes,
        filters: state.filters,
        view: state.view,
      }),
    }
  )
);