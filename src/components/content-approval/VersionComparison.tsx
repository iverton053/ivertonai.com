import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, Download, Clock, User, MessageSquare } from 'lucide-react';
import { ContentVersion, ContentItem } from '../../types/contentApproval';
import { useContentApprovalStore } from '../../stores/contentApprovalStore';

interface VersionComparisonProps {
  contentId: string;
  onClose: () => void;
}

const VersionComparison: React.FC<VersionComparisonProps> = ({ contentId, onClose }) => {
  const { contentItems } = useContentApprovalStore();
  const content = contentItems.find(item => item.id === contentId);
  
  const [selectedVersions, setSelectedVersions] = useState<{
    left: ContentVersion | null;
    right: ContentVersion | null;
  }>({
    left: content?.versions[content.versions.length - 2] || null,
    right: content?.versions[content.versions.length - 1] || null
  });

  if (!content || content.versions.length < 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-4">No Versions to Compare</h3>
          <p className="text-gray-400 mb-4">
            This content needs at least 2 versions to enable comparison.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const VersionSelector = ({ 
    position, 
    version, 
    onSelect 
  }: { 
    position: 'left' | 'right';
    version: ContentVersion | null;
    onSelect: (version: ContentVersion) => void;
  }) => (
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">
          {position === 'left' ? 'Compare From' : 'Compare To'}
        </h4>
        <div className="flex items-center space-x-2">
          <select
            value={version?.id || ''}
            onChange={(e) => {
              const selected = content.versions.find(v => v.id === e.target.value);
              if (selected) onSelect(selected);
            }}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {content.versions.map((v, index) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber} ({formatDate(v.createdAt)})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {version && (
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{version.createdBy}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{formatDate(version.createdAt)}</span>
          </div>
          {version.changeLog && (
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 mt-0.5" />
              <span className="text-xs">{version.changeLog}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const ContentPreview = ({ version }: { version: ContentVersion | null }) => {
    if (!version) return <div className="p-8 text-center text-gray-400">Select a version</div>;

    return (
      <div className="p-4 h-full overflow-auto">
        {version.content.type === 'image' && (
          <div className="space-y-4">
            <img
              src={version.content.url}
              alt={version.content.caption || 'Content preview'}
              className="w-full h-auto rounded-lg border"
            />
            {version.content.caption && (
              <div className="text-sm text-gray-400">
                <strong>Caption:</strong> {version.content.caption}
              </div>
            )}
            {version.content.hashtags && version.content.hashtags.length > 0 && (
              <div className="text-sm">
                <strong>Hashtags:</strong>{' '}
                <span className="text-blue-600">
                  {version.content.hashtags.join(' ')}
                </span>
              </div>
            )}
          </div>
        )}

        {version.content.type === 'video' && (
          <div className="space-y-4">
            <video
              src={version.content.url}
              controls
              className="w-full h-auto rounded-lg border"
            >
              Your browser does not support the video tag.
            </video>
            {version.content.caption && (
              <div className="text-sm text-gray-400">
                <strong>Caption:</strong> {version.content.caption}
              </div>
            )}
          </div>
        )}

        {version.content.type === 'text' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="whitespace-pre-wrap text-sm">
                {version.content.text}
              </div>
            </div>
            {version.content.hashtags && version.content.hashtags.length > 0 && (
              <div className="text-sm">
                <strong>Hashtags:</strong>{' '}
                <span className="text-blue-600">
                  {version.content.hashtags.join(' ')}
                </span>
              </div>
            )}
          </div>
        )}

        {version.content.type === 'carousel' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {version.content.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-auto rounded border"
                />
              ))}
            </div>
            {version.content.caption && (
              <div className="text-sm text-gray-400">
                <strong>Caption:</strong> {version.content.caption}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
            <div>
              <strong>File Size:</strong> {version.metadata.fileSize || 'N/A'}
            </div>
            <div>
              <strong>Dimensions:</strong> {version.metadata.dimensions || 'N/A'}
            </div>
            <div>
              <strong>Format:</strong> {version.metadata.format || 'N/A'}
            </div>
            <div>
              <strong>Duration:</strong> {version.metadata.duration || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Version Comparison</h2>
            <p className="text-sm text-gray-400 mt-1">{content.title}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (selectedVersions.right) {
                  const link = document.createElement('a');
                  link.href = selectedVersions.right.content.url;
                  link.download = `${content.title}_v${selectedVersions.right.versionNumber}`;
                  link.click();
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              <Download className="w-4 h-4" />
              <span>Download Current</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-400"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Version */}
          <div className="flex-1 border-r border-gray-700 flex flex-col">
            <VersionSelector
              position="left"
              version={selectedVersions.left}
              onSelect={(version) => setSelectedVersions(prev => ({ ...prev, left: version }))}
            />
            <div className="flex-1 overflow-hidden">
              <ContentPreview version={selectedVersions.left} />
            </div>
          </div>

          {/* Right Version */}
          <div className="flex-1 flex flex-col">
            <VersionSelector
              position="right"
              version={selectedVersions.right}
              onSelect={(version) => setSelectedVersions(prev => ({ ...prev, right: version }))}
            />
            <div className="flex-1 overflow-hidden">
              <ContentPreview version={selectedVersions.right} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Comparing{' '}
              {selectedVersions.left && selectedVersions.right && (
                <>
                  v{selectedVersions.left.versionNumber} → v{selectedVersions.right.versionNumber}
                </>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  // Quick swap versions
                  setSelectedVersions(prev => ({
                    left: prev.right,
                    right: prev.left
                  }));
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
                <span>Swap</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VersionComparison;