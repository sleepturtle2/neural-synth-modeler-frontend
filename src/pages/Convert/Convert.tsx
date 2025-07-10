import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../services/api';
import './Convert.css';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'downloading' | 'downloaded' | 'error';
  progress: number;
  errorMessage: string;
  requestId?: string;
}

const PixelLoader: React.FC = () => (
  <div className="pixel-loader" aria-label="Loading">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </div>
);

const Convert: React.FC = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    errorMessage: ''
  });

  const [downloaded, setDownloaded] = useState(false);
  const statusStreamUnsub = useRef<null | (() => void)>(null);

  // Subscribe to status stream when requestId is set
  useEffect(() => {
    if (uploadState.requestId) {
      // Set status to processing while waiting for updates
      setUploadState((prev) => ({ ...prev, status: 'processing' }));
      statusStreamUnsub.current = api.subscribeStatusStream(
        uploadState.requestId,
        (status, rawEvent) => {
          let errorMsg = '';
          try {
            if (rawEvent && rawEvent.data) {
              const data = typeof rawEvent.data === 'string' ? JSON.parse(rawEvent.data) : rawEvent.data;
              if (data.error) errorMsg = data.error;
            }
          } catch {}
          console.log('[SSE] Status update:', status, errorMsg ? `Error: ${errorMsg}` : '', rawEvent);
          if (status === 'DONE') {
            console.log('[SSE] Setting status to ready');
            setUploadState((prev) => ({ ...prev, status: 'ready' }));
          } else if (status === 'ERROR') {
            console.log('[SSE] Setting status to error');
            setUploadState((prev) => ({ ...prev, status: 'error', errorMessage: errorMsg || 'Inference failed or invalid preset.' }));
          } else if (status === 'PROCESSING' || status === 'PENDING') {
            console.log('[SSE] Setting status to processing');
            setUploadState((prev) => ({ ...prev, status: 'processing' }));
          }
        },
        (err) => {
          console.log('[SSE] Status stream error:', err);
          setUploadState((prev) => {
            // Only treat as error if we're still processing/uploading and haven't received DONE status
            if (prev.status === 'processing' || prev.status === 'uploading') {
              console.log('[SSE] Treating stream closure as error - still processing');
              return { ...prev, status: 'error', errorMessage: 'Lost connection to backend status stream.' };
            } else {
              console.log('[SSE] Stream closed normally after completion, ignoring error event');
              return prev;
            }
          });
        }
      );
    }
    return () => {
      if (statusStreamUnsub.current) {
        statusStreamUnsub.current();
        statusStreamUnsub.current = null;
      }
    };
  }, [uploadState.requestId]);

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
      // Remove setTimeout: status will be updated by SSE stream only
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
            {uploadState.status === 'processing' && <PixelLoader />}
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