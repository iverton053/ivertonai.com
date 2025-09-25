import { BrandAsset, BrandAssetFormat } from '../types/brandAssets';

// Performance optimization utilities for brand assets

interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableImageCompression: boolean;
  enableCaching: boolean;
  enableVirtualization: boolean;
  thumbnailSize: number;
  cacheTimeout: number;
}

export const PERFORMANCE_CONFIG: OptimizationConfig = {
  enableLazyLoading: true,
  enableImageCompression: true,
  enableCaching: true,
  enableVirtualization: true,
  thumbnailSize: 200,
  cacheTimeout: 1000 * 60 * 30, // 30 minutes
};

// Cache for thumbnails and metadata
const thumbnailCache = new Map<string, string>();
const metadataCache = new Map<string, any>();

// Debounce utility for search optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), delay);
    }
  };
}

// Memoization utility for expensive computations
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Generate optimized thumbnail
export async function generateThumbnail(
  file: File,
  maxSize: number = PERFORMANCE_CONFIG.thumbnailSize
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check cache first
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}-${maxSize}`;
    if (thumbnailCache.has(cacheKey)) {
      resolve(thumbnailCache.get(cacheKey)!);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate dimensions maintaining aspect ratio
        const { width, height } = calculateThumbnailDimensions(
          img.width,
          img.height,
          maxSize
        );

        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format for better compression if supported
        const format = supportsWebP() ? 'image/webp' : 'image/jpeg';
        const quality = 0.8; // 80% quality
        const thumbnailUrl = canvas.toDataURL(format, quality);

        // Cache the result
        thumbnailCache.set(cacheKey, thumbnailUrl);

        resolve(thumbnailUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    // Clean up object URL after loading
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      img.onload(); // Call the original onload
    };
  });
}

// Calculate optimal thumbnail dimensions
function calculateThumbnailDimensions(
  originalWidth: number,
  originalHeight: number,
  maxSize: number
): { width: number; height: number } {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (originalWidth > originalHeight) {
    return {
      width: maxSize,
      height: Math.round(maxSize / aspectRatio)
    };
  } else {
    return {
      width: Math.round(maxSize * aspectRatio),
      height: maxSize
    };
  }
}

// Check WebP support
function supportsWebP(): boolean {
  try {
    return (
      document
        .createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0
    );
  } catch {
    return false;
  }
}

// Compress file before upload
export async function compressFile(
  file: File,
  maxSizeMB: number = 5,
  quality: number = 0.8
): Promise<File> {
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file; // File is already small enough
  }

  if (!file.type.startsWith('image/')) {
    return file; // Only compress images
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions to reduce file size
        const scaleFactor = Math.sqrt((maxSizeMB * 1024 * 1024) / file.size);
        const newWidth = Math.floor(img.width * scaleFactor);
        const newHeight = Math.floor(img.height * scaleFactor);

        canvas.width = newWidth;
        canvas.height = newHeight;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
}

// Asset filtering with performance optimizations
export const optimizedAssetFilter = memoize((
  assets: BrandAsset[],
  searchQuery: string,
  filters: any
): BrandAsset[] => {
  let result = assets;

  // Fast text search using indexOf (faster than regex for simple searches)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    result = result.filter(asset =>
      asset.name.toLowerCase().includes(query) ||
      asset.description?.toLowerCase().includes(query) ||
      asset.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Apply filters
  if (filters.type?.length > 0) {
    result = result.filter(asset => filters.type.includes(asset.type));
  }

  if (filters.format?.length > 0) {
    result = result.filter(asset => filters.format.includes(asset.format));
  }

  if (filters.isApproved !== undefined) {
    result = result.filter(asset => asset.isApproved === filters.isApproved);
  }

  return result;
});

// Virtual scrolling helper for large asset lists
export class VirtualScrollHelper {
  private itemHeight: number;
  private containerHeight: number;
  private scrollTop: number = 0;
  private overscan: number = 5;

  constructor(itemHeight: number, containerHeight: number) {
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
  }

  getVisibleRange(itemCount: number): { start: number; end: number } {
    const visibleStart = Math.floor(this.scrollTop / this.itemHeight);
    const visibleEnd = Math.min(
      itemCount - 1,
      Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight)
    );

    return {
      start: Math.max(0, visibleStart - this.overscan),
      end: Math.min(itemCount - 1, visibleEnd + this.overscan)
    };
  }

  updateScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop;
  }

  getTotalHeight(itemCount: number): number {
    return itemCount * this.itemHeight;
  }

  getItemTransform(index: number): string {
    return `translateY(${index * this.itemHeight}px)`;
  }
}

// File format validation with extended support
export function validateFileFormat(file: File, allowedFormats: BrandAssetFormat[]): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase() as BrandAssetFormat;

  if (!fileExtension) return false;

  // Extended format mapping for better support
  const formatMapping: Record<string, BrandAssetFormat[]> = {
    'jpg': ['jpg', 'jpeg'],
    'jpeg': ['jpg', 'jpeg'],
    'tif': ['tiff'],
    'tiff': ['tiff'],
    'doc': ['docx'],
    'docx': ['docx'],
    'xls': ['xlsx'],
    'xlsx': ['xlsx'],
    'ppt': ['pptx'],
    'pptx': ['pptx'],
  };

  const validFormats = formatMapping[fileExtension] || [fileExtension];
  return validFormats.some(format => allowedFormats.includes(format));
}

// Asset metadata extraction
export async function extractAssetMetadata(file: File): Promise<any> {
  const cacheKey = `metadata-${file.name}-${file.size}-${file.lastModified}`;

  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey);
  }

  const metadata: any = {
    filename: file.name,
    fileSize: file.size,
    fileType: file.type,
    lastModified: new Date(file.lastModified),
  };

  // Extract image metadata
  if (file.type.startsWith('image/')) {
    try {
      const imageMetadata = await extractImageMetadata(file);
      metadata.dimensions = imageMetadata.dimensions;
      metadata.hasTransparency = imageMetadata.hasTransparency;
    } catch (error) {
      console.warn('Failed to extract image metadata:', error);
    }
  }

  // Cache the result
  metadataCache.set(cacheKey, metadata);

  // Auto-cleanup cache after timeout
  setTimeout(() => {
    metadataCache.delete(cacheKey);
  }, PERFORMANCE_CONFIG.cacheTimeout);

  return metadata;
}

// Extract image metadata
async function extractImageMetadata(file: File): Promise<{
  dimensions: { width: number; height: number };
  hasTransparency: boolean;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Create canvas to check for transparency
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hasTransparency = checkTransparency(imageData);

        resolve({
          dimensions: { width: img.width, height: img.height },
          hasTransparency
        });
      } else {
        resolve({
          dimensions: { width: img.width, height: img.height },
          hasTransparency: false
        });
      }

      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// Check if image has transparency
function checkTransparency(imageData: ImageData): boolean {
  const data = imageData.data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
}

// Cleanup utilities
export function cleanupCaches() {
  thumbnailCache.clear();
  metadataCache.clear();
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startMeasure(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }

      const measurements = this.metrics.get(name)!;
      measurements.push(duration);

      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }

  getMetrics(name: string): {
    average: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const measurements = this.metrics.get(name);

    if (!measurements || measurements.length === 0) {
      return null;
    }

    return {
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    };
  }

  reset(name?: string) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();