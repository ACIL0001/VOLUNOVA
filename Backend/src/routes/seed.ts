import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Organization, Mission, MissionNeed, Application, Notification, Review, AuditLog } from '../models';

const router = Router();

// POST /api/seed - Resets database to clean state with only standard admin
router.post('/', async (req: Request, res: Response) => {
  try {
    // 1. Purge all mock data from collections
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Mission.deleteMany({}),
      MissionNeed.deleteMany({}),
      Application.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 2. Standard Admin Credentials
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin1234', salt);

    const adminUser = await User.create({
      name: 'Administrateur Système',
      email: 'admin@gmail.com',
      passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      city: 'Alger',
      phone: '+213 21 00 00 00',
      impactHours: 0,
      reliabilityScore: 100,
    });

    return res.json({
      ok: true,
      message: 'Base de données réinitialisée avec succès sans données fictives.',
      data: {
        admin: {
          id: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
        },
      },
    });
  } catch (err: any) {
    console.error('Database reset failed:', err);
    return res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

export default router;
