import apiService from './ApiService';

// Response interfaces
export interface PaymentTransaction {
  id: number;
  transaction_type: string;
  reference: string;
  flutterwave_ref: string;
  transaction_id: string;
  payment_status: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  ip_address: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransactionsPagination {
  current_page: number;
  data: PaymentTransaction[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaymentStatusBreakdown {
  successful: number;
  failed: number;
  pending: number;
  cancelled: number;
}

export interface PaymentFinancialSummary {
  total_payments: number;
  total_amount: number;
  successful_amount: number;
  failed_amount: number;
  success_rate: number;
}

export interface PaymentSummary {
  total_transactions: number;
  status_breakdown: PaymentStatusBreakdown;
  financial_summary: PaymentFinancialSummary;
}

export interface PaymentTransactionsResponse {
  message: string;
  data: {
    transactions: PaymentTransactionsPagination;
    summary: PaymentSummary;
  };
}

// Service function
export async function fetchPaymentTransactions(page: number = 1): Promise<PaymentTransactionsResponse> {
  const response = await apiService.get<PaymentTransactionsResponse>(`payments/transactions?page=${page}`);
  return response.data;
}
