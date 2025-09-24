import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Type, 
  Image, 
  Layout, 
  Palette, 
  Eye, 
  Code, 
  Save, 
  Undo, 
  Redo,
  Plus,
  Trash2,
  Move,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  Grid,
  Columns
} from 'lucide-react'
import { useEmailMarketingStore } from '../../stores/emailMarketingStore'

interface EmailTemplateBuilderProps {
  templateId?: string
  content?: string
  onTemplateSelect: (templateId: string) => void
  onContentChange: (content: string) => void
  error?: string
}

interface EmailBlock {
  id: string
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'social' | 'header' | 'footer'
  content: any
  styles: {
    backgroundColor?: string
    padding?: string
    margin?: string
    textAlign?: 'left' | 'center' | 'right'
    fontSize?: string
    fontWeight?: string
    color?: string
    borderRadius?: string
    border?: string
  }
}

interface Template {
  id: string
  name: string
  thumbnail: string
  category: 'newsletter' | 'promotional' | 'transactional' | 'welcome'
  blocks: EmailBlock[]
}

const defaultTemplates: Template[] = [
  {
    id: 'newsletter-basic',
    name: 'Basic Newsletter',
    thumbnail: '/templates/newsletter-basic.png',
    category: 'newsletter',
    blocks: [
      {
        id: 'header-1',
        type: 'header',
        content: { text: 'Your Logo', logoUrl: '', backgroundColor: '#ffffff' },
        styles: { backgroundColor: '#ffffff', padding: '20px', textAlign: 'center' }
      },
      {
        id: 'text-1',
        type: 'text',
        content: { html: '<h1>Welcome to our Newsletter</h1><p>Stay updated with our latest news and updates.</p>' },
        styles: { padding: '20px', color: '#333333' }
      },
      {
        id: 'image-1',
        type: 'image',
        content: { src: '', alt: 'Featured image', url: '' },
        styles: { padding: '20px', textAlign: 'center' }
      },
      {
        id: 'button-1',
        type: 'button',
        content: { text: 'Read More', url: '#', backgroundColor: '#007bff', color: '#ffffff' },
        styles: { padding: '20px', textAlign: 'center' }
      }
    ]
  },
  {
    id: 'promotional-sale',
    name: 'Sale Promotion',
    thumbnail: '/templates/promotional-sale.png',
    category: 'promotional',
    blocks: [
      {
        id: 'header-2',
        type: 'header',
        content: { text: 'FLASH SALE', backgroundColor: '#ff4444' },
        styles: { backgroundColor: '#ff4444', padding: '30px', textAlign: 'center', color: '#ffffff' }
      },
      {
        id: 'text-2',
        type: 'text',
        content: { html: '<h2>50% OFF Everything!</h2><p>Limited time offer - Don\'t miss out!</p>' },
        styles: { padding: '20px', textAlign: 'center', color: '#333333' }
      },
      {
        id: 'button-2',
        type: 'button',
        content: { text: 'Shop Now', url: '#', backgroundColor: '#ff4444', color: '#ffffff' },
        styles: { padding: '20px', textAlign: 'center' }
      }
    ]
  }
]

