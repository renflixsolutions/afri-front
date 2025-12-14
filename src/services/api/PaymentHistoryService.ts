// filepath: c:\Users\omond\WebstormProjects\afri-front\src\services\api\PaymentHistoryService.ts
import apiService from './ApiService';
import {
  PaymentHistoryResponse,
  PaymentDetailsResponse,
  PaymentStatisticsResponse,
  PaymentHistoryFilters,
} from '@/types/payment-history';

class PaymentHistoryServiceClass {
  // Get payment history with filters
  async getPaymentHistory(page: number = 1, filters?: PaymentHistoryFilters): Promise<PaymentHistoryResponse> {
    const params = new URLSearchParams({ page: page.toString() });
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.gateway) params.append('gateway', filters.gateway);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);

    const response = await apiService.get<PaymentHistoryResponse['data']>(`payment-history?${params.toString()}`);
    return response.data;
  }

  // Get single payment details
  async getPaymentDetails(reference: string): Promise<PaymentDetailsResponse> {
    const response = await apiService.get<PaymentDetailsResponse['data']>(`payment-history/${reference}`);
    return response.data;
  }

  // Get payment statistics
  async getPaymentStatistics(from_date?: string, to_date?: string): Promise<PaymentStatisticsResponse> {
    const params = new URLSearchParams();
    if (from_date) params.append('from_date', from_date);
    if (to_date) params.append('to_date', to_date);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiService.get<PaymentStatisticsResponse['data']>(`payment-history/statistics${query}`);
    return response.data;
  }

  // Get Pesapal payments only
  async getPesapalPayments(page: number = 1, status?: string, per_page?: number): Promise<PaymentHistoryResponse> {
    const params = new URLSearchParams({ page: page.toString() });
    if (status) params.append('status', status);
    if (per_page) params.append('per_page', per_page.toString());

    const response = await apiService.get<PaymentHistoryResponse['data']>(`payment-history/pesapal?${params.toString()}`);
    return response.data;
  }

  // Get payments by module
  async getPaymentsByModule(module: string): Promise<{ status: string; message: string; data: any[] }> {
    const response = await apiService.get<any[]>(`payment-history/by-module/${module}`);
    return response.data;
  }

  // Export payment history to CSV
  exportPaymentHistory(filters?: PaymentHistoryFilters): string {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.gateway) params.append('gateway', filters.gateway);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);

    const query = params.toString() ? `?${params.toString()}` : '';
    return `${apiService['client'].defaults.baseURL}/payment-history/export${query}`;
  }
}

const PaymentHistoryService = new PaymentHistoryServiceClass();
export default PaymentHistoryService;

