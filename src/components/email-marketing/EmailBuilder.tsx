import React, { useState, useRef, useCallback } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Type,
  Image as ImageIcon,
  MousePointer,
  Columns,
  Square,
  AlignLeft,
  Settings,
  Eye,
  Code,
  Palette,
  Layers,
  Trash2,
  Copy,
  Move,
  Plus,
  Undo,
  Redo,
  Save,
  Send,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import type { EmailBuilderBlock, EmailBuilderSettings } from '../../types/emailMarketing'

// Block Components
const TextBlock: React.FC<{ block: EmailBuilderBlock; onUpdate: (updates: Partial<EmailBuilderBlock>) => void }> = ({ 
  block, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(block.content?.text || 'Enter your text here...')

  const handleSave = () => {
    onUpdate({
      content: { ...block.content, text: content }
    })
    setIsEditing(false)
  }

  return (
    <div 
      className="p-4 border border-gray-600 rounded-lg glass-effect min-h-[60px] cursor-text"
      onClick={() => setIsEditing(true)}
      style={{
        fontSize: block.styles?.fontSize || '16px',
        color: block.styles?.color || '#000000',
        textAlign: (block.styles?.textAlign || 'left') as 'left' | 'center' | 'right',
        fontFamily: block.styles?.fontFamily || 'Arial, sans-serif',
        lineHeight: block.styles?.lineHeight || '1.5'
      }}
    >
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSave()
            }
            if (e.key === 'Escape') {
              setContent(block.content?.text || '')
              setIsEditing(false)
            }
          }}
          className="w-full h-full resize-none border-none outline-none bg-transparent"
          autoFocus
          style={{
            fontSize: 'inherit',
            color: 'inherit',
            textAlign: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 'inherit'
          }}
        />
      ) : (
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ minHeight: '1.5em' }}
        />
      )}
    </div>
  )
}

