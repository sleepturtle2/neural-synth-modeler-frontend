import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../services/api';
import './Convert.css';

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage: string;
  requestId?: string;
}

const Convert: React.FC = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    errorMessage: ''
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.wav')) {
      setUploadState({
        status: 'error',
        progress: 0,
        errorMessage: 'Please upload a WAV file'
      });
      return;
    }

    setUploadState({
      status: 'uploading',
      progress: 0,
      errorMessage: ''
    });

    try {
      // Update progress for gzipping phase
      setUploadState((prev: UploadState) => ({
        ...prev,
        progress: 20
      }));

      // Make API call to backend (this will gzip the file internally)
      const response = await api.uploadAudio(file);
      
      setUploadState({
        status: 'success',
        progress: 100,
        errorMessage: '',
        requestId: response.request_id
      });
    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        errorMessage: error instanceof Error ? error.message : 'Failed to upload file. Please try again.'
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/wav': ['.wav']
    },
    multiple: false
  });

  const handleDownload = async () => {
    if (!uploadState.requestId) return;
    
    try {
      const blob = await api.downloadPreset(uploadState.requestId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preset_${uploadState.requestId}.vital`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setUploadState((prev: UploadState) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Failed to download preset'
      }));
    }
  };

  const getStatusMessage = () => {
    switch (uploadState.status) {
      case 'uploading':
        return 'Compressing and uploading your audio file...';
      case 'success':
        return 'Upload successful! Your preset is ready.';
      case 'error':
        return uploadState.errorMessage;
      default:
        return 'Drop your WAV file here or click to browse';
    }
  };

  return (
    <div className="convert">
      <div className="convert-container">
        <div className="upload-section">
          <h1 className="convert-title">Convert Audio to Preset</h1>
          <p className="convert-subtitle">
            Upload a WAV file to generate a Vital synthesizer preset (file will be compressed automatically)
          </p>
          
          <div 
            {...getRootProps()} 
            className={`upload-area ${isDragActive ? 'drag-active' : ''} ${uploadState.status}`}
          >
            <input {...getInputProps()} />
            <div className="upload-content">
              <div className="upload-icon">
                {uploadState.status === 'uploading' ? '⏳' : '📁'}
              </div>
              <p className="upload-text">{getStatusMessage()}</p>
              {uploadState.status === 'uploading' && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadState.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {uploadState.status === 'success' && (
            <div className="success-message">
              <p>✅ Your preset has been generated successfully!</p>
              <button className="download-button" onClick={handleDownload}>
                Download Preset
              </button>
            </div>
          )}

          {uploadState.status === 'error' && (
            <div className="error-message">
              <p>❌ {uploadState.errorMessage}</p>
              <button 
                className="retry-button"
                onClick={() => setUploadState({
                  status: 'idle',
                  progress: 0,
                  errorMessage: ''
                })}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Convert; 