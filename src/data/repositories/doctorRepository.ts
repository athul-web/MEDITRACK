/**
 * Doctor Repository Pattern
 * Abstracts data source so UI doesn't depend on implementation.
 */

import {
  Doctor,
  HospitalDoctorAffiliation,
  PublicHospitalDoctor,
  AdminHospitalDoctor,
  CreateDoctorProfileInput,
  CreateDoctorAffiliationInput,
  VerifyAndPublishDoctorInput,
  DoctorSearchFilters,
  DoctorSort,
} from '../../types/doctor';
import { SupabaseDoctorRepository } from './supabaseDoctorRepository';

export interface DoctorRepository {
  // Public directory queries
  getPublishedDoctorsForHospital(publicHospitalId: string): Promise<PublicHospitalDoctor[]>;

  // Admin queries
  getAllDoctorsForHospitalAdmin(publicHospitalId: string): Promise<AdminHospitalDoctor[]>;

  // Doctor profile management (doctor_admin/super_admin)
  createDoctorProfile(input: CreateDoctorProfileInput): Promise<string>;
  verifyAndPublishDoctor(input: VerifyAndPublishDoctorInput): Promise<void>;

  // Affiliation management
  createDoctorAffiliation(input: CreateDoctorAffiliationInput): Promise<string>;
  updateDoctorAffiliation(affiliationId: string, updates: Partial<CreateDoctorAffiliationInput>): Promise<void>;
  deleteDoctorAffiliation(affiliationId: string): Promise<void>;

  // Role management (super_admin)
  assignPrivilegedRole(targetUserId: string, role: 'doctor_admin' | 'super_admin'): Promise<void>;

  // Search
  searchDoctors(
    filters: DoctorSearchFilters,
    sort?: DoctorSort,
    options?: { signal?: AbortSignal }
  ): Promise<Doctor[]>;
}

// Export singleton instance
export const doctorRepository: DoctorRepository = new SupabaseDoctorRepository();