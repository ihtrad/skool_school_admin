/*
# Create school management tables (single-tenant, no auth)

1. New Tables
- `students` — stores student records (name, grade, section, roll number, email, guardian name, status, credits, created_at).
- `teachers` — stores teacher records (name, subject, email, phone, experience years, status, created_at).
- `events` — stores school events (title, description, date, location, category, status, created_at).
2. Security
- Single-tenant app with no sign-in. Enable RLS on all tables.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade text NOT NULL,
  section text NOT NULL DEFAULT 'A',
  roll_number text,
  email text,
  guardian_name text,
  status text NOT NULL DEFAULT 'Active',
  credits integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  email text,
  phone text,
  experience_years integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  location text,
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'Upcoming',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_teachers" ON teachers;
CREATE POLICY "anon_select_teachers" ON teachers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_teachers" ON teachers;
CREATE POLICY "anon_insert_teachers" ON teachers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_teachers" ON teachers;
CREATE POLICY "anon_update_teachers" ON teachers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_teachers" ON teachers;
CREATE POLICY "anon_delete_teachers" ON teachers FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_events" ON events;
CREATE POLICY "anon_select_events" ON events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_events" ON events;
CREATE POLICY "anon_insert_events" ON events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_events" ON events;
CREATE POLICY "anon_update_events" ON events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_events" ON events;
CREATE POLICY "anon_delete_events" ON events FOR DELETE
  TO anon, authenticated USING (true);
