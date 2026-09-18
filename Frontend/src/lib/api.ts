const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  _id: string;
  name: string;
  email: string;
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
    logo?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
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

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `HTTP Error ${res.status}`);
      }
      return data.data;
    } catch (err: any) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // 1. Stats
  async getImpactStats(): Promise<ImpactStats> {
    return this.request<ImpactStats>('/stats/impact-wall');
  }

  // 2. Missions
  async getMissions(query?: Record<string, string>): Promise<Mission[]> {
    const params = new URLSearchParams(query || {}).toString();
    const endpoint = `/missions${params ? `?${params}` : ''}`;
    return this.request<Mission[]>(endpoint);
  }

  async getMission(id: string): Promise<Mission> {
    return this.request<Mission>(`/missions/${id}`);
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

  // 4. Seed Database
  async seedDatabase(): Promise<any> {
    return this.request<any>('/seed', {
      method: 'POST',
    });
  }

  // 5. Auth
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
}

export const api = new ApiService();
