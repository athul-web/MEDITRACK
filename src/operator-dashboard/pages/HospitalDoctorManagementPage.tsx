import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Hospital,
  User,
  Stethoscope,
  GraduationCap,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Edit3,
  Trash2,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { supabase, getCurrentUserHospitalId } from '../../lib/supabase';
import { doctorRepository } from '../../data/repositories/doctorRepository';
import { AdminHospitalDoctor, CreateDoctorAffiliationInput } from '../../types/doctor';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';

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

export function HospitalDoctorManagement() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<AdminHospitalDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAffiliationModalOpen, setIsAffiliationModalOpen] = useState(false);
  const [isEditAffiliationModalOpen, setIsEditAffiliationModalOpen] = useState(false);
  const [selectedAffiliation, setSelectedAffiliation] = useState<AdminHospitalDoctor | null>(null);
  const [affiliationForm, setAffiliationForm] = useState<CreateDoctorAffiliationInput>(DEFAULT_AFFILIATION_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<{ id: string; fullName: string; specialties: string[] }[]>([]);
  const [publicHospitalId, setPublicHospitalId] = useState<string>('');
  const [hospitalName, setHospitalName] = useState<string>('');

  // Get current user's hospital and linked public_hospital
  useEffect(() => {
    let isActive = true;
    async function loadHospitalInfo() {
      try {
        const currentHospitalId = await getCurrentUserHospitalId();
        const { data, error } = await supabase
          .from('public_hospitals')
          .select('id, name')
          .eq('hospital_id', currentHospitalId)
          .maybeSingle();
        if (error) throw error;
        if (isActive && data) {
          setPublicHospitalId(data.id);
          setHospitalName(data.name);
        }
      } catch (err) {
        console.error('Failed to load hospital info:', err);
      }
    }
    loadHospitalInfo();
    return () => { isActive = false; };
  }, []);

  // Load doctors for this hospital
  const loadDoctors = useCallback(async () => {
    if (!publicHospitalId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const results = await doctorRepository.getAllDoctorsForHospitalAdmin(publicHospitalId);
      setDoctors(results);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  }, [publicHospitalId]);

  // Load available doctors (verified & published) for affiliation dropdown
  useEffect(() => {
    let isActive = true;
    async function loadAvailableDoctors() {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, full_name, specialties')
        .eq('verification_status', 'verified')
        .eq('is_published', true)
        .order('full_name');
      if (error) {
        console.error('Failed to load available doctors:', error);
        return;
      }
      if (isActive) setAvailableDoctors(((data ?? []) as { id: string; full_name: string; specialties: string[] }[]).map(d => ({
        id: d.id,
        fullName: d.full_name,
        specialties: d.specialties,
      })));
    }
    loadAvailableDoctors();
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Get unique departments from loaded doctors
  const allDepartments = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach(d => d.department && set.add(d.department));
    return Array.from(set).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      if (searchQuery && !d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !d.department.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !d.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      if (departmentFilter !== 'all' && d.department !== departmentFilter) return false;
      if (statusFilter === 'active' && !d.isActive) return false;
      if (statusFilter === 'inactive' && d.isActive) return false;
      return true;
    });
  }, [doctors, searchQuery, departmentFilter, statusFilter]);

  const handleAffiliationFormChange = (field: string, value: any) => {
    setAffiliationForm(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const openAddAffiliationModal = () => {
    setAffiliationForm({ ...DEFAULT_AFFILIATION_FORM, publicHospitalId });
    setIsAffiliationModalOpen(true);
  };

  const openEditAffiliationModal = (affiliation: AdminHospitalDoctor) => {
    setAffiliationForm({
      doctorId: affiliation.doctorId,
      publicHospitalId: affiliation.publicHospitalId,
      department: affiliation.department,
      designation: affiliation.designation || '',
      isPrimaryAffiliation: affiliation.isPrimaryAffiliation,
      appointmentBookingUrl: affiliation.appointmentBookingUrl || '',
      hospitalConsultationFeeInr: affiliation.hospitalConsultationFeeInr,
      isAcceptingPatients: affiliation.isAcceptingPatients,
      availableDays: affiliation.availableDays,
      availableHours: affiliation.availableHours || '',
    });
    setSelectedAffiliation(affiliation);
    setIsEditAffiliationModalOpen(true);
  };

  const handleCreateAffiliation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await doctorRepository.createDoctorAffiliation(affiliationForm);
      setIsAffiliationModalOpen(false);
      setAffiliationForm(DEFAULT_AFFILIATION_FORM);
      loadDoctors();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create affiliation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAffiliation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('hospital_doctors')
        .update({
          department: affiliationForm.department,
          designation: affiliationForm.designation || null,
          is_primary_affiliation: affiliationForm.isPrimaryAffiliation,
          appointment_booking_url: affiliationForm.appointmentBookingUrl || null,
          hospital_consultation_fee_inr: affiliationForm.hospitalConsultationFeeInr ?? null,
          is_accepting_patients: affiliationForm.isAcceptingPatients,
          available_days: affiliationForm.availableDays,
          available_hours: affiliationForm.availableHours || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedAffiliation?.id);
      if (error) throw error;
      setIsEditAffiliationModalOpen(false);
      setSelectedAffiliation(null);
      loadDoctors();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update affiliation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAffiliation = async (affiliationId: string) => {
    if (!confirm('Are you sure you want to remove this doctor affiliation?')) return;
    try {
      const { error } = await supabase.from('hospital_doctors').delete().eq('id', affiliationId);
      if (error) throw error;
      loadDoctors();
    } catch (err: any) {
      alert(`Failed to remove affiliation: ${err?.message}`);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-navy-500 text-sm">Loading hospital doctors…</div>;
  }

  if (loadError) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">{loadError}</div>;
  }

  if (!publicHospitalId) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
        Your account is not linked to a public hospital directory entry. Please contact your administrator.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Doctor Management</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Manage doctor affiliations for <strong>{hospitalName}</strong>.
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-cyan-100 text-cyan-700 rounded-full">
              <Hospital className="w-3 h-3" /> Hospital Admin
            </span>
          </p>
        </div>
        <button onClick={openAddAffiliationModal} className="inline-flex items-center gap-2 px-3 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition-colors">
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
            placeholder="Search by name, department, specialty..."
            className="flex-1"
          />
          <FilterDropdown
            label="Department"
            value={departmentFilter}
            options={[
              { value: 'all', label: 'All Departments' },
              ...allDepartments.map(d => ({ value: d, label: d })),
            ]}
            onChange={setDepartmentFilter}
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive Only' },
            ]}
            onChange={(value: string) => setStatusFilter(value as 'all' | 'active' | 'inactive')}
          />
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {filteredDoctors.length === 0 ? (
          <EmptyState
            title="No doctors found"
            description="No doctor affiliations match your current filters. Try adjusting your search or add a new doctor affiliation."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-navy-600 font-medium">
                  <tr>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">Fee (₹)</th>
                    <th className="px-4 py-3">Primary</th>
                    <th className="px-4 py-3">Accepting</th>
                    <th className="px-4 py-3">Availability</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-navy-900">{doctor.fullName}</div>
                        <div className="text-xs text-navy-500 flex flex-wrap gap-1">
                          {doctor.specialties.slice(0, 2).map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-[9px] font-medium bg-[#E4F6FA] text-[#073B55] rounded">{s}</span>
                          ))}
                          {doctor.specialties.length > 2 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-500 rounded">+{doctor.specialties.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-navy-700">{doctor.department}</td>
                      <td className="px-4 py-3 text-navy-700">{doctor.designation || '—'}</td>
                      <td className="px-4 py-3 text-navy-700 tabular-nums">
                        {doctor.hospitalConsultationFeeInr
                          ? doctor.hospitalConsultationFeeInr.toLocaleString()
                          : doctor.consultationFeeInr
                          ? doctor.consultationFeeInr.toLocaleString() + ' (default)'
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {doctor.isPrimaryAffiliation ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doctor.isAcceptingPatients ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {doctor.isAcceptingPatients ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-navy-600 max-w-xs">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {doctor.availableDays.length > 0 ? doctor.availableDays.join(', ') : 'Not set'}
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {doctor.availableHours || 'Not set'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge variant={doctor.isActive ? 'success' : 'neutral'}>
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditAffiliationModal(doctor)}
                            className="p-1.5 text-navy-600 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Affiliation"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAffiliation(doctor.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Remove Affiliation"
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
              Showing {filteredDoctors.length} of {doctors.length} affiliation{doctors.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      {/* Add Affiliation Modal */}
      <Modal open={isAffiliationModalOpen} onClose={() => { setIsAffiliationModalOpen(false); setAffiliationForm(DEFAULT_AFFILIATION_FORM); }} title="Add Doctor Affiliation" width="max-w-2xl">
        <form onSubmit={handleCreateAffiliation} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="font-medium text-navy-700 text-xs">Doctor *</span>
              <select value={affiliationForm.doctorId} onChange={e => handleAffiliationFormChange('doctorId', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" required>
                <option value="">Select Doctor</option>
                {availableDoctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} — {d.specialties[0] || 'General'}
                  </option>
                ))}
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
            <button type="button" onClick={() => { setIsAffiliationModalOpen(false); setAffiliationForm(DEFAULT_AFFILIATION_FORM); }} className="px-3 py-1.5 bg-white border border-neutral-200 text-navy-700 text-xs font-medium rounded hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 bg-navy-900 text-white text-xs font-medium rounded hover:bg-navy-800 disabled:opacity-60">
              {isSubmitting ? 'Adding…' : 'Add Affiliation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Affiliation Modal */}
      <Modal open={isEditAffiliationModalOpen} onClose={() => { setIsEditAffiliationModalOpen(false); setSelectedAffiliation(null); }} title="Edit Doctor Affiliation" width="max-w-2xl">
        <form onSubmit={handleUpdateAffiliation} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">{formError}</div>}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
            <strong className="text-slate-900">Editing affiliation for doctor ID: {selectedAffiliation?.doctorId}</strong>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <input type="checkbox" checked={affiliationForm.isAcceptingPatients} onChange={e => handleAffiliationFormChange('isAcceptingPatients', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-neutral-300 focus:ring-teal-500" />
              <span className="text-xs text-navy-700">Accepting New Patients</span>
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Available Days (comma-separated)</span>
              <input value={affiliationForm.availableDays.join(', ')} onChange={e => handleAffiliationFormChange('availableDays', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Available Hours</span>
              <input value={affiliationForm.availableHours} onChange={e => handleAffiliationFormChange('availableHours', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-medium text-navy-700 text-xs">Appointment Booking URL</span>
              <input value={affiliationForm.appointmentBookingUrl} onChange={e => handleAffiliationFormChange('appointmentBookingUrl', e.target.value)} className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-teal-500" />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
            <button type="button" onClick={() => { setIsEditAffiliationModalOpen(false); setSelectedAffiliation(null); }} className="px-3 py-1.5 bg-white border border-neutral-200 text-navy-700 text-xs font-medium rounded hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 bg-navy-900 text-white text-xs font-medium rounded hover:bg-navy-800 disabled:opacity-60">
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}