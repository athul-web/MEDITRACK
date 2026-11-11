import React, { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Navigation,
  ShieldCheck,
  Search,
  User,
  Info,
  ArrowLeft,
  Building,
} from 'lucide-react';
import type { DemoHospital } from '../types/hospital';
import type { DemoDoctor } from '../data/doctorsData';
import { DEMO_DOCTORS, DEPARTMENTS } from '../data/doctorsData';
import { DEMO_FACILITIES, DEMO_EQUIPMENT, EQUIPMENT_CATEGORIES, DEMO_SERVICES, SERVICE_CATEGORIES, OVERVIEW_STATS, OVERVIEW_ACCREDITATIONS, OVERVIEW_TIMINGS } from '../data/facilitiesData';

interface HospitalDetailsModalProps {
  hospital: DemoHospital | null;
  onClose: () => void;
}

type TabId = 'overview' | 'doctors' | 'facilities' | 'services' | 'contact';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'doctors', label: 'Doctors' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
];

// --- Availability badge helper ---
function AvailabilityBadge({ status }: { status: DemoDoctor['availability'] }) {
  const cfg = {
    available: {
      label: 'Available',
      dot: 'bg-emerald-500',
      wrap: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    on_duty: {
      label: 'On Duty',
      dot: 'bg-amber-500',
      wrap: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    unavailable: {
      label: 'Unavailable',
      dot: 'bg-rose-500',
      wrap: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.wrap}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// --- Doctor avatar helper ---
function DoctorAvatar({
  doctor,
  size = 56,
}: {
  doctor: DemoDoctor;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = doctor.name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dim = `${size}px`;

  if (imgError) {
    return (
      <div
        style={{ width: dim, height: dim, minWidth: dim }}
        className="rounded-full bg-[#E4F6FA] text-[#073B55] flex items-center justify-center font-bold text-sm border border-[#BCEBF5]"
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={doctor.imageUrl}
      alt={doctor.name}
      style={{ width: dim, height: dim, minWidth: dim }}
      className="rounded-full object-cover border border-[#D9E6EE]"
      onError={() => setImgError(true)}
    />
  );
}

// --- Placeholder tab panel ---
function ComingSoonPanel({ tabLabel }: { tabLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-[#E4F6FA] flex items-center justify-center">
        <Building size={22} className="text-[#087D91]" />
      </div>
      <p className="text-sm text-[#60778C] max-w-xs leading-relaxed">
        <span className="font-semibold text-[#122B43]">{tabLabel} information</span> coming soon.
        Please contact the hospital directly for more details.
      </p>
    </div>
  );
}

// --- Doctor Profile Panel ---
function DoctorProfilePanel({
  doctor,
  hospitalName,
  onBack,
}: {
  doctor: DemoDoctor;
  hospitalName: string;
  onBack: () => void;
}) {
  return (
    <div className="p-5 space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#087D91] hover:underline cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="flex flex-col items-center gap-3 text-center">
        <DoctorAvatar doctor={doctor} size={80} />
        <div>
          <h3 className="text-base font-bold text-[#122B43]">{doctor.name}</h3>
          <p className="text-xs text-[#60778C] mt-0.5">{doctor.specialization}</p>
          <div className="mt-2 flex justify-center">
            <AvailabilityBadge status={doctor.availability} />
          </div>
        </div>
      </div>

      <div className="bg-[#E4F6FA] rounded-xl p-4 space-y-2.5 text-xs text-[#122B43] border border-[#BCEBF5]">
        <div className="flex items-center justify-between">
          <span className="text-[#60778C]">Department</span>
          <span className="font-semibold">{doctor.department}</span>
        </div>
        {doctor.qualification && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-[#60778C] shrink-0">Qualification</span>
            <span className="font-semibold text-right">{doctor.qualification}</span>
          </div>
        )}
        {doctor.experience && (
          <div className="flex items-center justify-between">
            <span className="text-[#60778C]">Experience</span>
            <span className="font-semibold">{doctor.experience}</span>
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <span className="text-[#60778C] shrink-0">Affiliated Hospital</span>
          <span className="font-semibold text-right">{hospitalName}</span>
        </div>
      </div>

      {doctor.bio && (
        <div className="text-xs text-[#60778C] leading-relaxed border-t border-[#D9E6EE] pt-4">
          <p className="font-semibold text-[#122B43] mb-1">About</p>
          <p>{doctor.bio}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export function HospitalDetailsModal({ hospital, onClose }: HospitalDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedDoctor, setSelectedDoctor] = useState<DemoDoctor | null>(null);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [equipCategory, setEquipCategory] = useState('All Categories');
  const [serviceCategory, setServiceCategory] = useState('All');

  // Reset all state when hospital changes
  useEffect(() => {
    setActiveTab('overview');
    setDoctorSearch('');
    setSelectedDept('All Departments');
    setSelectedDoctor(null);
    setShowAllDoctors(false);
    setEquipCategory('All Categories');
    setServiceCategory('All');
  }, [hospital?.id]);

  // Keyboard / scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDoctor) {
          setSelectedDoctor(null);
        } else {
          onClose();
        }
      }
    };
    if (hospital) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hospital, onClose, selectedDoctor]);

  if (!hospital) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`;

  // --- Filtering logic ---
  const filteredDoctors = DEMO_DOCTORS.filter((d) => {
    const q = doctorSearch.toLowerCase();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q);
    const matchesDept =
      selectedDept === 'All Departments' || d.department === selectedDept;
    return matchesSearch && matchesDept;
  });
  const displayedDoctors = showAllDoctors
    ? filteredDoctors
    : filteredDoctors.slice(0, 6);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospital-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-[#D9E6EE] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* ── Header ── */}
        <div
          className="relative p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #001525 0%, #073B55 70%, #087D91 100%)',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#19D5E5]/20 text-[#19D5E5] border border-[#19D5E5]/40">
              <ShieldCheck size={13} />
              Verified Healthcare Facility
            </span>
            <span className="text-xs text-slate-300">• {hospital.distanceKm} km away</span>
          </div>

          <h2
            id="hospital-modal-title"
            className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2"
          >
            {hospital.name}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-200/90">
            <MapPin size={14} className="text-[#19D5E5] shrink-0" />
            <span>{hospital.address}</span>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="border-b border-[#D9E6EE] px-5 overflow-x-auto">
          <div className="flex gap-1 py-2 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedDoctor(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#073B55] text-white'
                    : 'text-[#60778C] hover:text-[#122B43]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Doctor profile overlay */}
          {activeTab === 'doctors' && selectedDoctor ? (
            <DoctorProfilePanel
              doctor={selectedDoctor}
              hospitalName={hospital.name}
              onBack={() => setSelectedDoctor(null)}
            />
          ) : (
            <>
              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <div className="p-6 space-y-6">
                  {/* Resource Breakdown Card */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-3">
                      Live Medical Resources
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {hospital.resources.map((res) => {
                        const ratio = res.total > 0 ? res.available / res.total : 0;
                        const isLimited = ratio < 0.25 || res.available <= 3;
                        const isNone = res.available === 0;

                        let stateColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                        let stateText = 'Available';
                        if (isNone) {
                          stateColor = 'text-rose-700 bg-rose-50 border-rose-200';
                          stateText = 'Full / Critical';
                        } else if (isLimited) {
                          stateColor = 'text-amber-700 bg-amber-50 border-amber-200';
                          stateText = 'Limited';
                        }

                        return (
                          <div
                            key={res.label}
                            className={`p-3.5 rounded-xl border ${stateColor} flex flex-col justify-between`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold">{res.label}</span>
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/70">
                                {stateText}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black tracking-tight">
                                {res.available}
                              </span>
                              <span className="text-xs font-semibold opacity-70">
                                / {res.total} total
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clinical Specialties & Tags */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-2.5">
                      Available Units &amp; Capabilities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hospital.tags.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6FA] text-[#073B55] border border-[#BCEBF5]"
                        >
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick Contact & Info */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-[#122B43]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#60778C]">Direct Emergency Desk:</span>
                      <a
                        href={`tel:${hospital.phone}`}
                        className="font-bold text-[#073B55] hover:text-[#087D91]"
                      >
                        {hospital.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#60778C]">Estimated Drive Time:</span>
                      <span className="font-semibold">
                        {hospital.driveMinutes} minutes via primary road
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#60778C]">GPS Coordinates:</span>
                      <span className="font-mono text-[11px] text-[#60778C]">
                        {hospital.lat.toFixed(4)}, {hospital.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {/* ── Quick Stats ── */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-3">
                      At a Glance
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {OVERVIEW_STATS.map((stat) => (
                        <div
                          key={stat.label}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[#D9E6EE] bg-white text-center"
                        >
                          <span className="text-2xl leading-none">{stat.icon}</span>
                          <span className="text-lg font-black text-[#073B55]">{stat.value}</span>
                          <span className="text-[10px] text-[#60778C] font-medium leading-tight">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── OPD Timings ── */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-3">
                      Working Hours
                    </h3>
                    <div className="rounded-xl border border-[#D9E6EE] overflow-hidden divide-y divide-[#D9E6EE]">
                      {OVERVIEW_TIMINGS.map((row) => (
                        <div key={row.day} className="flex items-center justify-between px-4 py-2.5 text-xs bg-white">
                          <span className="text-[#60778C] font-medium">{row.day}</span>
                          <span className="font-semibold text-[#122B43]">{row.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Accreditations ── */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-3">
                      Accreditations & Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {OVERVIEW_ACCREDITATIONS.map((a) => (
                        <span
                          key={a.name}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E4F6FA] text-[#073B55] border border-[#BCEBF5]"
                        >
                          <span>{a.icon}</span>
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── DOCTORS TAB ── */}
              {activeTab === 'doctors' && (
                <div className="p-5 space-y-4">
                  {/* Section title */}
                  <h3 className="text-base font-bold text-[#122B43]">
                    Doctors at {hospital.name}
                  </h3>

                  {/* Search + filter row */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60778C]"
                      />
                      <input
                        type="text"
                        value={doctorSearch}
                        onChange={(e) => {
                          setDoctorSearch(e.target.value);
                          setShowAllDoctors(false);
                        }}
                        placeholder="Search by name or specialization..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D9E6EE] text-xs text-[#122B43] placeholder-[#60778C] focus:outline-none focus:border-[#087D91] focus:ring-1 focus:ring-[#087D91]/30 bg-white"
                      />
                    </div>

                    {/* Department dropdown */}
                    <div className="relative">
                      <select
                        value={selectedDept}
                        onChange={(e) => {
                          setSelectedDept(e.target.value);
                          setShowAllDoctors(false);
                        }}
                        className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-[#D9E6EE] text-xs text-[#122B43] focus:outline-none focus:border-[#087D91] focus:ring-1 focus:ring-[#087D91]/30 bg-white cursor-pointer w-full sm:w-auto"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#60778C]">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Doctor grid or empty state */}
                  {filteredDoctors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                      <div className="w-11 h-11 rounded-full bg-[#E4F6FA] flex items-center justify-center">
                        <User size={20} className="text-[#087D91]" />
                      </div>
                      <p className="text-sm font-semibold text-[#122B43]">No doctors found</p>
                      <p className="text-xs text-[#60778C]">
                        Try adjusting your search or department filter.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {displayedDoctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            className="flex items-start gap-3 p-3.5 rounded-xl border border-[#D9E6EE] bg-white hover:border-[#BCEBF5] hover:bg-[#E4F6FA]/30 transition-colors"
                          >
                            <DoctorAvatar doctor={doctor} size={56} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#122B43] truncate">
                                {doctor.name}
                              </p>
                              <p className="text-xs text-[#60778C] truncate mt-0.5">
                                {doctor.specialization}
                              </p>
                              <div className="mt-1.5">
                                <AvailabilityBadge status={doctor.availability} />
                              </div>
                              <button
                                onClick={() => setSelectedDoctor(doctor)}
                                className="mt-2 text-xs font-semibold text-[#087D91] hover:underline cursor-pointer"
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* View All / Show Less toggle */}
                      {filteredDoctors.length > 6 && (
                        <button
                          onClick={() => setShowAllDoctors((prev) => !prev)}
                          className="w-full py-2.5 rounded-xl border border-[#D9E6EE] text-xs font-semibold text-[#073B55] hover:bg-[#E4F6FA] transition-colors cursor-pointer"
                        >
                          {showAllDoctors
                            ? 'Show Less'
                            : `View All Doctors (${filteredDoctors.length})`}
                        </button>
                      )}
                    </>
                  )}

                  {/* Info notice */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#E4F6FA] border border-[#BCEBF5] text-xs text-[#60778C]">
                    <Info size={14} className="text-[#087D91] shrink-0 mt-0.5" />
                    <span>
                      Doctor availability is subject to change. Please contact the hospital for
                      confirmation.
                    </span>
                  </div>
                </div>
              )}

              {/* ── FACILITIES TAB ── */}
              {activeTab === 'facilities' && (() => {
                const filteredEquip = equipCategory === 'All Categories'
                  ? DEMO_EQUIPMENT
                  : DEMO_EQUIPMENT.filter(e => e.category === equipCategory);

                return (
                  <div className="p-5 space-y-6">
                    {/* ── Facilities section ── */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-3">
                        Hospital Facilities
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {DEMO_FACILITIES.map((fac) => {
                          const statusCfg = {
                            operational: { dot: 'bg-emerald-500', label: 'Operational', wrap: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                            maintenance:  { dot: 'bg-amber-500',  label: 'Maintenance',  wrap: 'text-amber-700 bg-amber-50 border-amber-200' },
                            closed:       { dot: 'bg-rose-500',   label: 'Closed',       wrap: 'text-rose-700 bg-rose-50 border-rose-200' },
                          }[fac.status];
                          return (
                            <div
                              key={fac.id}
                              className="flex gap-3 p-3.5 rounded-xl border border-[#D9E6EE] bg-white hover:border-[#BCEBF5] hover:bg-[#E4F6FA]/30 transition-colors"
                            >
                              <span className="text-2xl leading-none mt-0.5 shrink-0">{fac.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="text-sm font-semibold text-[#122B43] leading-snug">{fac.name}</p>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${statusCfg.wrap}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                    {statusCfg.label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#60778C] leading-relaxed">{fac.description}</p>
                                {(fac.capacity || fac.floor) && (
                                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#60778C]">
                                    {fac.floor && <span>📍 {fac.floor}</span>}
                                    {fac.capacity && <span>🛏 {fac.capacity}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Equipment section ── */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#60778C]">
                          Medical Equipment
                        </h3>
                        {/* Category filter */}
                        <div className="relative">
                          <select
                            value={equipCategory}
                            onChange={(e) => setEquipCategory(e.target.value)}
                            className="appearance-none pl-3 pr-7 py-1.5 rounded-xl border border-[#D9E6EE] text-xs text-[#122B43] focus:outline-none focus:border-[#087D91] focus:ring-1 focus:ring-[#087D91]/30 bg-white cursor-pointer w-full sm:w-auto"
                          >
                            {EQUIPMENT_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#60778C]">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredEquip.map((eq) => {
                          const eqCfg = {
                            available:   { dot: 'bg-emerald-500', label: 'Available',   wrap: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                            in_use:      { dot: 'bg-blue-500',    label: 'In Use',      wrap: 'text-blue-700 bg-blue-50 border-blue-200' },
                            maintenance: { dot: 'bg-amber-500',   label: 'Maintenance', wrap: 'text-amber-700 bg-amber-50 border-amber-200' },
                          }[eq.status];
                          return (
                            <div
                              key={eq.id}
                              className="flex gap-3 p-3.5 rounded-xl border border-[#D9E6EE] bg-white hover:border-[#BCEBF5] hover:bg-[#E4F6FA]/30 transition-colors"
                            >
                              <span className="text-2xl leading-none mt-0.5 shrink-0">{eq.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="text-sm font-semibold text-[#122B43] leading-snug">{eq.name}</p>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${eqCfg.wrap}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${eqCfg.dot}`} />
                                    {eqCfg.label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#60778C] leading-relaxed">{eq.description}</p>
                                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#60778C]">
                                  <span className="font-semibold text-[#073B55]">Qty: {eq.quantity}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{eq.category}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {filteredEquip.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                          <p className="text-sm font-semibold text-[#122B43]">No equipment in this category</p>
                          <p className="text-xs text-[#60778C]">Try selecting a different category.</p>
                        </div>
                      )}
                    </div>

                    {/* Notice */}
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#E4F6FA] border border-[#BCEBF5] text-xs text-[#60778C]">
                      <Info size={14} className="text-[#087D91] shrink-0 mt-0.5" />
                      <span>Facilities and equipment availability may vary. Please contact the hospital to confirm current status before your visit.</span>
                    </div>
                  </div>
                );
              })()}

              {/* ── SERVICES TAB ── */}
              {activeTab === 'services' && (() => {
                const filteredServices = serviceCategory === 'All'
                  ? DEMO_SERVICES
                  : DEMO_SERVICES.filter(s => s.category === serviceCategory);
                return (
                  <div className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-[#122B43]">
                        Services at {hospital.name}
                      </h3>
                      {/* Category filter */}
                      <div className="relative">
                        <select
                          value={serviceCategory}
                          onChange={(e) => setServiceCategory(e.target.value)}
                          className="appearance-none pl-3 pr-7 py-1.5 rounded-xl border border-[#D9E6EE] text-xs text-[#122B43] focus:outline-none focus:border-[#087D91] focus:ring-1 focus:ring-[#087D91]/30 bg-white cursor-pointer w-full sm:w-auto"
                        >
                          {SERVICE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#60778C]">
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Service cards */}
                    <div className="space-y-2.5">
                      {filteredServices.map((svc) => (
                        <div
                          key={svc.id}
                          className={`flex gap-3.5 p-3.5 rounded-xl border transition-colors ${
                            svc.available
                              ? 'border-[#D9E6EE] bg-white hover:border-[#BCEBF5] hover:bg-[#E4F6FA]/30'
                              : 'border-rose-100 bg-rose-50/40'
                          }`}
                        >
                          <span className="text-2xl leading-none mt-0.5 shrink-0">{svc.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-[#122B43] leading-snug">{svc.name}</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                                svc.available
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${svc.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {svc.available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#60778C] leading-relaxed mb-1.5">{svc.description}</p>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-[#60778C]">🕐</span>
                              <span className="font-semibold text-[#073B55]">{svc.hours}</span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{svc.category}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredServices.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                          <p className="text-sm font-semibold text-[#122B43]">No services in this category</p>
                          <p className="text-xs text-[#60778C]">Try selecting a different category.</p>
                        </div>
                      )}
                    </div>

                    {/* Notice */}
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#E4F6FA] border border-[#BCEBF5] text-xs text-[#60778C]">
                      <Info size={14} className="text-[#087D91] shrink-0 mt-0.5" />
                      <span>Service availability and timings are subject to change. Please call the hospital to confirm before visiting.</span>
                    </div>
                  </div>
                );
              })()}

              {/* ── CONTACT TAB ── */}
              {activeTab === 'contact' && (
                <div className="p-5 space-y-5">
                  <h3 className="text-base font-bold text-[#122B43]">Contact {hospital.name}</h3>

                  {/* Primary phone numbers */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-2.5">Phone Numbers</p>
                    <div className="space-y-2">
                      {[
                        { label: '🚨 Emergency Hotline',  number: hospital.phone || '0484-2345678', note: '24 / 7' },
                        { label: '📋 OPD Appointments',   number: '0484-2345679',                   note: 'Mon–Sat, 8 AM–6 PM' },
                        { label: '🏥 General Enquiries',  number: '0484-2345680',                   note: 'Mon–Sat, 9 AM–5 PM' },
                        { label: '🚑 Ambulance',          number: '108',                            note: '24 / 7 · Free' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#D9E6EE] bg-white hover:border-[#BCEBF5] hover:bg-[#E4F6FA]/30 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#122B43]">{item.label}</p>
                            <p className="text-[11px] text-[#60778C] mt-0.5">{item.note}</p>
                          </div>
                          <a
                            href={`tel:${item.number.replace(/\s/g, '')}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#073B55] text-white text-xs font-bold hover:bg-[#052F4B] transition-colors shrink-0"
                          >
                            📞 {item.number}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email & web */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-2.5">Email & Web</p>
                    <div className="space-y-2">
                      {[
                        { label: '📧 General Enquiries', value: 'info@hospital.kerala.in',         href: 'mailto:info@hospital.kerala.in' },
                        { label: '📧 Appointments',      value: 'appointments@hospital.kerala.in', href: 'mailto:appointments@hospital.kerala.in' },
                        { label: '🌐 Website',           value: 'www.hospital.kerala.in',          href: 'https://www.hospital.kerala.in' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#D9E6EE] bg-white">
                          <p className="text-xs font-semibold text-[#122B43]">{item.label}</p>
                          <a
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#087D91] hover:underline truncate max-w-[55%] text-right"
                          >
                            {item.value}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address & map */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-2.5">Address</p>
                    <div className="rounded-xl border border-[#D9E6EE] bg-white overflow-hidden">
                      <div className="px-4 py-3 space-y-1">
                        <p className="text-sm font-semibold text-[#122B43]">{hospital.name}</p>
                        <p className="text-xs text-[#60778C] leading-relaxed">{hospital.address}</p>
                        {hospital.district && (
                          <p className="text-xs text-[#60778C]">{hospital.district} District, Kerala</p>
                        )}
                        <p className="text-[11px] font-mono text-[#60778C] mt-1">
                          {hospital.lat.toFixed(5)}, {hospital.lng.toFixed(5)}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-[#087D91] border-t border-[#D9E6EE] hover:bg-[#E4F6FA] transition-colors"
                      >
                        🗺️ Open in Google Maps
                      </a>
                    </div>
                  </div>

                  {/* Department direct lines */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-2.5">Department Direct Lines</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { dept: 'ICU',           ext: 'Ext. 201' },
                        { dept: 'Emergency',     ext: 'Ext. 100' },
                        { dept: 'Cardiology',    ext: 'Ext. 310' },
                        { dept: 'Radiology',     ext: 'Ext. 420' },
                        { dept: 'Laboratory',    ext: 'Ext. 530' },
                        { dept: 'Pharmacy',      ext: 'Ext. 110' },
                        { dept: 'Physiotherapy', ext: 'Ext. 640' },
                        { dept: 'Blood Bank',    ext: 'Ext. 720' },
                      ].map((d) => (
                        <div key={d.dept} className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#D9E6EE] bg-white text-xs">
                          <span className="font-medium text-[#122B43]">{d.dept}</span>
                          <span className="text-[#60778C] font-mono">{d.ext}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#E4F6FA] border border-[#BCEBF5] text-xs text-[#60778C]">
                    <Info size={14} className="text-[#087D91] shrink-0 mt-0.5" />
                    <span>Contact details shown are for demonstration purposes. Please verify with the hospital directly before visiting.</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-[#073B55] bg-white border border-[#D9E6EE] hover:border-[#073B55] transition-colors"
          >
            <Navigation size={14} />
            <span>Open in Google Maps</span>
          </a>

          <a
            href={`tel:${hospital.phone}`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#073B55] hover:bg-[#052F4B] transition-colors shadow-xs"
          >
            <Phone size={14} />
            <span>Call Hotline</span>
          </a>
        </div>
      </div>
    </div>
  );
}
