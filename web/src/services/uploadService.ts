import api from './api';

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    mimeType: string;
    originalName: string;
    size: number;
    cloudinaryId?: string;
  };
  message?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a file (image or video) to Cloudinary
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Upload response with file URL
 */
export const uploadFile = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Upload with progress tracking
    const response = await api.post<UploadResponse>('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Validate file before upload
 * @param file - The file to validate
 * @param maxSize - Maximum file size in bytes (default: 50MB)
 * @param acceptedTypes - Array of accepted MIME types
 * @returns Validation result
 */
export const validateFile = (
  file: File,
  maxSize: number = 50 * 1024 * 1024, // 50 MB
  acceptedTypes: string[] = ['image/*', 'video/*']
): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type
  const fileType = file.type;
  const isAccepted = acceptedTypes.some((type) => {
    if (type.endsWith('/*')) {
      // Handle wildcard types like "image/*"
      const category = type.split('/')[0];
      return fileType.startsWith(category + '/');
    }
    return fileType === type;
  });

  if (!isAccepted) {
    return {
      valid: false,
      error: 'File type not supported. Please upload an image or video.',
    };
  }

  return { valid: true };
};

export default {
  uploadFile,
  validateFile,
};
