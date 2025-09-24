import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pin,
  X,
  Edit3,
  Share,
  Copy,
  Archive,
  MoreVertical,
  Calendar,
  Tag,
  CheckSquare,
  Square,
  Plus,
  FileText,
  Lightbulb,
  Bell,
  Link,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';
import { StickyNote as StickyNoteType, TaskItem, NOTE_TYPE_ICONS, CATEGORY_COLORS } from '../../types/notes';
import { useNotesStore } from '../../stores/notesStore';

interface StickyNoteProps {
  note: StickyNoteType;
  isSelected?: boolean;
  isDragMode?: boolean;
  onSelect?: (noteId: string) => void;
  onDragStart?: (noteId: string) => void;
  onDragEnd?: () => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  isSelected = false,
  isDragMode = false,
  onSelect,
  onDragStart,
  onDragEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTitle, setEditTitle] = useState(note.title || '');
  const [newTaskText, setNewTaskText] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  const {
    updateNote,
    deleteNote,
    pinNote,
    unpinNote,
    archiveNote,
    duplicateNote,
    addTask,
    toggleTask,
    deleteTask,
    toggleNoteSelection,
  } = useNotesStore();

  const getTypeIcon = () => {
    const iconName = NOTE_TYPE_ICONS[note.type];
    switch (iconName) {
      case 'FileText': return <FileText size={16} />;
      case 'CheckSquare': return <CheckSquare size={16} />;
      case 'Bell': return <Bell size={16} />;
      case 'Lightbulb': return <Lightbulb size={16} />;
      case 'Link': return <Link size={16} />;
      case 'Palette': return <Palette size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getPriorityColor = () => {
    switch (note.priority) {
      case 'urgent': return 'border-l-4 border-red-500';
      case 'high': return 'border-l-4 border-orange-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return '';
    }
  };

  const handleSave = () => {
    updateNote(note.id, {
      content: editContent,
      title: editTitle || undefined,
    });
    setIsEditing(false);
    setHasStartedTyping(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setEditTitle(note.title || '');
    setIsEditing(false);
    setHasStartedTyping(false);
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(note.id, newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleTogglePin = () => {
    if (note.isPinned) {
      unpinNote(note.id);
    } else {
      pinNote(note.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEditContent(value);
    
    // Mark that user has started typing
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      
      // If it's default text, select all so it gets replaced when user types
      if (note.content === 'New note' || note.content === 'New task list') {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.select();
          }
        }, 0);
        setHasStartedTyping(false);
      } else {
        textareaRef.current.setSelectionRange(editContent.length, editContent.length);
      }
    }
  }, [isEditing]);

  const noteStyle = {
    backgroundColor: `${note.color}15`,
    borderColor: `${note.color}40`,
    width: note.size.width,
    minHeight: note.size.height,
  };

  return (
    <motion.div
      ref={noteRef}
      layout
      className={`
        relative group glass-effect border-2 rounded-2xl shadow-lg hover:shadow-xl 
        transition-all duration-300 cursor-pointer overflow-hidden
        ${isSelected ? 'ring-2 ring-purple-500 ring-opacity-60' : ''}
        ${getPriorityColor()}
        ${isDragMode ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
      style={noteStyle}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onSelect?.(note.id)}
      onDragStart={() => onDragStart?.(note.id)}
      onDragEnd={onDragEnd}
      draggable={isDragMode}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="text-gray-400 dark:text-gray-400">
            {getTypeIcon()}
          </div>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wide">
            {note.category}
          </span>
          {note.isPinned && (
            <Pin className="text-purple-500" size={12} />
          )}
        </div>

        <AnimatePresence>
          {showActions && (
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePin();
                }}
                className={`p-1 rounded-lg transition-colors ${
                  note.isPinned 
                    ? 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' 
                    : 'text-gray-400 hover:text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
              >
                <Pin size={14} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Edit3 size={14} />
              </button>

              <div className="relative">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-400 hover:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors"
                >
                  <MoreVertical size={14} />
                </button>

                {/* Dropdown menu would go here */}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-900/50 dark:hover:bg-red-900/30 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Title */}
      {(note.title || isEditing) && (
        <div className="px-4 pb-2">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full text-lg font-semibold bg-transparent border-none outline-none text-white placeholder-gray-400"
              onKeyDown={handleKeyDown}
              maxLength={100}
            />
          ) : (
            <h3 className="text-lg font-semibold text-white leading-tight">
              {note.title}
            </h3>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={handleContentChange}
              placeholder="Write your note..."
              className="w-full h-32 bg-transparent border-none outline-none resize-none text-white placeholder-gray-400 text-sm leading-relaxed"
              onKeyDown={handleKeyDown}
              maxLength={5000}
            />
            
            {/* Character Counter */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {editContent.length}/5000 characters
                {editContent.length > 4500 && (
                  <span className="text-orange-400 ml-1">
                    ({5000 - editContent.length} remaining)
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={editContent.trim().length === 0}
                  className="px-3 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-100 leading-relaxed">
              {note.content.length > 150 && !isExpanded 
                ? `${note.content.substring(0, 150)}...`
                : note.content
              }
            </p>
            
            {note.content.length > 150 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-xs text-purple-500 hover:text-purple-600 font-medium"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tasks */}
      {note.type === 'task' && note.tasks && (
        <div className="px-4 pb-4 space-y-2">
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {note.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 group/task">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(note.id, task.id);
                  }}
                  className="text-gray-400 hover:text-purple-500 transition-colors"
                >
                  {task.completed ? <CheckSquare size={14} /> : <Square size={14} />}
                </button>
                <span className={`text-xs flex-1 ${
                  task.completed 
                    ? 'text-gray-400 line-through' 
                    : 'text-gray-200'
                }`}>
                  {task.text}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(note.id, task.id);
                  }}
                  className="opacity-0 group-hover/task:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add task..."
                className="flex-1 text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 outline-none focus:border-purple-500"
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTask();
                  }
                }}
              />
              <button
                onClick={handleAddTask}
                className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-white/20 text-gray-200 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-400">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between text-xs text-gray-400">
        <span>
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        
        <div className="flex items-center gap-1">
          {note.reminderDate && (
            <Calendar size={12} className="text-orange-500" />
          )}
          {note.isShared && (
            <Share size={12} className="text-blue-500" />
          )}
          {note.metadata.wordCount && note.metadata.wordCount > 0 && (
            <span>{note.metadata.wordCount} words</span>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </motion.div>
  );
};

export default StickyNote;