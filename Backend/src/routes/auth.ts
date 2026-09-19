import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, Organization } from '../models';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import { logAuditEvent } from '../services/auditLogger';
import { normalizeSkillToBracketFormat } from '../services/skillsService';

const router = Router();
export const getJwtSecret = () => process.env.JWT_SECRET || 'volunova_jwt_fallback_secret_key_2026';

const SignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
  role: z.enum(['volunteer', 'organization']).default('volunteer'),
  skills: z.array(z.string()).optional(),
  city: z.string().default('Algiers'),
  phone: z.string().optional(),
  orgName: z.string().optional(),
  category: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
});

// POST /api/auth/signup
router.post(
  '/signup',
  rateLimit(10, 60000),
  validateBody(SignupSchema),
  async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, skills, city, phone, orgName, category } = req.body;

      // Ensure volunteers provide at least one valid skill
      if (role === 'volunteer' && (!skills || !Array.isArray(skills) || skills.filter((s: any) => typeof s === 'string' && s.trim().length > 0).length === 0)) {
        return res.status(400).json({
          ok: false,
          error: {
            code: 'SKILLS_REQUIRED',
            message: 'Au moins une compétence est requise pour créer un profil bénévole.',
          },
        });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({
          ok: false,
          error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists.' },
        });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const cleanedSkills = Array.isArray(skills)
        ? Array.from(new Set(skills.map((s: string) => normalizeSkillToBracketFormat(String(s).trim())).filter(Boolean)))
        : [];

      const user = await User.create({
        name,
        email,
        passwordHash,
        role,
        skills: role === 'volunteer' ? cleanedSkills : [],
        city: city || 'Algiers',
        phone: phone || '',
      });

      let organization = null;
      if (role === 'organization') {
        organization = await Organization.create({
          userId: user._id,
          name: orgName || name,
          category: category || 'Community Impact',
          verificationStatus: 'verified', // Pre-verified for demo convenience
          verifiedAt: new Date(),
        });
      }

      const token = jwt.sign(
        { sub: user._id.toString(), role: user.role, email: user.email },
        getJwtSecret(),
        { expiresIn: '30d' }
      );

      await logAuditEvent('user.signup', user._id.toString(), { email: user.email, role: user.role });

      return res.status(201).json({
        ok: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            city: user.city,
            skills: user.skills,
            impactHours: user.impactHours,
            reliabilityScore: user.reliabilityScore,
          },
          organization,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  rateLimit(15, 60000),
  validateBody(LoginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+passwordHash +failedLoginAttempts +lockUntil');

      if (user?.lockUntil && user.lockUntil > new Date()) {
        return res.status(429).json({
          ok: false,
          error: { code: 'ACCOUNT_LOCKED', message: 'Account temporarily locked due to failed attempts. Try again in 15 minutes.' },
        });
      }

      const dummyHash = '$2a$12$e8Y6l9b5W7GZ91x7tV7yZOGy44yqTqS7t9s1z0j1q3l5v7x9z1a2b';
      const isMatch = user && user.passwordHash
        ? await bcrypt.compare(password, user.passwordHash)
        : await bcrypt.compare(password, dummyHash);

      if (!user || !isMatch) {
        if (user) {
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          if (user.failedLoginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
            user.failedLoginAttempts = 0;
          }
          await user.save();
        }
        return res.status(401).json({
          ok: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        });
      }

      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      const organization = user.role === 'organization' ? await Organization.findOne({ userId: user._id }) : null;

      const token = jwt.sign(
        { sub: user._id.toString(), role: user.role, email: user.email },
        getJwtSecret(),
        { expiresIn: '30d' }
      );

      await logAuditEvent('user.login', user._id.toString(), { email: user.email });

      return res.json({
        ok: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            city: user.city,
            skills: user.skills,
            impactHours: user.impactHours,
            reliabilityScore: user.reliabilityScore,
          },
          organization,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const organization = user.role === 'organization' ? await Organization.findOne({ userId: user._id }) : null;

    return res.json({
      ok: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          avatar: user.avatar,
          city: user.city,
          skills: user.skills,
          impactHours: user.impactHours,
          reliabilityScore: user.reliabilityScore,
          bio: user.bio,
          createdAt: user.createdAt,
        },
        organization,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PATCH /api/auth/profile — Update volunteer or organization profile
router.patch('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Utilisateur introuvable' } });
    }

    const {
      name,
      city,
      phone,
      bio,
      skills,
      orgName,
      category,
      description,
      orgEmail,
      orgPhone,
      address,
      website,
      logo,
    } = req.body;

    // Update common user fields
    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof city === 'string') user.city = city.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof bio === 'string') user.bio = bio.trim();

    // If volunteer, update skills
    if (user.role === 'volunteer' && Array.isArray(skills)) {
      user.skills = Array.from(new Set(skills.map((s: any) => normalizeSkillToBracketFormat(String(s).trim())).filter(Boolean)));
    }

    await user.save();

    let organization = null;
    if (user.role === 'organization') {
      let org = await Organization.findOne({ userId });
      if (!org) {
        org = new Organization({
          userId: user._id,
          name: orgName || user.name,
          category: category || 'Community Impact',
        });
      }

      if (typeof orgName === 'string' && orgName.trim()) org.name = orgName.trim();
      if (typeof category === 'string' && category.trim()) org.category = category.trim();
      if (typeof description === 'string') org.description = description.trim();
      if (typeof orgEmail === 'string') org.email = orgEmail.trim().toLowerCase();
      if (typeof orgPhone === 'string') org.phone = orgPhone.trim();
      if (typeof address === 'string') org.address = address.trim();
      if (typeof city === 'string') org.city = city.trim();
      if (typeof website === 'string') org.website = website.trim();
      if (typeof logo === 'string') org.logo = logo.trim();

      await org.save();
      organization = org;
    }

    await logAuditEvent('user.profile_updated', String(userId), { role: user.role });

    return res.json({
      ok: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          avatar: user.avatar,
          city: user.city,
          skills: user.skills,
          impactHours: user.impactHours,
          reliabilityScore: user.reliabilityScore,
          bio: user.bio,
        },
        organization,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// GET /api/auth/volunteers (for smart matching pool)
router.get('/volunteers', async (req: Request, res: Response) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' })
      .select('name avatar city skills impactHours reliabilityScore bio')
      .limit(20)
      .lean();

    return res.json({ ok: true, data: volunteers });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
