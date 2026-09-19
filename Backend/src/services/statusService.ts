import { User, Application, Appreciation } from '../models';

export type StatusTier =
  | 'level_1_new'
  | 'level_2_active'
  | 'level_3_trusted'
  | 'level_4_leader'
  | 'level_5_impact_maker';

export interface TierInfo {
  tier: StatusTier;
  levelNumber: number;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  badgeIcon: string;
  privilegesAr: string[];
  privilegesFr: string[];
  privilegesEn: string[];
  nextMilestoneAr: string;
  nextMilestoneFr: string;
  nextMilestoneEn: string;
}

export const TIER_DEFINITIONS: Record<StatusTier, TierInfo> = {
  level_1_new: {
    tier: 'level_1_new',
    levelNumber: 1,
    titleAr: 'متطوع جديد',
    titleFr: 'Nouveau Bénévole',
    titleEn: 'New Volunteer',
    badgeIcon: '🌱',
    privilegesAr: [
      'الانضمام إلى المهام التطوعية المفتوحة',
      'الحصول على جواز السفر المدني ورمز QR الميداني',
      'تحديد دوافعك واهتماماتك المجتمعية',
    ],
    privilegesFr: [
      'Rejoindre les missions citoyennes ouvertes',
      'Obtenir votre passeport civique et QR code de terrain',
      'Personnaliser vos motivations et centres d’intérêt',
    ],
    privilegesEn: [
      'Join open civic volunteering missions',
      'Access civic passport and field check-in QR code',
      'Customize personal motivations and causes',
    ],
    nextMilestoneAr: 'أكمل مهمتين للحصول على رتبة متطوع نشيط وإمكانية إنشاء الفرق',
    nextMilestoneFr: 'Complétez 2 missions pour débloquer le rang Actif et créer des Squads',
    nextMilestoneEn: 'Complete 2 missions to unlock Active status and create Squads',
  },
  level_2_active: {
    tier: 'level_2_active',
    levelNumber: 2,
    titleAr: 'متطوع نشيط',
    titleFr: 'Bénévole Actif',
    titleEn: 'Active Volunteer',
    badgeIcon: '⚡',
    privilegesAr: [
      'الانضمام إلى المهام ذات المقاعد المحدودة',
      'إنشاء مجموعة تطوعية (Squad) ودعوة أصدقائك',
      'المساهمة في شريط تقدم تحدي الحومة الجماعي',
    ],
    privilegesFr: [
      'Accéder aux missions à places limitées',
      'Créer votre Squad de bénévoles et inviter vos proches',
      'Contribuer à la jauge collective du Défi de Quartier',
    ],
    privilegesEn: [
      'Access limited-slot missions',
      'Create a volunteer Squad and invite friends',
      'Contribute to the neighborhood collective challenge bar',
    ],
    nextMilestoneAr: 'أكمل 5 مهام واجمع 3 تقديرات شكر للترقية إلى متطوع موثوق',
    nextMilestoneFr: 'Complétez 5 missions et recevez 3 mercis pour devenir Bénévole de Confiance',
    nextMilestoneEn: 'Complete 5 missions and receive 3 thank-yous to reach Trusted status',
  },
  level_3_trusted: {
    tier: 'level_3_trusted',
    levelNumber: 3,
    titleAr: 'متطوع موثوق',
    titleFr: 'Bénévole de Confiance',
    titleEn: 'Trusted Volunteer',
    badgeIcon: '🛡️',
    privilegesAr: [
      'تنسيق المتطوعين في الميدان كمسؤول فرقة',
      'أولوية الوصول إلى مهام الطوارئ والإغاثة السريعة',
      'إرسال تقديرات الشكر لزملائك في الميدان',
    ],
    privilegesFr: [
      'Coordonner les bénévoles sur le terrain en chef d’équipe',
      'Accès prioritaire aux missions d’urgence et d’intervention rapide',
      'Envoyer des remerciements d’équipe à vos pairs',
    ],
    privilegesEn: [
      'Coordinate field teams as a Squad coordinator',
      'Priority access to emergency and rapid response missions',
      'Send peer appreciations to teammates',
    ],
    nextMilestoneAr: 'أكمل 12 مهمة و40 ساعة ميدانية للترقية إلى قائد ميداني',
    nextMilestoneFr: 'Atteignez 12 missions et 40h de terrain pour devenir Leader de Terrain',
    nextMilestoneEn: 'Reach 12 missions and 40 field hours to become a Field Leader',
  },
  level_4_leader: {
    tier: 'level_4_leader',
    levelNumber: 4,
    titleAr: 'قائد ميداني',
    titleFr: 'Leader de Terrain',
    titleEn: 'Field Leader',
    badgeIcon: '👑',
    privilegesAr: [
      'إنشاء وتنسيق مبادرات ميدانية بإشراف الجمعيات',
      'تأكيد حضور المتطوعين عبر فحص رموز QR الميدانية',
      'توزيع الأدوار اللوجستية وتوجيه الفرق الشبابية',
    ],
    privilegesFr: [
      'Créer et coordonner des initiatives locales sous l’égide des ONG',
      'Valider la présence des bénévoles par scan QR de terrain',
      'Attribuer les rôles et guider les équipes de volontaires',
    ],
    privilegesEn: [
      'Create and coordinate community initiatives under partner NGOs',
      'Verify volunteer attendance via field QR scanning',
      'Assign roles and mentor volunteer squads',
    ],
    nextMilestoneAr: 'أكمل 25 مهمة وساهم في انضمام متطوعين جدد لتصل إلى صانع أثر',
    nextMilestoneFr: 'Complétez 25 missions et parrainez des bénévoles pour devenir Bâtisseur d’Impact',
    nextMilestoneEn: 'Complete 25 missions and bring friends into volunteering to reach Impact Maker',
  },
  level_5_impact_maker: {
    tier: 'level_5_impact_maker',
    levelNumber: 5,
    titleAr: 'صانع أثر',
    titleFr: 'Bâtisseur d’Impact',
    titleEn: 'Impact Maker',
    badgeIcon: '🌟',
    privilegesAr: [
      'قيادة تحديات مجتمعية كبرى على مستوى البلديات',
      'إرشاد وتأطير قادة الفرق والمجموعات الجديدة',
      'الظهور الدائم في حائط الأثر الوطني (أبطال الجزائر)',
    ],
    privilegesFr: [
      'Diriger les grands défis citoyens municipaux',
      'Mentorer les nouveaux coordinateurs et squads',
      'Visibilité d’honneur sur le Mur de l’Impact National',
    ],
    privilegesEn: [
      'Lead major municipal and regional civic challenges',
      'Mentor new squad coordinators and emerging volunteers',
      'Featured honor spotlight on the National Wall of Impact',
    ],
    nextMilestoneAr: 'أعلى رتبة شرفية مدنية في فولونوفا! واصل إلهام مجتمعك',
    nextMilestoneFr: 'Plus haut rang honorifique de VOLUNOVA ! Continuez d’inspirer la jeunesse',
    nextMilestoneEn: 'Highest civic honor in VOLUNOVA! Keep inspiring your community',
  },
};

/**
 * Re-evaluates volunteer status tier and awards dynamic qualitative badges
 */
export async function evaluateUserStatus(userId: string) {
  const user = await User.findById(userId);
  if (!user || user.role !== 'volunteer') return null;

  // Count attended missions
  const attendedCount = await Application.countDocuments({
    volunteerId: userId,
    status: 'attended',
  });

  // Calculate total human appreciations received
  const totalAppreciations =
    (user.appreciationsReceived?.thankYou || 0) +
    (user.appreciationsReceived?.teamSpirit || 0) +
    (user.appreciationsReceived?.vitalRole || 0) +
    (user.appreciationsReceived?.problemSolver || 0) +
    (user.appreciationsReceived?.mostReliable || 0) +
    (user.appreciationsReceived?.creative || 0) +
    (user.appreciationsReceived?.rapidResponder || 0);

  const hours = user.impactHours || 0;
  const referrals = user.referralsCompletedCount || 0;

  let newTier: StatusTier = 'level_1_new';

  if (attendedCount >= 25 && hours >= 80 && (referrals >= 1 || totalAppreciations >= 20)) {
    newTier = 'level_5_impact_maker';
  } else if (attendedCount >= 12 && hours >= 40 && totalAppreciations >= 10) {
    newTier = 'level_4_leader';
  } else if (attendedCount >= 5 && totalAppreciations >= 3) {
    newTier = 'level_3_trusted';
  } else if (attendedCount >= 2) {
    newTier = 'level_2_active';
  }

  user.statusTier = newTier;

  // Check Community Builder badge
  if (referrals >= 1) {
    const hasBuilderBadge = user.qualitativeBadges?.some(
      (b: any) => b.type === 'community_builder'
    );
    if (!hasBuilderBadge) {
      user.qualitativeBadges.push({
        type: 'community_builder',
        labelAr: '🤝 باني المجتمع',
        labelFr: 'Bâtisseur de Communauté',
        awardedAt: new Date(),
        missionTitle: `ساهم في انضمام ${referrals} متطوعين للميدان`,
      });
    }
  }

  // Check Rapid Responder badge
  if ((user.appreciationsReceived?.rapidResponder || 0) >= 3) {
    const hasRapid = user.qualitativeBadges?.some((b: any) => b.type === 'rapid_responder');
    if (!hasRapid) {
      user.qualitativeBadges.push({
        type: 'rapid_responder',
        labelAr: '⚡ أسرع استجابة',
        labelFr: 'Intervention Rapide',
        awardedAt: new Date(),
        missionTitle: 'استجابة متكررة لنداءات الإغاثة العاجلة',
      });
    }
  }

  // Check Team Heart badge
  if ((user.appreciationsReceived?.teamSpirit || 0) >= 5) {
    const hasHeart = user.qualitativeBadges?.some((b: any) => b.type === 'heart_of_team');
    if (!hasHeart) {
      user.qualitativeBadges.push({
        type: 'heart_of_team',
        labelAr: '❤️ قلب الفريق',
        labelFr: 'Cœur de l’Équipe',
        awardedAt: new Date(),
        missionTitle: 'مساعدة مستمرة وتشجيع رفقاء الميدان',
      });
    }
  }

  await user.save();
  return {
    user,
    tierInfo: TIER_DEFINITIONS[newTier],
    attendedCount,
    totalAppreciations,
  };
}
