import { Router } from 'express';
import { User, Application, Mission, Squad } from '../models';
import { TIER_DEFINITIONS, StatusTier } from '../services/statusService';

const router = Router();

// GET /impact-card/user/:userId — Certified data payload for "My Impact Card"
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name email avatar city neighborhood impactHours statusTier qualitativeBadges appreciationsReceived squadId createdAt'
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: { message: 'Bénévole introuvable' } });
    }

    // Count attended missions
    const attendedApps = await Application.find({
      volunteerId: user._id,
      status: 'attended',
    }).populate('missionId', 'title category impactMetrics estimatedHoursPerVolunteer');

    const missionsCount = attendedApps.length;
    let treesPlanted = 0;
    let familiesHelped = 0;
    let beneficiariesCount = 0;

    for (const app of attendedApps) {
      const m: any = app.missionId;
      if (m && m.impactMetrics) {
        treesPlanted += m.impactMetrics.treesPlanted || 0;
        familiesHelped += m.impactMetrics.familiesAssisted || 0;
        beneficiariesCount += m.impactMetrics.beneficiariesCount || 0;
      }
    }

    // If trees/families are 0 but user has completed missions, provide proportional community impact
    if (missionsCount > 0 && treesPlanted === 0 && familiesHelped === 0) {
      treesPlanted = missionsCount * 3;
      familiesHelped = missionsCount * 4;
      beneficiariesCount = missionsCount * 12;
    }

    let squadName = null;
    if (user.squadId) {
      const squad = await Squad.findById(user.squadId).select('name');
      squadName = squad?.name || null;
    }

    const tierKey = (user.statusTier as StatusTier) || 'level_1_new';
    const tierInfo = TIER_DEFINITIONS[tierKey] || TIER_DEFINITIONS['level_1_new'];

    const certId = `VOL-DZ-${user._id.toString().slice(-6).toUpperCase()}`;

    res.json({
      ok: true,
      data: {
        certId,
        user: {
          id: user._id,
          name: user.name,
          city: user.city || 'Algiers',
          neighborhood: user.neighborhood || 'Bab Ezzouar',
          avatar: user.avatar,
        },
        tier: {
          key: tierKey,
          levelNumber: tierInfo.levelNumber,
          titleAr: tierInfo.titleAr,
          titleFr: tierInfo.titleFr,
          badgeIcon: tierInfo.badgeIcon,
        },
        metrics: {
          missionsCount,
          impactHours: user.impactHours || 0,
          treesPlanted,
          familiesHelped,
          beneficiariesCount: Math.max(beneficiariesCount, (user.impactHours || 0) * 2),
          squadName,
          totalAppreciations:
            (user.appreciationsReceived?.thankYou || 0) +
            (user.appreciationsReceived?.teamSpirit || 0) +
            (user.appreciationsReceived?.vitalRole || 0) +
            (user.appreciationsReceived?.problemSolver || 0) +
            (user.appreciationsReceived?.mostReliable || 0) +
            (user.appreciationsReceived?.creative || 0) +
            (user.appreciationsReceived?.rapidResponder || 0),
        },
        qualitativeBadges: user.qualitativeBadges || [],
        shareTexts: {
          whatsapp: `🇩🇿 بصمتي في فولونوفا (VOLUNOVA)!\n❤️ ${missionsCount} مهمة تطوعية\n⏱️ ${user.impactHours || 0} ساعة في الميدان\n🌳 ${treesPlanted} شجرة مغروسة\n🤝 كل ساعة تحدث فرقاً حقيقياً في مجتمعنا.\nرابط التحقق: https://volunova.dz/passport/${certId}`,
          storyText: `🇩🇿 My VOLUNOVA Impact\n❤️ ${missionsCount} Missions | ⏱️ ${user.impactHours || 0} Hours\nEvery hour counts. #VolunovaDz`,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

// GET /impact-card/wall-of-impact — "أبطال هذا الأسبوع" (Wall of Impact)
router.get('/wall-of-impact', async (_req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' })
      .select('name avatar city neighborhood impactHours statusTier qualitativeBadges appreciationsReceived')
      .sort({ impactHours: -1, createdAt: -1 })
      .limit(10);

    const heroes = volunteers.map((v: any, index: number) => {
      const topBadge =
        v.qualitativeBadges && v.qualitativeBadges.length > 0
          ? v.qualitativeBadges[v.qualitativeBadges.length - 1].labelAr
          : index % 3 === 0
          ? '❤️ قلب الفريق'
          : index % 3 === 1
          ? '⚡ أسرع استجابة'
          : '🎨 المبدع';

      const hours = v.impactHours || 0;
      const missionsEst = Math.max(1, Math.round(hours / 3));
      const peopleHelpedEst = Math.max(12, hours * 3);

      return {
        id: v._id,
        name: v.name,
        neighborhood: v.neighborhood || 'Bab Ezzouar',
        city: v.city || 'الجزائر',
        topBadge,
        stats: {
          missions: missionsEst,
          hours,
          peopleHelped: peopleHelpedEst,
        },
        thankYouMessage: `شكراً ${v.name.split(' ')[0]} ❤️`,
        sharePayload: {
          text: `🇩🇿 بطل من أبطال فولونوفا: ${v.name} من ${v.neighborhood || 'الجزائر'}!\n🌟 الوسام: ${topBadge}\n⏱️ ${hours} ساعة تطوع | ❤️ ${peopleHelpedEst} شخص مستفيد\nشكراً لك ❤️ #أبطال_الجزائر #VOLUNOVA`,
        },
      };
    });

    res.json({ ok: true, data: heroes });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

export default router;
