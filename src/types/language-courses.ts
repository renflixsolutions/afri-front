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

