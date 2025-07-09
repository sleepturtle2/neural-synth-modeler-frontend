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
      setUploadState((prev: UploadState) => ({ ...prev, progress: 20 }));
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
    accept: { 'audio/wav': ['.wav'] },
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
    <div className="convert-bg">
      <div className="convert-center">
        <div className="convert-card">
          <h2 className="convert-title">Convert Audio</h2>
          <div className="convert-input-area" {...getRootProps()}>
            <input {...getInputProps()} />
            <span className="convert-placeholder">{getStatusMessage()}</span>
            {uploadState.status === 'uploading' && (
              <div className="convert-progress-bar">
                <div className="convert-progress-fill" style={{ width: `${uploadState.progress}%` }} />
              </div>
            )}
          </div>
          <button
            className="convert-action-btn"
            type="button"
            disabled={uploadState.status === 'uploading'}
            onClick={() => document.querySelector<HTMLInputElement>('.convert-input-area input')?.click()}
          >
            {uploadState.status === 'uploading' ? 'Uploading...' : 'Upload & Convert'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Convert; 