import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import StickyNote from './StickyNote';
import { StickyNote as StickyNoteType } from '../../types/notes';

interface DraggableNoteProps {
  note: StickyNoteType;
  index: number;
  isSelected?: boolean;
  onSelect?: (noteId: string) => void;
}

const DraggableNote: React.FC<DraggableNoteProps> = ({ 
  note, 
  index, 
  isSelected, 
  onSelect 
}) => {
  return (
    <Draggable draggableId={note.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`transition-all duration-200 ${
            snapshot.isDragging 
              ? 'rotate-2 scale-105 shadow-2xl z-50' 
              : 'hover:scale-102'
          }`}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging 
              ? `${provided.draggableProps.style?.transform} rotate(2deg)` 
              : provided.draggableProps.style?.transform,
          }}
        >
          <StickyNote
            note={note}
            isSelected={isSelected}
            isDragMode={true}
            onSelect={onSelect}
          />
        </div>
      )}
    </Draggable>
  );
};

export default DraggableNote;