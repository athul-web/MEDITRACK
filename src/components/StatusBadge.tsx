import React from 'react';
import { EquipmentStatus, CriticalityLevel, TicketSeverity, TicketStatus } from '../types';
import { CheckCircle2, AlertOctagon, Wrench, AlertTriangle, ShieldAlert, Activity, Clock, Check } from 'lucide-react';

export const EquipmentStatusBadge: React.FC<{ status: EquipmentStatus; size?: 'sm' | 'md' }> = ({ 
  status, 
  size = 'md' 
}) => {
  const isSm = size === 'sm';
  const padding = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  switch (status) {
    case 'Working':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${padding}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Operational</span>
        </span>
      );
    case 'Down':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${padding}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
          <AlertOctagon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Down / Offline</span>
        </span>
      );
    case 'Under Maintenance':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${padding}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <Wrench className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Under Maintenance</span>
        </span>
      );
    case 'Needs Attention':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80 ${padding}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Needs Attention</span>
        </span>
      );
    default:
      return null;
  }
};

export const CriticalityBadge: React.FC<{ level: CriticalityLevel }> = ({ level }) => {
  switch (level) {
    case 'Life Support':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100/70 text-red-800 border border-red-200">
          <ShieldAlert className="w-3 h-3" />
          <span>Life Support</span>
        </span>
      );
    case 'Critical Diagnostic':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Activity className="w-3 h-3" />
          <span>Critical Diagnostic</span>
        </span>
      );
    case 'Patient Monitoring':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
          <span>Patient Monitoring</span>
        </span>
      );
    case 'General Clinical':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span>General Clinical</span>
        </span>
      );
    default:
      return null;
  }
};

export const SeverityBadge: React.FC<{ severity: TicketSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertOctagon className="w-3 h-3 text-red-600" />
          <span>Critical</span>
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>High Priority</span>
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <span>Medium</span>
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span>Low</span>
        </span>
      );
  }
};

export const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  switch (status) {
    case 'Reported':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
          <Clock className="w-3 h-3" />
          <span>Reported</span>
        </span>
      );
    case 'Assigned':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3" />
          <span>Assigned</span>
        </span>
      );
    case 'In Repair':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <Wrench className="w-3 h-3" />
          <span>In Repair</span>
        </span>
      );
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="w-3 h-3" />
          <span>Resolved</span>
        </span>
      );
  }
};
