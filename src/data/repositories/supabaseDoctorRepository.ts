import { DoctorRepository } from './doctorRepository';
import {
  Doctor,
  PublicHospitalDoctor,
  AdminHospitalDoctor,
  CreateDoctorProfileInput,
  CreateDoctorAffiliationInput,
  VerifyAndPublishDoctorInput,
  DoctorSearchFilters,
  DoctorSort,
} from '../../types/doctor';
import { supabase } from '../../lib/supabase';
import { isAbortError } from '../../utils/http';

export class SupabaseDoctorRepository implements DoctorRepository {
  /**
   * Get published and verified doctors for a public hospital.
   * Uses the public RPC which respects RLS and only returns verified+published doctors.
   */
  async getPublishedDoctorsForHospital(publicHospitalId: string): Promise<PublicHospitalDoctor[]> {
    const { data, error } = await supabase.rpc(
      'get_published_doctors_for_public_hospital',
      { p_public_hospital_id: publicHospitalId }
    );

    if (error) throw error;
    return (data ?? []) as PublicHospitalDoctor[];
  }

  /**
   * Get all doctors for a hospital (including unpublished/unverified).
   * Only accessible to Hospital Admin (own hospital), doctor_admin, super_admin.
   */
  async getAllDoctorsForHospitalAdmin(publicHospitalId: string): Promise<AdminHospitalDoctor[]> {
    const { data, error } = await supabase.rpc(
      'get_all_doctors_for_hospital_admin',
      { p_public_hospital_id: publicHospitalId }
    );

    if (error) throw error;
    return (data ?? []) as AdminHospitalDoctor[];
  }

  /**
   * Create a new doctor profile.
   * Only doctor_admin and super_admin can call this.
   */
  async createDoctorProfile(input: CreateDoctorProfileInput): Promise<string> {
    const { data, error } = await supabase.rpc('create_doctor_profile', {
      p_full_name: input.fullName,
      p_slug: input.slug,
      p_qualification: input.qualification ?? null,
      p_specialties: input.specialties ?? [],
      p_sub_specialties: input.subSpecialties ?? [],
      p_experience_years: input.experienceYears ?? null,
      p_languages: input.languages ?? [],
      p_bio: input.bio ?? null,
      p_profile_image_url: input.profileImageUrl ?? null,
      p_consultation_fee_inr: input.consultationFeeInr ?? null,
      p_verification_status: input.verificationStatus ?? 'unverified',
      p_is_published: input.isPublished ?? false,
      p_source_url: input.sourceUrl ?? null,
    });

    if (error) throw error;
    return data as string;
  }

  /**
   * Verify and/or publish a doctor.
   * Only doctor_admin and super_admin can call this.
   */
  async verifyAndPublishDoctor(input: VerifyAndPublishDoctorInput): Promise<void> {
    const { error } = await supabase.rpc('verify_and_publish_doctor', {
      p_doctor_id: input.doctorId,
      p_verification_status: input.verificationStatus,
      p_is_published: input.isPublished,
    });

    if (error) throw error;
  }

  /**
   * Create a doctor-hospital affiliation.
   * Hospital Admin can create for their own hospital.
   * doctor_admin/super_admin can create for any hospital.
   */
  async createDoctorAffiliation(input: CreateDoctorAffiliationInput): Promise<string> {
    const { data, error } = await supabase.rpc('create_doctor_affiliation', {
      p_doctor_id: input.doctorId,
      p_public_hospital_id: input.publicHospitalId,
      p_department: input.department,
      p_designation: input.designation ?? null,
      p_is_primary_affiliation: input.isPrimaryAffiliation ?? false,
      p_appointment_booking_url: input.appointmentBookingUrl ?? null,
      p_hospital_consultation_fee_inr: input.hospitalConsultationFeeInr ?? null,
      p_is_accepting_patients: input.isAcceptingPatients ?? true,
      p_available_days: input.availableDays ?? [],
      p_available_hours: input.availableHours ?? null,
    });

    if (error) throw error;
    return data as string;
  }

