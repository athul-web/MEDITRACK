-- Seed data for public_hospitals (Demo Records)
-- These are synthetic test records for functional verification.
-- All hospitals are located in Ernakulam/Kochi area, Kerala.

INSERT INTO public_hospitals (name, address, city, state, verified, last_updated, latitude, longitude, resources, contact)
VALUES
('MediTrack Demo Hospital 01', '123 Demo Medical Road, Kochi', 'Kochi', 'Kerala', false, now(), 9.9312, 76.2673,
 '{"emergencyDepartment": "available", "icu": "available", "ventilator": "available", "ctScan": "available", "blood": "available"}',
 '{"phone": "TEST-01", "emergencyPhone": "TEST-EMER-01"}'),

('MediTrack Demo Hospital 02', '45 Demo Healthcare Junction, Kalamassery', 'Kalamassery', 'Kerala', false, now(), 10.0285, 76.3361,
 '{"emergencyDepartment": "available", "icu": "available", "ventilator": "unknown", "ctScan": "unavailable", "blood": "unavailable"}',
 '{"phone": "TEST-02", "emergencyPhone": "TEST-EMER-02"}'),

('MediTrack Demo Hospital 03', '78 MediTrack Avenue, Aluva', 'Aluva', 'Kerala', false, now(), 10.1120, 76.3450,
 '{"emergencyDepartment": "available", "icu": "unknown", "ventilator": "unavailable", "ctScan": "available", "blood": "available"}',
 '{"phone": "TEST-03", "emergencyPhone": "TEST-EMER-03"}'),

('MediTrack Demo Hospital 04', '10 Test Hospital Road, Angamaly', 'Angamaly', 'Kerala', false, now(), 10.2410, 76.4320,
 '{"emergencyDepartment": "unavailable", "icu": "unavailable", "ventilator": "available", "ctScan": "unknown", "blood": "available"}',
 '{"phone": "TEST-04", "emergencyPhone": "TEST-EMER-04"}'),

('MediTrack Demo Hospital 05', '22 Demo Medical Road, Tripunithura', 'Tripunithura', 'Kerala', false, now(), 9.9120, 76.2850,
 '{"emergencyDepartment": "available", "icu": "available", "ventilator": "available", "ctScan": "available", "blood": "unavailable"}',
 '{"phone": "TEST-05", "emergencyPhone": "TEST-EMER-05"}'),

('MediTrack Demo Hospital 06', '56 Healthcare Way, Perumbavoor', 'Perumbavoor', 'Kerala', false, now(), 10.1530, 76.5210,
 '{"emergencyDepartment": "available", "icu": "unavailable", "ventilator": "unavailable", "ctScan": "available", "blood": "unknown"}',
 '{"phone": "TEST-06", "emergencyPhone": "TEST-EMER-06"}'),

('MediTrack Demo Hospital 07', '89 Demo Avenue, North Paravur', 'North Paravur', 'Kerala', false, now(), 10.1250, 76.2150,
 '{"emergencyDepartment": "available", "icu": "available", "ventilator": "unknown", "ctScan": "unavailable", "blood": "available"}',
 '{"phone": "TEST-07", "emergencyPhone": "TEST-EMER-07"}'),

('MediTrack Demo Hospital 08', '34 Test Road, Muvattupuzha', 'Muvattupuzha', 'Kerala', false, now(), 10.0520, 76.6530,
 '{"emergencyDepartment": "unavailable", "icu": "available", "ventilator": "available", "ctScan": "available", "blood": "unavailable"}',
 '{"phone": "TEST-08", "emergencyPhone": "TEST-EMER-08"}'),

('MediTrack Demo Hospital 09', '67 Healthcare Road, Kothamangalam', 'Kothamangalam', 'Kerala', false, now(), 10.1820, 76.7120,
 '{"emergencyDepartment": "available", "icu": "unavailable", "ventilator": "available", "ctScan": "unknown", "blood": "available"}',
 '{"phone": "TEST-09", "emergencyPhone": "TEST-EMER-09"}'),

('MediTrack Demo Hospital 10', '11 Demo Circle, Kochi', 'Kochi', 'Kerala', false, now(), 9.9450, 76.2810,
 '{"emergencyDepartment": "available", "icu": "available", "ventilator": "available", "ctScan": "available", "blood": "available"}',
 '{"phone": "TEST-10", "emergencyPhone": "TEST-EMER-10"}'),

('MediTrack Demo Hospital 11', '23 Test Avenue, Kalamassery', 'Kalamassery', 'Kerala', false, now(), 10.0350, 76.3420,
 '{"emergencyDepartment": "available", "icu": "unknown", "ventilator": "unavailable", "ctScan": "available", "blood": "unavailable"}',
 '{"phone": "TEST-11", "emergencyPhone": "TEST-EMER-11"}'),

('MediTrack Demo Hospital 12', '44 Demo Road, Aluva', 'Aluva', 'Kerala', false, now(), 10.1210, 76.3510,
 '{"emergencyDepartment": "unavailable", "icu": "available", "ventilator": "available", "ctScan": "unavailable", "blood": "available"}',
 '{"phone": "TEST-12", "emergencyPhone": "TEST-EMER-12"}'),

('MediTrack Demo Hospital 13', '66 Healthcare Way, Angamaly', 'Angamaly', 'Kerala', false, now(), 10.2510, 76.4410,
 '{"emergencyDepartment": "available", "icu": "available", "ventilator": "unavailable", "ctScan": "available", "blood": "unknown"}',
 '{"phone": "TEST-13", "emergencyPhone": "TEST-EMER-13"}'),

('MediTrack Demo Hospital 14', '88 Test Road, Tripunithura', 'Tripunithura', 'Kerala', false, now(), 9.9210, 76.2950,
 '{"emergencyDepartment": "available", "icu": "unavailable", "ventilator": "available", "ctScan": "available", "blood": "available"}',
 '{"phone": "TEST-14", "emergencyPhone": "TEST-EMER-14"}'),

('MediTrack Demo Hospital 15', '99 Demo Avenue, Perumbavoor', 'Perumbavoor', 'Kerala', false, now(), 10.1620, 76.5310,
 '{"emergencyDepartment": "unavailable", "icu": "available", "ventilator": "unknown", "ctScan": "unavailable", "blood": "available"}',
 '{"phone": "TEST-15", "emergencyPhone": "TEST-EMER-15"}');
