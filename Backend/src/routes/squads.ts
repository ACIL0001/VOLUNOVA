import { Router, Response } from 'express';
import crypto from 'crypto';
import { Squad, User, Application } from '../models';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /squads/my — Retrieve current user's squad
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user || !user.squadId) {
      return res.json({ ok: true, data: null });
    }

    const squad = await Squad.findById(user.squadId)
      .populate('leaderId', 'name avatar city impactHours statusTier')
      .populate('members', 'name avatar city impactHours statusTier qualitativeBadges');

    if (!squad) {
      user.squadId = null;
      await user.save();
      return res.json({ ok: true, data: null });
    }

    res.json({ ok: true, data: squad });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

// POST /squads — Create a new Squad
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, avatar, neighborhood, city } = req.body;
    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Nom de squad requis (au moins 3 caractères)' },
      });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: { message: 'Utilisateur introuvable' } });
    }

    if (user.squadId) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Vous appartenez déjà à une squad. Quittez votre squad actuelle d’abord.' },
      });
    }

    // Generate unique 6-character invite code
    let inviteCode = '';
    let isUnique = false;
    while (!isUnique) {
      inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      const existing = await Squad.findOne({ inviteCode });
      if (!existing) isUnique = true;
    }

    const squad = new Squad({
      name: name.trim(),
      avatar: avatar || 'users',
      leaderId: user._id,
      members: [user._id],
      neighborhood: neighborhood || user.neighborhood || 'Bab Ezzouar',
      city: city || user.city || 'Algiers',
      inviteCode,
      totalImpactHours: user.impactHours || 0,
      missionsCompletedCount: 0,
    });

    await squad.save();

    user.squadId = squad._id;
    await user.save();

    res.status(201).json({ ok: true, data: squad });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

// POST /squads/join — Join a Squad via invite code
router.post('/join', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode || !inviteCode.trim()) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Code d’invitation requis' },
      });
    }

    const code = inviteCode.trim().toUpperCase();
    const squad = await Squad.findOne({ inviteCode: code });
    if (!squad) {
      return res.status(404).json({
        ok: false,
        error: { message: 'Code de squad invalide ou inexistant' },
      });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: { message: 'Utilisateur introuvable' } });
    }

    if (user.squadId && user.squadId.toString() === squad._id.toString()) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Vous êtes déjà membre de cette squad.' },
      });
    }

    // Add user to members
    if (!squad.members.includes(user._id)) {
      squad.members.push(user._id);
      squad.totalImpactHours += user.impactHours || 0;
      await squad.save();
    }

    user.squadId = squad._id;
    await user.save();

    const populated = await Squad.findById(squad._id)
      .populate('leaderId', 'name avatar city impactHours statusTier')
      .populate('members', 'name avatar city impactHours statusTier qualitativeBadges');

    res.json({ ok: true, data: populated });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

// POST /squads/leave — Leave current Squad
router.post('/leave', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user || !user.squadId) {
      return res.status(400).json({ ok: false, error: { message: 'Vous n’avez pas de squad.' } });
    }

    const squad = await Squad.findById(user.squadId);
    if (squad) {
      squad.members = squad.members.filter((m: any) => m.toString() !== user._id.toString());
      if (squad.members.length === 0) {
        await Squad.findByIdAndDelete(squad._id);
      } else {
        // If leader leaves, assign next member as leader
        if (squad.leaderId.toString() === user._id.toString()) {
          squad.leaderId = squad.members[0];
        }
        await squad.save();
      }
    }

    user.squadId = null;
    await user.save();

    res.json({ ok: true, data: { message: 'Squad quittée avec succès' } });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

// GET /squads/neighborhood/:neighborhood — Top squads in neighborhood
router.get('/neighborhood/:neighborhood', async (req, res) => {
  try {
    const neighborhood = decodeURIComponent(req.params.neighborhood);
    const squads = await Squad.find({
      neighborhood: { $regex: new RegExp(`^${neighborhood}$`, 'i') },
    })
      .sort({ totalImpactHours: -1 })
      .limit(10)
      .populate('leaderId', 'name avatar')
      .populate('members', 'name avatar');

    res.json({ ok: true, data: squads });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

export default router;
