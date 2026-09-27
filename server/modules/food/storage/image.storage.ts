import crypto from 'crypto';
import { StoredImageMetadata } from '../food.models.js';
import { ValidationError } from '../../../core/errors.js';

export interface IImageStorage {
  storeImage(params: {
    userId: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<{ metadata: StoredImageMetadata; isDuplicate: boolean; base64Data: string }>;
  getImage(id: string): Promise<{ metadata: StoredImageMetadata; buffer: Buffer } | null>;
  getImageByHash(hash: string): StoredImageMetadata | undefined;
}

export class InMemoryImageStorage implements IImageStorage {
  private images = new Map<string, { metadata: StoredImageMetadata; buffer: Buffer }>();
  private hashIndex = new Map<string, string>(); // fileHash -> imageId

  async storeImage(params: {
    userId: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<{ metadata: StoredImageMetadata; isDuplicate: boolean; base64Data: string }> {
    // 1. Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(params.mimeType.toLowerCase())) {
      throw new ValidationError(
        `Unsupported image format '${params.mimeType}'. Supported formats: JPG, PNG, WEBP.`
      );
    }

    // 2. Validate File Size (Max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (params.buffer.length > maxSizeBytes) {
      throw new ValidationError(`Image size (${(params.buffer.length / 1024 / 1024).toFixed(2)} MB) exceeds 10MB limit.`);
    }

    if (params.buffer.length === 0) {
      throw new ValidationError('Uploaded image file is empty or corrupted.');
    }

    // 3. Compute SHA-256 Hash of original image
    const fileHash = crypto.createHash('sha256').update(params.buffer).digest('hex');

    // 4. Check for duplicate upload
    const existingId = this.hashIndex.get(fileHash);
    if (existingId) {
      const existing = this.images.get(existingId);
      if (existing) {
        return {
          metadata: existing.metadata,
          isDuplicate: true,
          base64Data: existing.buffer.toString('base64')
        };
      }
    }

    // 5. Store immutable image record
    const id = `img-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const sanitizedFileName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    const metadata: StoredImageMetadata = {
      id,
      userId: params.userId,
      fileHash,
      fileName: sanitizedFileName,
      mimeType: params.mimeType,
      sizeBytes: params.buffer.length,
      createdAt: new Date().toISOString()
    };

    this.images.set(id, { metadata, buffer: params.buffer });
    this.hashIndex.set(fileHash, id);

    return {
      metadata,
      isDuplicate: false,
      base64Data: params.buffer.toString('base64')
    };
  }

  async getImage(id: string) {
    return this.images.get(id) || null;
  }

  getImageByHash(hash: string) {
    const id = this.hashIndex.get(hash);
    return id ? this.images.get(id)?.metadata : undefined;
  }
}

export const imageStorage = new InMemoryImageStorage();
