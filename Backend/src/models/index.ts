import mongoose, { Schema, model, models } from 'mongoose';

// 1. USER SCHEMA — Hardened with PII Protection & Lockout
const UserSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  passwordHash: { type: String, select: false }, // Never returned in default queries
  role: {
    type: String,
    enum: ['volunteer', 'organization', 'admin'],
    default: 'volunteer',
  },
  avatar: { type: String, default: '' },
  phone: { type: String, select: false }, // Revealed only upon accepted RSVP
  skills: [{ type: String, trim: true, maxlength: 150, index: true }],
  city: { type: String, default: 'Algiers', trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [3.0588, 36.7538] }, // [lng, lat]
  },
  impactHours: { type: Number, default: 0, min: 0 },
  reliabilityScore: { type: Number, default: 0, min: 0, max: 100 },
  bio: { type: String, maxlength: 500, trim: true },
  pushTokens: [{ type: String, select: false }],
  failedLoginAttempts: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, select: false },

  // CIVIC MOTIVATION & RECOGNITION ENGINE (Levels 1-5, Squads, Appreciations)
  statusTier: {
    type: String,
    enum: ['level_1_new', 'level_2_active', 'level_3_trusted', 'level_4_leader', 'level_5_impact_maker'],
    default: 'level_1_new',
    index: true,
  },
  motivations: [{ type: String, trim: true }],
  neighborhood: { type: String, default: 'Bab Ezzouar', trim: true, index: true },
  squadId: { type: Schema.Types.ObjectId, ref: 'Squad', default: null, index: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  referralsCompletedCount: { type: Number, default: 0, min: 0 },
  appreciationsReceived: {
    thankYou: { type: Number, default: 0 },
    teamSpirit: { type: Number, default: 0 },
    vitalRole: { type: Number, default: 0 },
    problemSolver: { type: Number, default: 0 },
    mostReliable: { type: Number, default: 0 },
    creative: { type: Number, default: 0 },
    rapidResponder: { type: Number, default: 0 },
  },
  qualitativeBadges: [{
    type: { type: String, required: true },
    labelAr: { type: String, required: true },
    labelFr: { type: String, required: true },
    awardedAt: { type: Date, default: Date.now },
    missionTitle: { type: String, default: '' },
  }],
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

// 2. ORGANIZATION SCHEMA — Verification Document Lockdown & Profile
const OrganizationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  category: { type: String, default: 'Community Impact', trim: true },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  logo: { type: String, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: 'Algiers' },
  website: { type: String, trim: true, default: '' },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    index: true,
  },
  verificationDocs: [{ type: String, select: false }], // Protected Blob URLs
  verifiedAt: { type: Date },
  totalMissions: { type: Number, default: 0, min: 0 },
  totalVolunteersMobilized: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

// 3. MISSION SCHEMA — Lifecycle Invariants & Geo Index
const MissionSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  rawPrompt: { type: String, select: false },
  description: { type: String, trim: true, maxlength: 3000 },
  category: { type: String, default: 'Community', trim: true },
  venueName: { type: String, required: true, trim: true, maxlength: 150 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [3.0588, 36.7538] },
  },
  dateStart: { type: Date, default: Date.now },
  dateEnd: { type: Date },
  status: {
    type: String,
    enum: ['draft', 'active', 'in_progress', 'completed', 'cancelled'],
    default: 'active',
    index: true,
  },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  totalSlotsNeeded: { type: Number, default: 0, min: 0 },
  totalSlotsFilled: { type: Number, default: 0, min: 0 },
  estimatedHoursPerVolunteer: { type: Number, default: 4, min: 1, max: 24 },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String, trim: true, maxlength: 500 },

  // NEIGHBORHOOD & TANGIBLE IMPACT STORIES
  neighborhood: { type: String, default: 'Bab Ezzouar', trim: true, index: true },
  impactMetrics: {
    treesPlanted: { type: Number, default: 0 },
    familiesAssisted: { type: Number, default: 0 },
    wasteCollectedKg: { type: Number, default: 0 },
    beneficiariesCount: { type: Number, default: 0 },
  },
  outcomeStory: {
    headline: { type: String, default: '', trim: true },
    summary: { type: String, default: '', trim: true },
    photos: [{ type: String }],
    publishedAt: { type: Date },
  },
}, { timestamps: true });

MissionSchema.index({ location: '2dsphere' });
MissionSchema.index({ status: 1, createdAt: -1 });

// 4. MISSION NEED SCHEMA
const MissionNeedSchema = new Schema({
  missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true, index: true },
  roleName: { type: String, required: true, trim: true, maxlength: 100 },
  skillTag: { type: String, required: true, trim: true, maxlength: 150 },
  icon: { type: String, default: 'sparkles', trim: true },
  quantityNeeded: { type: Number, required: true, min: 1 },
  quantityFulfilled: { type: Number, default: 0, min: 0 },
  equipmentRequired: { type: String, trim: true, maxlength: 200 },
}, { timestamps: true });

