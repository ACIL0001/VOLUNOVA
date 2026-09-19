import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Mission, MissionNeed, Application, User, Organization, Notification } from '../models';
import { authenticateToken, optionalToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import { triggerRealtimeEvent } from '../config/pusher';
import { calculateMatchScore } from '../services/smartMatcher';
import { logAuditEvent } from '../services/auditLogger';
import { sendMissionAcceptedEmail } from '../services/emailService';
import { emitToUser, emitToMission } from '../config/socket';

const router = Router();

const CreateMissionSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  category: z.string().default('Community'),
  venueName: z.string().min(2).max(150),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimatedHoursPerVolunteer: z.number().min(1).max(24).default(4),
  rawPrompt: z.string().optional(),
  needs: z.array(
    z.object({
      roleName: z.string().min(2).max(100),
      skillTag: z.string().min(2).max(50),
      icon: z.string().default('sparkles'),
      quantityNeeded: z.number().int().min(1).max(100),
      equipmentRequired: z.string().optional(),
    })
  ).min(1),
});

// GET /api/missions
router.get('/', optionalToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, urgency, status, city } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;

    const missions = await Mission.find(query)
      .populate('orgId', 'name logo category verificationStatus')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Attach needs to each mission
    const missionIds = missions.map((m) => m._id);
    const allNeeds = await MissionNeed.find({ missionId: { $in: missionIds } }).lean();

    const enriched = missions.map((m) => {
      const needs = allNeeds.filter((n) => n.missionId.toString() === m._id.toString());
      return {
        ...m,
        needs,
      };
    });

    return res.json({ ok: true, data: enriched });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// GET /api/missions/:id
