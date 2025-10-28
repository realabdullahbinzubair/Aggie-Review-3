export interface Department {
  id: string;
  name: string;
  code: string;
  created_at?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department_id: string;
  created_at?: string;
  department?: Department;
}

export interface Professor {
  id: string;
  name: string;
  department_id: string;
  title: string;
  average_rating: number;
  total_reviews: number;
  would_take_again_percent: number;
  difficulty_rating: number;
  created_at?: string;
  department?: Department;
  departments?: Department[];
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  professor_id: string;
  user_id: string;
  course_id: string;
  rating: number;
  difficulty: number;
  would_take_again: boolean;
  for_credit: boolean;
  attendance_mandatory: boolean;
  grade_received?: string;
  comment: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  professor?: Professor;
  course?: Course;
  profile?: Profile;
}

export interface NewReview {
  professor_id: string;
  course_id: string;
  rating: number;
  difficulty: number;
  would_take_again: boolean;
  for_credit: boolean;
  attendance_mandatory: boolean;
  grade_received?: string;
  comment: string;
}
