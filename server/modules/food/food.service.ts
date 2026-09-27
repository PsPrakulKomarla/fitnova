import { FoodScanJob, ProductObservation } from './food.models.js';
import { imageStorage } from './storage/image.storage.js';
import { getFoodVisionProvider } from './vision/vision.provider.js';
import { productCatalog } from './matching/product.matcher.js';
import { reconcileMultiImageObservations } from './reconciliation/multi-image.reconciler.js';
import { NotFoundError, ValidationError } from '../../core/errors.js';
import { eventBus } from '../../core/events.js';

export class FoodService {
  private jobs = new Map<string, FoodScanJob>();

  async createScanJob(userId: string): Promise<FoodScanJob> {
    const job: FoodScanJob = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      status: 'UPLOADED',
      imageIds: [],
      observations: [],
      reconciledProduct: null,
      createdAt: new Date().toISOString()
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async processImages(params: {
    userId: string;
    files: Array<{ fileName: string; mimeType: string; buffer: Buffer }>;
    textHint?: string;
  }): Promise<FoodScanJob> {
    if (!params.files || params.files.length === 0) {
      throw new ValidationError('At least one image file is required for scanning.');
    }

    const job = await this.createScanJob(params.userId);
    job.status = 'PROCESSING';

    const visionProvider = getFoodVisionProvider();
    const storedImages: string[] = [];
    const observations: ProductObservation[] = [];

    for (let i = 0; i < params.files.length; i++) {
      const file = params.files[i];

      // 1. Image Validation, Hashing & Storage
      const { metadata, base64Data } = await imageStorage.storeImage({
        userId: params.userId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        buffer: file.buffer
      });
      storedImages.push(metadata.id);

      // 2. OCR / Vision Extraction
      const extraction = await visionProvider.extractFromImage({
        base64Data,
        mimeType: metadata.mimeType,
        textHint: params.textHint
      });

      const observation: ProductObservation = {
        id: `obs-${Date.now()}-${i}`,
        scanJobId: job.id,
        imageId: metadata.id,
        userId: params.userId,
        detectedBarcode: extraction.detectedBarcode,
        productName: extraction.productName,
        brand: extraction.brand,
        nutrition: extraction.nutrition,
        ingredientsRaw: extraction.ingredientsRaw,
        ingredientsParsed: extraction.ingredientsParsed,
        missingFields: extraction.missingFields,
        confidence: extraction.confidence,
        createdAt: new Date().toISOString()
      };

      observations.push(observation);
    }

    job.imageIds = storedImages;
    job.observations = observations;
    job.status = 'EXTRACTED';

    // 3. Multi-Image Reconciliation
    const reconciled = reconcileMultiImageObservations(observations);

    // 4. Product Matching against Verified Database
    const match = productCatalog.match({
      barcode: reconciled.barcode,
      brand: reconciled.brand,
      productName: reconciled.name
    });

    job.reconciledProduct = {
      ...reconciled,
      matchStatus: match.status,
      matchedProductId: match.product?.id
    };

    // If matched against verified catalog, elevate verification state
    if (match.status === 'EXACT_MATCH' && match.version) {
      job.reconciledProduct.verificationState = 'VERIFIED';
    }

    // 5. Final Job Lifecycle Status
    if (reconciled.conflicts.length > 0 || reconciled.missingFields.length > 0) {
      job.status = 'REQUIRES_VERIFICATION';
    } else {
      job.status = 'COMPLETED';
    }

    job.completedAt = new Date().toISOString();
    this.jobs.set(job.id, job);

    // 6. Emit Domain Event
    eventBus.emit('FOOD_SCANNED', params.userId, {
      scanJobId: job.id,
      productName: reconciled.name,
      verificationState: reconciled.verificationState,
      matchStatus: match.status
    });

    return job;
  }

  async getScanJob(id: string): Promise<FoodScanJob> {
    const job = this.jobs.get(id);
    if (!job) {
      throw new NotFoundError(`Food scan job with ID ${id} was not found.`, 'SCAN_JOB_NOT_FOUND');
    }
    return job;
  }

  async getProduct(productId: string) {
    const prod = productCatalog.getProductById(productId);
    if (!prod) {
      throw new NotFoundError(`Product ${productId} not found.`, 'PRODUCT_NOT_FOUND');
    }
    const ver = productCatalog.getVersionById(prod.currentVersionId);
    return { product: prod, version: ver };
  }
}

export const foodService = new FoodService();