router.get('/:id', optionalToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('orgId', 'name logo category verificationStatus')
      .lean();

    if (!mission) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Mission not found' } });
    }

    const needs = await MissionNeed.find({ missionId: mission._id }).lean();

    // Find recommended volunteers matching these needs
    const volunteers = await User.find({ role: 'volunteer' })
      .select('name avatar city skills impactHours reliabilityScore bio')
      .limit(15)
      .lean();

    const matchedVolunteers = volunteers.map((vol) => {
      let maxScore = 0;
      let matchedRole = '';

      for (const need of needs) {
        const score = calculateMatchScore(
          { skills: vol.skills || [], city: vol.city || 'Algiers', reliabilityScore: vol.reliabilityScore || 0 },
          { skillTag: need.skillTag, targetCity: mission.venueName?.includes('Algiers') ? 'Algiers' : (mission.wilaya || 'Algiers') }
        );
        if (score > maxScore) {
          maxScore = score;
          matchedRole = need.roleName;
        }
      }

      return {
        ...vol,
        matchScore: maxScore,
        matchedRole: matchedRole || (needs[0]?.roleName || 'Volunteer'),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Check if the current user has already applied
    let userApplication = null;
    if (req.user) {
      userApplication = await Application.findOne({
        missionId: mission._id,
        volunteerId: req.user.userId,
      }).lean();
    }

    return res.json({
      ok: true,
      data: {
        ...mission,
        needs,
        matchedVolunteers,
        userApplication,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/missions (Create & Publish Mission)
router.post(
  '/',
  authenticateToken,
  requireRole(['organization', 'admin']),
  validateBody(CreateMissionSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, description, category, venueName, urgency, estimatedHoursPerVolunteer, rawPrompt, needs } = req.body;

      // Find organization owned by user
      let org = await Organization.findOne({ userId: req.user!.userId });
      if (!org) {
        org = await Organization.create({
          userId: req.user!.userId,
          name: 'جمعية بصمة أمل',
          category: 'Community Impact',
          verificationStatus: 'verified',
        });
      }

      const totalSlots = needs.reduce((acc: number, n: any) => acc + (n.quantityNeeded || 1), 0);

      const mission = await Mission.create({
        orgId: org._id,
        title,
        description: description || `مبادرة تطوعية تهدف إلى خدمة المجتمع في ${venueName}.`,
        category: category || 'Community',
        venueName,
        urgency: urgency || 'medium',
        estimatedHoursPerVolunteer: estimatedHoursPerVolunteer || 4,
        rawPrompt: rawPrompt || '',
        status: 'active',
        totalSlotsNeeded: totalSlots,
        totalSlotsFilled: 0,
        location: {
          type: 'Point',
          coordinates: [3.0588, 36.7538],
        },
      });

      const needDocs = await MissionNeed.insertMany(
        needs.map((n: any) => ({
          missionId: mission._id,
          roleName: n.roleName,
          skillTag: n.skillTag,
          icon: n.icon || 'sparkles',
          quantityNeeded: n.quantityNeeded,
          quantityFulfilled: 0,
          equipmentRequired: n.equipmentRequired || '',
        }))
      );

      await Organization.findByIdAndUpdate(org._id, { $inc: { totalMissions: 1 } });

      await logAuditEvent('mission.create', req.user!.userId, { missionId: mission._id, title: mission.title });

      // Broadcast mission created to realtime stream
      await triggerRealtimeEvent('missions', 'mission_created', {
        missionId: mission._id,
        title: mission.title,
        venueName: mission.venueName,
        totalSlotsNeeded: mission.totalSlotsNeeded,
      });

      return res.status(201).json({
        ok: true,
        data: {
          ...mission.toObject(),
          needs: needDocs,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// POST /api/missions/:id/join (1-Tap Atomic RSVP)
router.post(
  '/:id/join',
  rateLimit(20, 60000),
  authenticateToken,
  requireRole(['volunteer']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { needId } = req.body;
      const volunteerId = req.user!.userId;
      const missionId = req.params.id;

      if (!needId) {
        return res.status(400).json({ ok: false, error: { code: 'MISSING_NEED_ID', message: 'needId is required' } });
      }

      // Check if user has already joined this mission
      const existingApplication = await Application.findOne({ missionId, volunteerId });
      if (existingApplication) {
        return res.status(400).json({
          ok: false,
          error: { code: 'ALREADY_JOINED', message: 'لقد سجلت بالفعل في هذه المهمة التطوعية.' },
        });
      }

      // 1. Atomic Slot Increment with Precondition Lock
      const updatedNeed = await MissionNeed.findOneAndUpdate(
        {
          _id: needId,
          missionId,
          $expr: { $lt: ['$quantityFulfilled', '$quantityNeeded'] },
        },
        { $inc: { quantityFulfilled: 1 } },
        { new: true }
      );

      if (!updatedNeed) {
        return res.status(409).json({
          ok: false,
          error: { code: 'SLOT_FULL', message: 'اكتملت المقاعد المخصصة لهذا الدور بالفعل.' },
        });
      }

      // 2. Persist Application
      try {
        const volunteer = await User.findById(volunteerId);
        const matchScore = volunteer
          ? calculateMatchScore(
              { skills: volunteer.skills || [], city: volunteer.city || 'Algiers', reliabilityScore: volunteer.reliabilityScore || 0 },
              { skillTag: updatedNeed.skillTag, targetCity: 'Algiers' }
            )
          : 0;

        const application = await Application.create({
          missionId,
          needId,
          volunteerId,
          matchScore,
          status: 'accepted',
          appliedAt: new Date(),
        });

        // 3. Update Mission & User Stats
        const mission = await Mission.findByIdAndUpdate(
          missionId,
          { $inc: { totalSlotsFilled: 1 } },
          { new: true }
        );

        const hoursGained = mission?.estimatedHoursPerVolunteer || 4;
        await User.findByIdAndUpdate(volunteerId, { $inc: { impactHours: hoursGained } });

        // Create in-app notification for volunteer
        await Notification.create({
          userId: volunteerId,
          type: 'slot_fulfilled',
          payload: {
            missionId,
            title: mission?.title || 'مهمة تطوعية',
            message: `تهانينا! لقد انضممت بنجاح إلى "${mission?.title}". دورك: ${updatedNeed.roleName}.`,
          },
          channel: 'in_app',
        });

        // Create in-app notification for the organization
        if (mission?.orgId) {
          let orgUserId = null;
          const org = await Organization.findById(mission.orgId);
          if (org?.userId) {
            orgUserId = org.userId;
          } else {
            const directUser = await User.findById(mission.orgId);
            if (directUser) {
              orgUserId = directUser._id;
            }
          }

          if (orgUserId) {
            const notifDoc = await Notification.create({
              userId: orgUserId,
              type: 'application_accepted',
              payload: {
                missionId,
                volunteerId,
                volunteerName: volunteer?.name || 'Bénévole',
                roleName: updatedNeed.roleName,
                missionTitle: mission.title,
                message: `${volunteer?.name || 'Un bénévole'} a accepté l'invitation pour la mission "${mission.title}" (Rôle: ${updatedNeed.roleName}).`,
              },
              channel: 'in_app',
            });

            // ⚡ Real-Time Socket.IO direct push to organization
            emitToUser(orgUserId, 'notification:new', {
              notification: notifDoc,
            });

            // ⚡ Real-Time Socket.IO push to mission room
            emitToMission(missionId, 'slot_updated', {
              needId: updatedNeed._id,
              roleName: updatedNeed.roleName,
              quantityFulfilled: updatedNeed.quantityFulfilled,
              quantityNeeded: updatedNeed.quantityNeeded,
              totalSlotsFilled: mission?.totalSlotsFilled,
              totalSlotsNeeded: mission?.totalSlotsNeeded,
              volunteerName: volunteer?.name || 'متطوع جديد',
            });

            await triggerRealtimeEvent(`user-${orgUserId}`, 'notification_received', {
              type: 'application_accepted',
              volunteerName: volunteer?.name,
              roleName: updatedNeed.roleName,
              missionTitle: mission.title,
            }).catch(() => {});
          }
        }

        await logAuditEvent('mission.join', volunteerId, { missionId, needId });

        // 3b. Dispatch Confirmation Email via Nodemailer / Resend
        if (volunteer?.email) {
          sendMissionAcceptedEmail({
            to: volunteer.email,
            volunteerName: volunteer.name || 'Bénévole',
            missionTitle: mission?.title || 'Mission Volunova',
            roleName: updatedNeed.roleName,
            venue: mission?.venueName || 'Lieu convenu',
            date: mission?.dateStart,
            hours: hoursGained,
            applicationId: application._id.toString(),
          }).catch((err) => console.error('[Missions] Background email send error:', err));
        }

        // 4. Realtime Broadcast to Mission Room (Pusher)
        await triggerRealtimeEvent(`mission-${missionId}`, 'slot_updated', {
          needId: updatedNeed._id,
          roleName: updatedNeed.roleName,
          quantityFulfilled: updatedNeed.quantityFulfilled,
          quantityNeeded: updatedNeed.quantityNeeded,
          totalSlotsFilled: mission?.totalSlotsFilled,
          totalSlotsNeeded: mission?.totalSlotsNeeded,
          volunteerName: volunteer?.name || 'متطوع جديد',
          volunteerAvatar: volunteer?.avatar || '/avatars/default.png',
        });

        return res.json({
          ok: true,
          data: {
            application,
            need: updatedNeed,
            impactHoursAdded: hoursGained,
          },
        });
      } catch (innerErr: any) {
        // Roll back the slot increment if application creation failed
        await MissionNeed.findByIdAndUpdate(needId, { $inc: { quantityFulfilled: -1 } });
        if (innerErr.code === 11000) {
          return res.status(400).json({ ok: false, error: { code: 'ALREADY_JOINED', message: 'لقد سجلت بالفعل.' } });
        }
        throw innerErr;
      }
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// POST /api/missions/:id/invite (Dispatch targeted invitation to volunteer)
router.post(
  '/:id/invite',
  rateLimit(30, 60000),
  authenticateToken,
  requireRole(['organization', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { volunteerId, needId } = req.body;
      const missionId = req.params.id;

      const mission = await Mission.findById(missionId);
      if (!mission) {
        return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Mission not found' } });
      }

      const volunteer = await User.findById(volunteerId);
      if (!volunteer) {
        return res.status(404).json({ ok: false, error: { code: 'VOLUNTEER_NOT_FOUND', message: 'Volunteer not found' } });
      }

      const need = needId ? await MissionNeed.findById(needId) : await MissionNeed.findOne({ missionId });

      const notifDoc = await Notification.create({
        userId: volunteer._id,
        type: 'mission_matched',
        payload: {
          missionId,
          needId: need?._id,
          roleName: need?.roleName || 'Bénévole',
          missionTitle: mission.title,
          message: `L'organisation vous a invité(e) pour le rôle "${need?.roleName || 'Bénévole'}" sur la mission "${mission.title}".`,
        },
        channel: 'in_app',
      });

      // ⚡ Real-Time Socket.IO emit to volunteer
      emitToUser(volunteer._id, 'notification:new', {
        notification: notifDoc,
      });

      return res.json({ ok: true, message: 'Invitation envoyée avec succès' });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// GET /api/missions/:id/applicants (BOLA protected)
router.get('/:id/applicants', authenticateToken, requireRole(['organization', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Mission not found' } });
    }

    const applications = await Application.find({ missionId: mission._id })
      .populate('volunteerId', 'name email avatar skills city reliabilityScore impactHours phone')
      .populate('needId', 'roleName skillTag icon')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, data: applications });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
