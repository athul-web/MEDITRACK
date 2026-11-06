import React, { useEffect, useMemo, useState } from 'react';
import { Package, ShieldAlert } from 'lucide-react';
import { mapDbToFrontend, supabase } from '../../lib/supabase';
import { Equipment } from '../../types';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { EmptyState } from '../components/ui/EmptyState';

interface DepartmentSummary {
  department: string;
  total: number;
  working: number;
  needsAttention: number;
  down: number;
  underMaintenance: number;
}

export function ResourceStatus() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterCriticality, setFilterCriticality] = useState('all');

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
          setLoadError(err?.message || 'Unable to load resource data.');
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

  const departmentSummaries = useMemo(() => {
    const groups = new Map<string, DepartmentSummary>();
    for (const item of equipment) {
      if (!groups.has(item.department)) {
        groups.set(item.department, {
          department: item.department,
          total: 0,
          working: 0,
          needsAttention: 0,
          down: 0,
          underMaintenance: 0,
        });
      }
      const summary = groups.get(item.department)!;
      summary.total += 1;
      if (item.status === 'Working') summary.working += 1;
      if (item.status === 'Needs Attention') summary.needsAttention += 1;
      if (item.status === 'Down') summary.down += 1;
      if (item.status === 'Under Maintenance') summary.underMaintenance += 1;
    }
    return Array.from(groups.values()).sort((a, b) => a.department.localeCompare(b.department));
  }, [equipment]);

  const criticalitySummaries = useMemo(() => {
    const groups = new Map<string, number>();
    for (const item of equipment) {
      groups.set(item.criticality, (groups.get(item.criticality) || 0) + 1);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([criticality, count]) => ({ criticality, count }));
  }, [equipment]);

  const filteredDepartments = useMemo(() => {
    return departmentSummaries.filter((summary) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = query === '' || summary.department.toLowerCase().includes(query);
      const matchesDepartment = filterDepartment === 'all' || summary.department === filterDepartment;
      const departmentEquipment = equipment.filter((item) => item.department === summary.department);
      const matchesCriticality =
        filterCriticality === 'all' ||
        departmentEquipment.some((item) => item.criticality === filterCriticality);
      return matchesSearch && matchesDepartment && matchesCriticality;
    });
  }, [departmentSummaries, equipment, searchTerm, filterDepartment, filterCriticality]);

  if (isLoading) {
    return <div className="py-12 text-center text-navy-500 text-sm">Loading resource data…</div>;
  }

  if (loadError) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">{loadError}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Facility Resource Status</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Equipment-inventory resource summaries derived from MediTrack equipment records.
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Limited Resource Data — Physical Verification Still Required</span>
        </div>
        <p className="text-amber-800 leading-relaxed text-[11px]">
          MediTrack stores equipment inventory, status, criticality, and department. It does not store facility
          utility capacity, stock levels, utilization percentages, or telemetry. Those plant-level metrics are
          unavailable here; counts below come only from the inventoried equipment records.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-medium text-navy-600">
          <span className="font-bold text-navy-900">{equipment.length}</span> inventoried equipment records across{' '}
          <span className="font-bold text-navy-900">{departmentSummaries.length}</span> departments
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 max-w-xs">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search departments…"
            />
          </div>
          <FilterDropdown
            label="Department"
            value={filterDepartment}
            options={[
              { value: 'all', label: 'All Departments' },
              ...departmentSummaries.map((summary) => ({ value: summary.department, label: summary.department })),
            ]}
            onChange={setFilterDepartment}
          />
          <FilterDropdown
            label="Criticality"
            value={filterCriticality}
            options={[
              { value: 'all', label: 'All Criticalities' },
              ...Array.from(new Set(equipment.map((item) => item.criticality))).map((criticality) => ({
                value: criticality,
                label: criticality,
              })),
            ]}
            onChange={setFilterCriticality}
          />
        </div>
      </div>

      {filteredDepartments.length === 0 ? (
        <EmptyState
          title="No department summaries match the criteria"
          description="Adjust the filters or verify that equipment has been inventoried."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((summary) => (
            <div key={summary.department} className="bg-white border border-neutral-200 rounded-md p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-neutral-100 rounded">
                    <Package className="w-4 h-4 text-navy-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-navy-900">{summary.department}</h3>
                    <span className="text-[10px] text-neutral-400">Equipment inventory grouping</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-navy-900 tabular-nums">{summary.total}</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-teal-700">Working</span>
                  <span className="font-semibold tabular-nums">{summary.working}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-700">Needs Attention</span>
                  <span className="font-semibold tabular-nums">{summary.needsAttention}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-700">Down</span>
                  <span className="font-semibold tabular-nums">{summary.down}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">Under Maintenance</span>
                  <span className="font-semibold tabular-nums">{summary.underMaintenance}</span>
                </div>
              </div>

              <div className="mt-3 border-t border-neutral-100 pt-2.5 text-[10px] text-neutral-500">
                Status counts are current equipment statuses; they are not capacity or utilization metrics.
              </div>
            </div>
          ))}
        </div>
      )}

      {criticalitySummaries.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-md p-4">
          <h2 className="text-sm font-semibold text-navy-900 mb-3">Equipment Inventory by Criticality</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {criticalitySummaries.map((summary) => {
              const percent = equipment.length > 0 ? Math.round((summary.count / equipment.length) * 100) : 0;
              return (
                <div key={summary.criticality} className="border border-neutral-200 rounded p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-navy-800">{summary.criticality}</span>
                    <span className="font-bold text-navy-900 tabular-nums">{summary.count}</span>
                  </div>
                  <div className="mt-2 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-navy-500 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-500">{percent}% of inventoried equipment</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
