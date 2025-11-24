import apiService from './ApiService';

export interface PendingProjectCycle {
  id: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  currency: string;
  max_slots: number;
  registration_types: Array<{ id: string; name: string }>;
  account_types: Array<{ id: string; name: string }>;
  amount: string;
  type: string;
  type_name: string;
  max_members: number;
  is_student: boolean;
  status: string;
  project: {
    id: string;
    name: string;
    country: string;
    location: string;
    sub_location: string;
    sponsor: string;
  };
}

export interface PendingDistributionArea {
  id: number;
  distribution_cycle: {
    id: number;
    cycle_name: string;
  };
  location: {
    id: number;
    name: string;
  };
  sub_location: {
    id: number;
    name: string;
  };
  status: string;
  beneficiaries_count: number;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface PendingProjectCyclesResponse {
  current_page: number;
  data: PendingProjectCycle[];
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

export interface PendingDistributionAreasResponse {
  current_page: number;
  data: PendingDistributionArea[];
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

class ApprovalService {
  async getPendingProjectCycles(page: number = 1, perPage: number = 5, search?: string): Promise<PendingProjectCyclesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await apiService.get(
      `pending-approvals/pending-project-cycles?${params.toString()}`
    );
    console.log('Pending cycles API response:', response.data);
    if (response.data.status && response.data.data) {
      console.log('Pending cycles data:', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to load pending project cycles');
  }

  async getPendingDistributionAreas(page: number = 1, perPage: number = 5, search?: string): Promise<PendingDistributionAreasResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await apiService.get(
      `pending-approvals/distribution-areas?${params.toString()}`
    );
    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to load pending distribution areas');
  }

  async approveOrRejectProjectCycle(cycleId: string, action: 'approve' | 'reject'): Promise<any> {
    const response = await apiService.post(
      `pending-approvals/project-cycle-approval/${cycleId}`,
      { action }
    );
    if (response.data.status) {
      return response.data;
    }
    throw new Error(response.data.message || `Failed to ${action} project cycle`);
  }

  async approveOrRejectBeneficiaries(rnsNumbers: string[], action: 'approve' | 'reject'): Promise<any> {
    const response = await apiService.post(
      `pending-approvals/beneficiary-approval`,
      { rns_numbers: rnsNumbers, action }
    );
    if (response.data.status) {
      return response.data;
    }
    throw new Error(response.data.message || `Failed to ${action} beneficiaries`);
  }

  async approveOrRejectTransactions(transactionIds: string[], action: 'approve' | 'reject'): Promise<any> {
    const response = await apiService.post(
      `pending-approvals/transaction-approval`,
      { transaction_ids: transactionIds, action }
    );
    if (response.data.status) {
      return response.data;
    }
    throw new Error(response.data.message || `Failed to ${action} transactions`);
  }

  async approveOrRejectDistributionAreas(areaIds: number[], action: 'approve' | 'reject'): Promise<any> {
    const response = await apiService.post(
      `pending-approvals/distribution-area-approval`,
      { area_ids: areaIds, action }
    );
    if (response.data.status) {
      return response.data;
    }
    throw new Error(response.data.message || `Failed to ${action} distribution areas`);
  }
}

export default new ApprovalService();
