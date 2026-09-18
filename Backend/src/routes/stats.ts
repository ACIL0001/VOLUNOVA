import { Router, Request, Response } from 'express';
import { Mission, User, Application } from '../models';

const router = Router();

// GET /api/stats/impact-wall
router.get('/impact-wall', async (req: Request, res: Response) => {
  try {
    const [
      activeMissionsCount,
      totalVolunteers,
      userHoursAgg,
      slotsAgg,
      environmentalMissionsAgg
    ] = await Promise.all([
      Mission.countDocuments({ status: { $in: ['active', 'in_progress'] } }),
      User.countDocuments({ role: 'volunteer' }),
      User.aggregate([{ $group: { _id: null, totalHours: { $sum: '$impactHours' } } }]),
      Mission.aggregate([
        {
          $group: {
            _id: null,
            totalSlotsNeeded: { $sum: '$totalSlotsNeeded' },
            totalSlotsFilled: { $sum: '$totalSlotsFilled' },
          },
        },
      ]),
      Mission.aggregate([
        { $match: { category: { $regex: /environ|arbre|plant|nature|forest/i } } },
        { $group: { _id: null, totalFilled: { $sum: '$totalSlotsFilled' } } },
      ]),
    ]);

    const totalImpactHours = userHoursAgg[0]?.totalHours || 0;
    const totalSlotsNeeded = slotsAgg[0]?.totalSlotsNeeded || 0;
    const totalSlotsFilled = slotsAgg[0]?.totalSlotsFilled || 0;
    const fillRatePercentage = totalSlotsNeeded > 0
      ? Math.min(100, Math.round((totalSlotsFilled / totalSlotsNeeded) * 100))
      : 0;

    // Environmental trees: based on confirmed volunteer slots in environmental initiatives
    const treesPlanted = (environmentalMissionsAgg[0]?.totalFilled || 0) * 10;

    const stats = {
      treesPlanted,
      totalImpactHours,
      volunteersMobilized: totalVolunteers,
      activeMissionsCount,
      fillRatePercentage,
    };

    return res.json({ ok: true, data: stats });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
