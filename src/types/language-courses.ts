// Language Courses types
export interface LanguageCourseBundle {
  id?: number;
  name: string;
  included_levels: string[];
  duration_weeks: number;
  original_price: number;
  discount_percent?: number | null;
  discounted_price?: number | null;
}

export interface LanguageCourse {
  id: number;
  language: string;
  level: string;
  title: string;
  description: string;
  ideal_for: string;
  duration_weeks: number;
  price: number;
  bundles: LanguageCourseBundle[];
}

export interface LanguageCoursesPaginationData {
  current_page: number;
  data: LanguageCourse[];
  per_page: number;
  total: number;
}

export interface LanguageCoursesResponse {
  status: boolean;
  message: string;
  data: LanguageCoursesPaginationData;
}

export interface LanguageCourseResponse {
  status: boolean;
  message: string;
  data: LanguageCourse;
}

// Enrollment types
export interface Enrollment {
  id: string;
  full_name: string;
  course_name: string;
  bundle_id: number;
  email: string;
  phone: string;
  preferred_timezone: string;
  payment_reference: string;
  status: string;
  enrolled_at: string;
}

export interface EnrollmentsPaginationData {
  current_page: number;
  data: Enrollment[];
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

export interface EnrollmentsResponse {
  status: boolean;
  message: string;
  data: EnrollmentsPaginationData;
}
