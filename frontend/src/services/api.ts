const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface AnalysisRequest {
  resumeFile: File;
  jobLink: string;
}

export interface AnalysisResponse {
  score: number;
  recommendations: Array<{
    id: string;
    type: 'rating' | 'missing' | 'improvement' | 'suggestion';
    title: string;
    content: string;
    icon: string;
    color: string;
  }>;
  message: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeResume(resumeFile: File, jobLink: string): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_link', jobLink);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async sendChatMessage(message: string): Promise<ChatMessage> {
    return this.makeRequest<ChatMessage>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>('/health');
  }
}

export const apiService = new ApiService(); 