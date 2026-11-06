# MediTrack Security Test Plan

## Test Database Requirements
- Use a dedicated Supabase project or local Supabase database.
- Apply migrations through 20261005_security_remediation_recommended.sql.
- Do not test against production data.

## Required Fixtures
- Hospital A and Hospital B rows in public.hospitals.
- User A Staff assigned to Hospital A.
- User B Staff assigned to Hospital B.
- User Admin assigned to Hospital A.

## Test Cases
1. Hospital A Staff can read/update Hospital A equipment and reports.
2. Hospital A Staff cannot read/update/delete Hospital B records.
3. Hospital A Staff cannot insert records with Hospital B hospital_id.
4. Staff cannot transfer own equipment or reports to Hospital B.
5. Staff cannot set own role to Admin or change hospital_id.
6. Anonymous user cannot update public_hospitals records.
7. Contact inquiry anonymous direct insert is denied; allowed path uses Edge Function.
8. Invalid input, oversized payload, unexpected fields, and repeated submissions are rejected.
9. Missing profile fails closed.
10. Expired/invalid session denies protected access.
