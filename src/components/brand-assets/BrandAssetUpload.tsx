import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  File,
  CheckCircle,
  AlertCircle,
  Image,
  FileText,
  Film,
  Music,
  Archive,
  Palette,
  Type,
  Target,
  Tag,
  Eye,
  Download,
  Shield,
  Clock
} from 'lucide-react';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';
import { 
  BrandAssetType, 
  BrandAssetVariant, 
  BrandAssetFormat, 
  AssetUsageContext,
  DEFAULT_ASSET_TYPES 
} from '../../types/brandAssets';

interface BrandAssetUploadProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  preSelectedType?: BrandAssetType;
}

const BrandAssetUpload: React.FC<BrandAssetUploadProps> = ({
  isOpen,
  onClose,
  clientId,
  preSelectedType
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStep, setUploadStep] = useState<'select' | 'configure' | 'uploading' | 'complete'>('select');
  
  // Asset configuration
  const [assetType, setAssetType] = useState<BrandAssetType>(preSelectedType || 'logo');
  const [assetVariant, setAssetVariant] = useState<BrandAssetVariant>('primary');
  const [assetTags, setAssetTags] = useState<string>('');
  const [assetDescription, setAssetDescription] = useState<string>('');
  const [usageContexts, setUsageContexts] = useState<AssetUsageContext[]>(['social-media']);
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [requiresApproval, setRequiresApproval] = useState<boolean>(true);

  const {
    addAsset,
    settings,
    checkCompliance,
    validateAssetNaming,
    setError
  } = useBrandAssetsStore();

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image className="text-green-500" size={20} />;
    if (type.startsWith('video/')) return <Film className="text-purple-500" size={20} />;
    if (type.startsWith('audio/')) return <Music className="text-blue-500" size={20} />;
    if (type.includes('pdf')) return <FileText className="text-red-500" size={20} />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="text-orange-500" size={20} />;
    return <File className="text-slate-500" size={20} />;
  };

  const getAssetTypeIcon = (type: BrandAssetType) => {
    switch (type) {
      case 'logo': return <Target className="text-purple-500" size={20} />;
      case 'icon': return <Palette className="text-blue-500" size={20} />;
      case 'color-palette': return <Palette className="text-green-500" size={20} />;
      case 'font': return <Type className="text-orange-500" size={20} />;
      case 'template': return <FileText className="text-indigo-500" size={20} />;
      case 'image': return <Image className="text-pink-500" size={20} />;
      case 'video': return <Film className="text-red-500" size={20} />;
      case 'document': return <FileText className="text-gray-400" size={20} />;
      case 'guideline': return <Shield className="text-cyan-500" size={20} />;
      default: return <File className="text-slate-500" size={20} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > settings.maxFileSize) {
      return `File size exceeds ${formatFileSize(settings.maxFileSize)} limit`;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && !settings.allowedFormats.includes(fileExtension as BrandAssetFormat)) {
      return `File type .${fileExtension} is not allowed`;
    }

    return null;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    if (validFiles.length > 0) {
      setUploadStep('configure');
    }
  }, [settings, setError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setUploadStep('select');
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploadStep('uploading');

    try {
      const tags = assetTags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      for (const file of selectedFiles) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() as BrandAssetFormat;
        
        // Create asset data
        const assetData = {
          clientId,
          name: file.name,
          description: assetDescription,
          type: assetType,
          variant: assetVariant,
          format: fileExtension,
          fileSize: file.size,
          url: URL.createObjectURL(file), // In real app, this would be uploaded to storage
          tags: [...tags, ...settings.defaultTags],
          isPrimary,
          versionNumber: 1,
          isApproved: !requiresApproval || settings.autoApproval,
          guidelinesCompliant: true,
          uploadedBy: 'current_user', // Get from auth context
          isPublic: false,
          allowedUsers: [],
          allowedContexts: usageContexts,
        };

        // Validate compliance
        const tempAsset = { ...assetData, id: 'temp', uploadedAt: new Date(), updatedAt: new Date(), usageHistory: [], totalDownloads: 0 };
        const complianceCheck = checkCompliance(tempAsset);
        
        if (!complianceCheck.isCompliant && settings.requireGuidelines) {
          setError(`File ${file.name} failed compliance check: ${complianceCheck.issues.join(', ')}`);
          continue;
        }

        // Add asset to store
        addAsset(assetData);
      }

      setUploadStep('complete');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
      setUploadStep('configure');
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setUploadStep('select');
    setAssetType(preSelectedType || 'logo');
    setAssetVariant('primary');
    setAssetTags('');
    setAssetDescription('');
    setUsageContexts(['social-media']);
    setIsPrimary(false);
    setRequiresApproval(true);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  const currentAssetType = DEFAULT_ASSET_TYPES.find(t => t.type === assetType);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="glass-effect border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 glass-effect rounded-xl border border-white/20">
                <Upload className="text-purple-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Upload Brand Assets
                </h2>
                <p className="text-gray-300 text-sm">
                  Step {uploadStep === 'select' ? '1' : uploadStep === 'configure' ? '2' : uploadStep === 'uploading' ? '3' : '4'} of 4
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Step 1: File Selection */}
            {uploadStep === 'select' && (
              <div className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-white/30 hover:border-purple-400/50 hover:bg-white/5'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto mb-4 text-gray-300" size={56} />
                  <h3 className="text-xl font-medium text-white mb-2">
                    Drop brand assets here or click to browse
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Supported formats: {settings.allowedFormats.join(', ')}
                  </p>
                  <p className="text-sm text-gray-400">
                    Maximum file size: {formatFileSize(settings.maxFileSize)}
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    accept={settings.allowedFormats.map(ext => `.${ext}`).join(',')}
                  />
                </div>

                {/* Asset Type Quick Select */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Or select asset type first:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DEFAULT_ASSET_TYPES.map((type) => (
                      <motion.button
                        key={type.type}
                        onClick={() => {
                          setAssetType(type.type);
                          fileInputRef.current?.click();
                        }}
                        className="p-4 glass-effect border border-white/20 rounded-xl hover:border-purple-400/50 transition-all text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {getAssetTypeIcon(type.type)}
                          <span className="font-medium text-white capitalize">
                            {type.type.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{type.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Configuration */}
            {uploadStep === 'configure' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: File List */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">
                      Selected Files ({selectedFiles.length})
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <motion.div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between p-3 glass-effect border border-white/20 rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(file)}
                            <div>
                              <div className="font-medium text-white text-sm">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-300">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                          >
                            <X size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white mb-4">Asset Configuration</h3>
                    
                    {/* Asset Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Asset Type
                      </label>
                      <select
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value as BrandAssetType)}
                        className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                      >
                        {DEFAULT_ASSET_TYPES.map((type) => (
                          <option key={type.type} value={type.type}>
                            {type.type.charAt(0).toUpperCase() + type.type.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Asset Variant */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Variant
                      </label>
                      <select
                        value={assetVariant}
                        onChange={(e) => setAssetVariant(e.target.value as BrandAssetVariant)}
                        className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                      >
                        {currentAssetType?.variants.map((variant) => (
                          <option key={variant} value={variant}>
                            {variant.charAt(0).toUpperCase() + variant.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Usage Contexts */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Usage Contexts
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['social-media', 'website', 'email', 'print', 'advertising', 'presentation'].map((context) => (
                          <label key={context} className="flex items-center gap-2 text-sm text-gray-300">
                            <input
                              type="checkbox"
                              checked={usageContexts.includes(context as AssetUsageContext)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setUsageContexts([...usageContexts, context as AssetUsageContext]);
                                } else {
                                  setUsageContexts(usageContexts.filter(c => c !== context));
                                }
                              }}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            {context.replace('-', ' ')}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={assetTags}
                        onChange={(e) => setAssetTags(e.target.value)}
                        placeholder="e.g., logo, primary, dark-mode"
                        className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        value={assetDescription}
                        onChange={(e) => setAssetDescription(e.target.value)}
                        placeholder="Describe this asset..."
                        rows={3}
                        className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={isPrimary}
                          onChange={(e) => setIsPrimary(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        Set as primary asset for this type
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={requiresApproval}
                          onChange={(e) => setRequiresApproval(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        Requires approval before use
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Uploading */}
            {uploadStep === 'uploading' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Uploading Assets...</h3>
                <p className="text-gray-400">Processing {selectedFiles.length} file(s)</p>
              </div>
            )}

            {/* Step 4: Complete */}
            {uploadStep === 'complete' && (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="text-green-500 mb-4" size={64} />
                <h3 className="text-xl font-medium text-white mb-2">Upload Complete!</h3>
                <p className="text-gray-400 mb-4">{selectedFiles.length} asset(s) uploaded successfully</p>
                <p className="text-sm text-gray-400">This window will close automatically...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {uploadStep === 'configure' && (
            <div className="flex items-center justify-between p-6 border-t border-white/20">
              <button
                onClick={() => setUploadStep('select')}
                className="px-6 py-3 text-gray-300 hover:text-white transition-colors font-medium"
              >
                ← Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium"
                >
                  Upload {selectedFiles.length} Asset{selectedFiles.length === 1 ? '' : 's'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BrandAssetUpload;