// Job types
export interface Partner {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  reference_code: string | null;
  title: string;
  country: string;
  location: string;
  job_type: string;
  category: string;
  level: string;
  description: string;
  responsibilities: string;
  requirements: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  is_remote: boolean;
  is_published: boolean;
  featured: boolean;
  status: string;
  closing_date: string;
  published_at: string;
  expires_at: string;
  partner: Partner | null;
  views_count: number;
  applications_count: number;
  created_by: string;
  created_at: string;
}

export interface JobsPaginationData {
  current_page: number;
  data: Job[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface JobsResponse {
  status: boolean;
  message: string;
  data: JobsPaginationData;
}

export interface JobResponse {
  status: boolean;
  message: string;
  data: Job;
}

// Job Application types
export interface ApplicationDocument {
  id: number;
  document_type: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  order: number;
  created_at: string;
  updated_at: string;
  document_url: string;
}

export interface JobApplicant {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  country: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  staff_id: string;
  reference_code: string;
  applicant_name: string;
  email: string;
  phone: string;
  country: string;
  passport_number: string | null;
  national_id: string | null;
  cover_letter: string | null;
  status: 'pending' | 'shortlisted' | 'rejected';
  remarks: string | null;
  submitted_by: string;
  created_at: string;
  updated_at: string;
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    job_type: string;
    category: string;
    description: string;
    requirements: string;
    salary_range: string;
    deadline: string;
    is_active: boolean;
    created_at: string;
  };
  applicant: JobApplicant;
  application_documents: ApplicationDocument[];
}

export interface JobApplicationsPaginationData {
  current_page: number;
  data: JobApplication[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface JobApplicationsResponse {
  status: boolean;
  message: string;
  data: JobApplicationsPaginationData;
}

export interface UpdateApplicationStatusRequest {
  id: string;
  status: 'pending' | 'shortlisted' | 'rejected';
  remarks?: string;
}

export interface UpdateApplicationStatusResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    reference_code: string;
    applicant_name: string;
    status: string;
    previous_status: string;
    remarks: string | null;
    submitted_by: string;
  };
}

