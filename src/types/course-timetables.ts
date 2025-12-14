// Course Timetable types

export interface CourseLevelConfig {
  id?: number;
  timetable_id?: number;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  duration_weeks: number;
  total_sessions: number;
  total_hours: number;
  created_at?: string;
  updated_at?: string;
}

export interface CourseScheduleItem {
  day: string;
  time: string;
  frequency: string;
}

export interface CourseTrack {
  id?: number;
  timetable_id?: number;
  name: string;
  schedule: CourseScheduleItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CourseOffering {
  id: number;
  timetable_id: number;
  track_id: number;
  language: string;
  level: string;
  end_date: string;
  max_students: number | null;
  enrolled_count: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CourseTimetable {
  id: number;
  name: string;
  registration_start: string;
  registration_end: string;
  classes_start: string;
  is_active: boolean;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  level_configs?: CourseLevelConfig[];
  tracks?: CourseTrack[];
  offerings?: CourseOffering[];
}

export interface CourseTimetablesPaginationData {
  current_page: number;
  data: CourseTimetable[];
  per_page: number;
  total: number;
}

export interface CourseTimetablesResponse {
  status: string;
  message: string;
  data: CourseTimetable[];
}

export interface CourseTimetableResponse {
  status: string;
  message: string;
  data: CourseTimetable;
}

export interface CreateTimetablePayload {
  name: string;
  registration_start: string;
  registration_end: string;
  classes_start: string;
  is_active?: boolean;
  meta?: Record<string, unknown>;
}

export interface UpdateLevelConfigsPayload {
  levels: Omit<CourseLevelConfig, 'id' | 'timetable_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateTracksPayload {
  tracks: Omit<CourseTrack, 'id' | 'timetable_id' | 'created_at' | 'updated_at'>[];
}

export interface GenerateOfferingsPayload {
  languages: string[];
  max_students_per_offering?: number;
}

export interface GenerateOfferingsResponse {
  status: string;
  message: string;
  data: {
    total_offerings: number;
    offerings: CourseOffering[];
  };
}

// Schedule Overview types (for public display)
export interface RegistrationPeriod {
  start: string;
  end: string;
  classes_start: string;
}

export interface LevelDuration {
  level: string;
  duration: string;
  total_sessions: number;
  total_hours: number;
}

export interface CourseOption {
  id: number;
  language: string;
  level: string;
  track: string;
  schedule: CourseScheduleItem[];
  duration: string;
  end_date: string;
  available_slots: number | null;
}

export interface ScheduleOverview {
  registration_period: RegistrationPeriod;
  level_durations: LevelDuration[];
  tracks: CourseTrack[];
  course_options: CourseOption[];
}

export interface ScheduleOverviewResponse {
  status: string;
  message: string;
  data: ScheduleOverview;
}

