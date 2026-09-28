import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHospital } from '../../../hooks/useHospital';
import { ResourceStatus } from '../../../types/public';
import { ReportResourceUpdateModal } from '../../../components/modals/ReportResourceUpdateModal';
import {
  ArrowLeft,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Navigation,
  Mail,
  Building,
  Activity,
  Edit3
} from 'lucide-react';

function ResourceItem({ label, status }: { label: string; status: ResourceStatus }) {
  const statusConfig: Record<ResourceStatus, { color: string; icon: any; text: string }> = {
    available: { color: 'text-emerald-600', icon: CheckCircle2, text: 'Available' },
    unavailable: { color: 'text-rose-500', icon: XCircle, text: 'Unavailable' },
    unknown: { color: 'text-slate-400', icon: Info, text: 'Unknown' },
    stale: { color: 'text-amber-500', icon: AlertTriangle, text: 'Stale' },
  };

  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className={`flex items-center gap-1.5 text-xs font-bold ${config.color}`}>
        <config.icon className="w-3.5 h-3.5" />
        {config.text}
      </div>
    </div>
  );
}

export function HospitalDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hospital, isLoading, error, refresh } = useHospital(id || '');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading hospital details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
        <p className="text-slate-500 max-w-md">{error}</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/hospitals')} className="btn-outline px-6">
            Back to Directory
          </button>
          <button onClick={refresh} className="btn-primary px-6">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Hospital Not Found</h2>
        <p className="text-slate-500 max-w-md">
          The facility you are looking for could not be found in our network.
        </p>
        <button onClick={() => navigate('/hospitals')} className="btn-primary px-8">
          Return to Directory
        </button>
      </div>
    );
  }

  const emergencyPhone = hospital.contact?.emergencyPhone || hospital.phone2 || hospital.phone1;
  const facilityPhone = hospital.contact?.phone || hospital.phone1 || hospital.phone2;

  const handleEmergencyCall = () => {
    const phone = emergencyPhone || facilityPhone;
    if (phone) {
      window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
    } else {
      alert('Emergency phone number is not available for this facility.');
    }
  };

  const handleFacilityContact = () => {
    const phone = facilityPhone || emergencyPhone;
    if (phone) {
      window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
    } else if (hospital.email) {
      window.location.href = `mailto:${hospital.email}`;
    } else {
      alert('Contact phone number is not available for this facility.');
    }
  };

  const handleGetDirections = () => {
    let url = '';
    if (hospital.coordinates?.latitude && hospital.coordinates?.longitude) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.latitude},${hospital.coordinates.longitude}`;
    } else {
      const destination = encodeURIComponent(`${hospital.name}, ${hospital.address || ''}, ${hospital.city || ''}`);
      url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const categoryLabel = hospital.category === 'single_specialty' ? 'Single-Specialty' : 'Multi-Specialty';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/hospitals')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-cyan-600 transition-colors mb-8 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Primary Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Banner Image */}
            <div className="relative h-64 sm:h-80 overflow-hidden">
              {hospital.image ? (
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <Info className="w-16 h-16" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {hospital.verified && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Facility
                    </div>
                  )}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 backdrop-blur-xs text-cyan-200 text-[10px] font-bold uppercase tracking-wider border border-cyan-400/30">
                    <Building className="w-3 h-3" />
                    {categoryLabel}
                  </div>
                  {hospital.systemOfMedicine && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 backdrop-blur-xs text-slate-200 text-[10px] font-bold uppercase tracking-wider border border-white/20">
                      <Activity className="w-3 h-3" />
                      {hospital.systemOfMedicine}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-2 leading-tight">
                  {hospital.name}
                </h1>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 text-cyan-700">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address & District</h4>
                    <p className="text-slate-900 font-medium leading-relaxed mt-0.5">
                      {[hospital.address, hospital.city || hospital.district, hospital.state].filter(Boolean).join(', ')}
                    </p>
                    {hospital.district && (
                      <span className="inline-block mt-1 text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                        District: {hospital.district}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 text-cyan-700">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Status Update</h4>
                    <p className="text-slate-900 font-medium mt-0.5">
                      {hospital.lastUpdated}
                    </p>
                    <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">
                      Verified on Medical Network
                    </span>
                  </div>
                </div>
              </div>

              {/* Resource Availability Header & Action */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Resource Availability</h3>
                    <span className="text-xs text-slate-500">Live operational status</span>
                  </div>
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Report Update</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(hospital.resources || {}).map(([key, status]) => (
                    <ResourceItem
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1').trim()}
                      status={status}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Contact */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Direct Actions</h3>

            <div className="space-y-3">
              <button
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 cursor-pointer shadow-md hover:shadow-lg transition-all"
                onClick={handleEmergencyCall}
              >
                <Phone className="w-5 h-5" />
                <span className="font-bold">Emergency Call</span>
              </button>

              <button
                className="w-full btn-outline flex items-center justify-center gap-2 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={handleFacilityContact}
              >
                <Phone className="w-5 h-5" />
                <span>Contact Facility</span>
              </button>

              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl border border-cyan-300 bg-cyan-50/50 text-cyan-800 font-semibold text-sm hover:bg-cyan-100 transition-colors cursor-pointer"
                onClick={handleGetDirections}
              >
                <Navigation className="w-5 h-5 text-cyan-700" />
                <span>Get Directions</span>
              </button>
            </div>

            {/* Direct Contact Details Section */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Directory</h4>
              {emergencyPhone && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Emergency:</span>
                  <a
                    href={`tel:${emergencyPhone.replace(/[^\d+]/g, '')}`}
                    className="font-bold text-rose-600 hover:underline"
                  >
                    {emergencyPhone}
                  </a>
                </div>
              )}
              {facilityPhone && facilityPhone !== emergencyPhone && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Facility Desk:</span>
                  <a
                    href={`tel:${facilityPhone.replace(/[^\d+]/g, '')}`}
                    className="font-semibold text-slate-800 hover:text-cyan-700 hover:underline"
                  >
                    {facilityPhone}
                  </a>
                </div>
              )}
              {hospital.email && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Email:</span>
                  <a
                    href={`mailto:${hospital.email}`}
                    className="font-medium text-cyan-700 hover:underline truncate max-w-[160px]"
                    title={hospital.email}
                  >
                    {hospital.email}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-slate-100">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Verified Healthcare Facility</p>
                  <p className="text-[11px] text-slate-500">MediTrack Kerala Medical Registry</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Callout */}
          <div className="bg-gradient-to-br from-cyan-700 to-sky-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-cyan-900/20">
            <div className="relative z-10">
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mb-2">
                24/7 National Hotline
              </span>
              <h4 className="font-bold text-lg leading-tight">Need Immediate Ambulance?</h4>
              <p className="text-cyan-100 text-xs mt-2 leading-relaxed">
                Dial 108 for government emergency ambulance response, or call the hospital directly above.
              </p>
              <a
                href="tel:108"
                className="mt-4 inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-4 h-4 text-rose-600" />
                <span>Call 108</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Update Modal */}
      {isUpdateModalOpen && hospital && (
        <ReportResourceUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          hospitalId={hospital.id}
          currentResources={hospital.resources as any}
          onSuccess={async () => {
            await refresh();
          }}
        />
      )}
    </div>
  );
}
