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

export interface HealthResponse {
  ready: boolean;
  details?: {
    mysql?: string;
    mongo?: string;
    bentoml?: string;
  };
}

export const api = {
  async checkHealth(): Promise<HealthResponse> {
    try {
      console.log('[API] Checking backend health...');
      const url = `${API_BASE_URL}/v1/health/ready`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      
      const healthData = await response.json();
      console.log('[API] Health check response:', healthData);
      return healthData;
    } catch (error) {
      console.error('[API] Health check error:', error);
      // If the health endpoint itself is unreachable, return only ready: false (no details)
      return {
        ready: false
      };
    }
  },

  async uploadAudio(file: File): Promise<UploadResponse> {
    try {
      console.log('[API] Starting upload:', { name: file.name, size: file.size, type: file.type });
      
      let fileToUpload: File;
      let isCompressed = false;
      
      // Try to gzip the file first
      try {
        console.log('[API] Attempting to gzip file...');
        const gzippedFile = await createGzippedFile(file);
        console.log('[API] Gzipped file created:', { name: gzippedFile.name, size: gzippedFile.size, type: gzippedFile.type });
        fileToUpload = gzippedFile;
        isCompressed = true;
      } catch (gzipError) {
        console.warn('[API] Gzipping failed, using uncompressed file:', gzipError);
        fileToUpload = file;
        isCompressed = false;
      }

      const url = `${API_BASE_URL}/v1/models/vital/infer`;
      const headers = { 'Content-Type': 'application/octet-stream' };
      console.log('[API] Sending POST request:', { 
        url, 
        headers, 
        isCompressed, 
        fileSize: fileToUpload.size 
      });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: fileToUpload,
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
  },

  subscribeStatusStream(requestId: string, onStatus: (status: string, rawEvent: MessageEvent) => void, onError?: (err: any) => void) {
    const url = `${API_BASE_URL}/v1/infer-audio/stream-status/${requestId}`;
    const eventSource = new EventSource(url);
    
    // Handle custom event type 'status_update'
    eventSource.addEventListener('status_update', (event) => {
      console.log('[API] Received SSE status_update event:', event.data);
      let status = undefined;
      try {
        const data = JSON.parse(event.data);
        if (data.status) {
          status = data.status;
        }
      } catch (e) {
        console.warn('[API] Could not parse SSE event data:', event.data);
      }
      if (status) {
        console.log('[API] Parsed status from SSE:', status);
        onStatus(status, event);
      } else {
        // Always call onStatus with raw event so frontend can try to parse error
        console.warn('[API] No status found in SSE event, treating as ERROR');
        onStatus('ERROR', event);
      }
    });
    
    // Also handle default message events as fallback
    eventSource.onmessage = (event) => {
      console.log('[API] Received SSE default message event:', event.data);
      let status = undefined;
      try {
        const data = JSON.parse(event.data);
        if (data.status) {
          status = data.status;
        }
      } catch (e) {
        console.warn('[API] Could not parse SSE event data:', event.data);
      }
      if (status) {
        console.log('[API] Parsed status from default SSE event:', status);
        onStatus(status, event);
      } else {
        // Always call onStatus with raw event so frontend can try to parse error
        console.warn('[API] No status found in default SSE event, treating as ERROR');
        onStatus('ERROR', event);
      }
    };
    
    eventSource.onerror = (err) => {
      console.error('[API] SSE stream error:', err);
      if (onError) onError(err);
      eventSource.close();
    };
    return () => eventSource.close();
  }
}; 