  /**
   * Update a doctor-hospital affiliation.
   * Uses direct table update with RLS enforcement.
   */
  async updateDoctorAffiliation(
    affiliationId: string,
    updates: Partial<CreateDoctorAffiliationInput>
  ): Promise<void> {
    const updatePayload: Record<string, unknown> = {};

    if (updates.department !== undefined) updatePayload.department = updates.department;
    if (updates.designation !== undefined) updatePayload.designation = updates.designation;
    if (updates.isPrimaryAffiliation !== undefined) updatePayload.is_primary_affiliation = updates.isPrimaryAffiliation;
    if (updates.appointmentBookingUrl !== undefined) updatePayload.appointment_booking_url = updates.appointmentBookingUrl;
    if (updates.hospitalConsultationFeeInr !== undefined) updatePayload.hospital_consultation_fee_inr = updates.hospitalConsultationFeeInr;
    if (updates.isAcceptingPatients !== undefined) updatePayload.is_accepting_patients = updates.isAcceptingPatients;
    if (updates.availableDays !== undefined) updatePayload.available_days = updates.availableDays;
    if (updates.availableHours !== undefined) updatePayload.available_hours = updates.availableHours;

    // If setting as primary, the RPC handles unsetting others. For direct update,
    // we rely on the unique constraint and the caller to handle this logic.
    // Better to use a dedicated RPC for primary changes, but for now use direct update.

    const { error } = await supabase
      .from('hospital_doctors')
      .update(updatePayload)
      .eq('id', affiliationId);

    if (error) throw error;
  }

  /**
   * Delete a doctor-hospital affiliation.
   */
  async deleteDoctorAffiliation(affiliationId: string): Promise<void> {
    const { error } = await supabase
      .from('hospital_doctors')
      .delete()
      .eq('id', affiliationId);

    if (error) throw error;
  }

  /**
   * Assign a privileged role (doctor_admin or super_admin).
   * Only super_admin can call this.
   */
  async assignPrivilegedRole(targetUserId: string, role: 'doctor_admin' | 'super_admin'): Promise<void> {
    const { error } = await supabase.rpc('assign_privileged_role', {
      p_target_user_id: targetUserId,
      p_role: role,
    });

    if (error) throw error;
  }

  /**
   * Search doctors with filters.
   * This is a direct query for admin interfaces.
   */
  async searchDoctors(
    filters: DoctorSearchFilters,
    sort: DoctorSort = 'name',
    options?: { signal?: AbortSignal }
  ): Promise<Doctor[]> {
    let query = supabase.from('doctors').select('*');

    if (filters.query && filters.query.trim()) {
      query = query.ilike('full_name', `%${filters.query.trim()}%`);
    }

    if (filters.specialties && filters.specialties.length > 0) {
      query = query.overlaps('specialties', filters.specialties);
    }

    if (filters.subSpecialties && filters.subSpecialties.length > 0) {
      query = query.overlaps('sub_specialties', filters.subSpecialties);
    }

    if (filters.verificationStatus && filters.verificationStatus.length > 0) {
      query = query.in('verification_status', filters.verificationStatus);
    }

    if (filters.isPublished !== undefined) {
      query = query.eq('is_published', filters.isPublished);
    }

    if (filters.hospitalId) {
      // Join with hospital_doctors to filter by hospital
      query = query.select(`
        *,
        hospital_doctors!inner(public_hospital_id)
      `).eq('hospital_doctors.public_hospital_id', filters.hospitalId);
    }

    switch (sort) {
      case 'name':
        query = query.order('full_name');
        break;
      case 'experience':
        query = query.order('experience_years', { ascending: false, nullsFirst: false });
        break;
      case 'fee':
        query = query.order('consultation_fee_inr', { ascending: false, nullsFirst: false });
        break;
      case 'recentlyAdded':
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query.abortSignal(options?.signal);
    if (error) {
      if (isAbortError(error)) throw error;
      throw error;
    }

    return (data ?? []) as Doctor[];
  }
}