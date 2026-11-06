import React from 'react';
import { Equipment } from '../types';
import { 
  CheckCircle2, 
  AlertOctagon, 
  Wrench, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface StatsOverviewProps {
  equipment: Equipment[];
  onFilterStatus: (status: string) => void;
  selectedStatusFilter: string;
  onSelectEquipment: (equipment: Equipment) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  equipment,
  onFilterStatus,
  selectedStatusFilter,
  onSelectEquipment,
}) => {
  const total = equipment.length;
  const operational = equipment.filter(e => e.status === 'Working').length;
  const down = equipment.filter(e => e.status === 'Down').length;
  const maintenance = equipment.filter(e => e.status === 'Under Maintenance').length;
  const attention = equipment.filter(e => e.status === 'Needs Attention').length;

  const fleetUptime = total > 0 ? ((operational + (maintenance * 0.5)) / total) * 100 : 100;

  // Find critical life support down equipment
  const criticalDown = equipment.filter(
    e => (e.criticality === 'Life Support' || e.criticality === 'Critical Diagnostic') && (e.status === 'Down' || e.status === 'Needs Attention')
  );

  return (
    <div className="space-y-4">
      {/* High-priority Critical Alert Banner if any critical device is down */}
      {criticalDown.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5 sm:mt-0">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <span>Urgent Attention Required: Critical Device Downtime</span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-200 text-rose-800 rounded-full">
                    {criticalDown.length} {criticalDown.length === 1 ? 'Unit' : 'Units'}
                  </span>
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  {criticalDown.map(e => `${e.name} (${e.id}) in ${e.room}`).join(' • ')}
                </p>
              </div>
            </div>
            <button
              id="critical-alert-view-btn"
              onClick={() => onSelectEquipment(criticalDown[0])}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <span>View First Critical Unit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Fleet Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Fleet Uptime */}
        <div 
          onClick={() => onFilterStatus('All')}
          className={`p-4 rounded-xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            selectedStatusFilter === 'All' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${selectedStatusFilter === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>
              Fleet Uptime
            </span>
            <Activity className={`w-4 h-4 ${selectedStatusFilter === 'All' ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{fleetUptime.toFixed(1)}%</span>
            <span className={`text-xs ${selectedStatusFilter === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>
              ({operational}/{total} active)
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${fleetUptime}%` }}
            />
          </div>
        </div>

        {/* Operational */}
        <div 
          onClick={() => onFilterStatus('Working')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Working' 
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/50 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Operational</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{operational}</span>
            <span className="text-xs font-medium text-emerald-700">
              {total > 0 ? Math.round((operational / total) * 100) : 0}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Available for clinical use</p>
        </div>

        {/* Down */}
        <div 
          onClick={() => onFilterStatus('Down')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Down' 
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300/50 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Down / Offline</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600">{down}</span>
            <span className="text-xs font-medium text-rose-600">
              {down > 0 ? 'Action needed' : 'Clear'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Immediate dispatch</p>
        </div>

        {/* Under Maintenance */}
        <div 
          onClick={() => onFilterStatus('Under Maintenance')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Under Maintenance' 
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/50 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">In Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{maintenance}</span>
            <span className="text-xs font-medium text-amber-700">In progress</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Technician on-site</p>
        </div>

        {/* Needs Attention */}
        <div 
          onClick={() => onFilterStatus('Needs Attention')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Needs Attention' 
              ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-300/50 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-orange-800">Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{attention}</span>
            <span className="text-xs font-medium text-orange-700">Pending</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Degraded or reported</p>
        </div>
      </div>
    </div>
  );
};
