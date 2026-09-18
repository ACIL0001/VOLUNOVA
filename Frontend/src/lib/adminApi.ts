const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export interface AdminStats {
  totalVolunteers: number;
  totalOrganizations: number;
  pendingOrganizations: number;
  totalMissions: number;
  activeMissions: number;
  totalImpactHours: number;
  avgReliability: number;
  wilayasActiveCount: number;
  totalSlotsNeeded: number;
  totalSlotsFilled: number;
  fulfillmentRate: number;
  categories: Array<{ category: string; count: number }>;
  recentAuditLogs: any[];
}

export interface AdminOrganization {
  _id: string;
  name: string;
  category: string;
  logo: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  totalMissions: number;
  totalVolunteersMobilized: number;
  createdAt: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
  };
}

export interface AdminMission {
  _id: string;
  title: string;
  description: string;
  category: string;
  venueName: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  totalSlotsNeeded: number;
  totalSlotsFilled: number;
  estimatedHoursPerVolunteer: number;
  createdAt: string;
  orgId?: {
    _id: string;
    name: string;
    logo: string;
    verificationStatus: string;
  };
}

export interface AdminVolunteer {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  city: string;
  skills: string[];
  impactHours: number;
  reliabilityScore: number;
  bio?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  _id: string;
  actorId: string;
  action: string;
  targetId?: string;
  metadata?: any;
  timestamp: string;
}

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    const res = await fetch(`${BASE_URL}/admin/stats`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message || 'Failed to fetch stats');
    return json.data;
  },

  async getOrganizations(): Promise<AdminOrganization[]> {
    const res = await fetch(`${BASE_URL}/admin/organizations`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message || 'Failed to fetch organizations');
    return json.data;
  },

  async verifyOrganization(id: string, status: 'verified' | 'rejected' | 'pending'): Promise<AdminOrganization> {
    const res = await fetch(`${BASE_URL}/admin/organizations/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message || 'Failed to update verification');
    return json.data;
  },

  async getMissions(): Promise<AdminMission[]> {
    const res = await fetch(`${BASE_URL}/admin/missions`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message || 'Failed to fetch missions');
    return json.data;
  },

  async cancelMission(id: string): Promise<AdminMission> {
    const res = await fetch(`${BASE_URL}/admin/missions/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message || 'Failed to cancel mission');
    return json.data;
  },

  async getVolunteers(): Promise<AdminVolunteer[]> {
    const res = await fetch(`${BASE_URL}/admin/volunteers`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message || 'Failed to fetch volunteers');
    return json.data;
  },

  async getAuditLogs(): Promise<AdminAuditLog[]> {
    const res = await fetch(`${BASE_URL}/admin/audit-logs`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message || 'Failed to fetch audit logs');
    return json.data;
  },
};
