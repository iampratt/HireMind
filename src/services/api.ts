const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
}

interface User {
  id: string;
  name: string;
  email: string;
  geminiApiKey?: string;
  createdAt: string;
  updatedAt: string;
}

interface Resume {
  id: string;
  fileName: string;
  uploadedAt: string;
  extractedData: {
    name: string;
    email: string;
    phone: string;
    location: string;
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      years: string;
    }>;
    summary: string;
  };
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  postTime: string;
  jobUrl: string;
  applicationUrl: string;
}

interface JobDetails {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationUrl: string;
}

interface JobRecommendations {
  jobs: Job[];
  totalRecommendations: number;
  basedOnResume: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('hiremind-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle both success and error responses from the backend
      if (data.success === false) {
        throw new Error(data.message || 'Request failed');
      }

      // Also check HTTP status for other types of errors
      if (!response.ok && data.success !== false) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async signup(userData: {
    name: string;
    email: string;
    password: string;
    geminiApiKey: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<ApiResponse<User & { resumes: Resume[] }>> {
    return this.request('/auth/profile');
  }

  // Resume endpoints
  async uploadResume(file: File): Promise<ApiResponse<{
    resumeId: string;
    fileName: string;
    uploadedAt: string;
    extractedData: Resume['extractedData'];
  }>> {
    const formData = new FormData();
    formData.append('resumeFile', file);

    const token = localStorage.getItem('hiremind-token');
    const response = await fetch(`${API_BASE_URL}/resume/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    // Handle both success and error responses from the backend
    if (data.success === false) {
      throw new Error(data.message || 'Failed to process resume');
    }

    // Also check HTTP status for other types of errors
    if (!response.ok && data.success !== false) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async getResumes(): Promise<ApiResponse<Resume[]>> {
    return this.request('/resume');
  }

  async getResume(id: string): Promise<ApiResponse<Resume>> {
    return this.request(`/resume/${id}`);
  }

  async deleteResume(id: string): Promise<ApiResponse<void>> {
    return this.request(`/resume/${id}`, {
      method: 'DELETE',
    });
  }

  async reparseResume(id: string): Promise<ApiResponse<{
    resumeId: string;
    fileName: string;
    uploadedAt: string;
    extractedData: Resume['extractedData'];
  }>> {
    return this.request(`/resume/${id}/reparse`, {
      method: 'POST',
    });
  }

  // Job search endpoints
  async searchJobs(params: {
    resumeId?: string;
    keywords?: string;
    location?: string;
    experienceLevel?: string;
    jobType?: string;
    workSchedule?: string;
    postedWithin?: string;
    start?: number;
    simplifiedApplication?: boolean;
    lessThan10Applicants?: boolean;
  }): Promise<ApiResponse<{
    jobs: Job[];
    searchParams: Record<string, string>;
    totalResults: number;
  }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return this.request(`/jobs/search?${queryParams.toString()}`);
  }

  async getJobDetails(jobId: string): Promise<ApiResponse<JobDetails>> {
    return this.request(`/jobs/${jobId}/details`);
  }

  async getJobRecommendations(resumeId?: string): Promise<ApiResponse<JobRecommendations>> {
    const endpoint = resumeId 
      ? `/jobs/recommendations/${resumeId}`
      : '/jobs/recommendations';
    return this.request(endpoint);
  }
}

export const apiService = new ApiService();
export default apiService; 