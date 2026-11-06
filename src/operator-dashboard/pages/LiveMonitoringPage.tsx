import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Monitor,
  Radio,
  ShieldAlert,
} from 'lucide-react';
import { mapDbToFrontend, supabase } from '../../lib/supabase';
import { Equipment } from '../../types';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';

export function LiveMonitoring() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    let isActive = true;

    async function loadEquipment() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const { data, error } = await supabase.from('equipment').select('*');
        if (error) throw error;
        if (isActive) setEquipment(mapDbToFrontend<Equipment[]>(data ?? []));
      } catch (err: any) {
        if (isActive) {
          setLoadError(err?.message || 'Unable to load equipment for monitoring.');
          setEquipment([]);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadEquipment();
    return () => {
      isActive = false;
    };
  }, []);

  const availableTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(equipment.map((item) => item.criticality)))];
  }, [equipment]);

  const availableDepartments = useMemo(() => {
    return ['all', ...Array.from(new Set(equipment.map((item) => item.department)))];
  }, [equipment]);

  const displayedEquipment = useMemo(() => {
    return [...equipment].filter((item) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query);

      const matchesType = filterType === 'all' || item.criticality === filterType;
      const matchesDepartment = filterDepartment === 'all' || item.department === filterDepartment;
      return matchesSearch && matchesType && matchesDepartment;
    });
  }, [equipment, searchTerm, filterType, filterDepartment]);

  if (isLoading) {
    return <div className="py-12 text-center text-navy-500 text-sm">Loading monitoring data…</div>;
  }

  if (loadError) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">{loadError}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Live Monitoring</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Equipment inventory and database-backed status only. Live telemetry is not connected in MediTrack.
          </p>
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-900">Telemetry unavailable:</span>{' '}
          MediTrack does not currently store or stream sensor readings, connectivity heartbeats, or
          threshold data. No live values, trends, simulation timers, or fake real-time indicators are
          displayed. Only equipment records and their current operational status from Supabase are shown.
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-md p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search equipment by ID, name, or model…"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Criticality"
            value={filterType}
            options={availableTypes.map((type) => ({
              value: type,
              label: type === 'all' ? 'All Criticalities' : type,
            }))}
            onChange={setFilterType}
          />
          <FilterDropdown
            label="Department"
            value={filterDepartment}
            options={availableDepartments.map((department) => ({
              value: department,
              label: department === 'all' ? 'All Departments' : department,
            }))}
            onChange={setFilterDepartment}
          />
        </div>
      </div>

      <div className="p-3 bg-neutral-100 border border-neutral-200 rounded text-xs text-navy-700 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-navy-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-navy-900">Notice for Operators:</span> Nominal database
          status does not constitute clinical clearance. Investigate equipment through the inventory and
          maintenance records rather than from this deliberately limited screen.
        </div>
      </div>

      {displayedEquipment.length === 0 ? (
        <EmptyState
          title="No equipment match the current filters"
          description="Adjust the search or filter criteria, or verify that equipment has been inventoried."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedEquipment.map((item) => (
            <div key={item.id} className="bg-white border border-neutral-200 rounded-md">
              <div className="p-3 border-b border-neutral-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-navy-900 text-xs">{item.id}</span>
                    <span className="text-[11px] text-neutral-500">•</span>
                    <span className="text-[11px] font-medium text-navy-600">{item.criticality}</span>
                  </div>
                  <div className="text-xs font-semibold text-navy-800 mt-0.5">{item.name}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {item.department} — {item.room}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge
                    variant={
                      item.status === 'Working'
                        ? 'success'
                        : item.status === 'Needs Attention'
                        ? 'warning'
                        : item.status === 'Down'
                        ? 'error'
                        : 'purple'
                    }
                    dot
                  >
                    {item.status}
                  </StatusBadge>
                </div>
              </div>

              <div className="p-3 space-y-2.5">
                <div className="py-4 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 rounded bg-neutral-50">
                  <Radio className="w-4 h-4 text-neutral-400 mx-auto mb-1.5" />
                  Live telemetry is unavailable
                </div>
              </div>

              <div className="px-3 py-2 bg-neutral-50/70 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Model: {item.model}</span>
                <span className="font-mono">SN: {item.serialNumber}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
