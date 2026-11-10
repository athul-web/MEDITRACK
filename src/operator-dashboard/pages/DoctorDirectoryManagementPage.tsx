import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  User,
  GraduationCap,
  ShieldCheck,
  Eye,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  Hospital,
  MapPin,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { doctorRepository } from '../../data/repositories/doctorRepository';
import {
  Doctor,
  AdminHospitalDoctor,
  CreateDoctorProfileInput,
  CreateDoctorAffiliationInput,
  VerifyAndPublishDoctorInput,
  DoctorSearchFilters,
  DoctorSort,
  DoctorVerificationStatus,
} from '../../types/doctor';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';

const VERIFICATION_STATUS_OPTIONS: { value: DoctorVerificationStatus; label: string; color: string }[] = [
  { value: 'unverified', label: 'Unverified', color: 'bg-slate-100 text-slate-700' },
  { value: 'pending', label: 'Pending Review', color: 'bg-amber-100 text-amber-700' },
  { value: 'verified', label: 'Verified', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-rose-100 text-rose-700' },
];

const DEFAULT_DOCTOR_FORM: CreateDoctorProfileInput = {
  fullName: '',
  slug: '',
  qualification: '',
  specialties: [],
  subSpecialties: [],
  experienceYears: undefined,
  languages: [],
  bio: '',
  profileImageUrl: '',
  consultationFeeInr: undefined,
  verificationStatus: 'unverified',
  isPublished: false,
  sourceUrl: '',
};

const DEFAULT_AFFILIATION_FORM: CreateDoctorAffiliationInput = {
  doctorId: '',
  publicHospitalId: '',
  department: '',
  designation: '',
  isPrimaryAffiliation: false,
  appointmentBookingUrl: '',
  hospitalConsultationFeeInr: undefined,
  isAcceptingPatients: true,
  availableDays: [],
  availableHours: '',
};

export function DoctorDirectoryManagement() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<DoctorVerificationStatus | 'all'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<DoctorSort>('name');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAffiliationModalOpen, setIsAffiliationModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<CreateDoctorProfileInput>(DEFAULT_DOCTOR_FORM);
  const [affiliationForm, setAffiliationForm] = useState<CreateDoctorAffiliationInput>(DEFAULT_AFFILIATION_FORM);
  const [verifyForm, setVerifyForm] = useState<VerifyAndPublishDoctorInput>({
    doctorId: '',
    verificationStatus: 'verified',
    isPublished: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publicHospitals, setPublicHospitals] = useState<{ id: string; name: string }[]>([]);

  // Load doctors
  const loadDoctors = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const filters: DoctorSearchFilters = {
        query: searchQuery || undefined,
        verificationStatus: verificationFilter !== 'all' ? [verificationFilter] : undefined,
        specialties: specialtyFilter !== 'all' ? [specialtyFilter] : undefined,
      };
      const results = await doctorRepository.searchDoctors(filters, sortBy);
      setDoctors(results);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, verificationFilter, specialtyFilter, sortBy]);

  // Load public hospitals for affiliation dropdown
  useEffect(() => {
    let isActive = true;
    async function loadPublicHospitals() {
      const { data, error } = await supabase
        .from('public_hospitals')
        .select('id, name')
        .order('name');
      if (error) {
        console.error('Failed to load public hospitals:', error);
        return;
      }
      if (isActive) setPublicHospitals((data ?? []) as { id: string; name: string }[]);
    }
    loadPublicHospitals();
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Get unique specialties from loaded doctors
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach(d => d.specialties.forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [doctors]);

  // Form handlers
  const handleDoctorFormChange = (field: string, value: any) => {
    setDoctorForm(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleAffiliationFormChange = (field: string, value: any) => {
    setAffiliationForm(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleVerifyFormChange = (field: string, value: any) => {
    setVerifyForm(prev => ({ ...prev, [field]: value }));
  };

  const openCreateDoctorModal = () => {
    setDoctorForm(DEFAULT_DOCTOR_FORM);
    setIsCreateModalOpen(true);
  };

  const openEditDoctorModal = (doctor: Doctor) => {
    setDoctorForm({
      fullName: doctor.fullName,
      slug: doctor.slug,
      qualification: doctor.qualification || '',
      specialties: doctor.specialties,
      subSpecialties: doctor.subSpecialties,
      experienceYears: doctor.experienceYears,
      languages: doctor.languages,
      bio: doctor.bio || '',
      profileImageUrl: doctor.profileImageUrl || '',
      consultationFeeInr: doctor.consultationFeeInr,
      verificationStatus: doctor.verificationStatus,
      isPublished: doctor.isPublished,
      sourceUrl: doctor.sourceUrl || '',
    });
    setSelectedDoctor(doctor);
    setIsEditModalOpen(true);
  };

  const openAffiliationModal = (doctor: Doctor) => {
    setAffiliationForm({ ...DEFAULT_AFFILIATION_FORM, doctorId: doctor.id });
    setSelectedDoctor(doctor);
    setIsAffiliationModalOpen(true);
  };

  const openVerifyModal = (doctor: Doctor) => {
    setVerifyForm({
      doctorId: doctor.id,
      verificationStatus: doctor.verificationStatus === 'verified' ? 'verified' : 'verified',
      isPublished: !doctor.isPublished,
    });
    setSelectedDoctor(doctor);
    setIsVerifyModalOpen(true);
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await doctorRepository.createDoctorProfile(doctorForm);
      setIsCreateModalOpen(false);
      setDoctorForm(DEFAULT_DOCTOR_FORM);
      loadDoctors();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('doctors')
        .update({
          full_name: doctorForm.fullName,
          qualification: doctorForm.qualification || null,
          specialties: doctorForm.specialties,
          sub_specialties: doctorForm.subSpecialties,
          experience_years: doctorForm.experienceYears ?? null,
          languages: doctorForm.languages,
          bio: doctorForm.bio || null,
          profile_image_url: doctorForm.profileImageUrl || null,
          consultation_fee_inr: doctorForm.consultationFeeInr ?? null,
          verification_status: doctorForm.verificationStatus,
          is_published: doctorForm.isPublished,
          source_url: doctorForm.sourceUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedDoctor?.id);
      if (updateError) throw updateError;
      setIsEditModalOpen(false);
      setSelectedDoctor(null);
      loadDoctors();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAffiliation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await doctorRepository.createDoctorAffiliation(affiliationForm);
      setIsAffiliationModalOpen(false);
      setAffiliationForm(DEFAULT_AFFILIATION_FORM);
      setSelectedDoctor(null);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create affiliation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await doctorRepository.verifyAndPublishDoctor(verifyForm);
      setIsVerifyModalOpen(false);
      setSelectedDoctor(null);
      loadDoctors();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to verify/publish doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor profile? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('doctors').delete().eq('id', doctorId);
      if (error) throw error;
      loadDoctors();
    } catch (err: any) {
      alert(`Failed to delete doctor: ${err?.message}`);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-navy-500 text-sm">Loading doctor directory…</div>;
  }

  if (loadError) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">{loadError}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Doctor Directory Management</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Manage doctor profiles, verifications, and hospital affiliations.
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Global Admin
            </span>
          </p>
        </div>
        <button onClick={openCreateDoctorModal} className="inline-flex items-center gap-2 px-3 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" />
          Add Doctor
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, specialty..."
            className="flex-1"
          />
          <FilterDropdown
            label="Verification"
            value={verificationFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              ...VERIFICATION_STATUS_OPTIONS.map(o => ({ value: o.value, label: o.label })),
            ]}
            onChange={setVerificationFilter as (value: string) => void}
          />
          <FilterDropdown
            label="Specialty"
            value={specialtyFilter}
            options={[
              { value: 'all', label: 'All Specialties' },
              ...allSpecialties.map(s => ({ value: s, label: s })),
            ]}
            onChange={setSpecialtyFilter}
          />
          <FilterDropdown
            label="Sort By"
            value={sortBy}
            options={[
              { value: 'name', label: 'Name (A-Z)' },
              { value: 'experience', label: 'Experience (High-Low)' },
              { value: 'fee', label: 'Fee (High-Low)' },
              { value: 'recentlyAdded', label: 'Recently Added' },
            ]}
            onChange={(value: string) => setSortBy(value as DoctorSort)}
          />
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {doctors.length === 0 ? (
          <EmptyState
            title="No doctors found"
            description="No doctor profiles match your current filters. Try adjusting your search or add a new doctor."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-navy-600 font-medium">
                  <tr>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Specialties</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Fee (₹)</th>
                    <th className="px-4 py-3">Verification</th>
                    <th className="px-4 py-3">Published</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-navy-900">{doctor.fullName}</div>
                        <div className="text-xs text-navy-500">{doctor.slug}</div>
                        {doctor.qualification && (
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3 h-3" />
                            {doctor.qualification}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {doctor.specialties.slice(0, 3).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-[#E4F6FA] text-[#073B55] rounded-full">
                              {s}
                            </span>
                          ))}
                          {doctor.specialties.length > 3 && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 rounded-full">
                              +{doctor.specialties.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-navy-700">
                        {doctor.experienceYears ? `${doctor.experienceYears} years` : '—'}
                      </td>
                      <td className="px-4 py-3 text-navy-700 tabular-nums">
                        {doctor.consultationFeeInr ? doctor.consultationFeeInr.toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const status = VERIFICATION_STATUS_OPTIONS.find(s => s.value === doctor.verificationStatus);
                          return (
                            <StatusBadge variant={
                              doctor.verificationStatus === 'verified' ? 'success' :
                              doctor.verificationStatus === 'pending' ? 'warning' :
                              doctor.verificationStatus === 'rejected' ? 'error' : 'neutral'
                            }>
                              {status?.label || doctor.verificationStatus}
                            </StatusBadge>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doctor.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {doctor.isPublished ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Published
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Hidden
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAffiliationModal(doctor)}
                            className="p-1.5 text-navy-600 hover:bg-slate-100 rounded transition-colors"
                            title="Manage Affiliations"
                          >
                            <Hospital className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openVerifyModal(doctor)}
                            className="p-1.5 text-navy-600 hover:bg-slate-100 rounded transition-colors"
                            title={doctor.isPublished ? 'Unpublish' : 'Verify & Publish'}
                          >
                            {doctor.isPublished ? <Eye className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEditDoctorModal(doctor)}
                            className="p-1.5 text-navy-600 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doctor.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-neutral-200 text-xs text-navy-500 text-right">
              Showing {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      {/* Create Doctor Modal */}
      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Doctor Profile" width="max-w-2xl">
        <form onSubmit={handleCreateDoctor} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Full Name *</span>
              <input value={doctorForm.fullName} onChange={e => handleDoctorFormChange('fullName', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" required />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Slug *</span>
              <input value={doctorForm.slug} onChange={e => handleDoctorFormChange('slug', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" required />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Qualification</span>
              <input value={doctorForm.qualification} onChange={e => handleDoctorFormChange('qualification', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Experience (years)</span>
              <input type="number" min="0" value={doctorForm.experienceYears || ''} onChange={e => handleDoctorFormChange('experienceYears', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Specialties (comma-separated)</span>
              <input value={doctorForm.specialties.join(', ')} onChange={e => handleDoctorFormChange('specialties', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" placeholder="Cardiology, Neurology" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Sub-specialties (comma-separated)</span>
              <input value={doctorForm.subSpecialties.join(', ')} onChange={e => handleDoctorFormChange('subSpecialties', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" placeholder="Interventional Cardiology" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Languages (comma-separated)</span>
              <input value={doctorForm.languages.join(', ')} onChange={e => handleDoctorFormChange('languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" placeholder="English, Hindi, Malayalam" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Bio</span>
              <textarea value={doctorForm.bio} onChange={e => handleDoctorFormChange('bio', e.target.value)} rows={3} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Profile Image URL</span>
              <input value={doctorForm.profileImageUrl} onChange={e => handleDoctorFormChange('profileImageUrl', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Consultation Fee (₹)</span>
              <input type="number" min="0" value={doctorForm.consultationFeeInr || ''} onChange={e => handleDoctorFormChange('consultationFeeInr', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Verification Status</span>
              <select value={doctorForm.verificationStatus} onChange={e => handleDoctorFormChange('verificationStatus', e.target.value as DoctorVerificationStatus)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500">
                {VERIFICATION_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 flex items-center gap-2">
              <input type="checkbox" checked={doctorForm.isPublished} onChange={e => handleDoctorFormChange('isPublished', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-neutral-300 focus:ring-teal-500" />
              <span className="text-xs text-navy-700">Published (visible in public directory)</span>
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Source URL</span>
              <input value={doctorForm.sourceUrl} onChange={e => handleDoctorFormChange('sourceUrl', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-3 py-1.5 bg-white border border-neutral-200 text-navy-700 text-xs font-medium rounded hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 bg-navy-900 text-white text-xs font-medium rounded hover:bg-navy-800 disabled:opacity-60">
              {isSubmitting ? 'Creating…' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal open={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedDoctor(null); }} title="Edit Doctor Profile" width="max-w-2xl">
        <form onSubmit={handleUpdateDoctor} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Full Name *</span>
              <input value={doctorForm.fullName} onChange={e => handleDoctorFormChange('fullName', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" required />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Slug *</span>
              <input value={doctorForm.slug} onChange={e => handleDoctorFormChange('slug', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" required />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Qualification</span>
              <input value={doctorForm.qualification} onChange={e => handleDoctorFormChange('qualification', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Experience (years)</span>
              <input type="number" min="0" value={doctorForm.experienceYears || ''} onChange={e => handleDoctorFormChange('experienceYears', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Specialties (comma-separated)</span>
              <input value={doctorForm.specialties.join(', ')} onChange={e => handleDoctorFormChange('specialties', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Sub-specialties (comma-separated)</span>
              <input value={doctorForm.subSpecialties.join(', ')} onChange={e => handleDoctorFormChange('subSpecialties', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Languages (comma-separated)</span>
              <input value={doctorForm.languages.join(', ')} onChange={e => handleDoctorFormChange('languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Bio</span>
              <textarea value={doctorForm.bio} onChange={e => handleDoctorFormChange('bio', e.target.value)} rows={3} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Profile Image URL</span>
              <input value={doctorForm.profileImageUrl} onChange={e => handleDoctorFormChange('profileImageUrl', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Consultation Fee (₹)</span>
              <input type="number" min="0" value={doctorForm.consultationFeeInr || ''} onChange={e => handleDoctorFormChange('consultationFeeInr', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Verification Status</span>
              <select value={doctorForm.verificationStatus} onChange={e => handleDoctorFormChange('verificationStatus', e.target.value as DoctorVerificationStatus)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500">
                {VERIFICATION_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 flex items-center gap-2">
              <input type="checkbox" checked={doctorForm.isPublished} onChange={e => handleDoctorFormChange('isPublished', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-neutral-300 focus:ring-teal-500" />
              <span className="text-xs text-navy-700">Published (visible in public directory)</span>
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Source URL</span>
              <input value={doctorForm.sourceUrl} onChange={e => handleDoctorFormChange('sourceUrl', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
            <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedDoctor(null); }} className="px-3 py-1.5 bg-white border border-neutral-200 text-navy-700 text-xs font-medium rounded hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 bg-navy-900 text-white text-xs font-medium rounded hover:bg-navy-800 disabled:opacity-60">
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Affiliation Modal */}
      <Modal open={isAffiliationModalOpen} onClose={() => { setIsAffiliationModalOpen(false); setAffiliationForm(DEFAULT_AFFILIATION_FORM); setSelectedDoctor(null); }} title={selectedDoctor ? `Add Affiliation: ${selectedDoctor.fullName}` : 'Add Affiliation'} width="max-w-2xl">
        <form onSubmit={handleCreateAffiliation} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Hospital *</span>
              <select value={affiliationForm.publicHospitalId} onChange={e => handleAffiliationFormChange('publicHospitalId', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" required>
                <option value="">Select Hospital</option>
                {publicHospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Department *</span>
              <input value={affiliationForm.department} onChange={e => handleAffiliationFormChange('department', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" required />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Designation</span>
              <input value={affiliationForm.designation} onChange={e => handleAffiliationFormChange('designation', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1 flex items-center gap-2">
              <input type="checkbox" checked={affiliationForm.isPrimaryAffiliation} onChange={e => handleAffiliationFormChange('isPrimaryAffiliation', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-neutral-300 focus:ring-teal-500" />
              <span className="text-xs text-navy-700">Primary Affiliation</span>
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Hospital Consultation Fee (₹)</span>
              <input type="number" min="0" value={affiliationForm.hospitalConsultationFeeInr || ''} onChange={e => handleAffiliationFormChange('hospitalConsultationFeeInr', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" placeholder="Overrides doctor's default fee" />
            </label>
            <label className="block space-y-1 flex items-center gap-2">
              <input type="checkbox" checked={affiliationForm.isAcceptingPatients} onChange={e => handleAffiliationFormChange('isAcceptingPatients', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-neutral-300 focus:ring-teal-500" defaultChecked />
              <span className="text-xs text-navy-700">Accepting New Patients</span>
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Available Days (comma-separated)</span>
              <input value={affiliationForm.availableDays.join(', ')} onChange={e => handleAffiliationFormChange('availableDays', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" placeholder="Monday, Wednesday, Friday" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Available Hours</span>
              <input value={affiliationForm.availableHours} onChange={e => handleAffiliationFormChange('availableHours', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" placeholder="09:00-13:00, 14:00-18:00" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Appointment Booking URL</span>
              <input value={affiliationForm.appointmentBookingUrl} onChange={e => handleAffiliationFormChange('appointmentBookingUrl', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" placeholder="https://hospital.example.com/book" />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
            <button type="button" onClick={() => { setIsAffiliationModalOpen(false); setAffiliationForm(DEFAULT_AFFILIATION_FORM); setSelectedDoctor(null); }} className="px-3 py-1.5 bg-white border border-neutral-200 text-navy-700 text-xs font-medium rounded hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 bg-navy-900 text-white text-xs font-medium rounded hover:bg-navy-800 disabled:opacity-60">
              {isSubmitting ? 'Adding…' : 'Add Affiliation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Verify/Publish Modal */}
      <Modal open={isVerifyModalOpen} onClose={() => { setIsVerifyModalOpen(false); setSelectedDoctor(null); }} title={selectedDoctor ? `${verifyForm.isPublished ? 'Unpublish' : 'Verify & Publish'}: ${selectedDoctor.fullName}` : 'Verify/Publish Doctor'}>
        <form onSubmit={handleVerifyPublish} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">{formError}</div>}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
            <strong className="text-slate-900">{selectedDoctor?.fullName}</strong> — {selectedDoctor?.specialties[0] || 'General'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Verification Status</span>
              <select value={verifyForm.verificationStatus} onChange={e => handleVerifyFormChange('verificationStatus', e.target.value as DoctorVerificationStatus)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500">
                {VERIFICATION_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 flex items-center gap-2">
              <input type="checkbox" checked={verifyForm.isPublished} onChange={e => handleVerifyFormChange('isPublished', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-neutral-300 focus:ring-teal-500" />
              <span className="text-xs text-navy-700">Published in public directory</span>
            </label>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <strong>Note:</strong> A doctor must be verified before they can be published. Publishing an unverified doctor is not allowed.
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
            <button type="button" onClick={() => { setIsVerifyModalOpen(false); setSelectedDoctor(null); }} className="px-3 py-1.5 bg-white border border-neutral-200 text-navy-700 text-xs font-medium rounded hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 bg-navy-900 text-white text-xs font-medium rounded hover:bg-navy-800 disabled:opacity-60">
              {isSubmitting ? 'Saving…' : verifyForm.isPublished ? 'Verify & Publish' : 'Unpublish'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}