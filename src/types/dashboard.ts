export interface LocationDistribution {
  name: string;
  total: number;
  latitude: string | null;
  longitude: string | null;
}

export interface CreditSummary {
  total_batches: number;
  processing_batches: number;
  failed_batches: number;
  completed_batches: number;
}

export interface RecentCreditBatch {
  tx_id: string;
  project_name: string;
  cycle_name: string;
  cycle_id: string;
  status: string;
  progress: number;
  credited_count: number;
  failed_count: number;
  skipped_count: number;
  total_records: number;
  created_at: string;
}

export interface DashboardStats {
  // Admin dashboard fields
  total_beneficiaries?: string;
  total_programs?: string;
  total_projects?: string;
  total_merchants?: string;
  total_transactions?: string;
  aid_distribution_by_type?: Record<string, string>;
  aid_distribution_by_location?: LocationDistribution[];
  active_projects?: ActiveProject[];
  credit_summary?: CreditSummary;
  recent_credit_batches?: RecentCreditBatch[];

  // User dashboard fields
  summary?: {
    total_job_applications: number;
    total_scholarships: number;
    total_scholarship_applications: number;
    total_opportunity_requests: number;
    total_payments: number;
    total_payment_amount: number;
    monthly_job_applications: number;
    monthly_payments: number;
  };
  breakdowns?: {
    job_application_status: Record<string, number>;
    scholarship_application_status: Record<string, number>;
  };
  recent_data?: {
    job_applications: Array<{
      id: string;
      job_title: string;
      company: string;
      status: string;
      applied_date: string;
    }>;
    scholarship_applications: Array<{
      id: string;
      scholarship_title: string;
      organization: string;
      status: string;
      applied_date: string;
    }>;
    payments: Array<{
      id: string;
      amount: number;
      gateway: string;
      status: string;
      date: string;
    }>;
  };
  charts?: {
    monthly_job_applications_trend: Array<{
      month: string;
      count: number;
    }>;
    payment_by_gateway: Array<{
      gateway: string;
      total_amount: number;
    }>;
    top_jobs: Array<{
      job_title: string;
      application_count: number;
    }>;
    applications_by_country: Array<{
      country: string;
      count: number;
    }>;
    scholarship_status_pie: Array<{
      status: string;
      count: number;
    }>;
    job_status_bar: Array<{
      status: string;
      count: number;
    }>;
  };
}

export interface ActiveProject {
  project_name: string;
  location: string;
  total_registered_for_active_cycle: number;
  registration_slots: number;
  total_cycles: number;
}

export interface DashboardResponse {
  status: boolean;
  message: string;
  data: DashboardStats;
}
