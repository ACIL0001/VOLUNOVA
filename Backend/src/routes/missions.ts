import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Mission, MissionNeed, Application, User, Organization, Notification, Squad, CommunityChallenge } from '../models';
import { authenticateToken, optionalToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import { triggerRealtimeEvent } from '../config/pusher';
import { calculateMatchScore, findBestMatchingSkill } from '../services/smartMatcher';
import { logAuditEvent } from '../services/auditLogger';
import { sendMissionAcceptedEmail } from '../services/emailService';
import { emitToUser, emitToMission } from '../config/socket';
import { sendExpoPushNotification } from '../services/pushNotifier';
import { evaluateUserStatus } from '../services/statusService';

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
      skillTag: z.string().min(2).max(150),
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

// GET /api/missions/my-applications — Get applications submitted by the logged-in volunteer
router.get(
  '/my-applications',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const volunteerId = req.user!.userId;
      const applications = await Application.find({ volunteerId }).lean();
      return res.json({ ok: true, data: applications });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// GET /api/missions/mine — Organization's own missions only (BOLA: ownership via org.userId)
router.get(
  '/mine',
  authenticateToken,
  requireRole(['organization', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;

      let org = await Organization.findOne({ userId }).lean();

      // Admins may inspect a specific org via ?orgId=
      if (role === 'admin' && req.query.orgId) {
        org = await Organization.findById(String(req.query.orgId)).lean();
      }

      if (!org) {
        return res.json({
          ok: true,
          data: { organization: null, missions: [] },
        });
      }

      // Non-admin: enforce ownership (BOLA)
      if (role !== 'admin' && String(org.userId) !== String(userId)) {
        return res.status(403).json({
          ok: false,
          error: { code: 'FORBIDDEN', message: 'You do not own this organization.' },
        });
      }

      const missions = await Mission.find({ orgId: org._id })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      const missionIds = missions.map((m) => m._id);
      const allNeeds = await MissionNeed.find({ missionId: { $in: missionIds } }).lean();

      const allApplications = await Application.find({ missionId: { $in: missionIds } })
        .populate('volunteerId', 'name email avatar skills city reliabilityScore impactHours')
        .populate('needId', 'roleName skillTag icon')
        .sort({ createdAt: -1 })
        .lean();

      const enriched = missions.map((m) => {
        const mid = m._id.toString();
        return {
          ...m,
          needs: allNeeds.filter((n) => n.missionId.toString() === mid),
          applicants: allApplications.filter((a) => a.missionId.toString() === mid),
        };
      });

      return res.json({
        ok: true,
        data: {
          organization: org,
          missions: enriched,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

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

    // Enrich each need with live fulfilled applications count from database
    const enrichedNeeds = await Promise.all(
      needs.map(async (n) => {
        const liveFulfilled = await Application.countDocuments({
          needId: n._id,
          status: { $in: ['accepted', 'pending'] },
        });
        return {
          ...n,
          quantityFulfilled: liveFulfilled,
        };
      })
    );

    // Find real recommended volunteers genuinely matching these needs
    const volunteers = await User.find({ role: 'volunteer' })
      .select('name avatar city skills impactHours reliabilityScore bio')
      .limit(20)
      .lean();

    const matchedVolunteers = volunteers
      .map((vol) => {
        let maxScore = 0;
        let matchedRole = '';
        let matchingSkill = '';

        for (const need of enrichedNeeds) {
          const score = calculateMatchScore(
            { skills: vol.skills || [], city: vol.city || 'Algiers', reliabilityScore: vol.reliabilityScore || 0 },
            { skillTag: need.skillTag, targetCity: mission.venueName?.includes('Algiers') ? 'Algiers' : (mission.wilaya || 'Algiers') }
          );
          if (score > maxScore) {
            maxScore = score;
            matchedRole = need.roleName;
            matchingSkill = findBestMatchingSkill(vol.skills || [], need.skillTag) || '';
          }
        }

        return {
          ...vol,
          matchScore: maxScore,
          matchedRole: matchedRole || '',
          matchingSkill: matchingSkill || '',
        };
      })
      .filter((vol) => vol.matchScore >= 50 && !!vol.matchedRole)
      .sort((a, b) => b.matchScore - a.matchScore);

    // Check if the current user has already applied
    let userApplication = null;
    if (req.user) {
      userApplication = await Application.findOne({
        missionId: mission._id,
        volunteerId: req.user.userId,
      }).lean();
    }

    const liveTotalFilled = enrichedNeeds.reduce((sum, n) => sum + (n.quantityFulfilled || 0), 0);

    return res.json({
      ok: true,
      data: {
        ...mission,
        totalSlotsFilled: liveTotalFilled,
        needs: enrichedNeeds,
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

      const volunteer = await User.findById(volunteerId).select('+pushTokens');
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

      // ⚡ 1. Real-Time Socket.IO emit to volunteer (for in-app foreground header bell)
      emitToUser(volunteer._id, 'notification:new', {
        notification: notifDoc,
      });

      // 📱 2. Mobile Phone Push Notification (for background / closed app / lockscreen)
      if (volunteer.pushTokens && volunteer.pushTokens.length > 0) {
        sendExpoPushNotification({
          pushTokens: volunteer.pushTokens,
          title: '🎉 Félicitations ! Vous avez été sélectionné(e)',
          body: `L'organisation vous a sélectionné(e) pour le rôle "${need?.roleName || 'Bénévole'}" sur "${mission.title}". Touchez pour voir la mission.`,
          data: {
            missionId: mission._id.toString(),
            needId: need?._id?.toString(),
            type: 'mission_selected',
          },
        }).catch((err) => console.warn('[Invite Push Notification Error]:', err));
      }

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

// PATCH /api/missions/:id/applications/:appId/select (Select an applicant)
router.patch(
  '/:id/applications/:appId/select',
  authenticateToken,
  requireRole(['organization', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id: missionId, appId } = req.params;
      const application = await Application.findOne({ _id: appId, missionId });
      if (!application) {
        return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
      }

      application.status = 'accepted';
      await application.save();

      const mission = await Mission.findById(missionId);
      const need = await MissionNeed.findById(application.needId);
      const volunteer = await User.findById(application.volunteerId).select('+pushTokens');

      if (volunteer) {
        const notifDoc = await Notification.create({
          userId: volunteer._id,
          type: 'application_accepted',
          payload: {
            missionId,
            needId: need?._id,
            roleName: need?.roleName || 'Bénévole',
            missionTitle: mission?.title || 'Mission',
            message: `Félicitations ! Votre candidature pour "${need?.roleName || 'Bénévole'}" sur "${mission?.title}" a été acceptée par l'organisation.`,
          },
          channel: 'in_app',
        });

        // 1. ⚡ Socket.IO real-time delivery
        emitToUser(volunteer._id, 'notification:new', { notification: notifDoc });

        // 2. 📱 Phone Push notification
        if (volunteer.pushTokens && volunteer.pushTokens.length > 0) {
          sendExpoPushNotification({
            pushTokens: volunteer.pushTokens,
            title: '🎉 Candidature Acceptée !',
            body: `Vous avez été sélectionné(e) pour "${need?.roleName || 'Bénévole'}" sur "${mission?.title}". Touchez pour voir les détails.`,
            data: {
              missionId: missionId.toString(),
              type: 'mission_selected',
            },
          }).catch((err) => console.warn('[Select Push Notification Error]:', err));
        }
      }

      return res.json({ ok: true, message: 'Candidat sélectionné avec succès', data: application });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// POST /api/missions/:id/complete — Finalize mission, log real outcome metrics, and broadcast Impact Story
router.post(
  '/:id/complete',
  authenticateToken,
  requireRole(['organization', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { headline, summary, photos, treesPlanted, familiesAssisted, wasteCollectedKg, beneficiariesCount } = req.body;

      const mission = await Mission.findById(id);
      if (!mission) {
        return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Mission non trouvée' } });
      }

      mission.status = 'completed';
      mission.completedAt = new Date();

      mission.impactMetrics = {
        treesPlanted: Number(treesPlanted) || 0,
        familiesAssisted: Number(familiesAssisted) || 0,
        wasteCollectedKg: Number(wasteCollectedKg) || 0,
        beneficiariesCount: Number(beneficiariesCount) || 0,
      };

      mission.outcomeStory = {
        headline: headline ? String(headline).trim() : 'مهمة تطوعية ناجحة أحدثت أثراً حقيقياً ❤️',
        summary: summary ? String(summary).trim() : 'شكراً لجميع المتطوعين الذين شاركوا في صنع هذا الأثر الميداني.',
        photos: Array.isArray(photos) ? photos : [],
        publishedAt: new Date(),
      };

      await mission.save();

      // Find all volunteers who applied and were accepted
      const applications = await Application.find({
        missionId: mission._id,
        status: { $in: ['accepted', 'attended'] },
      });

      const hours = mission.estimatedHoursPerVolunteer || 4;

      for (const app of applications) {
        if (app.status !== 'attended') {
          app.status = 'attended';
          await app.save();
        }

        const volunteer = await User.findById(app.volunteerId).select('+pushTokens');
        if (!volunteer) continue;

        // Check if this was their first mission and they were referred
        if (volunteer.referredBy) {
          const pastAttended = await Application.countDocuments({
            volunteerId: volunteer._id,
            status: 'attended',
          });
          if (pastAttended === 1) {
            // First mission completed! Reward referrer
            const referrer = await User.findById(volunteer.referredBy);
            if (referrer) {
              referrer.referralsCompletedCount = (referrer.referralsCompletedCount || 0) + 1;
              await referrer.save();
              await evaluateUserStatus(referrer._id.toString());

              await Notification.create({
                userId: referrer._id,
                type: 'slot_fulfilled',
                payload: {
                  title: '🤝 وسام باني المجتمع في انتظارك!',
                  message: `أكمل صديقك المدعو أول مهمة ميدانية له بنجاح!`,
                },
                channel: 'in_app',
              });
            }
          }
        }

        // Re-evaluate volunteer level status
        await evaluateUserStatus(volunteer._id.toString());

        // Update squad impact if volunteer belongs to a squad
        if (volunteer.squadId) {
          await Squad.findByIdAndUpdate(volunteer.squadId, {
            $inc: {
              missionsCompletedCount: 1,
              totalImpactHours: hours,
              treesPlanted: mission.impactMetrics.treesPlanted,
              familiesHelped: mission.impactMetrics.familiesAssisted,
            },
          });
        }

        // Notify volunteer with the emotional impact story
        const notifDoc = await Notification.create({
          userId: volunteer._id,
          type: 'slot_fulfilled',
          payload: {
            missionId: mission._id,
            title: 'أنت ساهمت في تحقيق هذا ❤️',
            message: mission.outcomeStory.headline,
            outcomeHeadline: mission.outcomeStory.headline,
            outcomeSummary: mission.outcomeStory.summary,
          },
          channel: 'in_app',
        });

        emitToUser(volunteer._id, 'notification:new', { notification: notifDoc });

        if (volunteer.pushTokens && volunteer.pushTokens.length > 0) {
          sendExpoPushNotification({
            pushTokens: volunteer.pushTokens,
            title: 'أنت ساهمت في تحقيق هذا ❤️',
            body: mission.outcomeStory.headline,
            data: {
              missionId: mission._id.toString(),
              type: 'outcome_story',
            },
          }).catch(() => {});
        }
      }

      // If active Community Challenge in this neighborhood, update progress
      if (mission.neighborhood) {
        const matchingChallenge = await CommunityChallenge.findOne({
          $or: [
            { neighborhood: { $regex: new RegExp(mission.neighborhood, 'i') } },
            { neighborhood: 'All' },
          ],
          status: 'active',
        });

        if (matchingChallenge) {
          let delta = 1;
          if (matchingChallenge.category === 'trees' && mission.impactMetrics.treesPlanted > 0) {
            delta = mission.impactMetrics.treesPlanted;
          } else if (matchingChallenge.category === 'families' && mission.impactMetrics.familiesAssisted > 0) {
            delta = mission.impactMetrics.familiesAssisted;
          }

          matchingChallenge.currentQuantity = Math.min(
            matchingChallenge.targetQuantity,
            matchingChallenge.currentQuantity + delta
          );
          if (matchingChallenge.currentQuantity >= matchingChallenge.targetQuantity) {
            matchingChallenge.status = 'completed';
            matchingChallenge.celebrationPost = {
              victoryTitle: `🎉 نحن فعلناها! إنجاز ${matchingChallenge.titleAr}`,
              victoryMessage: `بجهود سواعد المتطوعين في ${mission.neighborhood}، تم تحقيق الهدف بنجاح!`,
              completedAt: new Date(),
              totalParticipants: applications.length,
            };
          }
          await matchingChallenge.save();
        }
      }

      return res.json({ ok: true, data: mission });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// GET /api/missions/:id/outcome-story — Retrieve mission's impact story
router.get('/:id/outcome-story', async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findById(req.params.id).select(
      'title category venueName neighborhood completedAt impactMetrics outcomeStory'
    );
    if (!mission) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Mission introuvable' } });
    }
    return res.json({ ok: true, data: mission });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
