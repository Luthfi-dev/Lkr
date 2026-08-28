/**
 * Image and Media Optimization Utility for Lingkar
 * Handles client-side canvas compression, resolution downsampling, WebP/JPEG conversion,
 * and persistent storage into /uploads directory.
 */

export interface OptimizedImageResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  compressionRatio: number;
}

export interface UploadResult {
  url: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'sheet' | 'slide' | 'zip' | 'link';
  size: string;
  originalSize?: string;
  compressedSize?: string;
  dimensions?: { width: number; height: number };
}

/**
 * Compresses an image file using HTML5 Canvas to WebP or JPEG.
 * Automatically resizes image dimensions so that maximum width/height does not exceed maxWidth/maxHeight.
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    targetFormat?: 'image/webp' | 'image/jpeg';
  } = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.82,
    targetFormat = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Berkas yang diberikan bukan berkas gambar.'));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Free object URL from browser memory immediately
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Calculate aspect ratio downscaling
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      // Create offscreen canvas for rendering & compression
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Gagal menginisialisasi canvas context.'));
      }

      // High quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Check if browser supports WebP canvas export
      let outputMimeType = targetFormat;
      try {
        const testData = canvas.toDataURL('image/webp');
        if (!testData.startsWith('data:image/webp')) {
          outputMimeType = 'image/jpeg';
        }
      } catch {
        outputMimeType = 'image/jpeg';
      }

      const dataUrl = canvas.toDataURL(outputMimeType, quality);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Gagal mengompresi gambar ke blob.'));
          }

          const fileExtension = outputMimeType === 'image/webp' ? 'webp' : 'jpg';
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${cleanName}_opt.${fileExtension}`;

          const optimizedFile = new File([blob], newFileName, {
            type: outputMimeType,
            lastModified: Date.now(),
          });

          const originalSize = file.size;
          const compressedSize = blob.size;
          const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

          resolve({
            file: optimizedFile,
            blob,
            dataUrl,
            originalSize,
            compressedSize,
            width,
            height,
            compressionRatio: Math.max(0, compressionRatio),
          });
        },
        outputMimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memuat gambar untuk dioptimasi.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads media to server `/api/upload` endpoint and saves it into `/uploads` directory.
 * If file is an image, it is automatically compressed first to save bandwidth and storage.
 */
export async function uploadMediaFile(file: File): Promise<UploadResult> {
  const isImage = file.type.startsWith('image/');
  let uploadPayload: {
    filename: string;
    mimeType: string;
    dataBase64: string;
    originalSize: number;
    compressedSize?: number;
    width?: number;
    height?: number;
  };

  let formattedType: UploadResult['type'] = 'doc';
  if (isImage) formattedType = 'image';
  else if (file.type.includes('pdf') || file.name.endsWith('.pdf')) formattedType = 'pdf';
  else if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) formattedType = 'sheet';
  else if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) formattedType = 'slide';
  else if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) formattedType = 'zip';

  let dimensions: { width: number; height: number } | undefined;
  let compressedSizeNumber = file.size;

  if (isImage) {
    try {
      const optimized = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
      });

      dimensions = { width: optimized.width, height: optimized.height };
      compressedSizeNumber = optimized.compressedSize;

      uploadPayload = {
        filename: optimized.file.name,
        mimeType: optimized.file.type,
        dataBase64: optimized.dataUrl,
        originalSize: file.size,
        compressedSize: optimized.compressedSize,
        width: optimized.width,
        height: optimized.height,
      };
    } catch {
      // Fallback: read directly as data URL if canvas fails
      const dataUrl = await fileToDataUrl(file);
      uploadPayload = {
        filename: file.name,
        mimeType: file.type,
        dataBase64: dataUrl,
        originalSize: file.size,
        compressedSize: file.size,
      };
    }
  } else {
    const dataUrl = await fileToDataUrl(file);
    uploadPayload = {
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      dataBase64: dataUrl,
      originalSize: file.size,
      compressedSize: file.size,
    };
  }

  // Send to backend /api/upload
  let response;
  try {
    response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadPayload),
    });
  } catch (err) {
    throw new Error('Gagal menghubungi server untuk mengunggah media.');
  }

  if (response.ok) {
    const data = await response.json();
    if (data.url) {
      return {
        url: data.url,
        name: data.name || uploadPayload.filename,
        type: formattedType,
        size: formatBytes(compressedSizeNumber),
        originalSize: formatBytes(file.size),
        compressedSize: formatBytes(compressedSizeNumber),
        dimensions,
      };
    } else {
      throw new Error(data.error || 'Server tidak mengembalikan URL gambar.');
    }
  } else {
    let errorMsg = `Upload failed with status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {}
    throw new Error(errorMsg);
  }
}

/**
 * Converts File to Base64 Data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca berkas: ' + (reader.error?.message || 'Unknown error')));
    reader.readAsDataURL(file);
  });
}

/**
 * Formats bytes to human-readable string (KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
