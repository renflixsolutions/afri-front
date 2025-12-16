// Course Fee Payment types

export interface Student {
  name: string;
  email: string;
  phone: string | null;
}

export interface CourseDetails {
  type: 'course' | 'bundle';
  name: string;
  course_id: number | null;
  bundle_id: number | null;
}

export interface FeeSummary {
  total_fee: string;
  amount_paid: string;
  balance: string;
  minimum_required: string;
  payment_status: 'pending' | 'partial' | 'full';
  percentage_paid: number;
}

export interface Eligibility {
  is_eligible_for_class: boolean;
  first_installment_paid: boolean;
  second_installment_paid: boolean;
}

export interface Installment {
  installment_number: number;
  amount: string;
  status: 'pending' | 'paid' | 'failed';
  paid_at: string | null;
  payment_reference: string | null;
}

export interface NextAction {
  message: string;
  can_attend_class: boolean;
  balance_due: string;
  action_required: boolean;
}

export interface CourseFeePayment {
  id: number;
  enrollment_id: number;
  student: Student;
  course_details: CourseDetails;
  fee_summary: FeeSummary;
  eligibility: Eligibility;
  installments: Installment[];
  payment_link: string;
  due_date: string;
  created_at: string;
  next_action: NextAction;
}

export interface CourseFeesPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CourseFeesResponse {
  status: string;
  message: string;
  data: {
    course_fees: CourseFeePayment[];
    pagination: CourseFeesPagination;
  };
}

export interface OverviewStats {
  total_students: number;
  fully_paid: number;
  partially_paid: number;
  pending: number;
  eligible_for_class: number;
}

export interface FinancialStats {
  total_fees: string;
  total_collected: string;
  total_balance: string;
  collection_rate: number;
}

export interface CourseFeeStatistics {
  overview: OverviewStats;
  financial: FinancialStats;
}

export interface CourseFeesStatisticsResponse {
  status: string;
  message: string;
  data: CourseFeeStatistics;
}

export interface CourseFeeFilters {
  payment_status?: 'pending' | 'partial' | 'full';
  is_eligible?: boolean;
  per_page?: number;
}

