export type Student = {
  id: string;
  name: string;
  grade: string;
  section: string;
  roll_number: string | null;
  email: string | null;
  guardian_name: string | null;
  status: string;
  credits: number;
  created_at: string;
};

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  email: string | null;
  phone: string | null;
  experience_years: number;
  status: string;
  created_at: string;
};

export type SchoolEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  category: string;
  status: string;
  created_at: string;
};

export type StudentInput = {
  name: string;
  grade: string;
  section: string;
  roll_number: string;
  email: string;
  guardian_name: string;
  status: string;
  credits: number;
};

export type TeacherInput = {
  name: string;
  subject: string;
  email: string;
  phone: string;
  experience_years: number;
  status: string;
};

export type EventInput = {
  title: string;
  description: string;
  event_date: string;
  location: string;
  category: string;
  status: string;
};
