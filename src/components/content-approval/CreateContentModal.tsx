import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Calendar, Users, Tag, AlertCircle, FileText, Image, Video, Music, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ContentFormData {
  title: string;
  content_type: 'social_post' | 'blog_article' | 'email' | 'ad_creative' | 'video' | 'infographic' | 'story';
  platform: string;
  content_body: string;
  media_urls: string[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  assignees: string[];
  workflow_id: string;
  campaign_id?: string;
  brand_guidelines?: string;
  target_audience?: string;
  call_to_action?: string;
  objectives: string[];
  metadata: Record<string, any>;
}

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContentFormData) => Promise<void>;
  availableWorkflows: Array<{ id: string; name: string; }>;
  availableUsers: Array<{ id: string; name: string; email: string; }>;
  availableCampaigns: Array<{ id: string; name: string; }>;
}

const contentTypeOptions = [
  { value: 'social_post', label: 'Social Media Post', icon: Users, platforms: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok'] },
  { value: 'blog_article', label: 'Blog Article', icon: FileText, platforms: ['Website', 'Medium', 'LinkedIn'] },
  { value: 'email', label: 'Email Campaign', icon: FileText, platforms: ['Mailchimp', 'Constant Contact', 'Campaign Monitor'] },
  { value: 'ad_creative', label: 'Ad Creative', icon: Image, platforms: ['Google Ads', 'Facebook Ads', 'Instagram Ads', 'LinkedIn Ads'] },
  { value: 'video', label: 'Video Content', icon: Video, platforms: ['YouTube', 'Instagram', 'TikTok', 'Facebook'] },
  { value: 'infographic', label: 'Infographic', icon: Image, platforms: ['Website', 'Social Media', 'Email'] },
  { value: 'story', label: 'Story Content', icon: Image, platforms: ['Instagram Stories', 'Facebook Stories', 'Snapchat'] }
];

const priorityOptions = [
  { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800', badge: 'bg-green-500' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800', badge: 'bg-yellow-500' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800', badge: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', badge: 'bg-red-500' }
];

export default function CreateContentModal({
  isOpen,
  onClose,
  onSubmit,
  availableWorkflows,
  availableUsers,
  availableCampaigns
}: CreateContentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    content_type: 'social_post',
    platform: '',
    content_body: '',
    media_urls: [],
    tags: [],
    priority: 'medium',
    deadline: '',
    assignees: [],
    workflow_id: '',
    campaign_id: '',
    brand_guidelines: '',
    target_audience: '',
    call_to_action: '',
    objectives: [],
    metadata: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [objectiveInput, setObjectiveInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const selectedContentType = contentTypeOptions.find(opt => opt.value === formData.content_type);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.content_type) newErrors.content_type = 'Content type is required';
      if (!formData.platform) newErrors.platform = 'Platform is required';
      if (!formData.workflow_id) newErrors.workflow_id = 'Workflow is required';
    }

    if (step === 2) {
      if (!formData.content_body.trim()) newErrors.content_body = 'Content body is required';
      if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: keyof ContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileSelect = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, media: 'File size must be less than 50MB' }));
        return;
      }

      const fileName = file.name;
      setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));

      // Simulate file upload with progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fileName] || 0;
          if (currentProgress >= 100) {
            clearInterval(interval);
            // Add to media URLs (in real app, this would be the uploaded URL)
            const mockUrl = URL.createObjectURL(file);
            setFormData(prev => ({
              ...prev,
              media_urls: [...prev.media_urls, mockUrl]
            }));
            return { ...prev, [fileName]: 100 };
          }
          return { ...prev, [fileName]: currentProgress + 10 };
        });
      }, 200);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    handleInputChange('tags', formData.tags.filter(t => t !== tag));
  };

  const addObjective = () => {
    if (objectiveInput.trim() && !formData.objectives.includes(objectiveInput.trim())) {
      handleInputChange('objectives', [...formData.objectives, objectiveInput.trim()]);
      setObjectiveInput('');
    }
  };

  const removeObjective = (objective: string) => {
    handleInputChange('objectives', formData.objectives.filter(o => o !== objective));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        title: '',
        content_type: 'social_post',
        platform: '',
        content_body: '',
        media_urls: [],
        tags: [],
        priority: 'medium',
        deadline: '',
        assignees: [],
        workflow_id: '',
        campaign_id: '',
        brand_guidelines: '',
        target_audience: '',
        call_to_action: '',
        objectives: [],
        metadata: {}
      });
      setCurrentStep(1);
    } catch (error) {
      setErrors({ submit: 'Failed to create content. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return Image;
    if (['mp4', 'webm', 'avi', 'mov'].includes(extension || '')) return Video;
    if (['mp3', 'wav', 'aac'].includes(extension || '')) return Music;
    return File;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter a descriptive title for your content"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Type *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {contentTypeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  handleInputChange('content_type', option.value);
                  handleInputChange('platform', ''); // Reset platform when type changes
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.content_type === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        {errors.content_type && <p className="mt-1 text-sm text-red-600">{errors.content_type}</p>}
      </div>

      {selectedContentType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform *
          </label>
          <select
            value={formData.platform}
            onChange={(e) => handleInputChange('platform', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.platform ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select platform</option>
            {selectedContentType.platforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
          {errors.platform && <p className="mt-1 text-sm text-red-600">{errors.platform}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Workflow *
        </label>
        <select
          value={formData.workflow_id}
          onChange={(e) => handleInputChange('workflow_id', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.workflow_id ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select workflow</option>
          {availableWorkflows.map(workflow => (
            <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
          ))}
        </select>
        {errors.workflow_id && <p className="mt-1 text-sm text-red-600">{errors.workflow_id}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign (Optional)
        </label>
        <select
          value={formData.campaign_id}
          onChange={(e) => handleInputChange('campaign_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select campaign</option>
          {availableCampaigns.map(campaign => (
            <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Body *
        </label>
        <textarea
          value={formData.content_body}
          onChange={(e) => handleInputChange('content_body', e.target.value)}
          rows={6}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            errors.content_body ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your content here..."
        />
        {errors.content_body && <p className="mt-1 text-sm text-red-600">{errors.content_body}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media Files
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Drag and drop files here, or</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            browse files
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Supports images, videos, and documents up to 50MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Upload Progress */}
        {Object.entries(uploadProgress).map(([fileName, progress]) => (
          <div key={fileName} className="mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{fileName}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ))}

        {/* Uploaded Files */}
        {formData.media_urls.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {formData.media_urls.map((url, index) => {
              const FileIcon = getFileIcon(url);
              return (
                <div key={index} className="relative group">
                  <div className="border rounded-lg p-3 bg-gray-50 flex items-center space-x-2">
                    <FileIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-xs truncate">File {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('media_urls', formData.media_urls.filter((_, i) => i !== index));
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {errors.media && <p className="mt-1 text-sm text-red-600">{errors.media}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deadline *
          </label>
          <input
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => handleInputChange('deadline', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.deadline ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignees
        </label>
        <select
          multiple
          value={formData.assignees}
          onChange={(e) => handleInputChange('assignees', Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          size={4}
        >
          {availableUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple users</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add tag..."
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience
        </label>
        <input
          type="text"
          value={formData.target_audience}
          onChange={(e) => handleInputChange('target_audience', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your target audience..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Call to Action
        </label>
        <input
          type="text"
          value={formData.call_to_action}
          onChange={(e) => handleInputChange('call_to_action', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="What action should users take?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Objectives
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={objectiveInput}
            onChange={(e) => setObjectiveInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add objective..."
          />
          <button
            type="button"
            onClick={addObjective}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {formData.objectives.map((objective, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm">{objective}</span>
              <button
                type="button"
                onClick={() => removeObjective(objective)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand Guidelines
        </label>
        <textarea
          value={formData.brand_guidelines}
          onChange={(e) => handleInputChange('brand_guidelines', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Any specific brand guidelines or requirements..."
        />
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block w-full max-w-4xl px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Content
                </h3>
                <p className="text-sm text-gray-500">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="mt-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Error Messages */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{loading ? 'Creating...' : 'Create Content'}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}