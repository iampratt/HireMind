export interface User {
  id: string;
  email: string;
  name: string;
  geminiApiKey?: string;
}

export interface Resume {
  id: string;
  fileName: string;
  uploadedAt: string;
  extractedData: ExtractedData;
}

export interface ExtractedData {
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  contact: Contact;
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface Contact {
  email: string;
  phone: string;
  location: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  postTime: string;
  jobUrl: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: string;
  workSchedule: string;
  experienceLevel: string;
  simplifiedApplication: boolean;
  applicantCount: number;
}

export interface JobFilters {
  keywords: string;
  location: string;
  experienceLevel: string;
  jobType: string;
  workSchedule: string;
  postedWithin: string;
  simplifiedApplication: boolean;
  lessThan10Applicants: boolean;
}

export type Theme = 'dark' | 'light';

export type Screen = 'auth' | 'dashboard' | 'upload' | 'jobs' | 'resumes' | 'job-detail';