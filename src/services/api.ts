import { createGzippedFile } from '../utils/gzipUtils';

const API_BASE_URL = 'http://localhost:8080';

export interface UploadResponse {
  request_id: string;
  status: string;
  message?: string;
}

export interface StatusResponse {
  request_id: string;
  status: string;
}

export const api = {
  async uploadAudio(file: File): Promise<UploadResponse> {
    try {
      // Gzip the WAV file before uploading
      const gzippedFile = await createGzippedFile(file);
      
      const formData = new FormData();
      formData.append('file', gzippedFile);

      const response = await fetch(`${API_BASE_URL}/v1/models/vital/infer`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error during file upload:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getStatus(requestId: string): Promise<StatusResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/infer-audio/status/${requestId}`);
    
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    return response.json();
  },

  async downloadPreset(requestId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/v1/infer-audio/download/${requestId}`);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }
}; 