import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Share2,
  Edit,
  MoreVertical,
  Trash2,
  Star,
  Copy,
  ExternalLink,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Heart,
  History
} from 'lucide-react';
import { FileItem } from '../../types/fileManagement';
import { useFileManagerStore } from '../../stores/fileManagerStore';

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showActions, setShowActions] = useState(false);

  const {
    favoriteFiles,
    addToFavorites,
    removeFromFavorites,
    downloadFile,
    deleteFile
  } = useFileManagerStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrevious && onPrevious) onPrevious();
          break;
        case 'ArrowRight':
          if (hasNext && onNext) onNext();
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(prev + 25, 500));
          break;
        case '-':
          setZoom(prev => Math.max(prev - 25, 25));
          break;
        case '0':
          setZoom(100);
          setRotation(0);
          break;
        case 'r':
          setRotation(prev => (prev + 90) % 360);
          break;
        case ' ':
          e.preventDefault();
          if (file?.type === 'video' || file?.type === 'audio') {
            setIsPlaying(prev => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, file, hasNext, hasPrevious, onNext, onPrevious, onClose]);

  if (!isOpen || !file) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFavoriteToggle = () => {
    if (favoriteFiles.includes(file.id)) {
      removeFromFavorites(file.id);
    } else {
      addToFavorites(file.id);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile(file.id);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(file.id);
        onClose();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const renderPreview = () => {
    switch (file.type) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full overflow-hidden">
            <img
              src={file.url || file.thumbnailUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                cursor: zoom > 100 ? 'grab' : 'default'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              src={file.url}
              className="max-w-full max-h-full"
              controls
              autoPlay={isPlaying}
              muted={isMuted}
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
              onDurationChange={(e) => setDuration((e.target as HTMLVideoElement).duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="w-64 h-64 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-full flex items-center justify-center border border-white/20">
              <div className="text-6xl">🎵</div>
            </div>

            <div className="w-full max-w-md space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
                <p className="text-gray-300">{formatDuration(currentTime)} / {formatDuration(duration)}</p>
              </div>

              <audio
                src={file.url}
                className="w-full"
                controls
                autoPlay={isPlaying}
                muted={isMuted}
                onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
                onDurationChange={(e) => setDuration((e.target as HTMLAudioElement).duration)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-full">
            <iframe
              src={`${file.url}#view=FitH`}
              className="w-full h-full border-0"
              title={file.name}
            />
          </div>
        );

      case 'document':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl flex items-center justify-center border border-white/20">
              <div className="text-6xl">📄</div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
              <p className="text-gray-300 mb-4">Document Preview</p>
              <button
                onClick={() => window.open(file.url, '_blank')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                <ExternalLink size={20} />
                Open in New Tab
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-600/20 to-slate-600/20 rounded-xl flex items-center justify-center border border-white/20">
              <div className="text-6xl">📎</div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
              <p className="text-gray-300 mb-2">
                {file.mimeType} • {formatFileSize(file.size)}
              </p>
              <p className="text-gray-400 mb-4">Preview not available for this file type</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  <Download size={20} />
                  Download
                </button>
                <button
                  onClick={() => window.open(file.url, '_blank')}
                  className="flex items-center gap-2 px-6 py-3 glass-effect border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <ExternalLink size={20} />
                  Open
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Header */}
        <motion.div
          className="glass-effect border-b border-white/20 p-4 flex items-center justify-between"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {hasPrevious && (
                <button
                  onClick={onPrevious}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {hasNext && (
                <button
                  onClick={onNext}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white truncate max-w-md">
                {file.name}
              </h2>
              <p className="text-sm text-gray-300">
                {formatFileSize(file.size)} • {formatDate(file.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Image Controls */}
            {file.type === 'image' && (
              <>
                <div className="flex items-center space-x-1 mr-4">
                  <button
                    onClick={() => setZoom(prev => Math.max(prev - 25, 25))}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                    disabled={zoom <= 25}
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-sm text-gray-300 min-w-12 text-center">
                    {zoom}%
                  </span>
                  <button
                    onClick={() => setZoom(prev => Math.min(prev + 25, 500))}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                    disabled={zoom >= 500}
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                  >
                    <RotateCw size={16} />
                  </button>
                </div>
              </>
            )}

            <button
              onClick={handleFavoriteToggle}
              className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
                favoriteFiles.includes(file.id) ? 'text-yellow-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Star size={20} fill={favoriteFiles.includes(file.id) ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <Download size={20} />
            </button>

            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white relative"
            >
              <MoreVertical size={20} />

              {showActions && (
                <motion.div
                  className="absolute top-full right-0 mt-2 w-48 glass-effect border border-white/20 rounded-xl shadow-2xl z-10"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Share2 size={16} />
                      Share
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Copy size={16} />
                      Copy Link
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Edit size={16} />
                      Rename
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <History size={16} />
                      Version History
                    </button>
                    <div className="border-t border-white/10 my-1"></div>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>

        {/* Preview Content */}
        <motion.div
          className="flex-1 overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {renderPreview()}
        </motion.div>

        {/* Keyboard Shortcuts Help */}
        <motion.div
          className="absolute bottom-4 left-4 glass-effect border border-white/20 rounded-lg p-3 text-xs text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="space-y-1">
            <div><kbd className="bg-white/20 px-1 rounded">←→</kbd> Navigate</div>
            <div><kbd className="bg-white/20 px-1 rounded">Esc</kbd> Close</div>
            {file.type === 'image' && (
              <>
                <div><kbd className="bg-white/20 px-1 rounded">±</kbd> Zoom</div>
                <div><kbd className="bg-white/20 px-1 rounded">R</kbd> Rotate</div>
              </>
            )}
            {(file.type === 'video' || file.type === 'audio') && (
              <div><kbd className="bg-white/20 px-1 rounded">Space</kbd> Play/Pause</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FilePreviewModal;