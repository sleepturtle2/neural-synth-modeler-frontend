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
      console.log('[API] Starting upload:', { name: file.name, size: file.size, type: file.type });
      console.log('[API] Gzipping file...');
      const gzippedFile = await createGzippedFile(file);
      console.log('[API] Gzipped file created:', { name: gzippedFile.name, size: gzippedFile.size, type: gzippedFile.type });

      const url = `${API_BASE_URL}/v1/models/vital/infer`;
      const headers = { 'Content-Type': 'application/octet-stream' };
      console.log('[API] Sending POST request:', { url, headers });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: gzippedFile,
      });
      console.log('[API] Response status:', response.status, response.statusText);

      let responseBody;
      try {
        responseBody = await response.clone().json();
        console.log('[API] Response body:', responseBody);
      } catch (e) {
        responseBody = null;
        console.warn('[API] Could not parse response as JSON');
      }

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return responseBody;
    } catch (error) {
      console.error('[API] Error during file upload:', error, error instanceof Error ? error.stack : '');
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getStatus(requestId: string): Promise<StatusResponse> {
    const url = `${API_BASE_URL}/v1/infer-audio/status/${requestId}`;
    console.log('[API] Checking status:', url);
    const response = await fetch(url);
    console.log('[API] Status response:', response.status, response.statusText);
    let responseBody;
    try {
      responseBody = await response.clone().json();
      console.log('[API] Status response body:', responseBody);
    } catch (e) {
      responseBody = null;
      console.warn('[API] Could not parse status response as JSON');
    }
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }
    return responseBody;
  },

  async downloadPreset(requestId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/v1/infer-audio/download/${requestId}`;
    console.log('[API] Downloading preset:', url);
    const response = await fetch(url);
    console.log('[API] Download response:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    try {
      const blob = await response.clone().blob();
      console.log('[API] Downloaded blob size:', blob.size);
      return blob;
    } catch (e) {
      console.error('[API] Error reading blob:', e);
      throw e;
    }
  }
}; 