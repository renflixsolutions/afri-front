// Scholarship types

export interface ScholarshipPartner {
  id: string;
  name: string;
  type?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  slug: string;
  country: string | null;
  institution: string | null;
  level: string | null;
  field_of_study: string | null;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  application_deadline: string | null;
  is_fully_funded: boolean;
  is_published: boolean;
  partner_id: number | null;
  application_link: string | null;
  funding_type?: FundingType | null;
  created_by?: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  partner: ScholarshipPartner | null;
}

export interface ScholarshipsPaginationData {
  current_page: number;
  data: Scholarship[];
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

export interface ScholarshipsResponse {
  status: boolean;
  message: string;
  data: ScholarshipsPaginationData;
}

export interface ScholarshipResponse {
  status: boolean;
  message: string;
  data: Scholarship;
}

export interface CreateScholarshipRequest {
  title: string;
  slug?: string;
  country?: string;
  institution?: string;
  level?: string;
  field_of_study?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  application_deadline?: string;
  is_fully_funded?: boolean;
  is_published?: boolean;
  partner_id?: number;
  application_link?: string;
  funding_type?: FundingType;
}

export interface UpdateScholarshipRequest {
  title?: string;
  slug?: string;
  country?: string;
  institution?: string;
  level?: string;
  field_of_study?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  application_deadline?: string;
  is_fully_funded?: boolean;
  is_published?: boolean;
  partner_id?: number;
  application_link?: string;
  funding_type?: FundingType;
}

// Scholarship Application types

export interface ApplicationDocument {
  id: number;
  application_id: number;
  document_type: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ApplicationOpportunity {
  id: number;
  title: string;
  slug?: string;
  country?: string;
  institution: string;
  level: string;
  field_of_study: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  application_deadline: string;
  is_fully_funded: boolean;
}

export interface ScholarshipApplication {
  id: number;
  user_id: number | null;
  opportunity_id: number;
  partner_id: number | null;
  application_ref: string;
  full_name: string;
  email: string;
  phone: string;
  motivation: string | null;
  status: 'pending' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  submitted_at: string;
  handled_by: string | null;
  created_at: string;
  updated_at: string;
  user: ApplicationUser | null;
  opportunity: ApplicationOpportunity;
  partner: ScholarshipPartner | null;
  student_application_documents: ApplicationDocument[];
}

export interface ScholarshipApplicationsPaginationData {
  current_page: number;
  data: ScholarshipApplication[];
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

export interface ScholarshipApplicationsResponse {
  status: boolean;
  message: string;
  data: ScholarshipApplicationsPaginationData;
}

export interface ScholarshipApplicationResponse {
  status: boolean;
  message: string;
  data: ScholarshipApplication;
}

export interface CreateApplicationRequest {
  user_id?: number;
  opportunity_id: string; // encrypted
  partner_id?: number;
  application_ref?: string;
  full_name: string;
  email: string;
  phone: string;
  motivation?: string;
  status?: string;
  submitted_at?: string;
}

export interface UpdateApplicationRequest {
  application_ref?: string;
  motivation?: string;
  status?: 'pending' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  submitted_at?: string;
  handled_by?: string;
}

export interface AddDocumentRequest {
  document_type: string;
  file: File;
}

export interface AddDocumentResponse {
  status: boolean;
  message: string;
  data: ApplicationDocument;
}

export type FundingType = 'fully_funded' | 'partially_funded' | 'not_funded';
