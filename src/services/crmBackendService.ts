import { 
  CRMContact, 
  CRMDeal, 
  CRMActivity, 
  CRMNote,
  CRMAnalytics,
  CRMDashboardStats,
  CreateContactRequest,
  UpdateContactRequest,
  CreateDealRequest,
  UpdateDealRequest,
  CreateActivityRequest,
  UpdateActivityRequest,
  ContactFilters,
  DealFilters,
  ActivityFilters,
  CRMApiResponse,
  CRMResponse
} from '../types/crmBackend';

export class CRMBackendService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl = '/api/crm', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<CRMApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          details: data.details
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // ================== CONTACTS ==================

  async getContacts(filters?: ContactFilters): Promise<CRMApiResponse<CRMContact[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const query = queryParams.toString();
    return this.request<CRMContact[]>(`/contacts${query ? `?${query}` : ''}`);
  }

  async getContact(id: string): Promise<CRMApiResponse<CRMContact>> {
    return this.request<CRMContact>(`/contacts/${id}`);
  }

  async createContact(data: CreateContactRequest): Promise<CRMApiResponse<CRMContact>> {
    return this.request<CRMContact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateContact(id: string, data: UpdateContactRequest): Promise<CRMApiResponse<CRMContact>> {
    return this.request<CRMContact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteContact(id: string): Promise<CRMApiResponse<{ deleted: true }>> {
    return this.request<{ deleted: true }>(`/contacts/${id}`, {
      method: 'DELETE'
    });
  }

  async updateContactLeadScore(id: string, score: number): Promise<CRMApiResponse<CRMContact>> {
    return this.request<CRMContact>(`/contacts/${id}/lead-score`, {
      method: 'PATCH',
      body: JSON.stringify({ lead_score: score })
    });
  }

  async addContactTags(id: string, tags: string[]): Promise<CRMApiResponse<CRMContact>> {
    return this.request<CRMContact>(`/contacts/${id}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags })
    });
  }

  async removeContactTags(id: string, tags: string[]): Promise<CRMApiResponse<CRMContact>> {
    return this.request<CRMContact>(`/contacts/${id}/tags`, {
      method: 'DELETE',
      body: JSON.stringify({ tags })
    });
  }

  // ================== DEALS ==================

  async getDeals(filters?: DealFilters): Promise<CRMApiResponse<CRMDeal[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const query = queryParams.toString();
    return this.request<CRMDeal[]>(`/deals${query ? `?${query}` : ''}`);
  }

  async getDeal(id: string): Promise<CRMApiResponse<CRMDeal>> {
    return this.request<CRMDeal>(`/deals/${id}`);
  }

  async createDeal(data: CreateDealRequest): Promise<CRMApiResponse<CRMDeal>> {
    return this.request<CRMDeal>('/deals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateDeal(id: string, data: UpdateDealRequest): Promise<CRMApiResponse<CRMDeal>> {
    return this.request<CRMDeal>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updateDealStage(id: string, stage: CRMDeal['stage'], notes?: string): Promise<CRMApiResponse<CRMDeal>> {
    return this.request<CRMDeal>(`/deals/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage, notes })
    });
  }

  async deleteDeal(id: string): Promise<CRMApiResponse<{ deleted: true }>> {
    return this.request<{ deleted: true }>(`/deals/${id}`, {
      method: 'DELETE'
    });
  }

  async getDealHistory(id: string): Promise<CRMApiResponse<any[]>> {
    return this.request<any[]>(`/deals/${id}/history`);
  }

  // ================== ACTIVITIES ==================

  async getActivities(filters?: ActivityFilters): Promise<CRMApiResponse<CRMActivity[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const query = queryParams.toString();
    return this.request<CRMActivity[]>(`/activities${query ? `?${query}` : ''}`);
  }

  async getActivity(id: string): Promise<CRMApiResponse<CRMActivity>> {
    return this.request<CRMActivity>(`/activities/${id}`);
  }

  async createActivity(data: CreateActivityRequest): Promise<CRMApiResponse<CRMActivity>> {
    return this.request<CRMActivity>('/activities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateActivity(id: string, data: UpdateActivityRequest): Promise<CRMApiResponse<CRMActivity>> {
    return this.request<CRMActivity>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async completeActivity(
    id: string, 
    outcome?: CRMActivity['outcome'], 
    notes?: string
  ): Promise<CRMApiResponse<CRMActivity>> {
    return this.request<CRMActivity>(`/activities/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        completed: true, 
        completed_at: new Date().toISOString(),
        outcome,
        notes 
      })
    });
  }

  async deleteActivity(id: string): Promise<CRMApiResponse<{ deleted: true }>> {
    return this.request<{ deleted: true }>(`/activities/${id}`, {
      method: 'DELETE'
    });
  }

  async getActivitiesDueToday(userId?: string): Promise<CRMApiResponse<CRMActivity[]>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getActivities({
      due_date_after: `${today}T00:00:00.000Z`,
      due_date_before: `${today}T23:59:59.999Z`,
      assigned_to: userId,
      completed: false
    });
  }

  async getOverdueActivities(userId?: string): Promise<CRMApiResponse<CRMActivity[]>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getActivities({
      due_date_before: `${today}T00:00:00.000Z`,
      assigned_to: userId,
      completed: false
    });
  }

  // ================== NOTES ==================

  async getNotes(contactId?: string, dealId?: string): Promise<CRMApiResponse<CRMNote[]>> {
    const params = new URLSearchParams();
    if (contactId) params.append('contact_id', contactId);
    if (dealId) params.append('deal_id', dealId);

    const query = params.toString();
    return this.request<CRMNote[]>(`/notes${query ? `?${query}` : ''}`);
  }

  async createNote(data: {
    content: string;
    contact_id?: string;
    deal_id?: string;
    activity_id?: string;
    is_private?: boolean;
  }): Promise<CRMApiResponse<CRMNote>> {
    return this.request<CRMNote>('/notes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateNote(id: string, data: { content: string; is_private?: boolean }): Promise<CRMApiResponse<CRMNote>> {
    return this.request<CRMNote>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNote(id: string): Promise<CRMApiResponse<{ deleted: true }>> {
    return this.request<{ deleted: true }>(`/notes/${id}`, {
      method: 'DELETE'
    });
  }

  // ================== ANALYTICS ==================

  async getDashboardStats(userId?: string): Promise<CRMApiResponse<CRMDashboardStats>> {
    const params = userId ? `?user_id=${userId}` : '';
    return this.request<CRMDashboardStats>(`/analytics/dashboard${params}`);
  }

  async getAnalytics(
    startDate?: string, 
    endDate?: string, 
    userId?: string
  ): Promise<CRMApiResponse<CRMAnalytics>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (userId) params.append('user_id', userId);

    const query = params.toString();
    return this.request<CRMAnalytics>(`/analytics${query ? `?${query}` : ''}`);
  }

  async getPipelineAnalytics(): Promise<CRMApiResponse<{
    stages: Array<{
      stage: string;
      count: number;
      value: number;
      avg_days: number;
    }>;
    conversion_rates: Record<string, number>;
    bottlenecks: string[];
  }>> {
    return this.request(`/analytics/pipeline`);
  }

  async getLeadSourceAnalytics(): Promise<CRMApiResponse<{
    sources: Record<string, {
      count: number;
      conversion_rate: number;
      avg_lead_score: number;
      revenue: number;
    }>;
  }>> {
    return this.request(`/analytics/lead-sources`);
  }

  async getPerformanceAnalytics(userId?: string): Promise<CRMApiResponse<{
    user_stats: {
      contacts_created: number;
      deals_won: number;
      revenue_generated: number;
      activities_completed: number;
      avg_deal_size: number;
      win_rate: number;
    };
    comparison: {
      team_avg_deal_size: number;
      team_avg_win_rate: number;
      ranking: number;
    };
  }>> {
    const params = userId ? `?user_id=${userId}` : '';
    return this.request(`/analytics/performance${params}`);
  }

  // ================== SEARCH ==================

  async search(query: string, type?: 'contacts' | 'deals' | 'activities'): Promise<CRMApiResponse<{
    contacts: CRMContact[];
    deals: CRMDeal[];
    activities: CRMActivity[];
  }>> {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);

    return this.request(`/search?${params.toString()}`);
  }

  // ================== BULK OPERATIONS ==================

  async bulkUpdateContacts(
    contactIds: string[], 
    updates: Partial<UpdateContactRequest>
  ): Promise<CRMApiResponse<{ updated: number }>> {
    return this.request('/contacts/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ contact_ids: contactIds, updates })
    });
  }

  async bulkDeleteContacts(contactIds: string[]): Promise<CRMApiResponse<{ deleted: number }>> {
    return this.request('/contacts/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ contact_ids: contactIds })
    });
  }

  async importContacts(contacts: CreateContactRequest[]): Promise<CRMApiResponse<{
    imported: number;
    failed: number;
    errors: Array<{ index: number; error: string }>;
  }>> {
    return this.request('/contacts/import', {
      method: 'POST',
      body: JSON.stringify({ contacts })
    });
  }

  async exportContacts(filters?: ContactFilters): Promise<CRMApiResponse<{ download_url: string }>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    return this.request(`/contacts/export${query ? `?${query}` : ''}`);
  }
}

// Singleton instance for the application
export const crmBackendService = new CRMBackendService();

// Export default instance
export default crmBackendService;