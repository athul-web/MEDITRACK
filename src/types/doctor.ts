/**
 * Doctor types for public directory and admin interfaces
 */

export type DoctorVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Doctor {
  id: string;
  fullName: string;
  slug: string;
  qualification?: string;
  specialties: string[];
  subSpecialties: string[];
  experienceYears?: number;
  languages: string[];
  bio?: string;
  profileImageUrl?: string;
  consultationFeeInr?: number;
  verificationStatus: DoctorVerificationStatus;
  isPublished: boolean;
  sourceUrl?: string;
  lastVerifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalDoctorAffiliation {
  id: string;
  doctorId: string;
  publicHospitalId: string;
  department: string;
  designation?: string;
  isPrimaryAffiliation: boolean;
  appointmentBookingUrl?: string;
  hospitalConsultationFeeInr?: number;
  isAcceptingPatients: boolean;
  availableDays: string[];
  availableHours?: string;
  isActive: boolean;
  affiliationVerifiedAt?: string;
  affiliationVerifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/** Combined view for public hospital doctor display */
export interface PublicHospitalDoctor {
  doctorId: string;
  fullName: string;
  slug: string;
  qualification?: string;
  specialties: string[];
  subSpecialties: string[];
  experienceYears?: number;
  languages: string[];
  bio?: string;
  profileImageUrl?: string;
  consultationFeeInr?: number;
  department: string;
  designation?: string;
  isPrimaryAffiliation: boolean;
  appointmentBookingUrl?: string;
  hospitalConsultationFeeInr?: number;
  isAcceptingPatients: boolean;
  availableDays: string[];
  availableHours?: string;
}

/** Admin view with all fields including verification status */
export interface AdminHospitalDoctor extends PublicHospitalDoctor {
  verificationStatus: DoctorVerificationStatus;
  isPublished: boolean;
  isActive: boolean;
  affiliationVerifiedAt?: string;
  affiliationVerifiedBy?: string;
  /** The affiliation ID (from hospital_doctors.id) */
  id: string;
  /** The public hospital ID (same for all rows when filtered by hospital) */
  publicHospitalId: string;
}

/** Input types for RPC calls */
export interface CreateDoctorProfileInput {
  fullName: string;
  slug: string;
  qualification?: string;
  specialties?: string[];
  subSpecialties?: string[];
  experienceYears?: number;
  languages?: string[];
  bio?: string;
  profileImageUrl?: string;
  consultationFeeInr?: number;
  verificationStatus?: DoctorVerificationStatus;
  isPublished?: boolean;
  sourceUrl?: string;
}

export interface CreateDoctorAffiliationInput {
  doctorId: string;
  publicHospitalId: string;
  department: string;
  designation?: string;
  isPrimaryAffiliation?: boolean;
  appointmentBookingUrl?: string;
  hospitalConsultationFeeInr?: number;
  isAcceptingPatients?: boolean;
  availableDays?: string[];
  availableHours?: string;
}

export interface VerifyAndPublishDoctorInput {
  doctorId: string;
  verificationStatus: DoctorVerificationStatus;
  isPublished: boolean;
}

export interface AssignPrivilegedRoleInput {
  targetUserId: string;
  role: 'doctor_admin' | 'super_admin';
}

/** Search and filter types */
export interface DoctorSearchFilters {
  query?: string;
  specialties?: string[];
  subSpecialties?: string[];
  verificationStatus?: DoctorVerificationStatus[];
  isPublished?: boolean;
  hospitalId?: string;
}

export type DoctorSort = 'name' | 'experience' | 'fee' | 'recentlyAdded';