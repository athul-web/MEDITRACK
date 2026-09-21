import React from 'react';
import { Equipment } from '../types';
import { calculateUptimeHours } from '../utils/equipment';
import { EquipmentStatusBadge, CriticalityBadge } from './StatusBadge';
import { 
  MapPin, 
  Calendar, 
  User, 
  Wrench, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface EquipmentCardProps {
  equipment: Equipment;
  onSelect: (equipment: Equipment) => void;
  onReportProblem: (equipment: Equipment) => void;
  onQuickStatusChange?: (equipment: Equipment, status: Equipment['status']) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onSelect,
  onReportProblem,
  onQuickStatusChange,
}) => {
  return (
    <div 
      className="rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
    >
      {/* Card Header: Tag & Status */}
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {equipment.id}
            </span>
            <CriticalityBadge level={equipment.criticality} />
          </div>
          <EquipmentStatusBadge status={equipment.status} size="sm" />
        </div>

        <h3 
          onClick={() => onSelect(equipment)}
          className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
          title={equipment.name}
        >
          {equipment.name}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 truncate">
          {equipment.model} • {equipment.manufacturer}
        </p>

        {/* Location & Room */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium text-slate-700">{equipment.department}</span>
          <span className="text-slate-300">•</span>
          <span className="truncate text-slate-500">{equipment.room}</span>
        </div>
      </div>

      {/* Card Body: Tech & Metrics */}
      <div className="p-4 sm:p-5 bg-slate-50/40 text-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" /> Assigned Tech:
          </span>
          <span className="font-medium text-slate-800 truncate max-w-[160px]">
            {equipment.assignedTechnicianName || (
              <span className="text-slate-400 italic font-normal">Unassigned</span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Next Service:
          </span>
          <span className="font-mono text-slate-700">
            {equipment.nextScheduledMaintenance}
          </span>
        </div>

        {/* Total Uptime */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Total Uptime</span>
            <span className="font-semibold text-slate-700">{calculateUptimeHours(equipment).toLocaleString()} hrs</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Action Buttons */}
      <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(equipment)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>View Details</span>
        </button>

        <button
          onClick={() => onReportProblem(equipment)}
          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-xs font-medium text-rose-700 transition-colors"
          title="Report problem or breakdown for this equipment"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Report</span>
        </button>

</div>
    </div>
  );
};
