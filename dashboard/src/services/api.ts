const API_BASE = 'http://localhost:50051';

export interface HealthStatus {
  status: 'running' | 'stopped';
  version: string;
  uptime: number;
}

export interface Hand {
  name: string;
  active: boolean;
  status: string;
  capabilities: string[];
}

export interface HandsResponse {
  hands: Hand[];
}

class ApiService {
  private apiKey: string = '';

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openfang_api_key', key);
  }

  getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('openfang_api_key') || '';
    }
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = '';
    localStorage.removeItem('openfang_api_key');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const apiKey = this.getApiKey();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health');
  }

  async getHands(): Promise<HandsResponse> {
    return this.request<HandsResponse>('/hands');
  }

  async activateHand(name: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/hands/${name}/activate`, {
      method: 'POST',
    });
  }

  async deactivateHand(name: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/hands/${name}/deactivate`, {
      method: 'POST',
    });
  }

  async startOpenFang(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/start', {
      method: 'POST',
    });
  }

  async stopOpenFang(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/stop', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
