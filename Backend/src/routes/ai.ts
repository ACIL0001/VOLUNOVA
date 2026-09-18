import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { extractMissionNeedsSecure } from '../services/aiExtractor';
import { validateBody } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

const ExtractSchema = z.object({
  prompt: z.string().min(3).max(1500),
});

// POST /api/ai/extract
router.post(
  '/extract',
  rateLimit(15, 60000), // 15 req/min
  validateBody(ExtractSchema),
  async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      const extracted = await extractMissionNeedsSecure(prompt);

      return res.json({
        ok: true,
        data: extracted,
      });
    } catch (err: any) {
      return res.status(500).json({
        ok: false,
        error: { code: 'AI_EXTRACTION_FAILED', message: err.message },
      });
    }
  }
);

export default router;
