export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ApiClient {
  private baseUrl = '/api/v1';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse | null = null;
      try {
        errorData = await response.json();
      } catch {
        // Fallback for non-JSON errors
      }

      const message = errorData?.error?.message || `Request failed with status ${response.status}`;
      const code = errorData?.error?.code || 'HTTP_ERROR';
      throw new ApiClientError(message, code, response.status, errorData?.error?.details);
    }

    return response.json();
  }

  // Auth methods
  async getCurrentUser(userId = 'user-alex-1') {
    return this.request(`/auth/me?userId=${userId}`);
  }

  async login(email: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Profile methods
  async getProfile(userId = 'user-alex-1') {
    return this.request(`/profile?userId=${userId}`);
  }

  async updateProfile(profileData: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Goal & Plan methods
  async getPlan(userId = 'user-alex-1') {
    return this.request(`/goals?userId=${userId}`);
  }

  async getPlanVersions(userId = 'user-alex-1') {
    return this.request(`/goals/versions?userId=${userId}`);
  }

  async updateGoal(goalData: any) {
    return this.request('/goals', {
      method: 'PUT',
      body: JSON.stringify(goalData)
    });
  }

  // Phase 3 Food Scanning & Product Pipeline methods
  async createFoodScanJob(payload: {
    userId?: string;
    images?: Array<{ base64: string; fileName?: string; mimeType?: string }>;
    imageBase64?: string;
    textHint?: string;
    mimeType?: string;
  }) {
    return this.request('/food/scans', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getFoodScanJob(scanJobId: string) {
    return this.request(`/food/scans/${scanJobId}`);
  }

  async getProduct(productId: string) {
    return this.request(`/food/products/${productId}`);
  }

  async logFood(payload: any) {
    return this.request('/food/log', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Progress methods
  async getDailyProgress(userId = 'user-alex-1', date?: string) {
    const q = date ? `&date=${date}` : '';
    return this.request(`/progress/daily?userId=${userId}${q}`);
  }

  // Agent methods
  async getAdaptations(userId = 'user-alex-1') {
    return this.request(`/agent/adaptations?userId=${userId}`);
  }

  async resolveAdaptation(id: string, action: 'approved' | 'rejected') {
    return this.request(`/agent/adaptations/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }

  // Workflow triggers
  async triggerWorkflow(workflowId: string, userId = 'user-alex-1') {
    return this.request('/workflows/trigger', {
      method: 'POST',
      body: JSON.stringify({ workflowId, userId })
    });
  }

  async getWorkflowLogs() {
    return this.request('/workflows/logs');
  }

  async getNotifications() {
    return this.request('/notifications');
  }
}

export const apiClient = new ApiClient();
