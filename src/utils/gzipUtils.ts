// Utility function to gzip WAV files
export const gzipFile = async (file: File): Promise<Blob> => {
  // Check if the file is a WAV file
  if (!file.name.toLowerCase().endsWith('.wav')) {
    throw new Error('File must be in WAV format');
  }

  // Read the file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Convert to Uint8Array for compression
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Use the CompressionStream API if available (modern browsers)
  if ('CompressionStream' in window) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(uint8Array);
        controller.close();
      }
    });

    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const chunks: Uint8Array[] = [];
    
    const reader = compressedStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine all chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return new Blob([result], { type: 'application/gzip' });
  } else {
    // Fallback for older browsers - use a simple compression library
    // For now, we'll return the original file if CompressionStream is not available
    console.warn('CompressionStream not available, sending uncompressed file');
    return file;
  }
};

// Utility function to create a gzipped file with proper naming
export const createGzippedFile = async (file: File): Promise<File> => {
  const gzippedBlob = await gzipFile(file);
  
  // Create a new file with .wav.gz extension
  const gzippedFileName = file.name + '.gz';
  
  return new File([gzippedBlob], gzippedFileName, {
    type: 'application/gzip',
    lastModified: Date.now()
  });
}; 