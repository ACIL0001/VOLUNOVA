import { Router, Response } from 'express';
import { z } from 'zod';
import { Review, User } from '../models';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const ReviewSchema = z.object({
  missionId: z.string(),
  toUserId: z.string(),
  direction: z.enum(['org_to_volunteer', 'volunteer_to_org']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// POST /api/reviews
router.post(
  '/',
  authenticateToken,
  validateBody(ReviewSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { missionId, toUserId, direction, rating, comment } = req.body;
      const fromUserId = req.user!.userId;

      // Unique review check
      const existing = await Review.findOne({ missionId, fromUserId, toUserId });
      if (existing) {
        return res.status(409).json({
          ok: false,
          error: { code: 'REVIEW_EXISTS', message: 'You have already submitted a review for this mission.' },
        });
      }

      const review = await Review.create({
        missionId,
        fromUserId,
        toUserId,
        direction,
        rating,
        comment,
      });

      // Update reliability score of the recipient
      const allReviews = await Review.find({ toUserId });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      const newScore = Math.round((avg / 5) * 100);

      await User.findByIdAndUpdate(toUserId, { reliabilityScore: newScore });

      return res.status(201).json({ ok: true, data: review });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// GET /api/reviews/mission/:id
router.get('/mission/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ missionId: req.params.id })
      .populate('fromUserId', 'name avatar')
      .populate('toUserId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, data: reviews });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