const ImageBlock: React.FC<{ block: EmailBuilderBlock; onUpdate: (updates: Partial<EmailBuilderBlock>) => void }> = ({ 
  block, 
  onUpdate 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpdate({
          content: {
            ...block.content,
            src: event.target?.result as string,
            alt: file.name
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="p-4 border border-gray-600 rounded-lg glass-effect min-h-[200px] flex items-center justify-center">
      {block.content?.src ? (
        <img
          src={block.content.src}
          alt={block.content.alt || 'Email image'}
          className="max-w-full h-auto rounded cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: block.styles?.width || 'auto',
            height: block.styles?.height || 'auto',
            objectFit: (block.styles?.objectFit as 'cover' | 'contain' | 'fill') || 'cover'
          }}
        />
      ) : (
        <div 
          className="flex flex-col items-center text-gray-400 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-12 h-12 mb-2" />
          <p>Click to upload image</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
}

const ButtonBlock: React.FC<{ block: EmailBuilderBlock; onUpdate: (updates: Partial<EmailBuilderBlock>) => void }> = ({ 
  block, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(block.content?.text || 'Button Text')
  const [url, setUrl] = useState(block.content?.url || '#')

  const handleSave = () => {
    onUpdate({
      content: { ...block.content, text, url }
    })
    setIsEditing(false)
  }

  return (
    <div className="p-4 border border-gray-600 rounded-lg glass-effect min-h-[80px] flex items-center justify-center">
      {isEditing ? (
        <div className="space-y-2 w-full">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Button text"
            className="w-full p-2 border border-gray-600 rounded"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Button URL"
            className="w-full p-2 border border-gray-600 rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-300 text-gray-300 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <a
          href={url}
          onClick={(e) => {
            e.preventDefault()
            setIsEditing(true)
          }}
          className="inline-block px-6 py-3 rounded transition-colors"
          style={{
            backgroundColor: block.styles?.backgroundColor || '#007bff',
            color: block.styles?.color || '#ffffff',
            fontSize: block.styles?.fontSize || '16px',
            textDecoration: 'none',
            borderRadius: block.styles?.borderRadius || '4px'
          }}
        >
          {text}
        </a>
      )}
    </div>
  )
}

const DividerBlock: React.FC<{ block: EmailBuilderBlock }> = ({ block }) => {
  return (
    <div className="p-4 border border-gray-600 rounded-lg glass-effect min-h-[40px] flex items-center">
      <hr
        className="w-full"
        style={{
          borderColor: block.styles?.color || '#cccccc',
          borderWidth: block.styles?.borderWidth || '1px',
          borderStyle: block.styles?.borderStyle || 'solid'
        }}
      />
    </div>
  )
}

const SpacerBlock: React.FC<{ block: EmailBuilderBlock }> = ({ block }) => {
  return (
    <div
      className="border border-gray-600 rounded-lg bg-gray-700/50"
      style={{
        height: block.styles?.height || '20px'
      }}
    />
  )
}

// Draggable Block Component
const DraggableBlock: React.FC<{
  block: EmailBuilderBlock
  index: number
  onUpdate: (index: number, updates: Partial<EmailBuilderBlock>) => void
  onDelete: (index: number) => void
  onDuplicate: (index: number) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
  onSelect: (index: number) => void
  isSelected: boolean
}> = ({ block, index, onUpdate, onDelete, onDuplicate, onMove, onSelect, isSelected }) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop({
    accept: 'block',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      }
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) return
      
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      onMove(dragIndex, hoverIndex)
      item.index = hoverIndex
    }
  })

  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  drag(drop(ref))

  const renderBlock = () => {
    const updateHandler = (updates: Partial<EmailBuilderBlock>) => onUpdate(index, updates)

    switch (block.type) {
      case 'text':
        return <TextBlock block={block} onUpdate={updateHandler} />
      case 'image':
        return <ImageBlock block={block} onUpdate={updateHandler} />
      case 'button':
        return <ButtonBlock block={block} onUpdate={updateHandler} />
      case 'divider':
        return <DividerBlock block={block} />
      case 'spacer':
        return <SpacerBlock block={block} />
      default:
        return <div>Unknown block type</div>
    }
  }

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`relative group ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onSelect(index)}
    >
      {renderBlock()}
      
      {/* Block Controls */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate(index)
          }}
          className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(index)
          }}
          className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      
      {/* Drag Handle */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <Move className="w-4 h-4 text-gray-400 cursor-grab" />
      </div>
    </div>
  )
}

// Block Palette
const BlockPalette: React.FC<{ onAddBlock: (type: string) => void }> = ({ onAddBlock }) => {
  const blockTypes = [
    { type: 'text', label: 'Text', icon: Type, description: 'Add text content' },
    { type: 'image', label: 'Image', icon: ImageIcon, description: 'Add an image' },
    { type: 'button', label: 'Button', icon: MousePointer, description: 'Add a call-to-action button' },
    { type: 'divider', label: 'Divider', icon: Square, description: 'Add a horizontal line' },
    { type: 'spacer', label: 'Spacer', icon: Columns, description: 'Add vertical spacing' }
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Add Blocks</h3>
      {blockTypes.map((blockType) => {
        const Icon = blockType.icon
        return (
          <button
            key={blockType.type}
            onClick={() => onAddBlock(blockType.type)}
            className="w-full flex items-center gap-3 p-3 glass-effect border border-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <Icon className="w-5 h-5 text-gray-400" />
            <div>
              <div className="font-medium text-white text-sm">{blockType.label}</div>
              <div className="text-xs text-gray-400">{blockType.description}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Properties Panel
const PropertiesPanel: React.FC<{
  selectedBlock: EmailBuilderBlock | null
  onUpdateBlock: (updates: Partial<EmailBuilderBlock>) => void
  globalSettings: EmailBuilderSettings
  onUpdateSettings: (updates: Partial<EmailBuilderSettings>) => void
}> = ({ selectedBlock, onUpdateBlock, globalSettings, onUpdateSettings }) => {
  if (!selectedBlock) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Email Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={globalSettings.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
              className="w-full h-8 rounded border border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Content Width
            </label>
            <input
              type="number"
              value={globalSettings.contentWidth || 600}
              onChange={(e) => onUpdateSettings({ contentWidth: parseInt(e.target.value) })}
              className="w-full p-2 text-xs border border-gray-600 rounded"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Font Family
            </label>
            <select
              value={globalSettings.fontFamily || 'Arial, sans-serif'}
              onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
              className="w-full p-2 text-xs border border-gray-600 rounded"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Times New Roman, serif">Times New Roman</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        {selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)} Properties
      </h3>
      
      <div className="space-y-4">
        {(selectedBlock.type === 'text' || selectedBlock.type === 'button') && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Font Size
              </label>
              <input
                type="number"
                value={parseInt(selectedBlock.styles?.fontSize || '16')}
                onChange={(e) => onUpdateBlock({
                  styles: { ...selectedBlock.styles, fontSize: `${e.target.value}px` }
                })}
                className="w-full p-2 text-xs border border-gray-600 rounded"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Color
              </label>
              <input
                type="color"
                value={selectedBlock.styles?.color || '#000000'}
                onChange={(e) => onUpdateBlock({
                  styles: { ...selectedBlock.styles, color: e.target.value }
                })}
                className="w-full h-8 rounded border border-gray-600"
              />
            </div>
            
            {selectedBlock.type === 'text' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Text Align
                </label>
                <select
                  value={selectedBlock.styles?.textAlign || 'left'}
                  onChange={(e) => onUpdateBlock({
                    styles: { ...selectedBlock.styles, textAlign: e.target.value }
                  })}
                  className="w-full p-2 text-xs border border-gray-600 rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}
            
            {selectedBlock.type === 'button' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={selectedBlock.styles?.backgroundColor || '#007bff'}
                  onChange={(e) => onUpdateBlock({
                    styles: { ...selectedBlock.styles, backgroundColor: e.target.value }
                  })}
                  className="w-full h-8 rounded border border-gray-600"
                />
              </div>
            )}
          </>
        )}
        
        {selectedBlock.type === 'image' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Width
              </label>
              <input
                type="text"
                value={selectedBlock.styles?.width || 'auto'}
                onChange={(e) => onUpdateBlock({
                  styles: { ...selectedBlock.styles, width: e.target.value }
                })}
                placeholder="e.g., 100px, 50%, auto"
                className="w-full p-2 text-xs border border-gray-600 rounded"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Height
              </label>
              <input
                type="text"
                value={selectedBlock.styles?.height || 'auto'}
                onChange={(e) => onUpdateBlock({
                  styles: { ...selectedBlock.styles, height: e.target.value }
                })}
                placeholder="e.g., 200px, auto"
                className="w-full p-2 text-xs border border-gray-600 rounded"
              />
            </div>
          </>
        )}
        
        {selectedBlock.type === 'divider' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Color
              </label>
              <input
                type="color"
                value={selectedBlock.styles?.color || '#cccccc'}
                onChange={(e) => onUpdateBlock({
                  styles: { ...selectedBlock.styles, color: e.target.value }
                })}
                className="w-full h-8 rounded border border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Thickness
              </label>
              <input
                type="number"
                value={parseInt(selectedBlock.styles?.borderWidth || '1')}
                onChange={(e) => onUpdateBlock({
                  styles: { ...selectedBlock.styles, borderWidth: `${e.target.value}px` }
                })}
                className="w-full p-2 text-xs border border-gray-600 rounded"
              />
            </div>
          </>
        )}
        
        {selectedBlock.type === 'spacer' && (
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Height
            </label>
            <input
              type="number"
              value={parseInt(selectedBlock.styles?.height || '20')}
              onChange={(e) => onUpdateBlock({
                styles: { ...selectedBlock.styles, height: `${e.target.value}px` }
              })}
              className="w-full p-2 text-xs border border-gray-600 rounded"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Main Email Builder Component
const EmailBuilder: React.FC<{
  initialBlocks?: EmailBuilderBlock[]
  onSave?: (blocks: EmailBuilderBlock[], settings: EmailBuilderSettings) => void
  onPreview?: (blocks: EmailBuilderBlock[], settings: EmailBuilderSettings) => void
}> = ({ initialBlocks = [], onSave, onPreview }) => {
  const [blocks, setBlocks] = useState<EmailBuilderBlock[]>(initialBlocks)
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showPreview, setShowPreview] = useState(false)
  const [history, setHistory] = useState<EmailBuilderBlock[][]>([initialBlocks])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  const [settings, setSettings] = useState<EmailBuilderSettings>({
    backgroundColor: '#ffffff',
    contentWidth: 600,
    fontFamily: 'Arial, sans-serif'
  })

  const addToHistory = useCallback((newBlocks: EmailBuilderBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newBlocks])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const addBlock = (type: string) => {
    const newBlock: EmailBuilderBlock = {
      id: `block-${Date.now()}`,
      type: type as EmailBuilderBlock['type'],
      content: getDefaultContent(type),
      styles: getDefaultStyles(type)
    }

    const newBlocks = [...blocks, newBlock]
    setBlocks(newBlocks)
    addToHistory(newBlocks)
    setSelectedBlockIndex(newBlocks.length - 1)
  }

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Enter your text here...' }
      case 'image':
        return { src: '', alt: 'Email image' }
      case 'button':
        return { text: 'Click Here', url: '#' }
      default:
        return {}
    }
  }

  const getDefaultStyles = (type: string) => {
    switch (type) {
      case 'text':
        return {
          fontSize: '16px',
          color: '#000000',
          textAlign: 'left',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.5'
        }
      case 'button':
        return {
          backgroundColor: '#007bff',
          color: '#ffffff',
          fontSize: '16px',
          borderRadius: '4px'
        }
      case 'divider':
        return {
          color: '#cccccc',
          borderWidth: '1px',
          borderStyle: 'solid'
        }
      case 'spacer':
        return {
          height: '20px'
        }
      default:
        return {}
    }
  }

  const updateBlock = (index: number, updates: Partial<EmailBuilderBlock>) => {
    const newBlocks = blocks.map((block, i) => 
      i === index ? { ...block, ...updates } : block
    )
    setBlocks(newBlocks)
    addToHistory(newBlocks)
  }

  const deleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index)
    setBlocks(newBlocks)
    addToHistory(newBlocks)
    setSelectedBlockIndex(null)
  }

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = blocks[index]
    const duplicatedBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`
    }
    const newBlocks = [
      ...blocks.slice(0, index + 1),
      duplicatedBlock,
      ...blocks.slice(index + 1)
    ]
    setBlocks(newBlocks)
    addToHistory(newBlocks)
  }

  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragBlock = blocks[dragIndex]
    const newBlocks = [...blocks]
    newBlocks.splice(dragIndex, 1)
    newBlocks.splice(hoverIndex, 0, dragBlock)
    setBlocks(newBlocks)
  }, [blocks])

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setBlocks(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setBlocks(history[historyIndex + 1])
    }
  }

  const handleSave = () => {
    onSave?.(blocks, settings)
  }

  const handlePreview = () => {
    setShowPreview(true)
    onPreview?.(blocks, settings)
  }

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px'
      case 'tablet':
        return '768px'
      case 'desktop':
      default:
        return `${settings.contentWidth}px`
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex bg-gray-800/50">
        {/* Left Sidebar - Block Palette */}
        <div className="w-64 glass-effect border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <BlockPalette onAddBlock={addBlock} />
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="glass-effect border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 text-gray-400 hover:text-gray-400 disabled:opacity-50"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 text-gray-400 hover:text-gray-400 disabled:opacity-50"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-2" />
              
              <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${previewMode === 'desktop' ? 'glass-effect shadow-sm' : ''}`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded ${previewMode === 'tablet' ? 'glass-effect shadow-sm' : ''}`}
                  title="Tablet"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${previewMode === 'mobile' ? 'glass-effect shadow-sm' : ''}`}
                  title="Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div 
            className="flex-1 overflow-auto p-8 flex justify-center"
            style={{ backgroundColor: settings.backgroundColor }}
          >
            <div
              className="glass-effect shadow-lg rounded-lg overflow-hidden transition-all duration-300"
              style={{ width: getPreviewWidth(), maxWidth: '100%' }}
            >
              <div className="p-4 space-y-4">
                {blocks.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start building your email by adding blocks from the sidebar</p>
                  </div>
                ) : (
                  blocks.map((block, index) => (
                    <DraggableBlock
                      key={block.id}
                      block={block}
                      index={index}
                      onUpdate={updateBlock}
                      onDelete={deleteBlock}
                      onDuplicate={duplicateBlock}
                      onMove={moveBlock}
                      onSelect={setSelectedBlockIndex}
                      isSelected={selectedBlockIndex === index}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 glass-effect border-l border-gray-700 overflow-y-auto">
          <PropertiesPanel
            selectedBlock={selectedBlockIndex !== null ? blocks[selectedBlockIndex] : null}
            onUpdateBlock={(updates) => {
              if (selectedBlockIndex !== null) {
                updateBlock(selectedBlockIndex, updates)
              }
            }}
            globalSettings={settings}
            onUpdateSettings={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
          />
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-effect rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Email Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-400 hover:text-gray-400"
                  >
                    ×
                  </button>
                </div>
                
                <div className="p-8" style={{ backgroundColor: settings.backgroundColor }}>
                  <div
                    className="glass-effect shadow-lg rounded-lg overflow-hidden mx-auto"
                    style={{ width: settings.contentWidth, maxWidth: '100%' }}
                  >
                    <div className="p-4 space-y-4">
                      {blocks.map((block, index) => (
                        <div key={block.id}>
                          {block.type === 'text' && (
                            <div
                              dangerouslySetInnerHTML={{ __html: block.content?.text || '' }}
                              style={{
                                fontSize: block.styles?.fontSize || '16px',
                                color: block.styles?.color || '#000000',
                                textAlign: (block.styles?.textAlign || 'left') as 'left' | 'center' | 'right',
                                fontFamily: block.styles?.fontFamily || settings.fontFamily,
                                lineHeight: block.styles?.lineHeight || '1.5'
                              }}
                            />
                          )}
                          
                          {block.type === 'image' && block.content?.src && (
                            <img
                              src={block.content.src}
                              alt={block.content.alt || ''}
                              style={{
                                width: block.styles?.width || 'auto',
                                height: block.styles?.height || 'auto',
                                maxWidth: '100%'
                              }}
                            />
                          )}
                          
                          {block.type === 'button' && (
                            <div style={{ textAlign: 'center' }}>
                              <a
                                href={block.content?.url || '#'}
                                style={{
                                  display: 'inline-block',
                                  padding: '12px 24px',
                                  backgroundColor: block.styles?.backgroundColor || '#007bff',
                                  color: block.styles?.color || '#ffffff',
                                  fontSize: block.styles?.fontSize || '16px',
                                  textDecoration: 'none',
                                  borderRadius: block.styles?.borderRadius || '4px'
                                }}
                              >
                                {block.content?.text || 'Button'}
                              </a>
                            </div>
                          )}
                          
                          {block.type === 'divider' && (
                            <hr
                              style={{
                                borderColor: block.styles?.color || '#cccccc',
                                borderWidth: block.styles?.borderWidth || '1px',
                                borderStyle: block.styles?.borderStyle || 'solid'
                              }}
                            />
                          )}
                          
                          {block.type === 'spacer' && (
                            <div
                              style={{
                                height: block.styles?.height || '20px'
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}

export default EmailBuilder