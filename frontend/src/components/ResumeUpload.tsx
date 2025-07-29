import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface ResumeUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      simulateUpload(file);
    } else {
      showNotification('Please select a PDF file', 'error');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      simulateUpload(file);
    } else {
      showNotification('Please select a PDF file', 'error');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const simulateUpload = (file: File) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onFileSelect(file);
          showNotification('Resume uploaded successfully!', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate-slide-up`;
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        ${type === 'success' ? '<div class="w-5 h-5 text-neon-green"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>' : '<div class="w-5 h-5 text-neon-pink"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></div>'}
        <span class="text-white">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const removeFile = () => {
    onFileSelect(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {!selectedFile ? (
        <div
          className={`relative group cursor-pointer transition-all duration-500 ${
            isDragOver ? 'scale-105' : 'hover:scale-102'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className={`
            relative overflow-hidden rounded-2xl p-8 border-2 border-dashed transition-all duration-300
            ${isDragOver 
              ? 'border-neon-pink bg-neon-pink/10 shadow-neon' 
              : 'border-white/20 hover:border-neon-blue hover:bg-neon-blue/5'
            }
            glass-card
          `}>
            <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 via-neon-blue/5 to-neon-green/5 animate-pulse-slow" />
            <div className="absolute inset-0 shimmer" />
            <div className="relative z-10 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-blue rounded-full blur-xl opacity-50 animate-pulse-slow" />
                <div className="relative bg-glass-white backdrop-blur-xl rounded-full p-6 border border-white/20">
                  <Upload className="w-12 h-12 text-neon-pink mx-auto animate-bounce-slow" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 gradient-text">
                Upload your resume
              </h3>
              
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Drag and drop your PDF resume here, or click to browse
              </p>
              
              <button
                type="button"
                className="btn-gradient group relative overflow-hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>Choose File</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-green opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            <div className="absolute top-4 right-4 w-2 h-2 bg-neon-pink rounded-full animate-pulse" />
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-6 w-1 h-1 bg-neon-green rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-green rounded-full blur-md animate-pulse" />
                <div className="relative bg-glass-white backdrop-blur-xl rounded-full p-3 border border-white/20">
                  <CheckCircle className="w-8 h-8 text-neon-green" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="mt-2">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-neon-pink transition-colors duration-300 p-2 rounded-full hover:bg-glass-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ResumeUpload; 