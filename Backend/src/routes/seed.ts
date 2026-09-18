import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Organization, Mission, MissionNeed, Application, Notification, Review } from '../models';

const router = Router();

// POST /api/seed
router.post('/', async (req: Request, res: Response) => {
  try {
    // 1. Clean collections for a fresh demo run
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Mission.deleteMany({}),
      MissionNeed.deleteMany({}),
      Application.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({}),
    ]);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 2. Seed Organization Admin User
    const orgUser = await User.create({
      name: 'طارق بوعلام (رئيس جمعية بشبابنا)',
      email: 'org@volunova.dz',
      passwordHash,
      role: 'organization',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      city: 'Algiers',
      phone: '+213 550 12 34 56',
    });

    const org = await Organization.create({
      userId: orgUser._id,
      name: 'جمعية بشبابنا — Be Shababina Association',
      category: 'Environmental & Youth',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      totalMissions: 5,
      totalVolunteersMobilized: 142,
    });

    // 3. Seed Volunteers (Ahmed is the demo hero)
    const ahmed = await User.create({
      name: 'أحمد بن علي',
      email: 'ahmed@volunova.dz',
      passwordHash,
      role: 'volunteer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      skills: ['Graphic Design', 'Drone Videography', 'Photography'],
      city: 'Algiers',
      impactHours: 34,
      reliabilityScore: 98,
      bio: 'مصمم جرافيك ومحب للتصوير الجوي، شغوف بالعمل المجوعي وحماية الطبيعة في الجزائر.',
      phone: '+213 661 98 76 54',
    });

    const sarah = await User.create({
      name: 'سارة منصوري',
      email: 'sarah@volunova.dz',
      passwordHash,
      role: 'volunteer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      skills: ['Visual Identity', 'Graphic Design', 'Social Media'],
      city: 'Algiers',
      impactHours: 28,
      reliabilityScore: 95,
      bio: 'مصممة هوية بصرية وكاتبة محتوى.',
    });

    const karim = await User.create({
      name: 'كريم زياني',
      email: 'karim@volunova.dz',
      passwordHash,
      role: 'volunteer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      skills: ['Manual Labor', 'Tree Planting', 'Logistics'],
      city: 'Algiers',
      impactHours: 52,
      reliabilityScore: 94,
      bio: 'متطوع ميداني، متخصص في الغرس وحملات النظافة.',
    });

    const nour = await User.create({
      name: 'نور الهدى بلقاسم',
      email: 'nour@volunova.dz',
      passwordHash,
      role: 'volunteer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      skills: ['First Aid', 'Registration', 'Healthcare'],
      city: 'Algiers',
      impactHours: 46,
      reliabilityScore: 99,
      bio: 'طالبة طب ومسعفة متطوعة معتمدة.',
    });

    const yacine = await User.create({
      name: 'ياسين حداد',
      email: 'yacine@volunova.dz',
      passwordHash,
      role: 'volunteer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      skills: ['Manual Labor', 'First Aid', 'Field Work'],
      city: 'Cheraga',
      impactHours: 18,
      reliabilityScore: 92,
      bio: 'متطوع نشط في بلدية الشراقة وضواحيها.',
    });

    // 4. Seed Live Mission for the Demo Pitch
    const demoMission = await Mission.create({
      orgId: org._id,
      title: 'حملة تشجير غابة بوشاوي الكبرى — مبادرة المليون شجرة',
      description: 'انضم إلينا في حملة كبرى لإعادة تشجير غابة بوشاوي بعد الحرائق الأخيرة. نحتاج أيدي عاملة للغرس، درون لتوثيق المساحات المغروسة، ومصمم جرافيك لإطلاق ملصقات التوعية البيئية.',
      category: 'Environmental',
      venueName: 'غابة بوشاوي، الجزائر العاصمة',
      urgency: 'high',
      status: 'active',
      dateStart: new Date(Date.now() + 86400000 * 2), // in 2 days
      estimatedHoursPerVolunteer: 4,
      totalSlotsNeeded: 12,
      totalSlotsFilled: 7,
      location: {
        type: 'Point',
        coordinates: [2.9038, 36.7212], // Bouchaoui
      },
    });

    // 5. Seed Mission Needs for Bouchaoui
    const needDiggers = await MissionNeed.create({
      missionId: demoMission._id,
      roleName: 'عمال يدويين لغرس الأشجار والحفر',
      skillTag: 'Manual Labor',
      icon: 'hammer',
      quantityNeeded: 10,
      quantityFulfilled: 7, // 7 already filled
      equipmentRequired: 'مجرفة وقفازات سميكة',
    });

    const needDrone = await MissionNeed.create({
      missionId: demoMission._id,
      roleName: 'مصور فيديو ومحترف درون',
      skillTag: 'Drone Videography',
      icon: 'camera',
      quantityNeeded: 1,
      quantityFulfilled: 0, // open
      equipmentRequired: 'درون بدقة 4K',
    });

    const needDesigner = await MissionNeed.create({
      missionId: demoMission._id,
      roleName: 'مصمم جرافيك وبوسترات التوعية',
      skillTag: 'Graphic Design',
      icon: 'palette',
      quantityNeeded: 1,
      quantityFulfilled: 0, // open for Ahmed!
      equipmentRequired: 'حاسوب محمول للعمل السريع',
    });

    // 6. Seed Additional Real-world Missions (Health & Humanitarian)
    const medicalMission = await Mission.create({
      orgId: org._id,
      title: '🩺 قافلة الأمل الطبية — فحص أطفال القرى المعزولة',
      description: 'قافلة طبية تطوعية لفحص أطفال المدارس الابتدائية في المناطق والقرى المعزولة بولاية البليدة. تقديم كشوفات مجانية لطب العيون، طب الأطفال، وتوزيع حقائب إسعاف أولية.',
      category: 'Health',
      venueName: 'مدرسة الشهداء، جبال الأطلس البليدي',
      urgency: 'urgent',
      status: 'active',
      dateStart: new Date(Date.now() + 86400000 * 5),
      estimatedHoursPerVolunteer: 6,
      totalSlotsNeeded: 7,
      totalSlotsFilled: 3,
      location: {
        type: 'Point',
        coordinates: [2.8277, 36.4700], // Blida
      },
    });

    await MissionNeed.create({
      missionId: medicalMission._id,
      roleName: 'أطباء أطفال وممرضين معتمدين',
      skillTag: 'First Aid',
      icon: 'heart',
      quantityNeeded: 3,
      quantityFulfilled: 1,
      equipmentRequired: 'سماعة طبية ومعقمات',
    });

    await MissionNeed.create({
      missionId: medicalMission._id,
      roleName: 'منظمي استقبال وتوجيه التلاميذ',
      skillTag: 'Logistics',
      icon: 'users',
      quantityNeeded: 4,
      quantityFulfilled: 2,
      equipmentRequired: 'سترات تطوع وسجلات',
    });

    const ramadanMission = await Mission.create({
      orgId: org._id,
      title: '📦 توزيع قفف رمضان العاجلة — إغاثة العائلات المعوزة',
      description: 'حملة طارئة لتعبئة وتوزيع 500 قفة رمضانية محملة بالمواد الأساسية لفائدة العائلات المعوزة وذوي الدخل المحدود في بلدية براقي والمناطق المجاورة.',
      category: 'Humanitarian',
      venueName: 'المستودع المركزي للهلال، براقي',
      urgency: 'high',
      status: 'active',
      dateStart: new Date(Date.now() + 86400000 * 3),
      estimatedHoursPerVolunteer: 4,
      totalSlotsNeeded: 8,
      totalSlotsFilled: 5,
      location: {
        type: 'Point',
        coordinates: [3.0900, 36.6600], // Baraki
      },
    });

    await MissionNeed.create({
      missionId: ramadanMission._id,
      roleName: 'متطوعين لفرز وتعبئة الطرود الغذائية',
      skillTag: 'Manual Labor',
      icon: 'package',
      quantityNeeded: 6,
      quantityFulfilled: 4,
      equipmentRequired: 'قفازات وأشرطة لاصقة',
    });

    await MissionNeed.create({
      missionId: ramadanMission._id,
      roleName: 'سائقي شاحنات توزيع ميداني',
      skillTag: 'Logistics',
      icon: 'truck',
      quantityNeeded: 2,
      quantityFulfilled: 1,
      equipmentRequired: 'رخصة سياقة صنف ب أو ج',
    });

    // Seed Notification for Ahmed
    await Notification.create({
      userId: ahmed._id,
      type: 'mission_matched',
      payload: {
        missionId: demoMission._id,
        title: demoMission.title,
        matchedRole: 'مصمم جرافيك وبوسترات التوعية',
        matchScore: 98,
        message: 'تمت مطابقتك بنسبة 98% مع حملة تشجير غابة بوشاوي كـ مصمم جرافيك!',
      },
      channel: 'in_app',
    });

    return res.json({
      ok: true,
      message: 'Database successfully seeded with demo accounts and active mission!',
      data: {
        demoMissionId: demoMission._id,
        targetNeedIdForJoin: needDesigner._id,
        demoUsers: {
          org: { email: 'org@volunova.dz', password: 'password123' },
          ahmed: { id: ahmed._id, email: 'ahmed@volunova.dz', password: 'password123', matchScore: 98 },
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SEED_ERROR', message: err.message } });
  }
});

export default router;
