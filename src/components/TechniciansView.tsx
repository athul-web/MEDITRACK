import React, { useState } from 'react';
import { Technician, Equipment, ProblemReport, UserRole } from '../types';
import { User, Phone, Mail, Award, CheckCircle2, Clock, Wrench, Shield, Copy, Check } from 'lucide-react';

interface TechniciansViewProps {
  technicians: Technician[];
  equipmentList: Equipment[];
  tickets: ProblemReport[];
  currentRole: UserRole;
  onFilterEquipmentByTech: (techName: string) => void;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({
  technicians,
  equipmentList,
  tickets,
  currentRole,
  onFilterEquipmentByTech,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Biomedical Engineering & Clinical Technology Staff
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Certified biomedical equipment technicians (CBET) & clinical equipment specialists on roster
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            {technicians.filter(t => t.status === 'Available').length} Available Now
          </span>
          <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
            {technicians.filter(t => t.status === 'Assigned').length} In Field / Repair
          </span>
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map(tech => {
          const assignedUnits = equipmentList.filter(e => e.assignedTechnicianId === tech.id);
          const activeTechTickets = tickets.filter(
            t => t.assignedTechnicianId === tech.id && t.status !== 'Resolved'
          );

          return (
            <div
              key={tech.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="h-11 w-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {tech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    tech.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    tech.status === 'Assigned' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {tech.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900">{tech.name}</h4>
                <p className="text-xs text-slate-500">{tech.title}</p>
                <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">Specialty: </span>
                  <span className="text-slate-600">{tech.specialty}</span>
                </div>

                {/* Contact information */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {tech.phone}
                    </span>
                    <button
                      onClick={() => handleCopyPhone(tech.id, tech.phone)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Copy phone extension"
                    >
                      {copiedId === tech.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{tech.email}</span>
                  </div>
                </div>

                {/* Certifications */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    Credentials & Certifications
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tech.certifications.map((cert, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workload footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Active Work Orders: </span>
                  <strong className="text-slate-900">{activeTechTickets.length}</strong>
                </div>

                <button
                  onClick={() => onFilterEquipmentByTech(tech.name)}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-xs"
                >
                  View Assigned Devices →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
