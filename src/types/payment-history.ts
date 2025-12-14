// Payment History types based on new API

export interface PaymentItem {
  id: number;
  module: 'job' | 'scholarship' | 'course' | 'opportunity' | 'application_fee' | 'service_plan';
  module_ref_id: number;
  amount: string;
  status: string;
  module_name: string;
  item_details: Record<string, string> | null;
}

export interface PesapalStatus {
  payment_status_code: number;
  payment_status_description: string;
  confirmation_code: string;
}

export interface PesapalData {
  order_tracking_id: string;
  redirect_url: string;
  ipn_id: string;
  submitted_at: string;
  status_updated_at: string;
  pesapal_status: PesapalStatus;
}

export interface Payment {
  id: number;
  reference: string;
  provider_reference: string;
  gateway: 'pesapal' | 'flutterwave' | 'mpesa';
  amount: string;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  description: string;
  phone: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items: PaymentItem[];
  pesapal_data?: PesapalData;
  meta: Record<string, string | number> | null;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export interface PaymentPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface PaymentHistoryResponse {
  status: string;
  message: string;
  data: {
    payments: Payment[];
    pagination: PaymentPagination;
  };
}

export interface PaymentDetailsResponse {
  status: string;
  message: string;
  data: Payment;
}

export interface PaymentOverview {
  total_payments: number;
  successful_payments: number;
  pending_payments: number;
  failed_payments: number;
  total_amount_paid: string;
  pending_amount: string;
  currency: string;
}

export interface PaymentByGateway {
  gateway: string;
  count: number;
  total: string;
}

export interface PaymentByModule {
  module: string;
  count: number;
  total: string;
}

export interface PaymentStatistics {
  overview: PaymentOverview;
  by_gateway: PaymentByGateway[];
  by_module: PaymentByModule[];
  recent_payments: Payment[];
}

export interface PaymentStatisticsResponse {
  status: string;
  message: string;
  data: PaymentStatistics;
}

export interface PaymentHistoryFilters {
  status?: 'pending' | 'success' | 'failed' | 'cancelled';
  gateway?: 'pesapal' | 'flutterwave' | 'mpesa';
  module?: 'job' | 'scholarship' | 'course' | 'opportunity' | 'application_fee' | 'service_plan';
  per_page?: number;
  from_date?: string;
  to_date?: string;
}

