import { Router, Response } from 'express';
import { Appreciation, User, Mission, Notification } from '../models';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { evaluateUserStatus } from '../services/statusService';

const router = Router();

const KIND_METADATA: Record<string, { ar: string; fr: string; field: string }> = {
  thank_you: { ar: '❤️ شكراً على حضورك', fr: 'Merci pour votre présence', field: 'thankYou' },
  team_spirit: { ar: '🤝 روح الفريق', fr: 'Esprit d’équipe', field: 'teamSpirit' },
  vital_role: { ar: '👏 دور محوري', fr: 'Rôle essentiel', field: 'vitalRole' },
  problem_solver: { ar: '🧠 عقل الفريق', fr: 'Résolveur de problèmes', field: 'problemSolver' },
  most_reliable: { ar: '💪 أكثر واحد يعتمد عليه', fr: 'Pilier de confiance', field: 'mostReliable' },
  creative: { ar: '🎨 المبدع', fr: 'Créatif inspirant', field: 'creative' },
  rapid_responder: { ar: '⚡ أسرع استجابة', fr: 'Intervention rapide', field: 'rapidResponder' },
};

// POST /appreciations — Send real human gratitude
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { missionId, toUserId, kind, note } = req.body;
    const fromUserId = req.user!.userId;

    if (!missionId || !toUserId || !kind) {
      return res.status(400).json({
        ok: false,
        error: { message: 'MissionId, toUserId et type d’appréciation requis' },
      });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Vous ne pouvez pas vous auto-remercier.' },
      });
    }

    const meta = KIND_METADATA[kind];
    if (!meta) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Type d’appréciation invalide' },
      });
    }

    // Prevent duplicate spam
    const existing = await Appreciation.findOne({ missionId, fromUserId, toUserId });
    if (existing) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Vous avez déjà exprimé votre reconnaissance pour cette mission.' },
      });
    }

    const appreciation = new Appreciation({
      missionId,
      fromUserId,
      toUserId,
      kind,
      note: note ? note.trim() : '',
    });

    await appreciation.save();

    // Increment recipient count in User schema
    const recipient = await User.findById(toUserId);
    if (recipient) {
      if (!recipient.appreciationsReceived) {
        recipient.appreciationsReceived = {
          thankYou: 0,
          teamSpirit: 0,
          vitalRole: 0,
          problemSolver: 0,
          mostReliable: 0,
          creative: 0,
          rapidResponder: 0,
        };
      }
      const field = meta.field as keyof typeof recipient.appreciationsReceived;
      (recipient.appreciationsReceived as any)[field] =
        ((recipient.appreciationsReceived as any)[field] || 0) + 1;
      await recipient.save();

      // Trigger level status re-evaluation
      await evaluateUserStatus(toUserId);

      // Create in-app notification
      const sender = await User.findById(fromUserId).select('name');
      await Notification.create({
        userId: toUserId,
        type: 'review_received',
        payload: {
          title: 'تقدير إنساني جديد من القلب ❤️',
          body: `أرسل لك ${sender?.name || 'أحد رفقاء الميدان'}: "${meta.ar}"`,
          appreciationKind: kind,
          missionId,
        },
      });
    }

    res.status(201).json({ ok: true, data: appreciation });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

// GET /appreciations/my — Get appreciations received by current volunteer
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await Appreciation.find({ toUserId: req.user!.userId })
      .sort({ createdAt: -1 })
      .populate('fromUserId', 'name avatar role')
      .populate('missionId', 'title category venueName');

    const user = await User.findById(req.user!.userId).select('appreciationsReceived qualitativeBadges statusTier');

    res.json({
      ok: true,
      data: {
        appreciations: list,
        summary: user?.appreciationsReceived || {},
        qualitativeBadges: user?.qualitativeBadges || [],
        statusTier: user?.statusTier || 'level_1_new',
      },
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

export default router;
