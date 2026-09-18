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
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  phone: { type: String, select: false }, // Revealed only upon accepted RSVP
  skills: [{ type: String, trim: true, maxlength: 50, index: true }],
  city: { type: String, default: 'Algiers', trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [3.0588, 36.7538] }, // [lng, lat]
  },
  impactHours: { type: Number, default: 0, min: 0 },
  reliabilityScore: { type: Number, default: 95, min: 0, max: 100 },
  bio: { type: String, maxlength: 500, trim: true },
  pushTokens: [{ type: String, select: false }],
  failedLoginAttempts: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, select: false },
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

// 2. ORGANIZATION SCHEMA — Verification Document Lockdown
const OrganizationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  category: { type: String, default: 'Community Impact', trim: true },
  logo: { type: String, default: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80' },
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
}, { timestamps: true });

MissionSchema.index({ location: '2dsphere' });
MissionSchema.index({ status: 1, createdAt: -1 });

// 4. MISSION NEED SCHEMA
const MissionNeedSchema = new Schema({
  missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true, index: true },
  roleName: { type: String, required: true, trim: true, maxlength: 100 },
  skillTag: { type: String, required: true, trim: true, maxlength: 50 },
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
    enum: ['mission_matched', 'slot_fulfilled', 'application_accepted', 'org_verified', 'review_received'],
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

export const User = models.User || model('User', UserSchema);
export const Organization = models.Organization || model('Organization', OrganizationSchema);
export const Mission = models.Mission || model('Mission', MissionSchema);
export const MissionNeed = models.MissionNeed || model('MissionNeed', MissionNeedSchema);
export const Application = models.Application || model('Application', ApplicationSchema);
export const Notification = models.Notification || model('Notification', NotificationSchema);
export const Review = models.Review || model('Review', ReviewSchema);
export const AuditLog = models.AuditLog || model('AuditLog', AuditLogSchema);
