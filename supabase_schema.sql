-- 1. Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('Staff', 'Admin')) DEFAULT 'Staff',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Technicians Table
CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  specialty TEXT,
  status TEXT CHECK (status IN ('Available', 'Assigned', 'On Call', 'Off Duty')),
  active_tickets_count INT DEFAULT 0,
  certifications TEXT[]
);

-- 3. Equipment Table
CREATE TABLE equipment (
  id TEXT PRIMARY KEY, -- Using text to support 'EQ-ICU-001' format
  name TEXT NOT NULL,
  model TEXT,
  manufacturer TEXT,
  serial_number TEXT,
  department TEXT,
  room TEXT,
  status TEXT CHECK (status IN ('Working', 'Down', 'Under Maintenance', 'Needs Attention')),
  criticality TEXT CHECK (criticality IN ('Life Support', 'Critical Diagnostic', 'Patient Monitoring', 'General Clinical')),
  install_date DATE,
  last_maintenance_date DATE,
  next_scheduled_maintenance DATE,
  assigned_technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  active_ticket_id TEXT,
  uptime_percentage FLOAT,
  total_downtime_hours FLOAT,
  specifications JSONB
);

-- 4. Problem Reports Table
CREATE TABLE problem_reports (
  id TEXT PRIMARY KEY,
  equipment_id TEXT REFERENCES equipment(id) ON DELETE CASCADE,
  department TEXT,
  room TEXT,
  severity TEXT CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  status TEXT CHECK (status IN ('Reported', 'Assigned', 'In Repair', 'Resolved')),
  reported_by TEXT,
  reported_role TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  issue_description TEXT,
  assigned_technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  repair_notes TEXT[],
  resolved_at TIMESTAMPTZ,
  resolution_summary TEXT,
  parts_used TEXT[],
  downtime_hours FLOAT
);

-- Add foreign key for active_ticket_id back to problem_reports
ALTER TABLE equipment ADD CONSTRAINT fk_active_ticket 
FOREIGN KEY (active_ticket_id) REFERENCES problem_reports(id) ON DELETE SET NULL;

-- 5. Maintenance Records Table
CREATE TABLE maintenance_records (
  id TEXT PRIMARY KEY,
  equipment_id TEXT REFERENCES equipment(id) ON DELETE CASCADE,
  date DATE,
  type TEXT CHECK (type IN ('Corrective Repair', 'Preventive Maintenance', 'Calibration', 'Inspection')),
  technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  description TEXT,
  parts_replaced TEXT[],
  downtime_hours FLOAT,
  cost FLOAT,
  resolved_date TIMESTAMPTZ,
  notes TEXT
);

-- 6. Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  message TEXT,
  type TEXT CHECK (type IN ('alert', 'warning', 'info', 'success')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  equipment_id TEXT REFERENCES equipment(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false
);

-- 7. Facility Settings Table
CREATE TABLE facility_settings (
  id INT PRIMARY KEY,
  hospital_name TEXT,
  facility_code TEXT,
  sla_critical_hours INT,
  sla_high_hours INT,
  primary_contact_phone TEXT,
  maintenance_email TEXT
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Technicians: Staff and Admin can view
CREATE POLICY "Anyone can view technicians" ON technicians FOR SELECT USING (true);
CREATE POLICY "Admins can manage technicians" ON technicians FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Equipment: Staff and Admin can view
CREATE POLICY "Anyone can view equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Admins can manage equipment" ON equipment FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Staff can insert equipment (Add) and update operational fields
CREATE POLICY "Staff can insert equipment" ON equipment FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Staff')
);

CREATE POLICY "Staff can update equipment" ON equipment FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Staff')
);
-- Problem Reports: Staff can create, Admins can manage
CREATE POLICY "Anyone can view problem reports" ON problem_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can report problems" ON problem_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage problem reports" ON problem_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Staff can update problem reports (assign, status changes, notes, resolve)
CREATE POLICY "Staff can update problem reports" ON problem_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Staff')
);

-- Maintenance Records: Admins can manage, anyone can view
CREATE POLICY "Anyone can view maintenance" ON maintenance_records FOR SELECT USING (true);
CREATE POLICY "Admins can manage maintenance" ON maintenance_records FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Staff can insert maintenance records when a repair is certified
CREATE POLICY "Staff can insert maintenance records" ON maintenance_records FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Staff')
);

-- Notifications: Users view their own (if assigned) or all if Admin
CREATE POLICY "Anyone can view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Staff can update their notifications (mark as read)
CREATE POLICY "Staff can update notifications" ON notifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Staff')
);

-- Facility Settings: Admin only
CREATE POLICY "Anyone can view settings" ON facility_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON facility_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'Staff');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
