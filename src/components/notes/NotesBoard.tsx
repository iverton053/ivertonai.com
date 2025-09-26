import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Columns,
  Download,
  Upload,
  Settings,
  Archive,
  Pin,
  Star,
  Trash2,
  Copy,
  Share,
  Eye,
  EyeOff,
  ChevronDown,
  X,
  Sparkles,
  Zap,
  BookOpen,
  Target,
  Move
} from 'lucide-react';
import StickyNote from './StickyNote';
import DroppableNotesGrid from './DroppableNotesGrid';
import { useNotesStore } from '../../stores/notesStore';
import { NoteType, NoteCategory, NotePriority, CATEGORY_COLORS } from '../../types/notes';

const NotesBoard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewNoteMenu, setShowNewNoteMenu] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<NoteType | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);

  const {
    notes,
    selectedNotes,
    view,
    filters,
    isLoading,
    error,
    setView,
    setFilters,
    addNote,
    toggleNoteSelection,
    clearSelection,
    selectAllNotes,
    deleteNotes,
    createQuickNote,
    filterNotes,
    searchNotes,
    getPinnedNotes,
    getRecentNotes,
    setError,
    createNoteFromTemplate,
  } = useNotesStore();

  const fileInputRef = useRef<HTMLInputElement>(null); // File input for importing notes

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            handleCreateNote();
            break;
          case 'a':
            e.preventDefault();
            selectAllNotes();
            break;
          case 'f':
            e.preventDefault();
            setShowFilters(!showFilters);
            break;
          case 'q':
            e.preventDefault();
            handleQuickNote();
            break;
          default:
            break;
        }
      }

      // Other shortcuts
      switch (e.key) {
        case 'Escape':
          if (selectedNotes.length > 0) {
            clearSelection();
          } else if (showFilters) {
            setShowFilters(false);
          } else if (showNewNoteMenu) {
            setShowNewNoteMenu(false);
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedNotes.length > 0) {
            handleBulkAction('delete');
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotes, showFilters, showNewNoteMenu]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredNotes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order in the store
    // For now, we'll just log the reorder action
    console.log('Reordered notes:', {
      from: result.source.index,
      to: result.destination.index,
      noteId: reorderedItem.id
    });
  };

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (!showArchived) {
      result = result.filter(note => !note.isArchived);
    }

    if (showOnlyPinned) {
      result = result.filter(note => note.isPinned);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(note => note.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      result = result.filter(note => note.type === selectedType);
    }

    if (searchQuery) {
      result = result.filter(note =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return result;
  }, [notes, showArchived, showOnlyPinned, selectedCategory, selectedType, searchQuery]);

  const handleCreateNote = (type: NoteType = 'text') => {
    const defaultContent = type === 'task' ? 'New task list' : 'New note';
    const color = CATEGORY_COLORS.personal;
    
    addNote({
      type,
      content: defaultContent,
      category: 'personal',
      priority: 'medium',
      color,
      size: { width: 280, height: 200 },
      tags: [],
      isPinned: false,
      isArchived: false,
      createdBy: 'current_user',
      sharedWith: [],
      isShared: false,
    });
    setShowNewNoteMenu(false);
  };

  const handleQuickNote = () => {
    const content = prompt('Quick note:');
    if (content?.trim()) {
      createQuickNote(content.trim());
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      const store = useNotesStore.getState();

      switch (fileExtension) {
        case 'json':
          store.importNotes(fileContent, 'json');
          break;
        case 'txt':
          // Convert text file to note
          createQuickNote(fileContent);
          break;
        case 'md':
          // Parse markdown file to note(s)
          const lines = fileContent.split('\n');
          let currentNote = '';
          let title = '';

          for (const line of lines) {
            if (line.startsWith('# ')) {
              if (currentNote) {
                addNote({
                  type: 'text',
                  title: title || 'Imported Note',
                  content: currentNote.trim(),
                  category: 'personal',
                  priority: 'medium',
                  color: CATEGORY_COLORS.personal,
                  size: { width: 280, height: 200 },
                  tags: ['imported'],
                  isPinned: false,
                  isArchived: false,
                  createdBy: 'current_user',
                  sharedWith: [],
                  isShared: false,
                });
                currentNote = '';
              }
              title = line.substring(2).trim();
            } else if (line.trim() && !line.startsWith('**')) {
              currentNote += line + '\n';
            }
          }

          // Add the last note
          if (currentNote) {
            addNote({
              type: 'text',
              title: title || 'Imported Note',
              content: currentNote.trim(),
              category: 'personal',
              priority: 'medium',
              color: CATEGORY_COLORS.personal,
              size: { width: 280, height: 200 },
              tags: ['imported'],
              isPinned: false,
              isArchived: false,
              createdBy: 'current_user',
              sharedWith: [],
              isShared: false,
            });
          }
          break;
        default:
          setError('Unsupported file format. Please use .json, .txt, or .md files.');
          return;
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error importing file:', error);
      setError('Failed to import file. Please check the file format and try again.');
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedNotes.length === 0) return;

    switch (action) {
      case 'delete':
        if (confirm(`Delete ${selectedNotes.length} notes?`)) {
          deleteNotes(selectedNotes);
          clearSelection();
        }
        break;
      case 'archive':
        selectedNotes.forEach(noteId => {
          const note = notes.find(n => n.id === noteId);
          if (note && !note.isArchived) {
            // Use the store's archiveNote function for each note
            const store = useNotesStore.getState();
            store.archiveNote(noteId);
          }
        });
        clearSelection();
        break;
      case 'unarchive':
        selectedNotes.forEach(noteId => {
          const note = notes.find(n => n.id === noteId);
          if (note && note.isArchived) {
            const store = useNotesStore.getState();
            store.unarchiveNote(noteId);
          }
        });
        clearSelection();
        break;
      case 'pin':
        selectedNotes.forEach(noteId => {
          const note = notes.find(n => n.id === noteId);
          if (note && !note.isPinned) {
            const store = useNotesStore.getState();
            store.pinNote(noteId);
          }
        });
        clearSelection();
        break;
      case 'unpin':
        selectedNotes.forEach(noteId => {
          const note = notes.find(n => n.id === noteId);
          if (note && note.isPinned) {
            const store = useNotesStore.getState();
            store.unpinNote(noteId);
          }
        });
        clearSelection();
        break;
      case 'duplicate':
        selectedNotes.forEach(noteId => {
          const store = useNotesStore.getState();
          store.duplicateNote(noteId);
        });
        clearSelection();
        break;
      default:
        break;
    }
  };

  const getViewIcon = () => {
    switch (view) {
      case 'grid': return <Grid size={20} />;
      case 'list': return <List size={20} />;
      case 'masonry': return <Columns size={20} />;
      default: return <Grid size={20} />;
    }
  };

  const getLayoutClasses = () => {
    switch (view) {
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-max';
      case 'list':
        return 'flex flex-col space-y-4';
      case 'masonry':
        return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-max';
    }
  };

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/15 via-violet-600/10 to-fuchsia-600/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-indigo-600/15 via-purple-600/10 to-violet-600/12 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 glass-effect rounded-xl border border-white/20">
                <Sparkles className="text-purple-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sticky Notes</h1>
                <p className="text-gray-300 text-sm">
                  {filteredNotes.length} notes • {getPinnedNotes().length} pinned
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <button
              onClick={handleQuickNote}
              className="p-2 glass-effect border border-white/20 rounded-xl text-gray-300 hover:text-white hover:border-purple-400/50 transition-all duration-200"
              title="Quick Note (Ctrl+Q)"
            >
              <Zap size={20} />
            </button>

            {/* Import/Export */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 glass-effect border border-white/20 rounded-xl text-gray-300 hover:text-white hover:border-green-400/50 transition-all duration-200"
              title="Import Notes"
            >
              <Upload size={20} />
            </button>

            {selectedNotes.length > 0 && (
              <button
                onClick={() => {
                  const store = useNotesStore.getState();
                  const exportData = store.exportNotes(selectedNotes, 'json');
                  const blob = new Blob([exportData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-2 glass-effect border border-white/20 rounded-xl text-gray-300 hover:text-white hover:border-blue-400/50 transition-all duration-200"
                title="Export Selected Notes"
              >
                <Download size={20} />
              </button>
            )}

            {/* Drag Mode Toggle */}
            <button
              onClick={() => setIsDragMode(!isDragMode)}
              className={`p-2 glass-effect border rounded-xl transition-all ${
                isDragMode
                  ? 'border-purple-400/50 bg-purple-500/20 text-white'
                  : 'border-white/20 text-gray-300 hover:text-white hover:border-purple-400/50'
              }`}
              title="Toggle Drag Mode"
            >
              <Move size={20} />
            </button>

            {/* View Toggle */}
            <div className="flex items-center glass-effect border border-white/20 rounded-xl overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-2 transition-colors ${
                  view === 'grid' 
                    ? 'bg-purple-500/30 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setView('masonry')}
                className={`p-2 transition-colors ${
                  view === 'masonry' 
                    ? 'bg-purple-500/30 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Columns size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 transition-colors ${
                  view === 'list' 
                    ? 'bg-purple-500/30 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* New Note Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNewNoteMenu(!showNewNoteMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
              >
                <Plus size={20} />
                <span className="font-medium">New Note</span>
                <ChevronDown size={16} className={`transition-transform ${showNewNoteMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showNewNoteMenu && (
                  <motion.div
                    className="absolute top-full right-0 mt-2 glass-effect border border-white/20 rounded-xl shadow-xl overflow-hidden z-50"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  >
                    <div className="p-2 space-y-1 min-w-48">
                      <button
                        onClick={() => handleCreateNote('text')}
                        className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <BookOpen size={16} className="text-blue-400" />
                        <div>
                          <div className="font-medium">Text Note</div>
                          <div className="text-xs text-gray-300">Simple note with text</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleCreateNote('task')}
                        className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Target size={16} className="text-green-400" />
                        <div>
                          <div className="font-medium">Task List</div>
                          <div className="text-xs text-gray-300">Checklist with tasks</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleCreateNote('idea')}
                        className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Sparkles size={16} className="text-yellow-400" />
                        <div>
                          <div className="font-medium">Idea Note</div>
                          <div className="text-xs text-gray-300">Brainstorm and capture ideas</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleCreateNote('reminder')}
                        className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Zap size={16} className="text-orange-400" />
                        <div>
                          <div className="font-medium">Reminder</div>
                          <div className="text-xs text-gray-300">Note with date reminder</div>
                        </div>
                      </button>

                      <div className="w-full h-px bg-white/10 my-2" />

                      <div className="px-3 py-2">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Templates</div>
                      </div>

                      <button
                        onClick={() => {
                          createNoteFromTemplate('meeting-notes');
                          setShowNewNoteMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <BookOpen size={16} className="text-indigo-400" />
                        <div>
                          <div className="font-medium">Meeting Notes</div>
                          <div className="text-xs text-gray-300">Structured meeting template</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          createNoteFromTemplate('project-plan');
                          setShowNewNoteMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Target size={16} className="text-blue-400" />
                        <div>
                          <div className="font-medium">Project Plan</div>
                          <div className="text-xs text-gray-300">Task breakdown template</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          createNoteFromTemplate('daily-journal');
                          setShowNewNoteMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <BookOpen size={16} className="text-pink-400" />
                        <div>
                          <div className="font-medium">Daily Journal</div>
                          <div className="text-xs text-gray-300">Personal reflection template</div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search notes, tags, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 glass-effect border rounded-xl transition-all ${
                showFilters
                  ? 'border-purple-400/50 bg-purple-500/20 text-white'
                  : 'border-white/20 text-gray-300 hover:text-white hover:border-purple-400/50'
              }`}
            >
              <Filter size={20} />
            </button>

            {/* Selection Actions */}
            {selectedNotes.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 glass-effect border border-white/20 rounded-xl">
                <span className="text-sm text-gray-300">
                  {selectedNotes.length} selected
                </span>
                <div className="w-px h-4 bg-white/20" />
                <button
                  onClick={() => handleBulkAction('pin')}
                  className="p-1 text-gray-300 hover:text-purple-400 transition-colors"
                  title="Pin selected notes"
                >
                  <Pin size={16} />
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="p-1 text-gray-300 hover:text-blue-400 transition-colors"
                  title="Archive selected notes"
                >
                  <Archive size={16} />
                </button>
                <button
                  onClick={() => handleBulkAction('duplicate')}
                  className="p-1 text-gray-300 hover:text-green-400 transition-colors"
                  title="Duplicate selected notes"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                  title="Delete selected notes"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={clearSelection}
                  className="p-1 text-gray-300 hover:text-white transition-colors"
                  title="Clear selection"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="glass-effect border border-white/20 rounded-xl p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as NoteCategory | 'all')}
                      className="w-full p-2 glass-effect border border-white/20 rounded-lg bg-white/5 text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="personal">📝 Personal</option>
                      <option value="work">💼 Work</option>
                      <option value="ideas">💡 Ideas</option>
                      <option value="reminders">⏰ Reminders</option>
                      <option value="urgent">🚨 Urgent</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as NoteType | 'all')}
                      className="w-full p-2 glass-effect border border-white/20 rounded-lg bg-white/5 text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Types</option>
                      <option value="text">📄 Text</option>
                      <option value="task">✅ Task</option>
                      <option value="idea">💡 Idea</option>
                      <option value="reminder">⏰ Reminder</option>
                      <option value="link">🔗 Link</option>
                    </select>
                  </div>

                  {/* View Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Show</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={showOnlyPinned}
                          onChange={(e) => setShowOnlyPinned(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        Pinned only
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={showArchived}
                          onChange={(e) => setShowArchived(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        Include archived
                      </label>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Quick Actions</label>
                    <div className="space-y-2">
                      <button
                        onClick={selectAllNotes}
                        className="w-full p-2 text-sm glass-effect border border-white/20 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearSelection}
                        className="w-full p-2 text-sm glass-effect border border-white/20 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="text-red-400">⚠️</div>
              <div className="text-red-300">{error}</div>
              <button
                onClick={() => setError(undefined)}
                className="ml-auto text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 overflow-y-auto overflow-x-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-300px)] h-full">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading notes...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-300px)] h-full">
                <div className="text-center">
                  <div className="text-red-400 mb-2">⚠️ Error loading notes</div>
                  <div className="text-gray-400 text-sm">{error}</div>
                </div>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-300px)] h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <div className="text-xl font-medium text-white mb-2">No notes yet</div>
                  <div className="text-gray-400 mb-4">
                    {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                      ? 'No notes match your current filters'
                      : 'Create your first note to get started'}
                  </div>
                  <button
                    onClick={() => handleCreateNote()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium"
                  >
                    Create Note
                  </button>
                </div>
              </div>
            ) : isDragMode ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <DroppableNotesGrid
                  notes={filteredNotes}
                  selectedNotes={selectedNotes}
                  view={view}
                  onSelect={toggleNoteSelection}
                />
              </DragDropContext>
            ) : (
              <motion.div
                className={`${getLayoutClasses()} min-h-[calc(100vh-300px)]`}
                layout
              >
                <AnimatePresence>
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      className={`
                        ${view === 'masonry' ? 'break-inside-avoid mb-4' : ''}
                        ${view === 'grid' ? 'w-full' : ''}
                        ${view === 'list' ? 'max-w-full' : ''}
                      `}
                    >
                      <StickyNote
                        note={note}
                        isSelected={selectedNotes.includes(note.id)}
                        isDragMode={false}
                        onSelect={toggleNoteSelection}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,.md"
        className="hidden"
        onChange={handleFileImport}
      />
    </div>
  );
};

export default NotesBoard;