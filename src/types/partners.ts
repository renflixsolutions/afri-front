// Partner types
export interface Partner {
  id: string;
  name: string;
  type: string | null;
  country: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  logo: string | null;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string | null;
}

export interface PartnersPaginationData {
  current_page: number;
  data: Partner[];
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

export interface PartnersResponse {
  status: boolean;
  message: string;
  data: PartnersPaginationData;
}

export interface PartnerResponse {
  status: boolean;
  message: string;
  data: Partner;
}

export interface PartnerFormData {
  name: string;
  type: string;
  country: string;
  website: string;
  email: string;
  phone: string;
  logo?: File | string | null;
  description: string;
  is_active: boolean;
}