// 5. APPLICATION SCHEMA — Concurrency & Anti-Tamper Hardening
const ApplicationSchema = new Schema({
  missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true, index: true },
  needId: { type: Schema.Types.ObjectId, ref: 'MissionNeed', required: true, index: true },
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  matchScore: { type: Number, default: 85, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['matched', 'applied', 'accepted', 'attended', 'rejected', 'cancelled'],
    default: 'applied',
    index: true,
  },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

ApplicationSchema.index({ missionId: 1, needId: 1, volunteerId: 1 }, { unique: true });

// 6. NOTIFICATION SCHEMA — Persisted Tenant Isolation
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: [
      'mission_matched',
      'slot_fulfilled',
      'application_accepted',
      'org_verified',
      'review_received',
      'admin_support_alert',
      'admin_support_reply',
    ],
    required: true,
  },
  payload: { type: Schema.Types.Mixed, required: true },
  channel: { type: String, enum: ['in_app', 'push', 'email'], default: 'in_app' },
  readAt: { type: Date, default: null },
}, { timestamps: true });

NotificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

// 7. REVIEW SCHEMA — Fraud & Spam Invariants
const ReviewSchema = new Schema({
  missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  direction: { type: String, enum: ['org_to_volunteer', 'volunteer_to_org'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true });

ReviewSchema.index({ missionId: 1, fromUserId: 1, toUserId: 1 }, { unique: true });

// 8. AUDIT LOG SCHEMA — Immutable security events
const AuditLogSchema = new Schema({
  actorId: { type: String, required: true },
  action: { type: String, required: true },
  targetId: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now, immutable: true },
});

// 9. SUPPORT TICKET SCHEMA — Organization Alerts, Reclamations & Admin Governance
const SupportTicketSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orgName: { type: String, required: true, trim: true },
  orgEmail: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['warning', 'reclamation', 'note', 'assistance'],
    default: 'note',
    required: true,
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  subject: { type: String, required: true, trim: true, maxlength: 250 },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  status: {
    type: String,
    enum: ['unread', 'in_progress', 'resolved'],
    default: 'unread',
    index: true,
  },
  adminReply: { type: String, trim: true, maxlength: 4000, default: '' },
  repliedAt: { type: Date },
  resolvedAt: { type: Date },
}, { timestamps: true });

SupportTicketSchema.index({ status: 1, createdAt: -1 });

// 10. SQUAD SCHEMA — Friends Volunteering Together
const SquadSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  avatar: { type: String, default: 'users' },
  leaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  neighborhood: { type: String, default: 'Bab Ezzouar', trim: true, index: true },
  city: { type: String, default: 'Algiers', trim: true },
  missionsCompletedCount: { type: Number, default: 0, min: 0 },
  totalImpactHours: { type: Number, default: 0, min: 0 },
  treesPlanted: { type: Number, default: 0, min: 0 },
  familiesHelped: { type: Number, default: 0, min: 0 },
  inviteCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
}, { timestamps: true });

SquadSchema.index({ neighborhood: 1, totalImpactHours: -1 });

// 11. COMMUNITY CHALLENGE SCHEMA — Collective Municipal Goals ("تحدي الحي")
const CommunityChallengeSchema = new Schema({
  titleAr: { type: String, required: true, trim: true },
  titleFr: { type: String, required: true, trim: true },
  descriptionAr: { type: String, default: '', trim: true },
  descriptionFr: { type: String, default: '', trim: true },
  category: {
    type: String,
    enum: ['trees', 'families', 'blood_donation', 'cleanup', 'education'],
    required: true,
    index: true,
  },
  targetQuantity: { type: Number, required: true, min: 1 },
  currentQuantity: { type: Number, default: 0, min: 0 },
  unitAr: { type: String, default: 'مستفيد', trim: true },
  unitFr: { type: String, default: 'bénéficiaire', trim: true },
  neighborhood: { type: String, default: 'Bab Ezzouar', trim: true, index: true },
  city: { type: String, default: 'Algiers', trim: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active',
    index: true,
  },
  celebrationPost: {
    victoryTitle: { type: String, default: '' },
    victoryMessage: { type: String, default: '' },
    completedAt: { type: Date },
    totalParticipants: { type: Number, default: 0 },
  },
}, { timestamps: true });

CommunityChallengeSchema.index({ neighborhood: 1, status: 1 });

// 12. APPRECIATION SCHEMA — Real Human Gratitude From Peers & Organizers
const AppreciationSchema = new Schema({
  missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: false, index: true },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: {
    type: String,
    enum: [
      'thank_you',
      'team_spirit',
      'vital_role',
      'problem_solver',
      'most_reliable',
      'creative',
      'rapid_responder',
    ],
    required: true,
  },
  note: { type: String, trim: true, maxlength: 500, default: '' },
}, { timestamps: true });

AppreciationSchema.index({ missionId: 1, fromUserId: 1, toUserId: 1 }, { sparse: true });
AppreciationSchema.index({ toUserId: 1, createdAt: -1 });

export const User = models.User || model('User', UserSchema);
export const Organization = models.Organization || model('Organization', OrganizationSchema);
export const Mission = models.Mission || model('Mission', MissionSchema);
export const MissionNeed = models.MissionNeed || model('MissionNeed', MissionNeedSchema);
export const Application = models.Application || model('Application', ApplicationSchema);
export const Notification = models.Notification || model('Notification', NotificationSchema);
export const Review = models.Review || model('Review', ReviewSchema);
export const AuditLog = models.AuditLog || model('AuditLog', AuditLogSchema);
export const SupportTicket = models.SupportTicket || model('SupportTicket', SupportTicketSchema);
export const Squad = models.Squad || model('Squad', SquadSchema);
export const CommunityChallenge = models.CommunityChallenge || model('CommunityChallenge', CommunityChallengeSchema);
export const Appreciation = models.Appreciation || model('Appreciation', AppreciationSchema);
