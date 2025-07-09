import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../services/api';
import './Convert.css';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'downloading' | 'downloaded' | 'error';
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

  const [downloaded, setDownloaded] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
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
    setDownloaded(false);
    try {
      setUploadState((prev: UploadState) => ({ ...prev, progress: 20 }));
      const response = await api.uploadAudio(file);
      setUploadState({
        status: 'processing',
        progress: 100,
        errorMessage: '',
        requestId: response.request_id
      });
      // Simulate processing/loading state (replace with real polling if needed)
      setTimeout(() => {
        setUploadState((prev) => ({ ...prev, status: 'ready' }));
      }, 1200);
    } catch (error) {
      console.error('Upload error details:', error);
      let errorMessage = 'Upload failed: Unknown error';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Upload complete, but cannot connect to server to process file.';
        } else {
          errorMessage = error.message;
        }
      }
      setUploadState({
        status: 'error',
        progress: 0,
        errorMessage
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/wav': ['.wav'] },
    multiple: false
  });

  const handleDownload = async () => {
    if (!uploadState.requestId) return;
    setUploadState((prev) => ({ ...prev, status: 'downloading' }));
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
      setUploadState((prev) => ({ ...prev, status: 'downloaded' }));
      setDownloaded(true);
    } catch (error) {
      setUploadState((prev: UploadState) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Failed to download preset'
      }));
    }
  };

  const handleConvertAgain = () => {
    setUploadState({
      status: 'idle',
      progress: 0,
      errorMessage: ''
    });
    setDownloaded(false);
  };

  const getStatusMessage = () => {
    switch (uploadState.status) {
      case 'uploading':
        return 'Compressing and uploading your audio file...';
      case 'processing':
        return 'Processing your file...';
      case 'ready':
        return 'Upload successful! Your preset is ready.';
      case 'downloading':
        return 'Downloading your preset...';
      case 'downloaded':
        return 'Download complete!';
      case 'error':
        return uploadState.errorMessage;
      default:
        return 'Drop your WAV file here or click to browse';
    }
  };

  const isUploadingOrProcessing = uploadState.status === 'uploading' || uploadState.status === 'processing';
  const showUploadButton = uploadState.status === 'idle' || uploadState.status === 'error' || (uploadState.status === 'downloaded' && downloaded);
  const uploadButtonText = isUploadingOrProcessing ? 'Uploading...' : 'Upload & Convert';

  return (
    <div className="convert-bg">
      <div className="convert-center">
        <div className="convert-card">
          <h2 className="convert-title">Convert Audio</h2>
          <div className="convert-input-area" {...getRootProps()}>
            <input {...getInputProps()} />
            <span className="convert-placeholder">{getStatusMessage()}</span>
            {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
              <div className="convert-progress-bar">
                <div className="convert-progress-fill" style={{ width: `${uploadState.progress}%` }} />
              </div>
            )}
          </div>
          {uploadState.status === 'ready' && !downloaded && (
            <button
              className="convert-action-btn"
              type="button"
              onClick={handleDownload}
            >
              Download Preset
            </button>
          )}
          {uploadState.status === 'downloading' && (
            <button
              className="convert-action-btn"
              type="button"
              disabled
            >
              Downloading...
            </button>
          )}
          {showUploadButton && (
            <button
              className="convert-action-btn"
              type="button"
              disabled={isUploadingOrProcessing}
              onClick={() => document.querySelector<HTMLInputElement>('.convert-input-area input')?.click()}
            >
              {uploadButtonText}
            </button>
          )}
          {uploadState.status === 'downloaded' && downloaded && (
            <div style={{ marginTop: 12 }}>
              <button
                className="convert-again-link"
                type="button"
                onClick={handleConvertAgain}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#bfaec2',
                  textDecoration: 'underline',
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Convert again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Convert; 