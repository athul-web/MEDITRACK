import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHospital } from '../../../hooks/useHospital';
import { HospitalResources, ResourceStatus } from '../../../types/public';
import {
  ArrowLeft,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
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
  const { hospital, isLoading, error, refresh } = useHospital(id!);

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/hospitals')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-cyan-600 transition-colors mb-8 group"
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
                <div className="flex items-center gap-3">
                  {hospital.verified && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{hospital.name}</h1>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</h4>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {hospital.address}, {hospital.city}, {hospital.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Updated</h4>
                    <p className="text-slate-900 font-medium">
                      {hospital.lastUpdated}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resource Availability */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Resource Availability</h3>
                  <span className="text-xs text-slate-500 italic">Live data feed</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(hospital.resources).map(([key, status]) => (
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
            <h3 className="text-lg font-bold text-slate-900">Direct Contact</h3>

            <div className="space-y-3">
              <button
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
                onClick={() => window.open(`tel:${hospital.contact.emergencyPhone || hospital.contact.phone}`)}
              >
                <Phone className="w-5 h-5" />
                <span className="font-bold">Emergency Call</span>
              </button>

              <button
                className="w-full btn-outline flex items-center justify-center gap-2 py-4"
                onClick={() => window.open(`tel:${hospital.contact.phone}`)}
              >
                <Phone className="w-5 h-5" />
                <span>Contact Facility</span>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Verified Facility</p>
                  <p className="text-[11px] text-slate-500">Authenticated by MediTrack Network</p>
                </div>
              </div>
            </div>
          </div>

          {/* Small Callout */}
          <div className="bg-cyan-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-cyan-200">
            <div className="relative z-10">
              <h4 className="font-bold text-lg leading-tight">Need urgent help?</h4>
              <p className="text-cyan-100 text-xs mt-2 leading-relaxed">
                Call 108 for government emergency services or use the buttons above to contact this facility.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <Phone className="w-24 h-24 rotate-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
