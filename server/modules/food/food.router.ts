import { Router, Request, Response, NextFunction } from 'express';
import { foodService } from './food.service.js';
import { ValidationError } from '../../core/errors.js';

export const foodRouter = Router();

// POST /api/v1/food/scans
// Accepts JSON with base64 image array or single base64 image (supports multi-image upload e.g. front + back + nutrition label)
foodRouter.post('/scans', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId = 'user-alex-1', images, imageBase64, mimeType = 'image/jpeg', fileName = 'upload.jpg', textHint } = req.body;

    const filesToProcess: Array<{ fileName: string; mimeType: string; buffer: Buffer }> = [];

    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const rawBase64 = (img.base64 || img).replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(rawBase64, 'base64');
        filesToProcess.push({
          fileName: img.fileName || `image_${i + 1}.jpg`,
          mimeType: img.mimeType || mimeType,
          buffer
        });
      }
    } else if (imageBase64) {
      const rawBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(rawBase64, 'base64');
      filesToProcess.push({
        fileName,
        mimeType,
        buffer
      });
    } else if (textHint) {
      // Allow text hint fallback without image for quick testing
      const emptyBuffer = Buffer.from('mock_image_placeholder');
      filesToProcess.push({
        fileName: 'hint_query.jpg',
        mimeType: 'image/jpeg',
        buffer: emptyBuffer
      });
    } else {
      throw new ValidationError('Either imageBase64 or images array must be provided.');
    }

    const job = await foodService.processImages({
      userId,
      files: filesToProcess,
      textHint
    });

    return res.status(201).json(job);
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/food/scans/:id
foodRouter.get('/scans/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await foodService.getScanJob(req.params.id);
    return res.json(job);
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/food/products/:id
foodRouter.get('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await foodService.getProduct(req.params.id);
    return res.json(product);
  } catch (err) {
    return next(err);
  }
});
