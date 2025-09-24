import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Edit2, Save, X, Eye, Download, Upload,
  Palette, Type, Ruler, AlertTriangle, CheckCircle, Copy,
  Trash2, MoreVertical, Grid, List, Search, Filter
} from 'lucide-react';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';
import { 
  BrandGuidelines, 
  ColorPalette, 
  FontDefinition, 
  AssetUsageContext,
  DEFAULT_COMPLIANCE_RULES
} from '../../types/brandAssets';

const BrandGuidelinesManager: React.FC = () => {
  const {
    guidelines,
    assets,
    activeClient,
    addGuidelines,
    updateGuidelines,
    deleteGuidelines,
    checkCompliance
  } = useBrandAssetsStore();

  const [selectedGuideline, setSelectedGuideline] = useState<string | null>(null);
  const [editingGuideline, setEditingGuideline] = useState<BrandGuidelines | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get guidelines for active client
  const clientGuidelines = guidelines.filter(g => 
    !activeClient || g.clientId === activeClient
  );

  const filteredGuidelines = clientGuidelines.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGuidelineData = selectedGuideline 
    ? guidelines.find(g => g.id === selectedGuideline)
    : null;

  // Initialize empty guideline for creation
  const initializeEmptyGuideline = (): BrandGuidelines => ({
    id: '',
    clientId: activeClient || 'default',
    name: '',
    description: '',
    logoSpacing: {
      minimum: '10px',
      recommended: '20px',
      clearSpace: '50px'
    },
    colorPalettes: [],
    fonts: [],
    doNotUse: [],
    usage: {
      contexts: [],
      restrictions: [],
      approvedUses: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const handleSaveGuideline = (guidelineData: BrandGuidelines) => {
    if (guidelineData.id) {
      updateGuidelines(guidelineData);
    } else {
      const newGuideline = {
        ...guidelineData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addGuidelines(newGuideline);
    }
    setEditingGuideline(null);
    setShowCreateForm(false);
  };

  const ColorPaletteEditor: React.FC<{
    palette: ColorPalette;
    onUpdate: (palette: ColorPalette) => void;
    onDelete: () => void;
  }> = ({ palette, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(palette);

    const handleSave = () => {
      onUpdate(editData);
      setIsEditing(false);
    };

    const addColor = () => {
      setEditData({
        ...editData,
        colors: [...editData.colors, {
          name: 'New Color',
          hex: '#000000',
          rgb: 'rgb(0, 0, 0)',
          usage: 'Accent color'
        }]
      });
    };

    return (
      <div className="border border-white/10 rounded-lg p-4 bg-white/5">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                placeholder="Palette name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Primary</label>
                <input
                  type="color"
                  value={editData.primary}
                  onChange={(e) => setEditData({...editData, primary: e.target.value})}
                  className="w-full h-10 rounded border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Secondary</label>
                <input
                  type="color"
                  value={editData.secondary || '#000000'}
                  onChange={(e) => setEditData({...editData, secondary: e.target.value})}
                  className="w-full h-10 rounded border border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Additional Colors</label>
                <button
                  onClick={addColor}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {editData.colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => {
                      const newColors = [...editData.colors];
                      newColors[index] = {...color, hex: e.target.value};
                      setEditData({...editData, colors: newColors});
                    }}
                    className="w-8 h-8 rounded border border-white/10"
                  />
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => {
                      const newColors = [...editData.colors];
                      newColors[index] = {...color, name: e.target.value};
                      setEditData({...editData, colors: newColors});
                    }}
                    className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white"
                    placeholder="Color name"
                  />
                  <button
                    onClick={() => {
                      const newColors = editData.colors.filter((_, i) => i !== index);
                      setEditData({...editData, colors: newColors});
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-white"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">{palette.name}</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-2 mb-3">
              <div 
                className="w-8 h-8 rounded border border-white/20"
                style={{ backgroundColor: palette.primary }}
                title={`Primary: ${palette.primary}`}
              />
              {palette.secondary && (
                <div 
                  className="w-8 h-8 rounded border border-white/20"
                  style={{ backgroundColor: palette.secondary }}
                  title={`Secondary: ${palette.secondary}`}
                />
              )}
              {palette.colors.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded border border-white/20"
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name}: ${color.hex}`}
                />
              ))}
              {palette.colors.length > 4 && (
                <div className="w-8 h-8 rounded border border-white/20 bg-gray-600 flex items-center justify-center">
                  <span className="text-xs text-gray-300">+{palette.colors.length - 4}</span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-400">
              {palette.colors.length + 2} colors total
            </div>
          </div>
        )}
      </div>
    );
  };

  const FontEditor: React.FC<{
    font: FontDefinition;
    onUpdate: (font: FontDefinition) => void;
    onDelete: () => void;
  }> = ({ font, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(font);

    const handleSave = () => {
      onUpdate(editData);
      setIsEditing(false);
    };

    return (
      <div className="border border-white/10 rounded-lg p-4 bg-white/5">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Font Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Font Family</label>
                <input
                  type="text"
                  value={editData.family}
                  onChange={(e) => setEditData({...editData, family: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Weights</label>
                <input
                  type="text"
                  value={editData.weights.join(', ')}
                  onChange={(e) => setEditData({
                    ...editData, 
                    weights: e.target.value.split(',').map(w => w.trim())
                  })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                  placeholder="400, 500, 600, 700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Styles</label>
                <input
                  type="text"
                  value={editData.styles.join(', ')}
                  onChange={(e) => setEditData({
                    ...editData, 
                    styles: e.target.value.split(',').map(s => s.trim())
                  })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                  placeholder="normal, italic"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Usage</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(editData.usage).map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={editData.usage[key as keyof typeof editData.usage] || false}
                      onChange={(e) => setEditData({
                        ...editData,
                        usage: { ...editData.usage, [key]: e.target.checked }
                      })}
                      className="rounded border-white/10"
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-white"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-white">{font.name}</h4>
                <p className="text-sm text-gray-400">{font.family}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-300 mb-2" style={{ fontFamily: font.family }}>
              The quick brown fox jumps over the lazy dog
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {font.weights.map((weight) => (
                <span key={weight} className="px-2 py-1 text-xs bg-gray-600/50 rounded">
                  {weight}
                </span>
              ))}
            </div>
            
            <div className="text-xs text-gray-400">
              Used for: {Object.entries(font.usage)
                .filter(([_, enabled]) => enabled)
                .map(([key, _]) => key)
                .join(', ') || 'Not specified'}
            </div>
          </div>
        )}
      </div>
    );
  };

  const GuidelineForm: React.FC<{
    guideline: BrandGuidelines;
    onSave: (guideline: BrandGuidelines) => void;
    onCancel: () => void;
  }> = ({ guideline, onSave, onCancel }) => {
    const [formData, setFormData] = useState(guideline);

    const addColorPalette = () => {
      const newPalette: ColorPalette = {
        id: Date.now().toString(),
        name: 'New Palette',
        primary: '#000000',
        colors: []
      };
      setFormData({
        ...formData,
        colorPalettes: [...formData.colorPalettes, newPalette]
      });
    };

    const addFont = () => {
      const newFont: FontDefinition = {
        id: Date.now().toString(),
        name: 'New Font',
        family: 'Arial, sans-serif',
        weights: ['400'],
        styles: ['normal'],
        usage: {}
      };
      setFormData({
        ...formData,
        fonts: [...formData.fonts, newFont]
      });
    };

    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Guidelines Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              placeholder="e.g., TechCorp Brand Guidelines"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white resize-none"
              placeholder="Describe the purpose and scope of these brand guidelines"
            />
          </div>
        </div>

        {/* Logo Spacing */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-purple-400" />
            Logo Spacing
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Minimum</label>
              <input
                type="text"
                value={formData.logoSpacing.minimum}
                onChange={(e) => setFormData({
                  ...formData,
                  logoSpacing: {...formData.logoSpacing, minimum: e.target.value}
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Recommended</label>
              <input
                type="text"
                value={formData.logoSpacing.recommended}
                onChange={(e) => setFormData({
                  ...formData,
                  logoSpacing: {...formData.logoSpacing, recommended: e.target.value}
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Clear Space</label>
              <input
                type="text"
                value={formData.logoSpacing.clearSpace}
                onChange={(e) => setFormData({
                  ...formData,
                  logoSpacing: {...formData.logoSpacing, clearSpace: e.target.value}
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              />
            </div>
          </div>
        </div>

        {/* Color Palettes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Color Palettes
            </h3>
            <button
              onClick={addColorPalette}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
            >
              <Plus className="w-4 h-4" />
              Add Palette
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.colorPalettes.map((palette, index) => (
              <ColorPaletteEditor
                key={palette.id}
                palette={palette}
                onUpdate={(updatedPalette) => {
                  const newPalettes = [...formData.colorPalettes];
                  newPalettes[index] = updatedPalette;
                  setFormData({...formData, colorPalettes: newPalettes});
                }}
                onDelete={() => {
                  const newPalettes = formData.colorPalettes.filter((_, i) => i !== index);
                  setFormData({...formData, colorPalettes: newPalettes});
                }}
              />
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-purple-400" />
              Typography
            </h3>
            <button
              onClick={addFont}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
            >
              <Plus className="w-4 h-4" />
              Add Font
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.fonts.map((font, index) => (
              <FontEditor
                key={font.id}
                font={font}
                onUpdate={(updatedFont) => {
                  const newFonts = [...formData.fonts];
                  newFonts[index] = updatedFont;
                  setFormData({...formData, fonts: newFonts});
                }}
                onDelete={() => {
                  const newFonts = formData.fonts.filter((_, i) => i !== index);
                  setFormData({...formData, fonts: newFonts});
                }}
              />
            ))}
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Usage Guidelines</h3>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Do Not Use (one per line)</label>
            <textarea
              value={formData.doNotUse.join('\n')}
              onChange={(e) => setFormData({
                ...formData,
                doNotUse: e.target.value.split('\n').filter(line => line.trim())
              })}
              rows={4}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white resize-none"
              placeholder="Don't stretch the logo&#10;Don't change colors without approval&#10;Don't use on busy backgrounds"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Usage Restrictions</label>
            <textarea
              value={formData.usage.restrictions.join('\n')}
              onChange={(e) => setFormData({
                ...formData,
                usage: {
                  ...formData.usage,
                  restrictions: e.target.value.split('\n').filter(line => line.trim())
                }
              })}
              rows={4}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white resize-none"
              placeholder="Requires approval for external use&#10;Cannot be modified without permission&#10;Must maintain clear space requirements"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-6 border-t border-white/10">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.name.trim()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
          >
            Save Guidelines
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Brand Guidelines Manager
          </h2>
          <p className="text-gray-400">
            {filteredGuidelines.length} guidelines • Define and maintain brand standards
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Guidelines
        </button>
      </div>

      {/* Search and view controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guidelines..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white placeholder-gray-400"
          />
        </div>

        <div className="flex border border-white/10 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${
              viewMode === 'grid' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${
              viewMode === 'list' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(showCreateForm || editingGuideline) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">
              {editingGuideline ? 'Edit Guidelines' : 'Create New Guidelines'}
            </h3>
            
            <GuidelineForm
              guideline={editingGuideline || initializeEmptyGuideline()}
              onSave={handleSaveGuideline}
              onCancel={() => {
                setEditingGuideline(null);
                setShowCreateForm(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guidelines List/Grid */}
      {filteredGuidelines.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-white mb-2">No brand guidelines found</h3>
          <p className="text-gray-400 mb-4">
            Create your first brand guideline to establish standards and consistency
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Create Guidelines
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredGuidelines.map((guideline) => (
            <motion.div
              key={guideline.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group"
              onClick={() => setSelectedGuideline(guideline.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-1">{guideline.name}</h3>
                  {guideline.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">{guideline.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGuideline(guideline);
                    }}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGuidelines(guideline.id);
                    }}
                    className="p-2 hover:bg-white/10 rounded transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Color palette preview */}
              {guideline.colorPalettes.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-2">Color Palettes</div>
                  <div className="flex gap-2">
                    {guideline.colorPalettes.slice(0, 3).map((palette) => (
                      <div key={palette.id} className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded border border-white/20"
                          style={{ backgroundColor: palette.primary }}
                        />
                        {palette.secondary && (
                          <div 
                            className="w-4 h-4 rounded border border-white/20"
                            style={{ backgroundColor: palette.secondary }}
                          />
                        )}
                      </div>
                    ))}
                    {guideline.colorPalettes.length > 3 && (
                      <div className="text-xs text-gray-400 flex items-center">
                        +{guideline.colorPalettes.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Font preview */}
              {guideline.fonts.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Typography</div>
                  <div className="text-sm text-gray-300">
                    {guideline.fonts.slice(0, 2).map(font => font.name).join(', ')}
                    {guideline.fonts.length > 2 && ` +${guideline.fonts.length - 2} more`}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Updated {new Date(guideline.updatedAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-4">
                  <span>{guideline.colorPalettes.length} palettes</span>
                  <span>{guideline.fonts.length} fonts</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Compliance Rules Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-400" />
          Compliance Rules
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_COMPLIANCE_RULES.slice(0, 4).map((rule) => (
            <div key={rule.id} className="flex items-start gap-3">
              <div className={`p-1 rounded ${
                rule.severity === 'error' ? 'bg-red-900/200/20 text-red-400' :
                rule.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-900/200/20 text-blue-400'
              }`}>
                {rule.severity === 'error' ? <AlertTriangle className="w-4 h-4" /> :
                 rule.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                 <CheckCircle className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">{rule.name}</h4>
                <p className="text-gray-400 text-xs">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            These rules help ensure brand consistency across all assets
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandGuidelinesManager;