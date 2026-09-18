import { Router, Response } from 'express';
import { Notification } from '../models';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: req.user!.userId,
      readAt: null,
    });

    return res.json({
      ok: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.user!.userId, readAt: null },
      { readAt: new Date() }
    );

    return res.json({ ok: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    return res.json({ ok: true, data: notification });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
