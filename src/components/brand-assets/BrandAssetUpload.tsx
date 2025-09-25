import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  Clock,
  Zap
} from 'lucide-react';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';
import {
  BrandAssetType,
  BrandAssetVariant,
  BrandAssetFormat,
  AssetUsageContext,
  DEFAULT_ASSET_TYPES
} from '../../types/brandAssets';
import {
  generateThumbnail,
  compressFile,
  validateFileFormat,
  extractAssetMetadata,
  performanceMonitor,
  PERFORMANCE_CONFIG
} from '../../utils/asset-performance';

interface BrandAssetUploadProps {
  isOpen?: boolean;
  onClose?: () => void;
  clientId?: string;
  preSelectedType?: BrandAssetType;
}

const BrandAssetUpload: React.FC<BrandAssetUploadProps> = ({
  isOpen = true,
  onClose,
  clientId = 'default-client',
  preSelectedType
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStep, setUploadStep] = useState<'select' | 'configure' | 'uploading' | 'complete'>('select');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [completedUploads, setCompletedUploads] = useState<string[]>([]);
  
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
    setError,
    uploadFileToSupabase,
    getSupabaseStatus
  } = useBrandAssetsStore();

  const getFileIcon = useCallback((file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const type = file.type;

    // Extended file type detection
    if (['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg', 'tiff', 'bmp', 'ico'].includes(extension) || type.startsWith('image/')) {
      return <Image className="text-green-500" size={20} />;
    }
    if (['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(extension) || type.startsWith('video/')) {
      return <Film className="text-purple-500" size={20} />;
    }
    if (['mp3', 'wav', 'ogg', 'flac'].includes(extension) || type.startsWith('audio/')) {
      return <Music className="text-blue-500" size={20} />;
    }
    if (['pdf', 'docx', 'xlsx', 'pptx', 'txt'].includes(extension)) {
      return <FileText className="text-red-500" size={20} />;
    }
    if (['zip', 'rar', '7z', 'tar'].includes(extension)) {
      return <Archive className="text-orange-500" size={20} />;
    }
    if (['psd', 'ai', 'sketch', 'figma', 'xd'].includes(extension)) {
      return <Palette className="text-purple-400" size={20} />;
    }
    if (['otf', 'ttf', 'woff', 'woff2'].includes(extension)) {
      return <Type className="text-orange-400" size={20} />;
    }
    return <File className="text-slate-500" size={20} />;
  }, []);

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
    setUploadProgress({});
    setUploadErrors({});
    setCompletedUploads([]);
    setError('');

    // Check if Supabase is configured
    const supabaseStatus = getSupabaseStatus();
    const useSupabase = supabaseStatus.initialized && !supabaseStatus.error;

    try {
      const tags = assetTags.split(',').map(tag => tag.trim()).filter(Boolean);

      // Process files concurrently but with controlled concurrency
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileId = `${file.name}_${index}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        try {
          const fileExtension = file.name.split('.').pop()?.toLowerCase() as BrandAssetFormat;

          // Create base asset data
          const baseAssetData = {
            clientId,
            name: file.name,
            description: assetDescription,
            type: assetType,
            variant: assetVariant,
            format: fileExtension,
            fileSize: file.size,
            tags: [...tags, ...settings.defaultTags],
            isPrimary,
            versionNumber: 1,
            isApproved: !requiresApproval || settings.autoApproval,
            guidelinesCompliant: true,
            uploadedBy: 'current_user', // TODO: Get from auth context
            isPublic: false,
            allowedUsers: [],
            allowedContexts: usageContexts,
          };

          // Validate compliance
          const tempAsset = {
            ...baseAssetData,
            id: 'temp',
            url: '',
            uploadedAt: new Date(),
            updatedAt: new Date(),
            usageHistory: [],
            totalDownloads: 0
          };
          const complianceCheck = checkCompliance(tempAsset);

          if (!complianceCheck.isCompliant && settings.requireGuidelines) {
            throw new Error(`Compliance check failed: ${complianceCheck.issues.join(', ')}`);
          }

          if (useSupabase) {
            // Use Supabase for real file upload
            setUploadProgress(prev => ({ ...prev, [fileId]: 10 })); // Starting upload

            const uploadedAsset = await uploadFileToSupabase(file, baseAssetData);

            if (!uploadedAsset) {
              throw new Error('Supabase upload failed');
            }

            setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
            setCompletedUploads(prev => [...prev, fileId]);

            return uploadedAsset;
          } else {
            // Fallback to mock upload with progress simulation
            const assetData = {
              ...baseAssetData,
              url: URL.createObjectURL(file),
              thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            };

            // Simulate upload progress
            for (let progress = 10; progress <= 100; progress += 20) {
              setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
              await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
            }

            addAsset(assetData);
            setCompletedUploads(prev => [...prev, fileId]);

            return assetData;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          setUploadErrors(prev => ({ ...prev, [fileId]: errorMessage }));
          setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
          throw error;
        }
      });

      // Wait for all uploads to complete (or fail)
      const results = await Promise.allSettled(uploadPromises);

      // Check if any uploads succeeded
      const successfulUploads = results.filter(result => result.status === 'fulfilled').length;
      const failedUploads = results.filter(result => result.status === 'rejected').length;

      if (successfulUploads > 0) {
        setUploadStep('complete');

        // Auto close after delay if all uploads succeeded
        if (failedUploads === 0) {
          setTimeout(() => {
            resetForm();
            onClose?.();
          }, 2000);
        }
      } else {
        // All uploads failed, go back to configure step
        setUploadStep('configure');
        setError('All uploads failed. Please check your files and try again.');
      }

    } catch (error) {
      console.error('Upload process failed:', error);
      setError('Upload process failed. Please try again.');
      setUploadStep('configure');
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setUploadStep('select');
    setUploadProgress({});
    setUploadErrors({});
    setCompletedUploads([]);
    setAssetType(preSelectedType || 'logo');
    setAssetVariant('primary');
    setAssetTags('');
    setAssetDescription('');
    setUsageContexts(['social-media']);
    setIsPrimary(false);
    setRequiresApproval(true);
    setError('');
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
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-medium text-white mb-2">Uploading Assets</h3>
                  <p className="text-gray-400">Processing {selectedFiles.length} file(s)</p>
                </div>

                <div className="space-y-3">
                  {selectedFiles.map((file, index) => {
                    const fileId = `${file.name}_${index}`;
                    const progress = uploadProgress[fileId] || 0;
                    const error = uploadErrors[fileId];
                    const isCompleted = completedUploads.includes(fileId);

                    return (
                      <div key={fileId} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-lg">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white truncate">{file.name}</div>
                            <div className="text-sm text-gray-400">{formatFileSize(file.size)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {error ? (
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : progress > 0 ? (
                              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-white min-w-[3rem] text-right">
                              {error ? 'Error' : `${progress}%`}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              error
                                ? 'bg-red-500'
                                : isCompleted
                                ? 'bg-green-500'
                                : progress > 0
                                ? 'bg-purple-500'
                                : 'bg-gray-600'
                            }`}
                            style={{ width: error ? '100%' : `${progress}%` }}
                          />
                        </div>

                        {/* Error Message */}
                        {error && (
                          <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded p-2">
                            {error}
                          </div>
                        )}

                        {/* Success Message */}
                        {isCompleted && !error && (
                          <div className="text-sm text-green-400">
                            ✓ Upload completed successfully
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Overall Progress */}
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">
                    {completedUploads.length} of {selectedFiles.length} files completed
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${(completedUploads.length / selectedFiles.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {uploadStep === 'complete' && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
                  <h3 className="text-xl font-medium text-white mb-2">Upload Complete!</h3>
                </div>

                {/* Upload Summary */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-white mb-4">Upload Summary</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-300 font-medium">Successful</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{completedUploads.length}</div>
                      <div className="text-sm text-gray-400">files uploaded</div>
                    </div>

                    {Object.keys(uploadErrors).length > 0 && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-300 font-medium">Failed</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{Object.keys(uploadErrors).length}</div>
                        <div className="text-sm text-gray-400">files failed</div>
                      </div>
                    )}
                  </div>

                  {/* Failed Files Details */}
                  {Object.keys(uploadErrors).length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Failed Uploads:</h5>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {Object.entries(uploadErrors).map(([fileId, error]) => {
                          const fileName = fileId.split('_').slice(0, -1).join('_');
                          return (
                            <div key={fileId} className="text-sm bg-red-900/10 border border-red-500/20 rounded p-2">
                              <div className="font-medium text-red-300">{fileName}</div>
                              <div className="text-red-400">{error}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto-close message */}
                {Object.keys(uploadErrors).length === 0 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-400">This window will close automatically in 2 seconds...</p>
                  </div>
                )}

                {/* Retry option for failed uploads */}
                {Object.keys(uploadErrors).length > 0 && (
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        // Reset only failed files for retry
                        const failedFiles = selectedFiles.filter((file, index) => {
                          const fileId = `${file.name}_${index}`;
                          return uploadErrors[fileId];
                        });
                        setSelectedFiles(failedFiles);
                        setUploadStep('configure');
                        setUploadProgress({});
                        setUploadErrors({});
                        setCompletedUploads([]);
                      }}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white font-medium"
                    >
                      Retry Failed Uploads
                    </button>
                    <button
                      onClick={() => {
                        resetForm();
                        onClose?.();
                      }}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-white font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
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