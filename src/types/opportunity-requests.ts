// filepath: c:\Users\omond\WebstormProjects\afri-front\src\types\opportunity-requests.ts
export interface User {
  id: string;
  full_name: string;
  email: string;
}

export interface Staff {
  id: string;
  full_name: string;
  email: string;
}

export interface OpportunityRequest {
  id: string;
  user_id: number;
  staff_id: number | null;
  type: string;
  title: string;
  description: string;
  status: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
  user: User;
  staff: Staff | null;
}

export interface OpportunityRequestsPaginationData {
  current_page: number;
  data: OpportunityRequest[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface OpportunityRequestsResponse {
  status: boolean;
  message: string;
  data: OpportunityRequestsPaginationData;
}

export interface OpportunityRequestResponse {
  status: boolean;
  message: string;
  data: OpportunityRequest;
}
