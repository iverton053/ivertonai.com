import React, { useState } from 'react';
import FileManager from './FileManager';
import FileUpload from './FileUpload';
import SharedLibrary from './SharedLibrary';
import AccessControl from './AccessControl';
import { useFileManagerStore } from '../../stores/fileManagerStore';

const FileManagerWithModals: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSharedLibrary, setShowSharedLibrary] = useState(false);
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [selectedFileForControl, setSelectedFileForControl] = useState<string | undefined>();

  // Override the FileManager component to add the upload modal trigger
  const FileManagerWrapper = () => {
    return (
      <div className="h-full">
        <div className="h-full" onClick={() => {
          // If user clicks upload button, show upload modal
          const uploadButtons = document.querySelectorAll('[data-action="upload"]');
          uploadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              setShowUploadModal(true);
            });
          });
        }}>
          <FileManager />
        </div>

        {/* Quick Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Upload Files"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload
          </button>

          <button
            onClick={() => setShowSharedLibrary(true)}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
            title="Shared Library"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </button>

          <button
            onClick={() => setShowAccessControl(true)}
            className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            title="Access Control"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Control
          </button>
        </div>
      </div>
    );
  };

  // Override upload buttons in FileManager to open modal
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [data-file-manager] button:has(svg):first-of-type {
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (showSharedLibrary) {
    return (
      <SharedLibrary 
        onClose={() => setShowSharedLibrary(false)}
      />
    );
  }

  if (showAccessControl) {
    return (
      <AccessControl 
        fileId={selectedFileForControl}
        onClose={() => setShowAccessControl(false)}
      />
    );
  }

  return (
    <>
      <FileManagerWrapper />
      
      {/* Upload Modal */}
      <FileUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </>
  );
};

export default FileManagerWithModals;