const EmailTemplateBuilder: React.FC<EmailTemplateBuilderProps> = ({
  templateId,
  content,
  onTemplateSelect,
  onContentChange,
  error
}) => {
  const { templates } = useEmailMarketingStore()
  const [viewMode, setViewMode] = useState<'templates' | 'builder' | 'code'>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [emailBlocks, setEmailBlocks] = useState<EmailBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [history, setHistory] = useState<EmailBlock[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [draggedBlock, setDraggedBlock] = useState<EmailBlock | null>(null)

  const editorRef = useRef<HTMLDivElement>(null)

  const blockTypes = [
    { type: 'text', label: 'Text', icon: Type },
    { type: 'image', label: 'Image', icon: Image },
    { type: 'button', label: 'Button', icon: Grid },
    { type: 'divider', label: 'Divider', icon: Layout },
    { type: 'spacer', label: 'Spacer', icon: Move },
    { type: 'social', label: 'Social', icon: Link }
  ]

  const saveToHistory = useCallback((blocks: EmailBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...blocks])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: `${type}-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type)
    }

    const updatedBlocks = [...emailBlocks, newBlock]
    setEmailBlocks(updatedBlocks)
    saveToHistory(updatedBlocks)
    setSelectedBlock(newBlock.id)
  }

  const updateBlock = (blockId: string, updates: Partial<EmailBlock>) => {
    const updatedBlocks = emailBlocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    )
    setEmailBlocks(updatedBlocks)
    saveToHistory(updatedBlocks)
  }

  const deleteBlock = (blockId: string) => {
    const updatedBlocks = emailBlocks.filter(block => block.id !== blockId)
    setEmailBlocks(updatedBlocks)
    saveToHistory(updatedBlocks)
    setSelectedBlock(null)
  }

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const updatedBlocks = [...emailBlocks]
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1)
    updatedBlocks.splice(toIndex, 0, movedBlock)
    setEmailBlocks(updatedBlocks)
    saveToHistory(updatedBlocks)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setEmailBlocks(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setEmailBlocks(history[historyIndex + 1])
    }
  }

  const getDefaultContent = (type: EmailBlock['type']) => {
    switch (type) {
      case 'text':
        return { html: '<p>Add your text here...</p>' }
      case 'image':
        return { src: '', alt: 'Image', url: '' }
      case 'button':
        return { text: 'Click Me', url: '#', backgroundColor: '#007bff', color: '#ffffff' }
      case 'divider':
        return { color: '#e0e0e0', height: 1 }
      case 'spacer':
        return { height: 20 }
      case 'social':
        return { platforms: ['facebook', 'twitter', 'instagram'], size: 'medium' }
      default:
        return {}
    }
  }

  const getDefaultStyles = (type: EmailBlock['type']) => {
    const baseStyles = { padding: '10px' }
    
    switch (type) {
      case 'text':
        return { ...baseStyles, color: '#333333', fontSize: '16px' }
      case 'image':
        return { ...baseStyles, textAlign: 'center' as const }
      case 'button':
        return { ...baseStyles, textAlign: 'center' as const }
      case 'divider':
        return { padding: '5px 20px' }
      case 'spacer':
        return { padding: '0' }
      case 'social':
        return { ...baseStyles, textAlign: 'center' as const }
      default:
        return baseStyles
    }
  }

  const generateEmailHTML = () => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Email Template</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        </style>
      </head>
      <body>
        <div class="email-container">
    `

    emailBlocks.forEach(block => {
      html += generateBlockHTML(block)
    })

    html += `
        </div>
      </body>
      </html>
    `

    return html
  }

  const generateBlockHTML = (block: EmailBlock) => {
    const styleString = Object.entries(block.styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ')

    switch (block.type) {
      case 'text':
        return `<div style="${styleString}">${block.content.html}</div>`
      
      case 'image':
        return `
          <div style="${styleString}">
            ${block.content.url ? `<a href="${block.content.url}">` : ''}
            <img src="${block.content.src}" alt="${block.content.alt}" style="max-width: 100%; height: auto;" />
            ${block.content.url ? '</a>' : ''}
          </div>
        `
      
      case 'button':
        return `
          <div style="${styleString}">
            <a href="${block.content.url}" style="display: inline-block; padding: 12px 24px; background-color: ${block.content.backgroundColor}; color: ${block.content.color}; text-decoration: none; border-radius: 4px; font-weight: bold;">
              ${block.content.text}
            </a>
          </div>
        `
      
      case 'divider':
        return `
          <div style="${styleString}">
            <hr style="border: none; height: ${block.content.height}px; background-color: ${block.content.color}; margin: 0;" />
          </div>
        `
      
      case 'spacer':
        return `<div style="height: ${block.content.height}px;"></div>`
      
      case 'social':
        const socialLinks = block.content.platforms.map((platform: string) => 
          `<a href="#" style="margin: 0 10px;"><img src="/social/${platform}.png" alt="${platform}" style="width: 32px; height: 32px;" /></a>`
        ).join('')
        return `<div style="${styleString}">${socialLinks}</div>`
      
      default:
        return ''
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setEmailBlocks(template.blocks)
    setHistory([template.blocks])
    setHistoryIndex(0)
    setViewMode('builder')
    onTemplateSelect(template.id)
  }

  const handleDragStart = (block: EmailBlock, index: number) => {
    setDraggedBlock(block)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (!draggedBlock) return

    const dragIndex = emailBlocks.findIndex(b => b.id === draggedBlock.id)
    if (dragIndex !== -1 && dragIndex !== dropIndex) {
      moveBlock(dragIndex, dropIndex)
    }
    setDraggedBlock(null)
  }

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => setViewMode('templates')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'templates' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-300 hover:bg-gray-300'
          }`}
        >
          <Layout className="w-4 h-4 inline mr-2" />
          Templates
        </button>
        <button
          onClick={() => setViewMode('builder')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'builder' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-300 hover:bg-gray-300'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Builder
        </button>
        <button
          onClick={() => setViewMode('code')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'code' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-300 hover:bg-gray-300'
          }`}
        >
          <Code className="w-4 h-4 inline mr-2" />
          HTML
        </button>
      </div>

      {/* Template Selection */}
      {viewMode === 'templates' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Choose a Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultTemplates.map(template => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                className="glass-effect border border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="aspect-[4/3] bg-gray-800/50 flex items-center justify-center">
                  <Layout className="w-12 h-12 text-gray-400" />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white">{template.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{template.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-gray-700/50 rounded-lg text-center">
            <h4 className="font-semibold text-white mb-2">Start from Scratch</h4>
            <p className="text-gray-400 mb-4">Create your own custom email template</p>
            <button
              onClick={() => {
                setEmailBlocks([])
                setHistory([[]])
                setHistoryIndex(0)
                setViewMode('builder')
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Blank Template
            </button>
          </div>
        </div>
      )}

      {/* Email Builder */}
      {viewMode === 'builder' && (
        <div className="flex flex-1 gap-6">
          {/* Blocks Toolbar */}
          <div className="w-64 bg-gray-700/50 rounded-lg p-4">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h4 className="font-semibold text-white mb-3">Add Blocks</h4>
            <div className="space-y-2">
              {blockTypes.map(blockType => {
                const Icon = blockType.icon
                return (
                  <button
                    key={blockType.type}
                    onClick={() => addBlock(blockType.type as EmailBlock['type'])}
                    className="w-full flex items-center space-x-2 p-3 text-left glass-effect border border-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">{blockType.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Email Preview */}
          <div className="flex-1 glass-effect border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h4 className="font-semibold text-white">Email Preview</h4>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto" ref={editorRef}>
              <div className="max-w-md mx-auto glass-effect border border-gray-700 rounded-lg overflow-hidden">
                {emailBlocks.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start building your email by adding blocks</p>
                  </div>
                ) : (
                  emailBlocks.map((block, index) => (
                    <div
                      key={block.id}
                      className={`relative group ${selectedBlock === block.id ? 'ring-2 ring-blue-500' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(block, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onClick={() => setSelectedBlock(block.id)}
                    >
                      <div dangerouslySetInnerHTML={{ __html: generateBlockHTML(block) }} />
                      
                      {selectedBlock === block.id && (
                        <div className="absolute top-0 right-0 flex space-x-1 p-1 glass-effect border border-gray-600 rounded-bl-lg">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteBlock(block.id)
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Block"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Block Settings */}
          {selectedBlock && (
            <div className="w-80 bg-gray-700/50 rounded-lg p-4">
              <BlockEditor
                block={emailBlocks.find(b => b.id === selectedBlock)!}
                onUpdate={(updates) => updateBlock(selectedBlock, updates)}
              />
            </div>
          )}
        </div>
      )}

      {/* HTML Code View */}
      {viewMode === 'code' && (
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">HTML Code</h3>
            <button
              onClick={() => {
                const htmlCode = generateEmailHTML()
                onContentChange(htmlCode)
                navigator.clipboard.writeText(htmlCode)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copy HTML
            </button>
          </div>
          
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm">
            <code>{generateEmailHTML()}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

// Block Editor Component
interface BlockEditorProps {
  block: EmailBlock
  onUpdate: (updates: Partial<EmailBlock>) => void
}

const BlockEditor: React.FC<BlockEditorProps> = ({ block, onUpdate }) => {
  const updateContent = (content: any) => {
    onUpdate({ content: { ...block.content, ...content } })
  }

  const updateStyles = (styles: any) => {
    onUpdate({ styles: { ...block.styles, ...styles } })
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-white capitalize">{block.type} Settings</h4>
      
      {/* Content Settings */}
      <div>
        <h5 className="font-medium text-gray-300 mb-2">Content</h5>
        
        {block.type === 'text' && (
          <textarea
            value={block.content.html || ''}
            onChange={(e) => updateContent({ html: e.target.value })}
            className="w-full p-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
            rows={4}
            placeholder="Enter HTML content"
          />
        )}

        {block.type === 'image' && (
          <div className="space-y-2">
            <input
              type="url"
              placeholder="Image URL"
              value={block.content.src || ''}
              onChange={(e) => updateContent({ src: e.target.value })}
              className="w-full p-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Alt text"
              value={block.content.alt || ''}
              onChange={(e) => updateContent({ alt: e.target.value })}
              className="w-full p-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
            />
            <input
              type="url"
              placeholder="Link URL (optional)"
              value={block.content.url || ''}
              onChange={(e) => updateContent({ url: e.target.value })}
              className="w-full p-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
            />
          </div>
        )}

        {block.type === 'button' && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Button text"
              value={block.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              className="w-full p-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
            />
            <input
              type="url"
              placeholder="Button URL"
              value={block.content.url || ''}
              onChange={(e) => updateContent({ url: e.target.value })}
              className="w-full p-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
            />
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Background</label>
                <input
                  type="color"
                  value={block.content.backgroundColor || '#007bff'}
                  onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                  className="w-full h-8 rounded border border-gray-600"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                <input
                  type="color"
                  value={block.content.color || '#ffffff'}
                  onChange={(e) => updateContent({ color: e.target.value })}
                  className="w-full h-8 rounded border border-gray-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Style Settings */}
      <div>
        <h5 className="font-medium text-gray-300 mb-2">Styling</h5>
        
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Padding</label>
            <input
              type="text"
              value={block.styles.padding || ''}
              onChange={(e) => updateStyles({ padding: e.target.value })}
              placeholder="e.g., 20px"
              className="w-full p-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Text Alignment</label>
            <select
              value={block.styles.textAlign || 'left'}
              onChange={(e) => updateStyles({ textAlign: e.target.value })}
              className="w-full p-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          {block.type === 'text' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                <input
                  type="text"
                  value={block.styles.fontSize || ''}
                  onChange={(e) => updateStyles({ fontSize: e.target.value })}
                  placeholder="e.g., 16px"
                  className="w-full p-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                <input
                  type="color"
                  value={block.styles.color || '#333333'}
                  onChange={(e) => updateStyles({ color: e.target.value })}
                  className="w-full h-8 rounded border border-gray-600"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Background Color</label>
            <input
              type="color"
              value={block.styles.backgroundColor || '#ffffff'}
              onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
              className="w-full h-8 rounded border border-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailTemplateBuilder