import { Router, Response } from 'express';
import { CommunityChallenge, Mission, Application } from '../models';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /challenges — List community challenges
router.get('/', async (req, res) => {
  try {
    const { neighborhood, status } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = 'active';
    }

    if (neighborhood && neighborhood !== 'All') {
      filter.$or = [
        { neighborhood: { $regex: new RegExp(`^${neighborhood}$`, 'i') } },
        { neighborhood: 'All' },
      ];
    }

    let challenges = await CommunityChallenge.find(filter).sort({ createdAt: -1 });

    // Seed default challenges if empty
    if (challenges.length === 0 && !neighborhood) {
      const seedChallenges = [
        {
          titleAr: 'تحدي 1000 شجرة في الحزام الأخضر',
          titleFr: 'Défi 1000 Arbres pour la Ceinture Verte',
          descriptionAr: 'مبادرة بلدية جماعية لغرس الأشجار وتوسيع الرقعة الخضراء في الأحياء الحضرية.',
          descriptionFr: 'Initiative citoyenne pour la plantation d’arbres et la végétalisation urbaine.',
          category: 'trees',
          targetQuantity: 1000,
          currentQuantity: 340,
          neighborhood: 'Bab Ezzouar',
          city: 'Algiers',
          status: 'active',
        },
        {
          titleAr: 'تحدي الحي النظيف — 5 ساحات عمومية',
          titleFr: 'Défi Quartier Propre — 5 Espaces Publics',
          descriptionAr: 'تنظيف وتهيئة خمس مساحات وساحات لعب عمومية بالتعاون بين فرق الأحياء.',
          descriptionFr: 'Nettoyage et réaménagement de 5 espaces publics et aires de jeux en équipe.',
          category: 'cleanup',
          targetQuantity: 5,
          currentQuantity: 3,
          neighborhood: 'Bab Ezzouar',
          city: 'Algiers',
          status: 'active',
        },
        {
          titleAr: 'تحدي 500 سلة شتوية للعائلات',
          titleFr: 'Défi 500 Paniers Solidaires d’Hiver',
          descriptionAr: 'تجهيز وتوزيع 500 طرد شتوي ومستلزمات تدفئة للأسر المتعففة.',
          descriptionFr: 'Préparation et distribution de 500 colis d’hiver et kits thermiques aux familles.',
          category: 'families',
          targetQuantity: 500,
          currentQuantity: 215,
          neighborhood: 'Belouizdad',
          city: 'Algiers',
          status: 'active',
        },
        {
          titleAr: 'تحدي 300 متبرع بالدم للمستشفيات',
          titleFr: 'Défi 300 Donneurs de Sang',
          descriptionAr: 'حملة استجابة عاجلة لدعم بنوك الدم في المستشفيات الجامعية الكبرى.',
          descriptionFr: 'Campagne de mobilisation d’urgence pour réapprovisionner les banques de sang.',
          category: 'blood_donation',
          targetQuantity: 300,
          currentQuantity: 142,
          neighborhood: 'All',
          city: 'Algiers',
          status: 'active',
        },
      ];
      challenges = await CommunityChallenge.insertMany(seedChallenges);
    }

    const withProgress = challenges.map((c: any) => {
      const pct = Math.min(100, Math.round((c.currentQuantity / (c.targetQuantity || 1)) * 100));
      return {
        ...c.toObject(),
        progressPercentage: pct,
        remainingQuantity: Math.max(0, c.targetQuantity - c.currentQuantity),
      };
    });

    res.json({ ok: true, data: withProgress });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

// POST /challenges — Create a new Community Challenge (Org / Admin only)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { titleAr, titleFr, descriptionAr, descriptionFr, category, targetQuantity, neighborhood, city } = req.body;

    if (!titleAr || !targetQuantity || !category) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Titre en arabe, quantité cible et catégorie requis' },
      });
    }

    const challenge = new CommunityChallenge({
      titleAr: titleAr.trim(),
      titleFr: titleFr ? titleFr.trim() : titleAr.trim(),
      descriptionAr: descriptionAr || '',
      descriptionFr: descriptionFr || '',
      category,
      targetQuantity: Number(targetQuantity),
      currentQuantity: 0,
      neighborhood: neighborhood || 'Bab Ezzouar',
      city: city || 'Algiers',
      status: 'active',
    });

    await challenge.save();
    res.status(201).json({ ok: true, data: challenge });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

// GET /challenges/:id — Challenge detail
router.get('/:id', async (req, res) => {
  try {
    const challenge = await CommunityChallenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ ok: false, error: { message: 'Défi introuvable' } });
    }

    const pct = Math.min(
      100,
      Math.round((challenge.currentQuantity / (challenge.targetQuantity || 1)) * 100)
    );

    res.json({
      ok: true,
      data: {
        ...challenge.toObject(),
        progressPercentage: pct,
        remainingQuantity: Math.max(0, challenge.targetQuantity - challenge.currentQuantity),
      },
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

export default router;
