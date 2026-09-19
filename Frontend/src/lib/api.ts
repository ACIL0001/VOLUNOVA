const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'volunteer' | 'organization' | 'admin';
  avatar?: string;
  city?: string;
  skills?: string[];
  impactHours?: number;
  reliabilityScore?: number;
  bio?: string;
  organization?: {
    _id: string;
    name: string;
    category: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    website?: string;
    logo?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    totalMissions?: number;
    totalVolunteersMobilized?: number;
    createdAt?: string;
  };
}

export interface SupportTicket {
  _id: string;
  orgId: string;
  userId: string;
  orgName: string;
  orgEmail: string;
  type: 'warning' | 'reclamation' | 'note' | 'assistance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  message: string;
  status: 'unread' | 'in_progress' | 'resolved';
  adminReply?: string;
  repliedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissionNeed {
  _id: string;
  missionId: string;
  roleName: string;
  skillTag: string;
  icon: string;
  quantityNeeded: number;
  quantityFulfilled: number;
  equipmentRequired?: string;
}

export interface Mission {
  _id: string;
  title: string;
  description?: string;
  category: string;
  venueName: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  totalSlotsNeeded: number;
  totalSlotsFilled: number;
  estimatedHoursPerVolunteer: number;
  dateStart: string;
  orgId?: {
    _id: string;
    name: string;
    logo: string;
    category: string;
    verificationStatus: string;
  };
  needs?: MissionNeed[];
  matchedVolunteers?: any[];
  userApplication?: any;
}

export interface ImpactStats {
  treesPlanted: number;
  totalImpactHours: number;
  volunteersMobilized: number;
  activeMissionsCount: number;
  fillRatePercentage: number;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  payload: {
    missionId?: string;
    volunteerId?: string;
    volunteerName?: string;
    roleName?: string;
    missionTitle?: string;
    title?: string;
    message?: string;
    [key: string]: any;
  };
  channel: string;
  readAt: string | null;
  createdAt: string;
}

export interface ExtractedNeedsResponse {
  title: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  venue: string;
  suggestedHoursPerPerson: number;
  needs: {
    roleName: string;
    skillTag: string;
    icon: string;
    quantityNeeded: number;
    equipmentRequired?: string;
  }[];
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('volunova_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('volunova_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('volunova_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res: Response;
    try {
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (err: any) {
      console.warn(`[VOLUNOVA API] Backend server unreachable at ${API_BASE}${endpoint}. Make sure the backend is running on port 5000.`);
      throw new Error(`Serveur backend inaccessible (${API_BASE}). Vérifiez que le serveur backend est démarré.`);
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Réponse serveur invalide (HTTP ${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data?.error?.message || `Erreur HTTP ${res.status}`);
    }
    return data.data;
  }

  // 1. Stats
  async getImpactStats(): Promise<ImpactStats> {
    try {
      return await this.request<ImpactStats>('/stats/impact-wall');
    } catch {
      return {
        treesPlanted: 0,
        totalImpactHours: 0,
        volunteersMobilized: 0,
        activeMissionsCount: 0,
        fillRatePercentage: 0,
      };
    }
  }

  // 2. Missions
  async getMissions(query?: Record<string, string>): Promise<Mission[]> {
    const params = new URLSearchParams(query || {}).toString();
    const endpoint = `/missions${params ? `?${params}` : ''}`;
    try {
      return await this.request<Mission[]>(endpoint);
    } catch {
      return [];
    }
  }

  async getMission(id: string): Promise<Mission> {
    return this.request<Mission>(`/missions/${id}`);
  }

  /** Organization dashboard: own missions only (JWT + role required). */
  async getMyMissions(): Promise<{ organization: any; missions: Mission[] }> {
    return this.request<{ organization: any; missions: Mission[] }>('/missions/mine');
  }

  async createMission(data: any): Promise<Mission> {
    return this.request<Mission>('/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinMission(missionId: string, needId: string): Promise<any> {
    return this.request<any>(`/missions/${missionId}/join`, {
      method: 'POST',
      body: JSON.stringify({ needId }),
    });
  }

  // 3. AI Extraction
  async extractNeeds(prompt: string): Promise<ExtractedNeedsResponse> {
    return this.request<ExtractedNeedsResponse>('/ai/extract', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // 4. Auth
  async login(email: string, password: string): Promise<any> {
    const res = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async signup(data: {
    name: string;
    email: string;
    password: string;
    role: 'volunteer' | 'organization';
    city?: string;
    skills?: string[];
  }): Promise<any> {
    const res = await this.request<{ token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  logout() {
    this.clearToken();
  }

  async getMe(): Promise<any> {
    return this.request<any>('/auth/me');
  }

  async getVolunteers(): Promise<any[]> {
    return this.request<any[]>('/auth/volunteers');
  }

  // 6. Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return this.request<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications');
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead(): Promise<any> {
    return this.request<any>('/notifications/read-all', { method: 'PATCH' });
  }

  async inviteVolunteer(missionId: string, volunteerId: string, needId?: string): Promise<any> {
    return this.request<any>(`/missions/${missionId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ volunteerId, needId }),
    });
  }

  // 7. Profile Updates
  async updateProfile(data: {
    name?: string;
    city?: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    orgName?: string;
    category?: string;
    description?: string;
    orgEmail?: string;
    orgPhone?: string;
    address?: string;
    website?: string;
    logo?: string;
  }): Promise<{ user: User; organization: any }> {
    return this.request<{ user: User; organization: any }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 8. Organization Support & Admin Alert Center
  async createSupportTicket(data: {
    type: 'warning' | 'reclamation' | 'note' | 'assistance';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    subject: string;
    message: string;
  }): Promise<SupportTicket> {
    return this.request<SupportTicket>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMySupportTickets(): Promise<SupportTicket[]> {
    return this.request<SupportTicket[]>('/support/tickets/mine');
  }

  async getAdminSupportTickets(params?: {
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<{
    tickets: SupportTicket[];
    metrics: {
      total: number;
      unread: number;
      warnings: number;
      resolved: number;
    };
  }> {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (
          val !== undefined &&
          val !== null &&
          val !== '' &&
          val !== 'undefined' &&
          val !== 'null'
        ) {
          cleanParams[key] = String(val);
        }
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return this.request<{
      tickets: SupportTicket[];
      metrics: {
        total: number;
        unread: number;
        warnings: number;
        resolved: number;
      };
    }>(`/support/tickets/admin${query ? `?${query}` : ''}`);
  }

  async getAdminUnreadTicketsCount(): Promise<{
    unreadCount: number;
    urgentCount: number;
    recentTickets: SupportTicket[];
  }> {
    return this.request<{
      unreadCount: number;
      urgentCount: number;
      recentTickets: SupportTicket[];
    }>('/support/tickets/admin/unread-count');
  }

  async replyAdminSupportTicket(
    id: string,
    data: { adminReply?: string; status?: 'unread' | 'in_progress' | 'resolved' }
  ): Promise<SupportTicket> {
    return this.request<SupportTicket>(`/support/tickets/${id}/admin-reply`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 9. Skills & AI
  async getRegisteredSkills(): Promise<{
    id: string;
    name: string;
    nameFr: string;
    nameEn: string;
    nameAr: string;
    category: string;
    icon: string;
    volunteerCount: number;
  }[]> {
    return this.request<any[]>('/skills');
  }

  async getSkillCategories(): Promise<{
    id: string;
    labelFr: string;
    labelAr: string;
    labelEn: string;
    icon: string;
  }[]> {
    return this.request<any[]>('/skills/categories');
  }

  async classifySkillWithAI(prompt: string, locale?: string): Promise<{
    matchedCanonical: any | null;
    normalizedSkill: {
      id: string;
      nameFr: string;
      nameEn: string;
      nameAr: string;
      category: string;
      icon: string;
    };
    explanation: string;
    isCanonical: boolean;
  }> {
    return this.request<any>('/skills/ai-classify', {
      method: 'POST',
      body: JSON.stringify({ prompt, locale }),
    });
  }
}

export const api = new ApiService();
