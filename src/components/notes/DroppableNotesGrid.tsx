import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import DraggableNote from './DraggableNote';
import { StickyNote } from '../../types/notes';

interface DroppableNotesGridProps {
  notes: StickyNote[];
  selectedNotes: string[];
  view: 'grid' | 'masonry' | 'list';
  onSelect: (noteId: string) => void;
}

const DroppableNotesGrid: React.FC<DroppableNotesGridProps> = ({
  notes,
  selectedNotes,
  view,
  onSelect,
}) => {
  const getLayoutClasses = () => {
    switch (view) {
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-max min-h-[calc(100vh-300px)]';
      case 'list':
        return 'flex flex-col space-y-4 min-h-[calc(100vh-300px)]';
      case 'masonry':
        return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 min-h-[calc(100vh-300px)]';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-max min-h-[calc(100vh-300px)]';
    }
  };

  return (
    <Droppable droppableId="notes-grid" direction={view === 'list' ? 'vertical' : undefined}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`
            ${getLayoutClasses()}
            ${snapshot.isDraggingOver 
              ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl border-2 border-dashed border-purple-400/30' 
              : ''
            }
            transition-all duration-300 p-4
          `}
        >
          {notes.map((note, index) => (
            <div key={note.id} className={view === 'masonry' ? 'break-inside-avoid mb-4' : ''}>
              <DraggableNote
                note={note}
                index={index}
                isSelected={selectedNotes.includes(note.id)}
                onSelect={onSelect}
              />
            </div>
          ))}
          {provided.placeholder}
          
          {/* Drop zone indicator */}
          {snapshot.isDraggingOver && (
            <motion.div
              className="col-span-full flex items-center justify-center p-8 border-2 border-dashed border-purple-400/50 rounded-2xl bg-purple-500/5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center">
                <div className="text-purple-400 text-2xl mb-2">📝</div>
                <div className="text-purple-300 font-medium">Drop to reorder notes</div>
                <div className="text-purple-400/70 text-sm">Release to place here</div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default DroppableNotesGrid;